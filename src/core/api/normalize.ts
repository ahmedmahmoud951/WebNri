import type {
  AccessPass,
  AdminUserRow,
  Building,
  DistrictInvoice,
  EvCharger,
  EvChargerStatus,
  GraceViolation,
  IndoorRoute,
  Occupancy,
  OccupancyLot,
  OccupancyReport,
  OccupancyUpdated,
  ParkingBundle,
  ParkingReceipt,
  ParkingReservation,
  ParkingSession,
  ParkingSubscription,
  PaymentCapture,
  PaymentIntent,
  PlateBinding,
  PlateSearchHit,
  ReservationStatus,
  RouteEdge,
  RouteNode,
  SessionUpdated,
  SupportTicket,
  TicketType,
  UserProfile,
  Vehicle,
  VehicleLocation,
  VehicleLocationCleared,
  VehicleLocationPoint,
  VehicleLocationUpdated,
} from './types';
import { normalizeRole, unwrapData, unwrapList } from './types';

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asOptionalNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function normalizeIsoUtcDate(raw: unknown): string | undefined {
  if (raw == null || raw === '') return undefined;
  const str = String(raw).trim();
  if (!str) return undefined;
  // If date contains 'T' (ISO format) but lacks 'Z' or timezone offset, append 'Z' to treat as UTC
  if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
    return str + 'Z';
  }
  return str;
}

function normalizeReservationStatus(raw: unknown): ReservationStatus {
  const value = String(raw ?? 'Booked');
  if (value === 'Confirmed' || value === 'Active' || value === 'Pending') return 'Booked';
  if (value === 'Cancelled' || value === 'Used' || value === 'Expired' || value === 'Booked') return value;
  return 'Booked';
}

export function normalizeAuthTokens(payload: unknown) {
  const data = unwrapData<Record<string, unknown>>(payload);
  return {
    accessToken: String(data.accessToken ?? ''),
    refreshToken: data.refreshToken ? String(data.refreshToken) : undefined,
    expiresIn: asNumber(data.expiresIn, 3600),
    expiresAt: data.expiresAt ? String(data.expiresAt) : undefined,
    tokenType: data.tokenType ? String(data.tokenType) : undefined,
    username: data.username
      ? String(data.username)
      : data.userName
        ? String(data.userName)
        : undefined,
    displayName: data.displayName ? String(data.displayName) : undefined,
    role: data.role ? String(data.role) : undefined,
    permissions: Array.isArray(data.permissions) ? (data.permissions as string[]) : undefined,
  };
}

export function normalizeUser(payload: unknown): UserProfile {
  const data = unwrapData<Record<string, unknown>>(payload);
  const vehiclesRaw = Array.isArray(data.vehicles) ? data.vehicles : [];
  return {
    userId: asNumber(data.userId ?? data.id),
    displayName: String(data.displayName ?? data.username ?? data.userName ?? ''),
    role: normalizeRole(String(data.role ?? data.roleName ?? 'visitor')),
    locale: String(data.locale ?? 'ar'),
    buildingId: asOptionalNumber(data.buildingId) ?? null,
    unitId: data.unitId ? String(data.unitId) : null,
    vehicles: vehiclesRaw.map((item) => normalizeVehicle(item)),
  };
}

export function normalizeVehicle(raw: unknown): Vehicle {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    id: data.id == null ? undefined : asNumber(data.id),
    plate: String(data.plate ?? ''),
    make: data.make ? String(data.make) : undefined,
    model: data.model ? String(data.model) : undefined,
  };
}

export function normalizeBuilding(raw: unknown): Building {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    id: asNumber(data.id ?? data.buildingId),
    name: String(data.name ?? data.id ?? ''),
    emptyPlaces: asNumber(data.emptyPlaces ?? data.free),
    totalPlaces: asNumber(data.totalPlaces ?? data.total),
    reservedPlaces: asOptionalNumber(data.reservedPlaces),
    zonesCount: asOptionalNumber(data.zonesCount ?? data.activeZones),
  };
}

export function normalizeBuildings(payload: unknown): Building[] {
  return unwrapList(payload).map(normalizeBuilding);
}

