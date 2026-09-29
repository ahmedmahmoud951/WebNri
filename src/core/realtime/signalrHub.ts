import * as signalR from '@microsoft/signalr';
import { config } from '../config';
import { normalizeOccupancyEvent, normalizeSessionEvent, normalizeLocationCleared, normalizeLocationUpdated } from '../api/normalize';
import { normalizeVehiclePlateEvent } from '../api/opsNormalize';
import type { BarrierOpened, OccupancyUpdated, SessionUpdated, VehicleLocationCleared, VehicleLocationUpdated } from '../api/types';
import type { VehiclePlateEvent } from '../api/opsTypes';
import { isJwtUnexpired } from '../auth/jwt';
import type { ConnectionState, LiveHub } from './liveHub';

type Handler<T> = (event: T) => void;

const RECONNECT_MS = 5000;

interface SignalRLiveHubOptions {
  getToken?: () => string | null;
  onTokenExpired?: () => void;
}

function hubLog(_level: signalR.LogLevel, message: string): void {
  if (_level < signalR.LogLevel.Error) return;
  // React Strict Mode remount aborts the first negotiate; reconnect runs immediately after.
  if (
    /Under Construction|Status code '503'|Length Required|stopped during negotiation|canceled|The connection was stopped/i.test(
      message,
    )
  ) {
    return;
  }
  const compact = message.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
  console.warn('[hub]', compact);
}

export class SignalRLiveHub implements LiveHub {
  state: ConnectionState = 'disconnected';
  private connection: signalR.HubConnection | null = null;
  private lastBuildingId: number | null = null;
  private lastToken: string | null = null;
  private connectGeneration = 0;
  private reconnectTimer: number | null = null;
  private readonly occupancy = new Set<Handler<OccupancyUpdated>>();
  private readonly sessions = new Set<Handler<SessionUpdated>>();
  private readonly barriers = new Set<Handler<BarrierOpened>>();
  private readonly locationUpdated = new Set<Handler<VehicleLocationUpdated>>();
  private readonly locationCleared = new Set<Handler<VehicleLocationCleared>>();
  private readonly plates = new Set<Handler<VehiclePlateEvent>>();
  private readonly cameraOnline = new Set<Handler<number>>();
  private readonly cameraOffline = new Set<Handler<number>>();
  private readonly alarmsCreated = new Set<Handler<any>>();
  private readonly alarmsUpdated = new Set<Handler<any>>();
  private readonly invitationStatus = new Set<Handler<any>>();
  private readonly paymentSucceeded = new Set<Handler<any>>();
  private readonly barrierStateChanged = new Set<Handler<any>>();
  private readonly deviceStatusChanged = new Set<Handler<any>>();
  private readonly states = new Set<Handler<ConnectionState>>();
  private readonly options: SignalRLiveHubOptions;

  constructor(options: SignalRLiveHubOptions = {}) {
    this.options = options;
  }

