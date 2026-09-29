export type UserRole =
  | 'visitor'
  | 'citizen'
  | 'employee'
  | 'admin'
  | 'building-op'
  | 'cashier';

export type SessionStatus = 'Open' | 'Paid' | 'Closed';
export type TicketType = 'lost_ticket' | 'barrier' | 'waste' | 'maintenance' | 'other';
export type TicketStatus = 'Open' | 'InProgress' | 'Closed';

export function ticketTypeI18nKey(type: TicketType): string {
  if (type === 'lost_ticket') return 'tickets.typeLost';
  if (type === 'barrier') return 'tickets.typeBarrier';
  if (type === 'waste') return 'tickets.typeWaste';
  if (type === 'maintenance') return 'tickets.typeMaintenance';
  return 'tickets.typeOther';
}

export interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  code?: string;
  errorCode?: string;
  message?: string;
  correlationId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt?: string;
  tokenType?: string;
  username?: string;
  displayName?: string;
  role?: string;
  permissions?: string[];
}

export interface Vehicle {
  id?: number;
  plate: string;
  make?: string;
  model?: string;
}

export interface UserProfile {
  userId: number;
  displayName: string;
  role: UserRole;
  locale: string;
  buildingId: number | null;
  unitId?: string | null;
  vehicles: Vehicle[];
}

export interface Building {
  id: number;
  name: string;
  emptyPlaces: number;
  totalPlaces: number;
  reservedPlaces?: number;
  zonesCount?: number;
}

export interface ZoneOccupancy {
  zoneId: number;
  name?: string;
  free: number;
  total: number;
}

export interface Occupancy {
  buildingId: number;
  zones: ZoneOccupancy[];
}

export interface OccupancyLot {
  parkingId: number;
  name: string;
  zoneId?: number;
  buildingId?: number;
  free: number;
  occupied: number;
  total: number;
  reserved?: number;
}

export interface OccupancyUpdated {
  buildingId: number;
  zoneId?: number;
  parkingId?: number;
  free: number;
  total: number;
  at: string;
  eventId?: string;
}

export interface ParkingReceipt {
  sessionId: number;
  plate?: string;
  buildingId?: number;
  gateId?: number;
  amount: number;
  currency: string;
  paidAt: string;
  graceUntil?: string | null;
  endedAt?: string | null;
  status?: SessionStatus | 'Captured';
  parkingName?: string;
}

export type BundlePeriod = 'monthly' | 'quarterly' | 'annual';

export interface ParkingBundle {
  id: number;
  name: string;
  period: BundlePeriod;
  price: number;
  currency: string;
  guaranteedSlot: boolean;
  buildingId?: number;
}

export type SubscriptionStatus = 'Active' | 'Expired' | 'Cancelled';

export interface ParkingSubscription {
  id: number;
  bundleId: number;
  bundleName: string;
  status: SubscriptionStatus;
  plate?: string;
  buildingId?: number;
  startsAt: string;
  endsAt: string;
  price: number;
  currency: string;
  mainArea?: string;
  slotReserved?: boolean;
  slotLabel?: string;
  optionalAreas?: string[];
}

export interface AccessPass {
  payload: string;
  kind: string;
  plate?: string;
  buildingId?: number;
  validUntil?: string;
  displayName?: string;
  slotLabel?: string;
  code?: string;
}

export type EvChargerStatus = 'Available' | 'Occupied' | 'Charging' | 'Offline' | 'Unknown';

export interface EvCharger {
  id: number;
  name: string;
  status: EvChargerStatus;
  connector?: string;
  powerKw?: number;
  slotLabel?: string;
  free?: number;
  total?: number;
  platformStatus?: 'online' | 'offline';
}

export interface EvChargerWrite {
  label: string;
  free: number;
  total: number;
  status: 'online' | 'offline';
}

export type InvoiceStatus = 'Due' | 'Paid' | 'Overdue' | 'Unknown';

export interface DistrictInvoice {
  id: number;
  title: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueAt?: string;
  issuedAt?: string;
  period?: string;
}

export type LocationAccuracy = 'Exact' | 'Approximate' | 'ZoneOnly' | 'Unknown';

export interface RouteNode {
  id: string;
  x: number;
  y: number;
  floorId?: number;
  name?: string;
}

export interface RouteEdge {
  fromId: string;
  toId: string;
}

export interface IndoorRoute {
  totalDistance?: number;
  estimatedTimeSeconds?: number;
  nodes: RouteNode[];
  edges: RouteEdge[];
  instructions: string[];
}

export interface VehicleLocationPoint {
  vehicleId?: number;
  plate?: string;
  areaName?: string;
  placeId?: number | string;
  placeName?: string;
  zoneName?: string;
  parkingLotName?: string;
  floorId?: number | string;
  laneName?: string;
  locationAccuracy?: LocationAccuracy;
  capturedAt?: string;
  latitude?: number;
  longitude?: number;
  indoorX?: number;
  indoorY?: number;
  indoorZ?: number;
  locationType?: string;
  isCurrent?: boolean;
}

export interface VehicleLocation {
  found: boolean;
  plate: string;
  vehicleId?: number;
  sessionId?: number;
  message?: string;
  isCurrent: boolean;
  locationType?: string;
  areaName?: string;
  zoneName?: string;
  parkingLotName?: string;
  floorId?: number | string;
  laneName?: string;
  placeId?: number | string;
  placeName?: string;
  locationAccuracy?: LocationAccuracy;
  capturedAt?: string;
  latitude?: number;
  longitude?: number;
  indoorX?: number;
  indoorY?: number;
  indoorZ?: number;
  route?: IndoorRoute;
}

export interface VehicleLocationUpdated {
  plate: string;
  at?: string;
}

