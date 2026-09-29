import axios from 'axios';
import { config } from '../config';

const apiClient = axios.create({
  baseURL: config.apiBase,
  timeout: 15000,
});

apiClient.interceptors.request.use((req) => {
  const token = window.sessionStorage.getItem(config.tokenKey);
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response unwrapper: handles { success: true, data: ... } or direct data
apiClient.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === 'object' && 'data' in res.data && 'success' in res.data) {
      return res.data.data;
    }
    return res.data;
  },
  (err) => {
    return Promise.reject(err);
  }
);

export interface DashboardSummary {
  totalCapacity: number;
  occupied: number;
  available: number;
  occupancyPercentage: number;
  activeSessions: number;
  todayEntries: number;
  todayExits: number;
  activeReservations: number;
  activeAlarms: number;
  onlineCameras: number;
  offlineCameras: number;
  onlineBarriers: number;
  offlineBarriers: number;
}

export interface LiveOperations {
  lprEvents: Array<{
    id: string;
    plateNumber: string;
    cameraName: string;
    direction: string;
    confidence: number;
    eventTime: string;
    gateName?: string;
  }>;
  entries: Array<{
    id: string;
    plateNumber: string;
    gateName: string;
    entryTime: string;
  }>;
  exits: Array<{
    id: string;
    plateNumber: string;
    gateName: string;
    exitTime: string;
    totalAmount: number;
  }>;
  barrierStates: Array<{
    id: string;
    name: string;
    state: string;
    gateName: string;
  }>;
  cameraStates: Array<{
    id: string;
    name: string;
    status: string;
    ipAddress?: string;
    lastPing?: string;
  }>;
  alarms: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    createdAt: string;
  }>;
}

export interface BuildingItem {
  id: string;
  name: string;
  code: string;
  totalCapacity: number;
  floorsCount: number;
}

export interface FloorItem {
  id: string;
  name: string;
  floorNumber: number;
  capacity: number;
  buildingId: string;
}

export interface FloorMapSpot {
  id: string;
  spotNumber: string;
  label: string;
  status: 'Vacant' | 'Occupied' | 'Reserved' | 'VIP' | 'Charging' | 'Disabled';
  currentPlateNumber?: string;
  x?: number;
  y?: number;
  zone?: string;
}

export interface FloorMapResponse {
  floorId: string;
  floorName: string;
  spots: FloorMapSpot[];
  navigationMetadata: {
    entryPoint: { x: number; y: number };
    elevatorPoint: { x: number; y: number };
    exitPoint: { x: number; y: number };
  };
}

export interface VehicleDto {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  color?: string;
  status?: string;
  subscriptionPlan?: string;
  lastSeenAt?: string;
}

export interface ReservationDto {
  id: string;
  buildingName?: string;
  floorName?: string;
  slotLabel?: string;
  plateNumber: string;
  reservedFrom: string;
  reservedTo: string;
  fee: number;
  status: 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';
  inviteCode?: string;
}

export interface FindCarResponse {
  vehicleId: string;
  plate: string;
  building: string;
  floor: string;
  spot: string;
  coordinates: { x: number; y: number; floorNumber?: number };
  nearestEntrance: string;
  nearestElevator: string;
  navigationPath: Array<{ x: number; y: number; instruction?: string }>;
  directions: string[];
}

export interface SubscriptionPlanDto {
  id: string;
  name: string;
  price: number;
  billingCycle: 'Monthly' | 'Annual' | 'Quarterly';
  features: string[];
}

export interface SubscriptionDto {
  id: string;
  planName: string;
  startsAt: string;
  endsAt: string;
  amount: number;
  status: string;
  remainingDays?: number;
}

export interface DigitalCardDto {
  subscriptionId: string;
  userId: string;
  userName: string;
  vehicleId: string;
  plateNumber: string;
  publicToken: string;
  qrPayload: string;
  expiresAt: string;
}

export interface GuestInviteDto {
  id: string;
  guestName: string;
  phone: string;
  plateNumber?: string;
  startsAt: string;
  endsAt: string;
  inviteCode: string;
  status: 'Pending' | 'Active' | 'Used' | 'Expired' | 'Revoked';
  gateName?: string;
}

export interface PaymentDto {
  id: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Processing' | 'Succeeded' | 'Failed' | 'Refunded';
  method: string;
  createdAt: string;
  description?: string;
}

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string;
  items: Array<{ description: string; amount: number }>;
}

