import { config } from '../config';
import { ApiError } from './errors';
import type {
  Occupancy,
  OccupancyUpdated,
  ParkingSession,
  PaymentCapture,
  SupportTicket,
  UserProfile,
  UserRole,
  Vehicle,
} from './types';

export const DEMO_PASSWORD = 'admin';

function nowIso(): string {
  return new Date().toISOString();
}

function delay<T>(value: T, ms = 280): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });
}

export function roleFromUsername(username: string): UserRole {
  const key = username.trim().toLowerCase();
  if (key.startsWith('admin')) return 'admin';
  if (key.startsWith('citizen')) return 'citizen';
  if (key.startsWith('employee') || key.startsWith('staff')) return 'employee';
  if (key.startsWith('building-op') || key.startsWith('buildingop')) return 'building-op';
  if (key.startsWith('cashier')) return 'cashier';
  return 'visitor';
}

function userIdFor(role: UserRole): number {
  switch (role) {
    case 'citizen':
      return 2;
    case 'employee':
      return 3;
    case 'admin':
      return 1;
    case 'building-op':
      return 4;
    case 'cashier':
      return 5;
    default:
      return 42;
  }
}

function seedVehicles(role: UserRole): Vehicle[] {
  switch (role) {
    case 'citizen':
      return [{ id: 2, plate: 'RUH2941', make: 'Lexus', model: 'ES' }];
    case 'employee':
      return [{ id: 3, plate: 'NRI-01', make: 'Toyota', model: 'Corolla' }];
    case 'admin':
      return [];
    case 'building-op':
      return [{ id: 4, plate: 'BOP-01', make: 'Toyota', model: 'Hilux' }];
    case 'cashier':
      return [{ id: 5, plate: 'CSH-01', make: 'Toyota', model: 'Yaris' }];
    default:
      return [{ id: 1, plate: 'ABC1234', make: 'Toyota', model: 'Corolla' }];
  }
}

function displayNameFor(role: UserRole, locale: string): string {
  const isAr = locale === 'ar';
  switch (role) {
    case 'citizen':
      return isAr ? 'ساكن تجريبي' : 'Pilot resident';
    case 'employee':
      return isAr ? 'موظف تجريبي' : 'Pilot employee';
    case 'admin':
      return isAr ? 'مدير تجريبي' : 'Pilot admin';
    case 'building-op':
      return isAr ? 'مشغّل مبنى تجريبي' : 'Pilot building operator';
    case 'cashier':
      return isAr ? 'كاشير تجريبي' : 'Pilot cashier';
    default:
      return isAr ? 'زائر تجريبي' : 'Pilot visitor';
  }
}

function seedOccupancy(role: UserRole): Occupancy {
  const buildingId = config.mockBuildingId;
  if (role === 'employee' || role === 'admin' || role === 'building-op') {
    return {
      buildingId,
      zones: [
        { zoneId: 3, free: 18, total: 20 },
        { zoneId: 4, free: 4, total: 16 },
      ],
    };
  }
  if (role === 'citizen') {
    return { buildingId, zones: [{ zoneId: config.mockZoneId, free: 11, total: 20 }] };
  }
  return { buildingId, zones: [{ zoneId: config.mockZoneId, free: 18, total: 20 }] };
}

export interface MockStore {
  role: UserRole;
  locale: string;
  occupancy: Occupancy;
  session: ParkingSession | null;
  tickets: SupportTicket[];
  vehicles: Vehicle[];
  lastIdempotencyKey: string | null;
  lastCapture: PaymentCapture | null;
  nextVehicleId: number;
  nextTicketId: number;
}

export const mockStore: MockStore = {
  role: 'visitor',
  locale: 'ar',
  occupancy: seedOccupancy('visitor'),
  session: null,
  tickets: [],
  vehicles: seedVehicles('visitor'),
  lastIdempotencyKey: null,
  lastCapture: null,
  nextVehicleId: 10,
  nextTicketId: 17,
};

export function setMockLocale(locale: string): void {
  mockStore.locale = locale;
}

export function currentProfile(): UserProfile {
  return {
    userId: userIdFor(mockStore.role),
    displayName: displayNameFor(mockStore.role, mockStore.locale),
    role: mockStore.role,
    locale: mockStore.locale,
    buildingId: config.mockBuildingId,
    unitId: mockStore.role === 'citizen' ? 'B-01-12' : undefined,
    vehicles: [...mockStore.vehicles],
  };
}