export function normalizeOccupancy(payload: unknown): Occupancy {
  const data = unwrapData<Record<string, unknown>>(payload);
  const zones = Array.isArray(data.zones) ? data.zones : [];
  return {
    buildingId: asNumber(data.buildingId),
    zones: zones.map((item) => {
      const zone = item as Record<string, unknown>;
      return {
        zoneId: asNumber(zone.zoneId ?? zone.id),
        name: zone.name ? String(zone.name) : undefined,
        free: asNumber(zone.free ?? zone.emptyPlaces),
        total: asNumber(zone.total ?? zone.totalPlaces),
      };
    }),
  };
}

export function normalizeOccupancyLot(raw: unknown): OccupancyLot {
  const data = (raw ?? {}) as Record<string, unknown>;
  const total = asNumber(data.totalSpaces ?? data.total);
  const free = asNumber(data.freeSpaces ?? data.free ?? data.emptyPlaces);
  const occupied = asOptionalNumber(data.occupied) ?? Math.max(0, total - free);
  return {
    parkingId: asNumber(data.parkingId ?? data.id),
    name: String(data.parkingName ?? data.name ?? data.parkingId ?? ''),
    zoneId: asOptionalNumber(data.zoneId),
    buildingId: asOptionalNumber(data.areaId ?? data.buildingId),
    free,
    occupied,
    total,
    reserved: asOptionalNumber(data.reserved ?? data.reservedPlaces),
  };
}

export function normalizeOccupancyLots(payload: unknown): OccupancyLot[] {
  return unwrapList(payload).map(normalizeOccupancyLot);
}

function mapSessionStatus(raw: unknown): ParkingSession['status'] {
  const key = String(raw ?? '').toLowerCase();
  if (key.includes('paid') || key.includes('exit') || key.includes('captured')) return 'Paid';
  if (key.includes('closed') || key.includes('expired') || key.includes('cancel')) return 'Closed';
  return 'Open';
}

export function normalizeSession(payload: unknown): ParkingSession {
  const data = unwrapData<Record<string, unknown>>(payload) ?? ((payload ?? {}) as Record<string, unknown>);
  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  return {
    sessionId: asNumber(body.sessionId ?? body.id),
    status: mapSessionStatus(body.status ?? body.lifecycle ?? body.paymentStatus),
    buildingId: asOptionalNumber(body.buildingId ?? body.areaId),
    plate: body.plate ? String(body.plate) : undefined,
    gateId: body.gateId == null ? undefined : asNumber(body.gateId),
    startedAt: normalizeIsoUtcDate(body.startedAt),
    endedAt: normalizeIsoUtcDate(body.endedAt) ?? null,
    graceUntil: normalizeIsoUtcDate(body.graceUntil) ?? null,
    amountDue: body.amountDue == null && body.amount == null ? undefined : asNumber(body.amountDue ?? body.amount),
    currency: body.currency ? String(body.currency) : undefined,
    lifecycle: body.lifecycle ? String(body.lifecycle) : body.status ? String(body.status) : undefined,
    extraFee: body.extraFee == null && body.extraFeeAmount == null ? undefined : asNumber(body.extraFee ?? body.extraFeeAmount),
    extraFeeCurrency: body.extraFeeCurrency ? String(body.extraFeeCurrency) : body.currency ? String(body.currency) : undefined,
    parkingId: asOptionalNumber(body.parkingId),
    parkingName: body.parkingName ? String(body.parkingName) : body.parkingLotName ? String(body.parkingLotName) : undefined,
    placeName: body.placeName ? String(body.placeName) : undefined,
  };
}

export function normalizePayment(payload: unknown): PaymentIntent & PaymentCapture {
  const data = unwrapData<Record<string, unknown>>(payload);
  return {
    id: asNumber(data.id),
    sessionId: asNumber(data.sessionId),
    amount: asNumber(data.amount),
    currency: String(data.currency ?? 'EGP'),
    status: String(data.status ?? ''),
    replay: Boolean(data.replay),
    graceUntil: data.graceUntil ? String(data.graceUntil) : null,
  };
}

export function normalizeTicket(payload: unknown): SupportTicket {
  const data = unwrapData<Record<string, unknown>>(payload);
  return {
    id: asNumber(data.id),
    userId: data.userId == null ? undefined : asNumber(data.userId),
    type: normalizeTicketType(data.type),
    note: String(data.note ?? ''),
    status: (data.status as SupportTicket['status']) ?? 'Open',
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    userName: data.userName ? String(data.userName) : data.username ? String(data.username) : undefined,
    resolutionNote: data.resolutionNote ? String(data.resolutionNote) : data.resolution ? String(data.resolution) : undefined,
    updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
  };
}

