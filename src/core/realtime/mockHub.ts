import { emitOccupancyTick } from '../api/mockStore';
import type { BarrierOpened, OccupancyUpdated, SessionUpdated, VehicleLocationCleared, VehicleLocationUpdated } from '../api/types';
import type { VehiclePlateEvent } from '../api/opsTypes';
import type { ConnectionState, LiveHub } from './liveHub';

type Handler<T> = (event: T) => void;

export class MockLiveHub implements LiveHub {
  state: ConnectionState = 'disconnected';
  private buildingId: number | null = null;
  private timer: number | null = null;
  private readonly occupancy = new Set<Handler<OccupancyUpdated>>();
  private readonly sessions = new Set<Handler<SessionUpdated>>();
  private readonly barriers = new Set<Handler<BarrierOpened>>();
  private readonly locationUpdated = new Set<Handler<VehicleLocationUpdated>>();
  private readonly locationCleared = new Set<Handler<VehicleLocationCleared>>();
  private readonly plates = new Set<Handler<VehiclePlateEvent>>();
  private readonly cameraOnline = new Set<Handler<number>>();
  private readonly cameraOffline = new Set<Handler<number>>();
  private readonly states = new Set<Handler<ConnectionState>>();

  async connect(_accessToken: string): Promise<void> {
    this.setState('connecting');
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    this.setState('connected');
  }

  async joinBuilding(buildingId: number): Promise<void> {
    this.buildingId = buildingId;
    this.stopTick();
    this.timer = window.setInterval(() => {
      if (this.state !== 'connected' || this.buildingId == null) return;
      const event = emitOccupancyTick();
      if (event) this.occupancy.forEach((handler) => handler(event));
    }, 6000);
  }

  async disconnect(): Promise<void> {
    this.stopTick();
    this.buildingId = null;
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

  onStateChange(handler: Handler<ConnectionState>) {
    this.states.add(handler);
    handler(this.state);
    return () => this.states.delete(handler);
  }

  private setState(state: ConnectionState) {
    this.state = state;
    this.states.forEach((handler) => handler(state));
  }

  private stopTick() {
    if (this.timer != null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
}