export function resetForLogin(username: string, password: string): void {
  if (!username.trim() || !password) {
    throw new ApiError({
      code: 'VALIDATION_ERROR',
      message: 'Username and password are required',
      statusCode: 400,
    });
  }
  mockStore.role = roleFromUsername(username);
  mockStore.occupancy = seedOccupancy(mockStore.role);
  mockStore.session = null;
  mockStore.vehicles = seedVehicles(mockStore.role);
  mockStore.tickets = [];
  mockStore.lastIdempotencyKey = null;
  mockStore.lastCapture = null;
  if (mockStore.role === 'employee') {
    mockStore.tickets = [
      {
        id: 101,
        userId: userIdFor('employee'),
        type: 'barrier',
        note: 'الحاجز في الحارة IN-1 لا يفتح بعد الدفع',
        status: 'Open',
        createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      },
      {
        id: 102,
        userId: userIdFor('employee'),
        type: 'lost_ticket',
        note: 'زائر فقد التذكرة عند المصعد',
        status: 'Open',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }
}

export function ensureVisitorSession(): ParkingSession | null {
  if (mockStore.role !== 'visitor') {
    return mockStore.session;
  }
  if (!mockStore.session) {
    const plate = mockStore.vehicles[0]?.plate ?? 'ABC1234';
    mockStore.session = {
      sessionId: 88,
      status: 'Open',
      lifecycle: 'Entered',
      buildingId: config.mockBuildingId,
      plate,
      gateId: 2,
      startedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      amountDue: config.pilotPaymentAmount,
      currency: config.currency,
    };
  }
  return mockStore.session;
}

export function addMockVehicle(vehicle: Vehicle): UserProfile {
  const plate = vehicle.plate.trim().toUpperCase();
  if (mockStore.vehicles.some((item) => item.plate.trim().toUpperCase() === plate)) {
    throw new ApiError({
      code: 'VEHICLE_ALREADY_EXISTS',
      message: 'Vehicle already registered',
      statusCode: 409,
    });
  }
  mockStore.vehicles = [
    ...mockStore.vehicles,
    {
      id: mockStore.nextVehicleId,
      plate: vehicle.plate.trim(),
      make: vehicle.make,
      model: vehicle.model,
    },
  ];
  mockStore.nextVehicleId += 1;
  return currentProfile();
}

export function updateMockVehicle(id: number, vehicle: Vehicle): UserProfile {
  const exists = mockStore.vehicles.some((item) => item.id === id);
  if (!exists) {
    throw new ApiError({ code: 'NOT_FOUND', message: 'Vehicle not found', statusCode: 404 });
  }
  const plate = vehicle.plate.trim().toUpperCase();
  if (mockStore.vehicles.some((item) => item.id !== id && item.plate.trim().toUpperCase() === plate)) {
    throw new ApiError({
      code: 'VEHICLE_ALREADY_EXISTS',
      message: 'Vehicle already registered',
      statusCode: 409,
    });
  }
  mockStore.vehicles = mockStore.vehicles.map((item) =>
    item.id === id
      ? { ...item, plate: vehicle.plate.trim(), make: vehicle.make, model: vehicle.model }
      : item,
  );
  return currentProfile();
}

export function deleteMockVehicle(id: number): UserProfile {
  mockStore.vehicles = mockStore.vehicles.filter((item) => item.id !== id);
  return currentProfile();
}

export function emitOccupancyTick(): OccupancyUpdated | null {
  const zones = mockStore.occupancy.zones;
  if (zones.length === 0) return null;
  const index = Math.floor(Math.random() * zones.length);
  const zone = zones[index];
  const delta = Math.random() > 0.5 ? -1 : 1;
  const free = Math.min(zone.total, Math.max(0, zone.free + delta));
  if (free === zone.free) return null;
  mockStore.occupancy.zones[index] = { ...zone, free };
  return {
    buildingId: mockStore.occupancy.buildingId,
    zoneId: zone.zoneId,
    free,
    total: zone.total,
    at: nowIso(),
  };
}

export { delay, nowIso };
