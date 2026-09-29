/** Ops DTOs mirroring WPF /api/parking users · cameras · LPR */

export interface ManagedUser {
  id: number;
  userName: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  roleId?: number;
  roleName?: string;
  isActive: boolean;
  createdAt?: string;
  buildingId?: number | null;
}

export interface ManagedUserWrite {
  userName: string;
  displayName?: string;
  email?: string | null;
  phoneNumber?: string | null;
  password?: string;
  roleId?: number | null;
  isActive?: boolean;
}

export interface RoleRow {
  id: number;
  name: string;
  isActive: boolean;
}

export interface PermissionRow {
  id: number;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface CameraRow {
  id: number;
  name: string;
  ip: string;
  streamUrl?: string;
  rtspUrl?: string;
  snapshotUrl?: string;
  userName?: string;
  hasPassword?: boolean;
  isActive: boolean;
  typeCode?: string;
  manufacturer?: string;
  model?: string;
  httpPort?: number;
  groupNum: number;
  cameraTypeId?: string;
  status?: string;
  parkingId?: number;
  zoneId?: number;
  gateId?: number;
  laneId?: number;
  lane?: string;
  direction?: string;
  latitude?: number;
  longitude?: number;
  indoorX?: number;
  indoorY?: number;
  indoorZ?: number;
  floorId?: number;
}

export interface CameraWrite {
  name?: string;
  ip: string;
  streamUrl?: string;
  rtspUrl?: string;
  snapshotUrl?: string;
  userName: string;
  password?: string;
  typeCode?: string;
  manufacturer?: string;
  model?: string;
  httpPort?: number;
  groupNum?: number;
  cameraTypeId?: string;
  parkingId?: number | null;
  gateId?: number | null;
  laneId?: number | null;
  direction?: string;
  latitude?: number;
  longitude?: number;
  indoorX?: number;
  indoorY?: number;
  indoorZ?: number;
  floorId?: number;
}

export interface CameraProbeRequest {
  ip: string;
  port?: number;
  userName: string;
  password: string;
}

export interface CameraProbeResult {
  success: boolean;
  usedOnvif: boolean;
  manufacturer?: string;
  model?: string;
  firmware?: string;
  brandKey?: string;
  /** Probe returns RTSP in this field (WPF maps it to RtspUrl). */
  streamUrl?: string;
  snapshotUrl?: string;
  httpPort?: number;
  message?: string;
}

export interface CameraStatus {
  cameraId: number;
  online: boolean;
  status?: string;
  message?: string;
  rtspUrl?: string;
  snapshotUrl?: string;
  checkedAt?: string;
}

export interface CameraSnapshot {
  cameraId: number;
  success: boolean;
  contentType?: string;
  imageBase64?: string;
  message?: string;
}

export interface CameraTestResult {
  success: boolean;
  status?: string;
  message?: string;
}

export interface CameraViewRow {
  id: number;
  name: string;
  rowCount: number;
  columnCount: number;
  isActive: boolean;
  createdAt?: string;
  slots: CameraViewSlotRow[];
}

export interface CameraViewSlotRow {
  rowIndex: number;
  columnIndex: number;
  cameraId: number;
  cameraName?: string;
  cameraIp?: string;
}

export interface CameraViewWrite {
  name: string;
  rowCount: number;
  columnCount: number;
  isActive?: boolean;
  slots: CameraViewSlotWrite[];
}

export interface CameraViewSlotWrite {
  rowIndex: number;
  columnIndex: number;
  cameraId?: number | null;
}

export interface LprEvent {
  id: number | string;
  plateNumber: string;
  normalizedPlateNumber?: string;
  confidence?: number;
  cameraId?: number;
  cameraName?: string;
  parkingId?: number;
  direction?: string;
  eventDateTime: string;
  imagePath?: string;
  plateImagePath?: string;
  chars?: string;
  number?: string;
  vehicleType?: string;
  vehicleColor?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  groupNum?: number;
  carSpeed?: string;
  state?: string;
  isSpeeding?: boolean;
  speedLimit?: number;
  authorized?: boolean;
  reason?: string;
}

export interface VehiclePlateEvent {
  eventId?: string;
  cameraId?: number;
  cameraName?: string;
  plate: string;
  placeId?: number;
  parkingId?: number;
  sessionId?: number;
  gateId?: number;
  direction?: string;
  reason?: string;
  authorized?: boolean;
  confidence?: number;
  occurredAt: string;
  plateImage?: string;
  vehicleImage?: string;
  vehicleType?: string;
  vehicleColor?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  carSpeed?: string;
  state?: string;
  isSpeeding?: boolean;
  speedLimit?: number;
  plateChars?: string;
  plateDigits?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface ParkingPlace {
  id: number;
  name: string;
  parkingId?: number;
  isEmpty: boolean;
  occupancyStatus?: number;
  indexNo?: number;
  cellNo?: number;
  carStatus?: string;
  carDirection?: string;
  latitude?: number;
  longitude?: number;
}

export interface ParkingPlaceWrite {
  name: string;
  parkingId: number;
  isEmpty: boolean;
  indexNo?: number;
  cellNo?: number;
  carStatus?: string;
  carDirection?: string;
  latitude?: number;
  longitude?: number;
}

export interface ParkingLotRef {
  id: number;
  name: string;
  zoneId?: number;
  emptyPlaces?: number;
  totalPlaces?: number;
  latitude?: number;
  longitude?: number;
}

export interface ParkingZoneRef {
  id: number;
  name: string;
  areaId?: number;
  parkingCount?: number;
}

export interface ParkingWrite {
  name: string;
  zoneId: number;
  costPerHour?: number;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface GateRow {
  id: number;
  name: string;
  parkingId?: number | null;
  parkingName?: string | null;
  direction?: string;
  isActive: boolean;
  lastEvent?: string;
  status?: string;
}

export interface GateWrite {
  name: string;
  parkingId?: number | null;
  direction?: string;
  isActive?: boolean;
}

export interface BarrierRow {
  id: number;
  name: string;
  gateId?: number | null;
  gateName?: string | null;
  state?: string;
  status?: string;
  providerKey?: string;
  deviceAddress?: string;
  isActive: boolean;
}

export interface BarrierStatusResult {
  barrierId: number;
  state: string;
  status: string;
  providerKey?: string;
  message?: string;
  checkedAt?: string;
}

export interface BarrierWrite {
  name: string;
  providerKey?: string;
  deviceAddress?: string;
  gateId?: number | null;
  isActive?: boolean;
}

export interface DeviceHealthSummary {
  totalDevices: number;
  online: number;
  warning: number;
  offline: number;
  error: number;
  maintenance: number;
  unknown: number;
  byDeviceType: Record<string, number>;
}

export interface ActiveProblemItem {
  id: string;
  category: string;
  severity: 'Critical' | 'Warning' | 'Info' | string;
  title: string;
  description: string;
  entityId?: string;
  occurredAt: string;
}

export interface OperationsCenterOverview {
  totalCapacity: number;
  totalOccupied: number;
  totalFree: number;
  occupancyPercent: number;
  activeSessionsCount: number;
  todayEntriesCount: number;
  todayExitsCount: number;
  deviceHealth: DeviceHealthSummary;
  activeProblems: ActiveProblemItem[];
  recentLprEvents: any[];
  gates: GateRow[];
  barriers: BarrierRow[];
  cameras: CameraRow[];
  edgeAgents: any[];
}

export interface ManualBarrierCommandBody {
  barrierId: number;
  command: 'OPEN' | 'CLOSE' | 'EMERGENCY_OPEN' | 'RESET' | string;
  reason: string;
  idempotencyKey?: string;
}

export interface AlarmAuditDto {
  id: number;
  alarmId: number;
  userId?: number;
  userName?: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
  timestamp: string;
  correlationId?: string;
}

export interface AlarmDto {
  id: number;
  alarmType: string;
  severity: 'Info' | 'Warning' | 'High' | 'Critical' | string;
  source: string;
  deviceId?: number;
  buildingId?: number;
  zoneId?: number;
  status: 'Open' | 'Acknowledged' | 'Assigned' | 'InProgress' | 'Resolved' | 'Closed' | string;
  message: string;
  correlationId?: string;
  dedupKey?: string;
  occurrencesCount: number;
  createdAt: string;
  lastOccurredAt: string;
  acknowledgedAt?: string;
  acknowledgedByUserName?: string;
  assignedToUserId?: number;
  assignedToUserName?: string;
  resolvedAt?: string;
  resolvedByUserName?: string;
  closedAt?: string;
  closedByUserName?: string;
  isIncident: boolean;
  incidentNumber?: string;
  resolutionNote?: string;
  audits?: AlarmAuditDto[];
}