  async connect(accessToken: string): Promise<void> {
    const token = this.readCurrentToken(accessToken);
    this.lastToken = token;
    await this.stopConnection();
    const generation = ++this.connectGeneration;
    this.setState('connecting');

    // Direct API host (config.hubUrl) → WebSockets; LongPolling fallback for IIS.
    const transport =
      signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(config.hubUrl, {
        accessTokenFactory: () => this.readCurrentToken(token),
        transport,
        withCredentials: false,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging({ log: hubLog })
      .build();

    connection.on('OccupancyUpdated', (event: unknown) => {
      const normalized = normalizeOccupancyEvent(event);
      this.occupancy.forEach((handler) => handler(normalized));
    });
    connection.on('SessionUpdated', (event: unknown) => {
      const normalized = normalizeSessionEvent(event);
      this.sessions.forEach((handler) => handler(normalized));
    });
    connection.on('BarrierOpened', (event: BarrierOpened) => {
      this.barriers.forEach((handler) => handler(event));
    });
    connection.on('VehicleLocationUpdated', (event: unknown) => {
      const normalized = normalizeLocationUpdated(event);
      this.locationUpdated.forEach((handler) => handler(normalized));
    });
    connection.on('VehicleLocationCleared', (event: unknown) => {
      const normalized = normalizeLocationCleared(event);
      this.locationCleared.forEach((handler) => handler(normalized));
    });
    const plateHandler = (event: unknown) => {
      const normalized = normalizeVehiclePlateEvent(event);
      this.plates.forEach((handler) => handler(normalized));
    };
    connection.on('PlateRecognized', plateHandler);
    connection.on('VehicleDetected', plateHandler);
    connection.on('VehicleEntered', plateHandler);
    connection.on('VehicleExited', plateHandler);
    connection.on('CameraOnline', (cameraId: number) => {
      this.cameraOnline.forEach((handler) => handler(Number(cameraId)));
    });
    connection.on('CameraOffline', (cameraId: number) => {
      this.cameraOffline.forEach((handler) => handler(Number(cameraId)));
    });
    connection.on('AlarmCreated', (alarm: any) => {
      this.alarmsCreated.forEach((handler) => handler(alarm));
    });
    connection.on('AlarmUpdated', (alarm: any) => {
      this.alarmsUpdated.forEach((handler) => handler(alarm));
    });
    connection.on('InvitationDeliveryStatusChanged', (event: any) => {
      this.invitationStatus.forEach((handler) => handler(event));
    });
    connection.on('PaymentSucceeded', (event: any) => {
      this.paymentSucceeded.forEach((handler) => handler(event));
    });
    connection.on('BarrierStateChanged', (event: any) => {
      this.barrierStateChanged.forEach((handler) => handler(event));
    });
    connection.on('DeviceStatusChanged', (event: any) => {
      this.deviceStatusChanged.forEach((handler) => handler(event));
    });
    connection.onreconnecting(() => this.setState('disconnected'));
    connection.onreconnected(() => {
      this.setState('connected');
      void this.rejoin();
    });
    connection.onclose(() => {
      this.setState('disconnected');
      this.queueReconnect();
    });

    this.connection = connection;
    try {
      await connection.start();
      if (generation !== this.connectGeneration) return;
      this.setState('connected');
      await this.joinAllowedGroups();
    } catch (error) {
      if (generation !== this.connectGeneration) return;
      if (this.isTokenExpiredError(error)) {
        this.handleExpiredToken();
        return;
      }
      this.setState('disconnected');
      this.queueReconnect();
    }
  }

  async joinBuilding(buildingId: number): Promise<void> {
    this.lastBuildingId = buildingId;
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) return;
    try {
      await this.connection.invoke('JoinBuilding', Number(buildingId));
    } catch {
      // keep socket; REST still works
    }
  }

  async disconnect(): Promise<void> {
    this.lastToken = null;
    this.connectGeneration += 1;
    this.clearReconnect();
    this.lastBuildingId = null;
    await this.stopConnection();
    this.setState('disconnected');
  }

  onOccupancyUpdated(handler: Handler<OccupancyUpdated>) {
    this.occupancy.add(handler);
    return () => this.occupancy.delete(handler);
  }

  onSessionUpdated(handler: Handler<SessionUpdated>) {
    this.sessions.add(handler);
    return () => this.sessions.delete(handler);
  }

  onBarrierOpened(handler: Handler<BarrierOpened>) {
    this.barriers.add(handler);
    return () => this.barriers.delete(handler);
  }

  onVehicleLocationUpdated(handler: Handler<VehicleLocationUpdated>) {
    this.locationUpdated.add(handler);
    return () => this.locationUpdated.delete(handler);
  }

  onVehicleLocationCleared(handler: Handler<VehicleLocationCleared>) {
    this.locationCleared.add(handler);
    return () => this.locationCleared.delete(handler);
  }

  onPlateRecognized(handler: Handler<VehiclePlateEvent>) {
    this.plates.add(handler);
    return () => this.plates.delete(handler);
  }

  onCameraOnline(handler: Handler<number>) {
    this.cameraOnline.add(handler);
    return () => this.cameraOnline.delete(handler);
  }

  onCameraOffline(handler: Handler<number>) {
    this.cameraOffline.add(handler);
    return () => this.cameraOffline.delete(handler);
  }

  onAlarmCreated(handler: Handler<any>) {
    this.alarmsCreated.add(handler);
    return () => this.alarmsCreated.delete(handler);
  }

  onAlarmUpdated(handler: Handler<any>) {
    this.alarmsUpdated.add(handler);
    return () => this.alarmsUpdated.delete(handler);
  }

  onInvitationDeliveryStatusChanged(handler: Handler<any>) {
    this.invitationStatus.add(handler);
    return () => this.invitationStatus.delete(handler);
  }

  onPaymentSucceeded(handler: Handler<any>) {
    this.paymentSucceeded.add(handler);
    return () => this.paymentSucceeded.delete(handler);
  }

  onBarrierStateChanged(handler: Handler<any>) {
    this.barrierStateChanged.add(handler);
    return () => this.barrierStateChanged.delete(handler);
  }

  onDeviceStatusChanged(handler: Handler<any>) {
    this.deviceStatusChanged.add(handler);
    return () => this.deviceStatusChanged.delete(handler);
  }

  onStateChange(handler: Handler<ConnectionState>) {
    this.states.add(handler);
    handler(this.state);
    return () => this.states.delete(handler);
  }

  private setState(state: ConnectionState) {
    this.state = state;
    this.states.forEach((handler) => handler(state));
  }

  private async joinAllowedGroups(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) return;
    try {
      await this.connection.invoke('JoinAllowedGroups');
    } catch {
      // optional
    }
  }

  private async rejoin(): Promise<void> {
    await this.joinAllowedGroups();
    if (this.lastBuildingId == null) return;
    await this.joinBuilding(this.lastBuildingId);
  }

  private queueReconnect(): void {
    if (this.reconnectTimer != null || !this.lastToken) return;
    if (!isJwtUnexpired(this.lastToken)) {
      this.handleExpiredToken();
      return;
    }
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.lastToken) {
        this.handleExpiredToken();
        return;
      }
      const token = this.readCurrentToken(this.lastToken);
      if (!token || !isJwtUnexpired(token)) {
        this.handleExpiredToken();
        return;
      }
      void this.connect(token);
    }, RECONNECT_MS);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer == null) return;
    window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private async stopConnection(): Promise<void> {
    const connection = this.connection;
    this.connection = null;
    if (!connection) return;
    connection.onclose(() => undefined);
    try {
      await connection.stop();
    } catch {
      // already down
    }
  }

  private readCurrentToken(fallback: string): string {
    return this.options.getToken?.() ?? fallback;
  }

  private isTokenExpiredError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    return /token_expired|access token has expired/i.test(error.message);
  }

  private handleExpiredToken(): void {
    this.lastToken = null;
    this.clearReconnect();
    this.setState('disconnected');
    this.options.onTokenExpired?.();
  }
}