function normalizeTicketType(raw: unknown): TicketType {
  const key = String(raw ?? 'other').toLowerCase().replace(/[\s-]+/g, '_');
  if (key === 'lost_ticket' || key === 'lostticket' || key === 'lost') return 'lost_ticket';
  if (key === 'barrier') return 'barrier';
  if (key === 'waste') return 'waste';
  if (key === 'maintenance') return 'maintenance';
  return 'other';
}

export function normalizeOccupancyEvent(raw: unknown): OccupancyUpdated {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    eventId: data.eventId ? String(data.eventId) : undefined,
    buildingId: asNumber(data.buildingId),
    zoneId: asOptionalNumber(data.zoneId),
    parkingId: asOptionalNumber(data.parkingId),
    free: asNumber(data.free),
    total: asNumber(data.total),
    at: String(data.occurredAt ?? data.at ?? new Date().toISOString()),
  };
}

export function normalizeSessionEvent(raw: unknown): SessionUpdated {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    sessionId: asNumber(data.sessionId),
    status: (data.status as SessionUpdated['status']) ?? 'Open',
    plate: data.plate ? String(data.plate) : undefined,
    at: String(data.occurredAt ?? data.at ?? new Date().toISOString()),
    graceUntil: data.graceUntil ? String(data.graceUntil) : null,
    amountDue: data.amountDue == null ? undefined : asNumber(data.amountDue),
    currency: data.currency ? String(data.currency) : undefined,
    parkingId: asOptionalNumber(data.parkingId),
    buildingId: asOptionalNumber(data.buildingId),
  };
}

export function normalizeReceipt(raw: unknown): ParkingReceipt {
  const data = (raw ?? {}) as Record<string, unknown>;
  const rawPaidAt = data.paidAt ?? data.capturedAt ?? data.endedAt ?? data.startedAt ?? new Date().toISOString();
  const paidAt = normalizeIsoUtcDate(rawPaidAt) ?? String(rawPaidAt);
  return {
    sessionId: asNumber(data.sessionId ?? data.id),
    plate: data.plate ? String(data.plate) : undefined,
    buildingId: asOptionalNumber(data.buildingId),
    gateId: data.gateId == null ? undefined : asNumber(data.gateId),
    amount: asNumber(data.amount ?? data.amountDue ?? data.total),
    currency: String(data.currency ?? 'EGP'),
    paidAt,
    graceUntil: normalizeIsoUtcDate(data.graceUntil) ?? null,
    endedAt: normalizeIsoUtcDate(data.endedAt) ?? null,
    status: (data.status as ParkingReceipt['status']) ?? 'Captured',
    parkingName: data.parkingName ? String(data.parkingName) : undefined,
  };
}

export function normalizeReceipts(payload: unknown): ParkingReceipt[] {
  return unwrapList(payload).map(normalizeReceipt);
}

export function normalizeBundle(raw: unknown): ParkingBundle {
  const data = (raw ?? {}) as Record<string, unknown>;
  const periodRaw = String(data.period ?? 'monthly').toLowerCase();
  const period =
    periodRaw === 'annual' || periodRaw === 'yearly'
      ? 'annual'
      : periodRaw === 'quarterly'
        ? 'quarterly'
        : 'monthly';
  return {
    id: asNumber(data.id ?? data.bundleId),
    name: String(data.name ?? data.title ?? data.id),
    period,
    price: asNumber(data.price ?? data.amount),
    currency: String(data.currency ?? 'EGP'),
    guaranteedSlot: Boolean(data.guaranteedSlot ?? data.reservedSlot ?? true),
    buildingId: asOptionalNumber(data.buildingId),
  };
}

export function normalizeBundles(payload: unknown): ParkingBundle[] {
  return unwrapList(payload).map(normalizeBundle);
}

