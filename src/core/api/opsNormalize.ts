import { unwrapData, unwrapList } from './types';
import type {
  BarrierRow,
  BarrierStatusResult,
  CameraProbeResult,
  CameraRow,
  CameraSnapshot,
  CameraStatus,
  CameraTestResult,
  CameraViewRow,
  CameraViewSlotRow,
  GateRow,
  LprEvent,
  ManagedUser,
  PermissionRow,
  RoleRow,
  VehiclePlateEvent,
} from './opsTypes';


function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asOptionalNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function normalizeManagedUser(raw: unknown): ManagedUser {
  const data = (unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>)) as Record<
    string,
    unknown
  >;
  return {
    id: asNumber(data.id ?? data.userId),
    userName: String(data.userName ?? data.username ?? ''),
    displayName: String(data.displayName ?? data.userName ?? data.username ?? ''),
    email: data.email ? String(data.email) : undefined,
    phoneNumber: data.phoneNumber ? String(data.phoneNumber) : undefined,
    roleId: asOptionalNumber(data.roleId),
    roleName: data.roleName ? String(data.roleName) : data.role ? String(data.role) : undefined,
    isActive: data.isActive == null ? true : Boolean(data.isActive),
    createdAt: data.createdAt ? String(data.createdAt) : undefined,
    buildingId: asOptionalNumber(data.buildingId) ?? null,
  };
}

export function normalizeRole(raw: unknown): RoleRow {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    id: asNumber(data.id),
    name: String(data.name ?? ''),
    isActive: data.isActive == null ? true : Boolean(data.isActive),
  };
}

export function normalizePermission(raw: unknown): PermissionRow {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    id: asNumber(data.id),
    code: String(data.code ?? ''),
    description: data.description ? String(data.description) : undefined,
    isActive: data.isActive == null ? true : Boolean(data.isActive),
  };
}

export function normalizeCamera(raw: unknown): CameraRow {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    id: asNumber(data.id),
    name: String(data.name ?? ''),
    ip: String(data.ip ?? ''),
    streamUrl: data.streamUrl ? String(data.streamUrl) : undefined,
    rtspUrl: data.rtspUrl ? String(data.rtspUrl) : undefined,
    snapshotUrl: data.snapshotUrl ? String(data.snapshotUrl) : undefined,
    userName: data.userName ? String(data.userName) : undefined,
    hasPassword: Boolean(data.hasPassword),
    isActive: data.isActive == null ? true : Boolean(data.isActive),
    typeCode: data.typeCode ? String(data.typeCode) : undefined,
    manufacturer: data.manufacturer ? String(data.manufacturer) : undefined,
    model: data.model ? String(data.model) : undefined,
    httpPort: asOptionalNumber(data.httpPort),
    groupNum: asNumber(data.groupNum),
    cameraTypeId: data.cameraTypeId != null ? String(data.cameraTypeId) : undefined,
    status: data.status ? String(data.status) : undefined,
    parkingId: asOptionalNumber(data.parkingId),
    zoneId: asOptionalNumber(data.zoneId),
    gateId: asOptionalNumber(data.gateId),
    laneId: asOptionalNumber(data.laneId),
    lane: data.lane ? String(data.lane) : undefined,
    direction: data.direction ? String(data.direction) : undefined,
    latitude: asOptionalNumber(data.latitude),
    longitude: asOptionalNumber(data.longitude),
    indoorX: asOptionalNumber(data.indoorX),
    indoorY: asOptionalNumber(data.indoorY),
    indoorZ: asOptionalNumber(data.indoorZ),
    floorId: asOptionalNumber(data.floorId),
  };
}

export function normalizeProbe(raw: unknown): CameraProbeResult {
  const data = (unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>)) as Record<
    string,
    unknown
  >;
  return {
    success: Boolean(data.success),
    usedOnvif: Boolean(data.usedOnvif),
    manufacturer: data.manufacturer ? String(data.manufacturer) : undefined,
    model: data.model ? String(data.model) : undefined,
    firmware: data.firmware ? String(data.firmware) : undefined,
    brandKey: data.brandKey ? String(data.brandKey) : undefined,
    streamUrl: data.streamUrl ? String(data.streamUrl) : undefined,
    snapshotUrl: data.snapshotUrl ? String(data.snapshotUrl) : undefined,
    httpPort: asOptionalNumber(data.httpPort),
    message: data.message ? String(data.message) : undefined,
  };
}

