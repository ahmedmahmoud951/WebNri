import type { BarrierOpened, OccupancyUpdated, SessionUpdated, VehicleLocationCleared, VehicleLocationUpdated } from '../api/types';
import type { VehiclePlateEvent } from '../api/opsTypes';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export interface LiveHub {
  readonly state: ConnectionState;
  connect(accessToken: string): Promise<void>;
  joinBuilding(buildingId: number): Promise<void>;
  disconnect(): Promise<void>;
  onOccupancyUpdated(handler: (event: OccupancyUpdated) => void): () => void;
  onSessionUpdated(handler: (event: SessionUpdated) => void): () => void;
  onBarrierOpened(handler: (event: BarrierOpened) => void): () => void;
  onVehicleLocationUpdated(handler: (event: VehicleLocationUpdated) => void): () => void;
  onVehicleLocationCleared(handler: (event: VehicleLocationCleared) => void): () => void;
  onPlateRecognized(handler: (event: VehiclePlateEvent) => void): () => void;
  onCameraOnline(handler: (cameraId: number) => void): () => void;
  onCameraOffline(handler: (cameraId: number) => void): () => void;
  onAlarmCreated?(handler: (alarm: import('../api/opsTypes').AlarmDto) => void): () => void;
  onAlarmUpdated?(handler: (alarm: import('../api/opsTypes').AlarmDto) => void): () => void;
  onInvitationDeliveryStatusChanged?(handler: (event: any) => void): () => void;
  onPaymentSucceeded?(handler: (event: any) => void): () => void;
  onBarrierStateChanged?(handler: (event: any) => void): () => void;
  onDeviceStatusChanged?(handler: (event: any) => void): () => void;
  onStateChange(handler: (state: ConnectionState) => void): () => void;
}