export function normalizeSubscription(raw: unknown): ParkingSubscription {
  const data = unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>);
  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  return {
    id: asNumber(body.id),
    bundleId: asNumber(body.bundleId),
    bundleName: String(body.bundleName ?? body.name ?? body.bundleId),
    status: (body.status as ParkingSubscription['status']) ?? 'Active',
    plate: body.plate ? String(body.plate) : undefined,
    buildingId: asOptionalNumber(body.buildingId),
    startsAt: normalizeIsoUtcDate(body.startsAt ?? body.startAt) ?? '',
    endsAt: normalizeIsoUtcDate(body.endsAt ?? body.endAt) ?? '',
    price: asNumber(body.price ?? body.amount),
    currency: String(body.currency ?? 'EGP'),
    mainArea: body.mainArea ? String(body.mainArea) : undefined,
    slotReserved: body.slotReserved == null ? undefined : Boolean(body.slotReserved),
    slotLabel: body.slotLabel ? String(body.slotLabel) : undefined,
    optionalAreas: normalizeOptionalAreas(body.optionalAreas),
  };
}

function normalizeOptionalAreas(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return String(item);
      if (item && typeof item === 'object') {
        const row = item as Record<string, unknown>;
        return String(row.name ?? row.label ?? row.area ?? row.id ?? '');
      }
      return '';
    })
    .filter(Boolean);
  return items.length ? items : undefined;
}

export function overlaySubscription(
  base: ParkingSubscription | null,
  extra: ParkingSubscription | null,
): ParkingSubscription | null {
  if (!base && !extra) return null;
  if (!base) return extra;
  if (!extra) return base;
  return {
    ...base,
    plate: extra.plate || base.plate,
    buildingId: extra.buildingId ?? base.buildingId,
    mainArea: extra.mainArea ?? base.mainArea,
    slotReserved: extra.slotReserved ?? base.slotReserved,
    slotLabel: extra.slotLabel ?? base.slotLabel,
    optionalAreas: extra.optionalAreas ?? base.optionalAreas,
    startsAt: extra.startsAt || base.startsAt,
    endsAt: extra.endsAt || base.endsAt,
    bundleName: extra.bundleName && extra.bundleName !== '0' ? extra.bundleName : base.bundleName,
  };
}

export function normalizeAccessPass(raw: unknown): AccessPass | null {
  const data = unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>);
  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const payload = body.payload != null ? String(body.payload) : '';
  if (!payload) return null;
  return {
    payload,
    kind: String(body.kind ?? body.type ?? 'session'),
    plate: body.plate ? String(body.plate) : undefined,
    buildingId: asOptionalNumber(body.buildingId),
    validUntil: normalizeIsoUtcDate(body.validUntil ?? body.expiresAt),
    displayName: body.displayName ? String(body.displayName) : undefined,
    slotLabel: body.slotLabel ? String(body.slotLabel) : undefined,
    code: body.code ? String(body.code) : undefined,
  };
}

function normalizeChargerStatus(raw: unknown): EvChargerStatus {
  const key = String(raw ?? '').toLowerCase().replace(/[\s-]+/g, '_');
  if (key.includes('avail') || key === 'free' || key === 'idle') return 'Available';
  if (key.includes('charg')) return 'Charging';
  if (key.includes('occup') || key.includes('busy') || key.includes('in_use') || key === 'inuse') {
    return 'Occupied';
  }
  if (key.includes('off') || key.includes('fault') || key.includes('unavail')) return 'Offline';
  return 'Unknown';
}

export function normalizeEvCharger(raw: unknown): EvCharger {
  const data = (raw ?? {}) as Record<string, unknown>;
  const free = asOptionalNumber(data.free ?? data.freeSpaces);
  const total = asOptionalNumber(data.total ?? data.totalSpaces);
  const statusRaw = data.status ?? data.state;
  let status = normalizeChargerStatus(statusRaw);
  const key = String(statusRaw ?? '').toLowerCase();
  if (status === 'Unknown' && (key === 'online' || key === 'ok' || key === 'active')) {
    status = free === 0 ? 'Occupied' : 'Available';
  }
  const platformStatus: EvCharger['platformStatus'] =
    key.includes('off') || key.includes('fault') || key.includes('unavail') ? 'offline' : 'online';
  return {
    id: asNumber(data.id ?? data.chargerId),
    name: String(data.name ?? data.label ?? data.code ?? data.id ?? ''),
    status,
    connector: data.connector ? String(data.connector) : data.type ? String(data.type) : undefined,
    powerKw: asOptionalNumber(data.powerKw ?? data.powerKW ?? data.kw),
    slotLabel: data.slotLabel ? String(data.slotLabel) : data.bay ? String(data.bay) : undefined,
    free,
    total,
    platformStatus,
  };
}