export interface VehicleLocationCleared {
  plate: string;
  at?: string;
}

export type ReservationStatus = 'Booked' | 'Cancelled' | 'Used' | 'Expired';

export interface ParkingReservation {
  id: number;
  buildingId: number;
  zoneId?: number;
  plate: string;
  startsAt: string;
  endsAt: string;
  status: ReservationStatus;
  guestName?: string;
  guestPhone?: string;
  inviteCode?: string;
}

export interface PlateSearchHit {
  plate: string;
  buildingId: number;
  buildingName?: string;
  zoneName?: string;
  status: 'Parked' | 'Exited' | 'Unknown';
  startedAt?: string;
  sessionId?: number;
}

export interface PlateBinding {
  vehicleId: number;
  plate: string;
  normalizedPlate?: string;
  userId?: number;
  userName?: string;
  displayName?: string;
  make?: string;
  model?: string;
}

export interface OccupancyReport {
  buildingCount: number;
  free: number;
  occupied: number;
  total: number;
  revenueToday: number;
  currency: string;
  graceViolations: number;
  activeSubscriptions: number;
}

export interface AdminUserRow {
  userId: number;
  userName: string;
  displayName: string;
  role: UserRole;
  buildingId?: number | null;
  isActive: boolean;
}

export interface ParkingSession {
  sessionId: number;
  status: SessionStatus;
  buildingId?: number;
  plate?: string;
  gateId?: number;
  startedAt?: string;
  endedAt?: string | null;
  graceUntil?: string | null;
  amountDue?: number;
  currency?: string;
  lifecycle?: string;
  extraFee?: number;
  extraFeeCurrency?: string;
  parkingId?: number;
  parkingName?: string;
  placeName?: string;
}

export interface GraceViolation {
  sessionId: number;
  plate?: string;
  buildingId?: number;
  buildingName?: string;
  gateId?: number;
  paidAt?: string;
  graceUntil: string;
  extraFee: number;
  currency: string;
  stillParked: boolean;
}

export interface SessionUpdated {
  sessionId: number;
  status: SessionStatus;
  plate?: string;
  gateId?: number;
  at: string;
  graceUntil?: string | null;
  amountDue?: number;
  currency?: string;
  parkingId?: number;
  buildingId?: number;
}

export interface BarrierOpened {
  buildingId?: number;
  laneId?: string | number;
  sessionId?: number;
  at?: string;
}

export interface PaymentIntent {
  id: number;
  sessionId: number;
  amount: number;
  currency: string;
  status: string;
  replay?: boolean;
  graceUntil?: string | null;
}

export interface PaymentCapture {
  id: number;
  status: string;
  sessionId: number;
  amount?: number;
  currency?: string;
  replay?: boolean;
  graceUntil?: string | null;
}

export interface SupportTicket {
  id: number;
  userId?: number;
  userName?: string;
  type: TicketType;
  note: string;
  status: TicketStatus;
  createdAt: string;
  resolutionNote?: string;
  updatedAt?: string;
}

export interface TicketList {
  items: SupportTicket[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
}

export interface ApiErrorBody {
  success?: boolean;
  code?: string;
  errorCode?: string;
  message?: string;
  correlationId?: string;
}

export function sameId(a: number | string | undefined, b: number | string | undefined): boolean {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

export function applyZoneUpdate(
  occupancy: Occupancy,
  update: Pick<OccupancyUpdated, 'zoneId' | 'free' | 'total'>,
): Occupancy {
  const exists = occupancy.zones.some(
    (zone) => update.zoneId != null && sameId(zone.zoneId, update.zoneId),
  );
  if (!exists && update.zoneId != null) {
    return {
      ...occupancy,
      zones: [
        ...occupancy.zones,
        { zoneId: Number(update.zoneId), free: update.free, total: update.total },
      ],
    };
  }
  return {
    ...occupancy,
    zones: occupancy.zones.map((zone) =>
      update.zoneId != null && sameId(zone.zoneId, update.zoneId)
        ? { ...zone, free: update.free, total: update.total }
        : zone,
    ),
  };
}

export function applyLotUpdate(lots: OccupancyLot[], update: OccupancyUpdated): OccupancyLot[] {
  return lots.map((lot) => {
    const matchParking = update.parkingId != null && sameId(lot.parkingId, update.parkingId);
    const matchZone = update.parkingId == null && update.zoneId != null && sameId(lot.zoneId, update.zoneId);
    if (!matchParking && !matchZone) return lot;
    return {
      ...lot,
      free: update.free,
      total: update.total,
      occupied: Math.max(0, update.total - update.free),
    };
  });
}

export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

export function unwrapList<T>(payload: unknown): T[] {
  const data = unwrapData<unknown>(payload);
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { items?: T[] }).items)) {
    return (data as { items: T[] }).items;
  }
  if (payload && typeof payload === 'object' && Array.isArray((payload as { items?: T[] }).items)) {
    return (payload as { items: T[] }).items;
  }
  return [];
}

export function parseTickets(payload: unknown): SupportTicket[] {
  const data = unwrapData<unknown>(payload);
  if (Array.isArray(data)) return data as SupportTicket[];
  if (data && typeof data === 'object' && Array.isArray((data as TicketList).items)) {
    return (data as TicketList).items;
  }
  return [];
}

export function normalizeRole(raw: string | undefined | null): UserRole {
  const key = (raw ?? 'visitor').trim().toLowerCase().replace(/[\s_]+/g, '-');
  if (key === 'admin') return 'admin';
  if (key === 'citizen') return 'citizen';
  if (key === 'employee') return 'employee';
  if (key === 'building-op' || key === 'buildingop') return 'building-op';
  if (key === 'cashier') return 'cashier';
  if (key === 'visitor') return 'visitor';
  return 'visitor';
}
