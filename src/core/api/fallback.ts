import { config } from '../config';
import { readReceipts } from '../parking/receipts';
import type {
  AccessPass,
  AdminUserRow,
  DistrictInvoice,
  EvCharger,
  GraceViolation,
  OccupancyReport,
  ParkingBundle,
  ParkingReceipt,
  ParkingReservation,
  ParkingSubscription,
  PlateSearchHit,
  SupportTicket,
  UserRole,
} from './types';

const SUB_KEY = `${config.tokenKey}.subscriptions`;
const RES_KEY = `${config.tokenKey}.reservations`;

export const fallbackBundles: ParkingBundle[] = [
  {
    id: 1,
    name: 'شهري — موقف رئيسي مضمون',
    period: 'monthly',
    price: 250,
    currency: config.currency,
    guaranteedSlot: true,
    buildingId: 1,
  },
  {
    id: 2,
    name: 'ربع سنوي — رئيسي + اختياري',
    period: 'quarterly',
    price: 700,
    currency: config.currency,
    guaranteedSlot: true,
    buildingId: 1,
  },
  {
    id: 3,
    name: 'سنوي — ساكن/موظف',
    period: 'annual',
    price: 2400,
    currency: config.currency,
    guaranteedSlot: true,
    buildingId: 1,
  },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function fallbackHistory(): ParkingReceipt[] {
  const local = readReceipts();
  if (local.length) return local;
  return [
    {
      sessionId: 71,
      plate: 'ABC1234',
      buildingId: 1,
      gateId: 2,
      amount: 15,
      currency: config.currency,
      paidAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      status: 'Closed',
      endedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export function fallbackSubscriptions(): ParkingSubscription[] {
  return readJson<ParkingSubscription[]>(SUB_KEY, []);
}

export function fallbackSaveSubscription(item: ParkingSubscription): ParkingSubscription {
  const next = [item, ...fallbackSubscriptions().filter((row) => row.id !== item.id)];
  writeJson(SUB_KEY, next);
  return item;
}

export function fallbackReservations(): ParkingReservation[] {
  return readJson<ParkingReservation[]>(RES_KEY, []);
}

export function fallbackSaveReservation(item: ParkingReservation): ParkingReservation {
  const next = [item, ...fallbackReservations().filter((row) => row.id !== item.id)];
  writeJson(RES_KEY, next);
  return item;
}

export function fallbackRemoveReservation(id: number): void {
  writeJson(
    RES_KEY,
    fallbackReservations().map((row) => (row.id === id ? { ...row, status: 'Cancelled' as const } : row)),
  );
}

export function fallbackPlateSearch(plate: string): PlateSearchHit[] {
  const q = plate.trim().toUpperCase();
  const sample: PlateSearchHit[] = [
    {
      plate: 'ABC1234',
      buildingId: 1,
      buildingName: 'Building 01',
      zoneName: 'Zone A',
      status: 'Parked',
      startedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      sessionId: 88,
    },
    {
      plate: 'RUH2941',
      buildingId: 1,
      buildingName: 'Building 01',
      zoneName: 'Zone B',
      status: 'Exited',
      startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      sessionId: 71,
    },
  ];
  if (!q) return sample;
  return sample.filter((row) => row.plate.toUpperCase().includes(q));
}

export function fallbackReport(): OccupancyReport {
  return {
    buildingCount: 1,
    free: 18,
    occupied: 2,
    total: 20,
    revenueToday: 15,
    currency: config.currency,
    graceViolations: 1,
    activeSubscriptions: fallbackSubscriptions().filter((row) => row.status === 'Active').length,
  };
}

export function fallbackUsers(): AdminUserRow[] {
  return [
    { userId: 5, userName: 'visitor1', displayName: 'Demo Visitor', role: 'visitor', buildingId: 1, isActive: true },
    { userId: 2, userName: 'citizen1', displayName: 'Demo Citizen', role: 'citizen', buildingId: 1, isActive: true },
    { userId: 3, userName: 'employee1', displayName: 'Demo Employee', role: 'employee', buildingId: 1, isActive: true },
    { userId: 1, userName: 'admin1', displayName: 'Demo Admin', role: 'admin', buildingId: 1, isActive: true },
  ];
}

export function fallbackGraceViolations(): GraceViolation[] {
  const graceUntil = new Date(Date.now() - 12 * 60 * 1000).toISOString();
  return [
    {
      sessionId: 88,
      plate: 'ABC1234',
      buildingId: 1,
      buildingName: 'Building 01',
      gateId: 2,
      paidAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
      graceUntil,
      extraFee: 20,
      currency: config.currency,
      stillParked: true,
    },
  ];
}

export function fallbackInvite(code: string): ParkingReservation | null {
  const q = code.trim().toUpperCase();
  if (!q) return null;
  const local = fallbackReservations().find((row) => (row.inviteCode ?? '').toUpperCase() === q);
  if (local) return local;
  return {
    id: 44,
    buildingId: 1,
    plate: 'XYZ9876',
    startsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'Booked',
    guestName: 'Demo Guest',
    inviteCode: q.startsWith('NRI') ? q : `NRI-${q}`,
  };
}

export function fallbackAdminTickets(): SupportTicket[] {
  return [
    {
      id: 21,
      userId: 5,
      userName: 'visitor1',
      type: 'lost_ticket',
      note: 'Lost paper ticket at gate 2',
      status: 'Open',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 18,
      userId: 2,
      userName: 'citizen1',
      type: 'barrier',
      note: 'Barrier did not open after payment',
      status: 'InProgress',
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      resolutionNote: 'Sent to parking cashier. Web does not open the barrier.',
    },
    {
      id: 19,
      userId: 3,
      userName: 'employee1',
      type: 'waste',
      note: 'Overflowing bins at visitor parking',
      status: 'Open',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export function fallbackPass(role: UserRole, plate?: string): AccessPass | null {
  if (role === 'visitor') return null;
  const resolvedPlate = plate ?? (role === 'citizen' ? 'CIT2001' : 'NRI-01');
  return {
    kind: 'subscription',
    payload: `NRI|${role}|${resolvedPlate}|1`,
    plate: resolvedPlate,
    buildingId: 1,
  };
}

export function fallbackChargers(): EvCharger[] {
  return [
    { id: 1, name: 'EV-A1', status: 'Available', connector: 'Type 2', powerKw: 22, slotLabel: 'E-01', free: 1, total: 1 },
    { id: 2, name: 'EV-A2', status: 'Occupied', connector: 'Type 2', powerKw: 22, slotLabel: 'E-02', free: 0, total: 1 },
    { id: 3, name: 'EV-B1', status: 'Offline', connector: 'CCS', powerKw: 50, slotLabel: 'E-03', free: 0, total: 1 },
  ];
}

export function fallbackInvoices(): DistrictInvoice[] {
  return [
    {
      id: 1,
      title: 'District service fee',
      amount: 350,
      currency: config.currency,
      status: 'Due',
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      period: '2026-08',
    },
  ];
}

export function nextLocalId(prefix: number): number {
  return prefix + Math.floor(Date.now() % 100000);
}