export function normalizeEvChargers(payload: unknown): EvCharger[] {
  return unwrapList(payload).map(normalizeEvCharger);
}

function normalizeInvoiceStatus(raw: unknown): DistrictInvoice['status'] {
  const key = String(raw ?? '').toLowerCase();
  if (key.includes('over')) return 'Overdue';
  if (key.includes('paid') || key.includes('settled')) return 'Paid';
  if (key.includes('due') || key.includes('unpaid') || key.includes('open')) return 'Due';
  return 'Unknown';
}

export function normalizeInvoice(raw: unknown): DistrictInvoice {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    id: asNumber(data.id ?? data.invoiceId),
    title: String(data.title ?? data.description ?? data.period ?? data.id ?? ''),
    amount: asNumber(data.amount ?? data.total ?? data.balance),
    currency: String(data.currency ?? 'EGP'),
    status: normalizeInvoiceStatus(data.status),
    dueAt: normalizeIsoUtcDate(data.dueAt ?? data.dueDate),
    issuedAt: normalizeIsoUtcDate(data.issuedAt ?? data.createdAt),
    period: data.period ? String(data.period) : undefined,
  };
}

export function normalizeInvoices(payload: unknown): DistrictInvoice[] {
  return unwrapList(payload).map(normalizeInvoice);
}

export function normalizeReservation(raw: unknown): ParkingReservation {
  const data = unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>);
  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  return {
    id: asNumber(body.id),
    buildingId: asNumber(body.buildingId),
    zoneId: asOptionalNumber(body.zoneId),
    plate: String(body.plate ?? ''),
    startsAt: normalizeIsoUtcDate(body.startsAt) ?? '',
    endsAt: normalizeIsoUtcDate(body.endsAt) ?? '',
    status: normalizeReservationStatus(body.status),
    guestName: body.guestName ? String(body.guestName) : undefined,
    guestPhone: body.guestPhone ? String(body.guestPhone) : undefined,
    inviteCode: body.inviteCode ? String(body.inviteCode) : undefined,
  };
}

export function normalizeReservations(payload: unknown): ParkingReservation[] {
  return unwrapList(payload).map(normalizeReservation);
}

export function normalizePlateHit(raw: unknown): PlateSearchHit {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    plate: String(data.plate ?? ''),
    buildingId: asNumber(data.buildingId),
    buildingName: data.buildingName ? String(data.buildingName) : undefined,
    zoneName: data.zoneName ? String(data.zoneName) : undefined,
    status: (data.status as PlateSearchHit['status']) ?? 'Unknown',
    startedAt: normalizeIsoUtcDate(data.startedAt),
    sessionId: asOptionalNumber(data.sessionId),
  };
}

export function normalizePlateBinding(raw: unknown): PlateBinding {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    vehicleId: asNumber(data.vehicleId ?? data.id),
    plate: String(data.plate ?? ''),
    normalizedPlate: data.normalizedPlate ? String(data.normalizedPlate) : undefined,
    userId: asOptionalNumber(data.userId),
    userName: data.userName ? String(data.userName) : undefined,
    displayName: data.displayName ? String(data.displayName) : undefined,
    make: data.make ? String(data.make) : undefined,
    model: data.model ? String(data.model) : undefined,
  };
}

export function normalizeReport(payload: unknown): OccupancyReport {
  const data = unwrapData<Record<string, unknown>>(payload);
  return {
    buildingCount: asNumber(data.buildingCount ?? data.buildings),
    free: asNumber(data.free ?? data.emptyPlaces),
    occupied: asNumber(data.occupied),
    total: asNumber(data.total ?? data.totalPlaces),
    revenueToday: asNumber(data.revenueToday ?? data.revenue),
    currency: String(data.currency ?? 'EGP'),
    graceViolations: asNumber(data.graceViolations),
    activeSubscriptions: asNumber(data.activeSubscriptions),
  };
}