export function normalizeCameraStatus(raw: unknown): CameraStatus {
  const data = (unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>)) as Record<
    string,
    unknown
  >;
  return {
    cameraId: asNumber(data.cameraId ?? data.id),
    online: Boolean(data.online),
    status: data.status ? String(data.status) : undefined,
    message: data.message ? String(data.message) : undefined,
    rtspUrl: data.rtspUrl ? String(data.rtspUrl) : undefined,
    snapshotUrl: data.snapshotUrl ? String(data.snapshotUrl) : undefined,
    checkedAt: data.checkedAt ? String(data.checkedAt) : undefined,
  };
}

export function normalizeCameraSnapshot(raw: unknown): CameraSnapshot {
  const data = (unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>)) as Record<
    string,
    unknown
  >;
  return {
    cameraId: asNumber(data.cameraId),
    success: Boolean(data.success),
    contentType: data.contentType ? String(data.contentType) : undefined,
    imageBase64: data.imageBase64 ? String(data.imageBase64) : undefined,
    message: data.message ? String(data.message) : undefined,
  };
}

export function normalizeCameraTest(raw: unknown): CameraTestResult {
  const data = (unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>)) as Record<
    string,
    unknown
  >;
  return {
    success: Boolean(data.success),
    status: data.status ? String(data.status) : undefined,
    message: data.message ? String(data.message) : undefined,
  };
}

export function normalizeCameraView(raw: unknown): CameraViewRow {
  const data = (unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>)) as Record<
    string,
    unknown
  >;
  const slotsRaw = Array.isArray(data.slots) ? data.slots : [];
  const slots: CameraViewSlotRow[] = slotsRaw.map((s) => {
    const slot = (s ?? {}) as Record<string, unknown>;
    return {
      rowIndex: asNumber(slot.rowIndex),
      columnIndex: asNumber(slot.columnIndex),
      cameraId: asNumber(slot.cameraId),
      cameraName: slot.cameraName ? String(slot.cameraName) : undefined,
      cameraIp: slot.cameraIp ? String(slot.cameraIp) : undefined,
    };
  });
  return {
    id: asNumber(data.id),
    name: String(data.name ?? ''),
    rowCount: Math.max(1, asNumber(data.rowCount, 1)),
    columnCount: Math.max(1, asNumber(data.columnCount, 1)),
    isActive: data.isActive == null ? true : Boolean(data.isActive),
    createdAt: data.createdAt ? String(data.createdAt) : undefined,
    slots,
  };
}

export function normalizeLprEvent(raw: unknown): LprEvent {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    id: (data.id as number | string) ?? crypto.randomUUID(),
    plateNumber: String(data.plateNumber ?? data.plate ?? ''),
    normalizedPlateNumber: data.normalizedPlateNumber ? String(data.normalizedPlateNumber) : undefined,
    confidence: asOptionalNumber(data.confidence),
    cameraId: asOptionalNumber(data.cameraId),
    cameraName: data.cameraName ? String(data.cameraName) : undefined,
    parkingId: asOptionalNumber(data.parkingId),
    direction: data.direction ? String(data.direction) : undefined,
    eventDateTime: String(data.eventDateTime ?? data.occurredAt ?? new Date().toISOString()),
    imagePath: data.imagePath ? String(data.imagePath) : data.vehicleImage ? String(data.vehicleImage) : undefined,
    plateImagePath: data.plateImagePath
      ? String(data.plateImagePath)
      : data.plateImage
        ? String(data.plateImage)
        : undefined,
    chars: data.chars ? String(data.chars) : data.plateChars ? String(data.plateChars) : undefined,
    number: data.number ? String(data.number) : data.plateDigits ? String(data.plateDigits) : undefined,
    vehicleType: data.vehicleType ? String(data.vehicleType) : undefined,
    vehicleColor: data.vehicleColor ? String(data.vehicleColor) : undefined,
    vehicleBrand: data.vehicleBrand ? String(data.vehicleBrand) : undefined,
    vehicleModel: data.vehicleModel ? String(data.vehicleModel) : undefined,
    groupNum: asOptionalNumber(data.groupNum),
    carSpeed: data.carSpeed ? String(data.carSpeed) : undefined,
    state: data.state ? String(data.state) : undefined,
    isSpeeding: Boolean(data.isSpeeding),
    speedLimit: asOptionalNumber(data.speedLimit),
    authorized: data.authorized == null ? undefined : Boolean(data.authorized),
    reason: data.reason ? String(data.reason) : undefined,
  };
}