export const smartParkingApi = {
  // Auth
  login: (credentials: { userName: string; password: string }) =>
    apiClient.post('/v1/auth/login', credentials),
  logout: (refreshToken?: string) =>
    apiClient.post('/v1/auth/logout', { refreshToken }),
  getMe: () => apiClient.get('/v1/auth/me'),

  // Dashboard & Operations
  getDashboardSummary: (): Promise<DashboardSummary> =>
    apiClient.get('/v1/dashboard/summary'),
  getLiveOperations: (): Promise<LiveOperations> =>
    apiClient.get('/v1/operations/live'),

  // Parking Topology
  getBuildings: (): Promise<BuildingItem[]> =>
    apiClient.get('/v1/parking/buildings'),
  getBuilding: (id: string): Promise<BuildingItem> =>
    apiClient.get(`/v1/parking/buildings/${id}`),
  getBuildingFloors: (buildingId: string): Promise<FloorItem[]> =>
    apiClient.get(`/v1/parking/buildings/${buildingId}/floors`),
  getFloorMap: (floorId: string): Promise<FloorMapResponse> =>
    apiClient.get(`/v1/parking/floors/${floorId}/map`),

  // Client Vehicles
  getVehicles: (): Promise<VehicleDto[]> =>
    apiClient.get('/v1/client/vehicles'),
  addVehicle: (data: Partial<VehicleDto>): Promise<VehicleDto> =>
    apiClient.post('/v1/client/vehicles', data),
  updateVehicle: (id: string, data: Partial<VehicleDto>): Promise<VehicleDto> =>
    apiClient.put(`/v1/client/vehicles/${id}`, data),
  deleteVehicle: (id: string): Promise<void> =>
    apiClient.delete(`/v1/client/vehicles/${id}`),

  // Client Reservations
  getReservations: (): Promise<ReservationDto[]> =>
    apiClient.get('/v1/client/reservations'),
  createReservation: (data: any): Promise<ReservationDto> =>
    apiClient.post('/v1/client/reservations', data),
  getReservation: (id: string): Promise<ReservationDto> =>
    apiClient.get(`/v1/client/reservations/${id}`),
  cancelReservation: (id: string): Promise<void> =>
    apiClient.post(`/v1/client/reservations/${id}/cancel`),

  // Find My Car
  findMyCar: (plate: string): Promise<FindCarResponse> =>
    apiClient.get(`/v1/client/navigation/find-my-car?plate=${encodeURIComponent(plate)}`),

  // Subscriptions & Digital Card
  getSubscriptionPlans: (): Promise<SubscriptionPlanDto[]> =>
    apiClient.get('/v1/client/subscriptions/plans'),
  getMySubscriptions: (): Promise<SubscriptionDto[]> =>
    apiClient.get('/v1/client/subscriptions'),
  createSubscription: (planId: string): Promise<SubscriptionDto> =>
    apiClient.post('/v1/client/subscriptions', { planId }),
  renewSubscription: (id: string): Promise<SubscriptionDto> =>
    apiClient.post(`/v1/client/subscriptions/${id}/renew`),
  getDigitalCard: (): Promise<DigitalCardDto> =>
    apiClient.get('/v1/client/digital-card'),

  // Guest Invites
  getGuestInvites: (): Promise<GuestInviteDto[]> =>
    apiClient.get('/v1/parking/invites'),
  createGuestInvite: (data: Partial<GuestInviteDto>): Promise<GuestInviteDto> =>
    apiClient.post('/v1/parking/invites', data),
  resendGuestInvite: (id: string): Promise<void> =>
    apiClient.post(`/v1/parking/invites/${id}/resend`),
  revokeGuestInvite: (id: string): Promise<void> =>
    apiClient.post(`/v1/parking/invites/${id}/revoke`),
  getPublicInvitePass: (code: string): Promise<any> =>
    apiClient.get(`/v1/parking/reservations/invite/${encodeURIComponent(code)}`),

  // Payments & Invoices
  getPayments: (): Promise<PaymentDto[]> =>
    apiClient.get('/v1/client/payments'),
  getInvoices: (): Promise<InvoiceDto[]> =>
    apiClient.get('/v1/client/invoices'),
  executeDemoPayment: (amount: number, method: string, status?: string): Promise<any> =>
    apiClient.post('/v1/client/payments/demo', { amount, method, status: status || 'Succeeded' }),

  // Hardware Console & Queries
  getGates: (): Promise<any[]> =>
    apiClient.get('/v1/parking/gates'),
  getBarriers: (): Promise<any[]> =>
    apiClient.get('/v1/parking/barriers'),
  getCameras: (): Promise<any[]> =>
    apiClient.get('/v1/parking/cameras'),
  getAlarms: (): Promise<any[]> =>
    apiClient.get('/v1/parking/alarms'),
  acknowledgeAlarm: (id: string): Promise<void> =>
    apiClient.post(`/v1/parking/alarms/${id}/acknowledge`),
  resolveAlarm: (id: string): Promise<void> =>
    apiClient.post(`/v1/parking/alarms/${id}/resolve`),

  // Demo Hardware Simulator Endpoints
  simulateLpr: (body: { plate: string; cameraId?: string; direction?: string; confidence?: number }) =>
    apiClient.post('/v1/demo/lpr/simulate', body),
  openBarrier: (id: string) =>
    apiClient.post(`/v1/demo/barriers/${id}/open`),
  closeBarrier: (id: string) =>
    apiClient.post(`/v1/demo/barriers/${id}/close`),
  simulateBarrierFailure: (id: string) =>
    apiClient.post(`/v1/demo/barriers/${id}/simulate-failure`),
  setCameraOffline: (id: string) =>
    apiClient.post(`/v1/demo/cameras/${id}/offline`),
  setCameraOnline: (id: string) =>
    apiClient.post(`/v1/demo/cameras/${id}/online`),

  // Demo Simulation Engine
  startSimulation: () =>
    apiClient.post('/v1/demo/simulation/start'),
  stopSimulation: () =>
    apiClient.post('/v1/demo/simulation/stop'),
  resetSimulation: () =>
    apiClient.post('/v1/demo/simulation/reset'),
  runScenario: (scenario: string) =>
    apiClient.post('/v1/demo/simulation/run-scenario', { scenario }),

  // Admin users & audit logs
  getUsers: (): Promise<any[]> =>
    apiClient.get('/v1/admin/users'),
  getAuditLogs: (): Promise<any[]> =>
    apiClient.get('/v1/admin/audit-logs'),
};