export function normalizeAdminUser(raw: unknown): AdminUserRow {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    userId: asNumber(data.userId ?? data.id),
    userName: String(data.userName ?? data.username ?? ''),
    displayName: String(data.displayName ?? data.userName ?? ''),
    role: normalizeRole(String(data.role ?? data.roleName ?? 'visitor')),
    buildingId: asOptionalNumber(data.buildingId) ?? null,
    isActive: data.isActive == null ? true : Boolean(data.isActive),
  };
}

export function normalizeGraceViolation(raw: unknown): GraceViolation {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    sessionId: asNumber(data.sessionId ?? data.id),
    plate: data.plate ? String(data.plate) : undefined,
    buildingId: asOptionalNumber(data.buildingId),
    buildingName: data.buildingName ? String(data.buildingName) : undefined,
    gateId: data.gateId == null ? undefined : asNumber(data.gateId),
    paidAt: data.paidAt ? String(data.paidAt) : undefined,
    graceUntil: String(data.graceUntil ?? ''),
    extraFee: asNumber(data.extraFee ?? data.extraFeeAmount),
    currency: String(data.currency ?? data.extraFeeCurrency ?? 'EGP'),
    stillParked: data.stillParked == null ? true : Boolean(data.stillParked),
  };
}

function nodeCoord(row: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = asOptionalNumber(row[key]);
    if (value != null) return value;
  }
  return undefined;
}

function nodeId(row: Record<string, unknown>, fallback: number): string {
  return String(row.id ?? row.nodeId ?? row.key ?? fallback);
}

export function normalizeRouteNode(raw: unknown, index: number): RouteNode | null {
  const row = (raw ?? {}) as Record<string, unknown>;
  const x = nodeCoord(row, ['x', 'indoorX', 'locX', 'positionX']);
  const y = nodeCoord(row, ['y', 'indoorY', 'locY', 'positionY']);
  if (x == null || y == null) return null;
  return {
    id: nodeId(row, index),
    x,
    y,
    floorId: asOptionalNumber(row.floorId),
    name: row.name ? String(row.name) : row.label ? String(row.label) : undefined,
  };
}

export function normalizeRouteEdge(raw: unknown): RouteEdge | null {
  const row = (raw ?? {}) as Record<string, unknown>;
  const fromId = row.fromId ?? row.fromNodeId ?? row.sourceId ?? row.from ?? row.source ?? row.a;
  const toId = row.toId ?? row.toNodeId ?? row.targetId ?? row.to ?? row.target ?? row.b;
  if (fromId == null || toId == null) return null;
  return { fromId: String(fromId), toId: String(toId) };
}

function normalizeInstructions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const row = item as Record<string, unknown>;
        return String(row.text ?? row.instruction ?? row.message ?? row.description ?? '');
      }
      return '';
    })
    .filter(Boolean);
}

export function normalizeIndoorRoute(raw: unknown): IndoorRoute | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const body = raw as Record<string, unknown>;
  const mappedNodes = (Array.isArray(body.nodes) ? body.nodes : [])
    .map((item, index) => normalizeRouteNode(item, index))
    .filter((item): item is RouteNode => Boolean(item));
  const edges = unwrapList(body.edges)
    .map((item) => normalizeRouteEdge(item))
    .filter((item): item is RouteEdge => Boolean(item));
  const instructions = normalizeInstructions(body.instructions);
  const totalDistance = asOptionalNumber(body.totalDistance ?? body.distance);
  const estimatedTimeSeconds = asOptionalNumber(
    body.estimatedTimeSeconds ?? body.durationSeconds ?? body.etaSeconds,
  );
  if (!mappedNodes.length && !edges.length && totalDistance == null && estimatedTimeSeconds == null && !instructions.length) {
    return undefined;
  }
  return {
    totalDistance,
    estimatedTimeSeconds,
    nodes: mappedNodes,
    edges,
    instructions,
  };
}

function normalizeAccuracy(raw: unknown): VehicleLocation['locationAccuracy'] {
  const key = String(raw ?? '').toLowerCase().replace(/[\s-]+/g, '');
  if (key === 'exact') return 'Exact';
  if (key === 'approximate') return 'Approximate';
  if (key === 'zoneonly' || key === 'zone') return 'ZoneOnly';
  if (!key) return undefined;
  return 'Unknown';
}