export function normalizeVehiclePlateEvent(raw: unknown): VehiclePlateEvent {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    eventId: data.eventId ? String(data.eventId) : undefined,
    cameraId: asOptionalNumber(data.cameraId),
    cameraName: data.cameraName ? String(data.cameraName) : undefined,
    plate: String(data.plate ?? data.plateNumber ?? ''),
    placeId: asOptionalNumber(data.placeId),
    parkingId: asOptionalNumber(data.parkingId),
    sessionId: asOptionalNumber(data.sessionId),
    gateId: asOptionalNumber(data.gateId),
    direction: data.direction ? String(data.direction) : undefined,
    reason: data.reason ? String(data.reason) : undefined,
    authorized: Boolean(data.authorized),
    confidence: asOptionalNumber(data.confidence),
    occurredAt: String(data.occurredAt ?? data.eventDateTime ?? new Date().toISOString()),
    plateImage: data.plateImage ? String(data.plateImage) : data.plateImagePath ? String(data.plateImagePath) : undefined,
    vehicleImage: data.vehicleImage ? String(data.vehicleImage) : data.imagePath ? String(data.imagePath) : undefined,
    vehicleType: data.vehicleType ? String(data.vehicleType) : undefined,
    vehicleColor: data.vehicleColor ? String(data.vehicleColor) : undefined,
    vehicleBrand: data.vehicleBrand ? String(data.vehicleBrand) : undefined,
    vehicleModel: data.vehicleModel ? String(data.vehicleModel) : undefined,
    carSpeed: data.carSpeed ? String(data.carSpeed) : undefined,
    state: data.state ? String(data.state) : undefined,
    isSpeeding: Boolean(data.isSpeeding),
    speedLimit: asOptionalNumber(data.speedLimit),
    plateChars: data.plateChars ? String(data.plateChars) : data.chars ? String(data.chars) : undefined,
    plateDigits: data.plateDigits ? String(data.plateDigits) : data.number ? String(data.number) : undefined,
  };
}

export function pageMeta(payload: unknown, fallbackPage = 1, fallbackSize = 20) {
  const envelope = (payload ?? {}) as Record<string, unknown>;
  const data = unwrapData<Record<string, unknown>>(payload);
  const items = unwrapList(payload);
  return {
    items,
    page: asNumber(envelope.page ?? data?.page, fallbackPage),
    pageSize: asNumber(envelope.pageSize ?? data?.pageSize, fallbackSize),
    totalCount: asNumber(envelope.totalCount ?? data?.totalCount, items.length),
  };
}

export function normalizeGate(raw: unknown): GateRow {
  const data = (unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>)) as Record<
    string,
    unknown
  >;
  return {
    id: asNumber(data.id),
    name: String(data.name ?? ''),
    parkingId: asOptionalNumber(data.parkingId) ?? null,
    parkingName: data.parkingName ? String(data.parkingName) : null,
    direction: data.direction ? String(data.direction) : 'Bidirectional',
    isActive: data.isActive == null ? true : Boolean(data.isActive),
    lastEvent: data.lastEvent ? String(data.lastEvent) : undefined,
    status: data.status ? String(data.status) : (data.isActive !== false ? 'Online' : 'Offline'),
  };
}

export function normalizeBarrier(raw: unknown): BarrierRow {
  const data = (unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>)) as Record<
    string,
    unknown
  >;
  return {
    id: asNumber(data.id),
    name: String(data.name ?? ''),
    gateId: asOptionalNumber(data.gateId) ?? null,
    gateName: data.gateName ? String(data.gateName) : null,
    state: data.state ? String(data.state) : 'Closed',
    status: data.status ? String(data.status) : 'Closed',
    providerKey: data.providerKey ? String(data.providerKey) : 'simulated',
    deviceAddress: data.deviceAddress ? String(data.deviceAddress) : undefined,
    isActive: data.isActive == null ? true : Boolean(data.isActive),
  };
}

export function normalizeBarrierStatus(raw: unknown): BarrierStatusResult {
  const data = (unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>)) as Record<
    string,
    unknown
  >;
  return {
    barrierId: asNumber(data.barrierId ?? data.id),
    state: String(data.state ?? 'Closed'),
    status: String(data.status ?? data.state ?? 'Closed'),
    providerKey: data.providerKey ? String(data.providerKey) : undefined,
    message: data.message ? String(data.message) : undefined,
    checkedAt: data.checkedAt ? String(data.checkedAt) : new Date().toISOString(),
  };
}