export function normalizeVehicleLocationPoint(raw: unknown): VehicleLocationPoint {
  const body = (unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>)) as Record<
    string,
    unknown
  >;
  return {
    vehicleId: asOptionalNumber(body.vehicleId),
    plate: body.plate ? String(body.plate) : undefined,
    areaName: body.areaName ? String(body.areaName) : body.buildingName ? String(body.buildingName) : undefined,
    placeId: body.placeId != null ? (typeof body.placeId === 'number' ? body.placeId : String(body.placeId)) : undefined,
    placeName: body.placeName ? String(body.placeName) : undefined,
    zoneName: body.zoneName ? String(body.zoneName) : undefined,
    parkingLotName: body.parkingLotName
      ? String(body.parkingLotName)
      : body.parkingName
        ? String(body.parkingName)
        : undefined,
    floorId: body.floorId != null ? (typeof body.floorId === 'number' ? body.floorId : String(body.floorId)) : undefined,
    laneName: body.laneName ? String(body.laneName) : undefined,
    locationAccuracy: normalizeAccuracy(body.locationAccuracy),
    capturedAt: normalizeIsoUtcDate(body.capturedAt ?? body.updatedAt ?? body.recordedAt),
    latitude: asOptionalNumber(body.latitude ?? body.lat),
    longitude: asOptionalNumber(body.longitude ?? body.lng ?? body.lon),
    indoorX: asOptionalNumber(body.indoorX),
    indoorY: asOptionalNumber(body.indoorY),
    indoorZ: asOptionalNumber(body.indoorZ),
    locationType: body.locationType ? String(body.locationType) : undefined,
    isCurrent: body.isCurrent == null ? undefined : Boolean(body.isCurrent),
  };
}

export function normalizeVehicleLocation(raw: unknown): VehicleLocation {
  const data = unwrapData<Record<string, unknown>>(raw) ?? ((raw ?? {}) as Record<string, unknown>);
  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const foundExplicit = body.found;
  const plate = body.plate ? String(body.plate) : '';
  const found =
    foundExplicit == null
      ? Boolean(
          plate ||
            body.placeName ||
            body.areaName ||
            body.zoneName ||
            body.indoorX != null ||
            body.latitude != null,
        )
      : Boolean(foundExplicit);
  return {
    found,
    plate,
    vehicleId: asOptionalNumber(body.vehicleId),
    sessionId: asOptionalNumber(body.sessionId ?? body.parkingSessionId),
    message: body.message ? String(body.message) : undefined,
    isCurrent: body.isCurrent == null ? found : Boolean(body.isCurrent),
    locationType: body.locationType ? String(body.locationType) : undefined,
    areaName: body.areaName ? String(body.areaName) : body.buildingName ? String(body.buildingName) : undefined,
    zoneName: body.zoneName ? String(body.zoneName) : undefined,
    parkingLotName: body.parkingLotName
      ? String(body.parkingLotName)
      : body.parkingName
        ? String(body.parkingName)
        : undefined,
    floorId: body.floorId != null ? (typeof body.floorId === 'number' ? body.floorId : String(body.floorId)) : undefined,
    laneName: body.laneName ? String(body.laneName) : undefined,
    placeId: body.placeId != null ? (typeof body.placeId === 'number' ? body.placeId : String(body.placeId)) : undefined,
    placeName: body.placeName ? String(body.placeName) : undefined,
    locationAccuracy: normalizeAccuracy(body.locationAccuracy),
    capturedAt: normalizeIsoUtcDate(body.capturedAt ?? body.updatedAt ?? body.recordedAt),
    latitude: asOptionalNumber(body.latitude ?? body.lat),
    longitude: asOptionalNumber(body.longitude ?? body.lng ?? body.lon),
    indoorX: asOptionalNumber(body.indoorX),
    indoorY: asOptionalNumber(body.indoorY),
    indoorZ: asOptionalNumber(body.indoorZ),
    route: normalizeIndoorRoute(body.route),
  };
}

export function normalizeLocationUpdated(raw: unknown): VehicleLocationUpdated {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    plate: String(data.plate ?? ''),
    at: data.at ? String(data.at) : data.occurredAt ? String(data.occurredAt) : undefined,
  };
}

export function normalizeLocationCleared(raw: unknown): VehicleLocationCleared {
  const data = (raw ?? {}) as Record<string, unknown>;
  return {
    plate: String(data.plate ?? ''),
    at: data.at ? String(data.at) : data.occurredAt ? String(data.occurredAt) : undefined,
  };
}
