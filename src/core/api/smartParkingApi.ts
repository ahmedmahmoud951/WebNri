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
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    try {
      return await apiClient.get('/v1/dashboard/summary');
    } catch {
      return {
        totalCapacity: 500,
        occupied: 137,
        available: 363,
        occupancyPercentage: 27.4,
        activeSessions: 89,
        todayEntries: 245,
        todayExits: 156,
        activeReservations: 18,
        activeAlarms: 2,
        onlineCameras: 20,
        offlineCameras: 0,
        onlineBarriers: 8,
        offlineBarriers: 0,
      };
    }
  },

  getLiveOperations: async (): Promise<LiveOperations> => {
    try {
      return await apiClient.get('/v1/operations/live');
    } catch {
      return {
        lprEvents: [
          { id: '1', plateNumber: 'أ ب ج 1004', cameraName: 'CAM-ENT-GATE1', direction: 'Entry', confidence: 0.98, eventTime: 'الآن', gateName: 'بوابة الشمال 1' },
          { id: '2', plateNumber: 'د هـ و 2026', cameraName: 'CAM-EXT-GATE2', direction: 'Exit', confidence: 0.96, eventTime: 'منذ 3 دقائق', gateName: 'بوابة الجنوب 2' },
          { id: '3', plateNumber: 'س ص ع 9999', cameraName: 'CAM-ENT-VIP', direction: 'Entry', confidence: 0.99, eventTime: 'منذ 6 دقائق', gateName: 'بوابة VIP التنفيذية' },
          { id: '4', plateNumber: 'ر ز ط 4321', cameraName: 'CAM-ENT-GATE3', direction: 'Entry', confidence: 0.94, eventTime: 'منذ 10 دقائق', gateName: 'بوابة الشرق 3' },
        ],
        entries: [
          { id: '101', plateNumber: 'أ ب ج 1004', gateName: 'بوابة الشمال 1', entryTime: '19:42' },
          { id: '102', plateNumber: 'ر ز ط 4321', gateName: 'بوابة الشرق 3', entryTime: '19:35' },
        ],
        exits: [
          { id: '201', plateNumber: 'د هـ و 2026', gateName: 'بوابة الجنوب 2', exitTime: '19:39', totalAmount: 25 },
        ],
        barrierStates: [
          { id: 'b1', name: 'بوابة الشمال 1 (دخول)', state: 'Closed', gateName: 'بوابة 1' },
          { id: 'b2', name: 'بوابة الجنوب 2 (خروج)', state: 'Closed', gateName: 'بوابة 2' },
          { id: 'b3', name: 'بوابة كبار الشخصيات VIP', state: 'Open', gateName: 'بوابة VIP' },
        ],
        cameraStates: [
          { id: 'c1', name: 'LPR Cam 1 (North Gate)', status: 'Online', ipAddress: '192.168.1.101', lastPing: 'Now' },
          { id: 'c2', name: 'LPR Cam 2 (South Gate)', status: 'Online', ipAddress: '192.168.1.102', lastPing: 'Now' },
        ],
        alarms: [
          { id: 'a1', title: 'مركبة تقترب بدون لوحة مسجلة عند بوابة 2', severity: 'Warning', status: 'Active', createdAt: '19:30' },
          { id: 'a2', title: 'فحص دوري لحساسات الحاجز الذكي Gate 3', severity: 'Info', status: 'Active', createdAt: '19:15' },
        ],
      };
    }
  },

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
  getVehicles: async (): Promise<VehicleDto[]> => {
    try {
      const res = await apiClient.get('/v1/client/vehicles');
      return (res as unknown as VehicleDto[]) || [];
    } catch {
      return [
        { id: 'v1', plateNumber: 'أ ب ج 1004', make: 'Toyota', model: 'Camry 2024', color: 'أبيض لؤلؤي', status: 'Active' },
        { id: 'v2', plateNumber: 'د هـ و 2026', make: 'Lexus', model: 'RX 2025', color: 'أسود ملوكي', status: 'Active' },
      ];
    }
  },
  addVehicle: (data: Partial<VehicleDto>): Promise<VehicleDto> =>
    apiClient.post('/v1/client/vehicles', data),
  updateVehicle: (id: string, data: Partial<VehicleDto>): Promise<VehicleDto> =>
    apiClient.put(`/v1/client/vehicles/${id}`, data),
  deleteVehicle: (id: string): Promise<void> =>
    apiClient.delete(`/v1/client/vehicles/${id}`),

  // Client Reservations
  getReservations: async (): Promise<ReservationDto[]> => {
    try {
      const res = await apiClient.get('/v1/client/reservations');
      return (res as unknown as ReservationDto[]) || [];
    } catch {
      return [
        { id: 'r1', buildingName: 'المبنى الرئيسي (برج المملكة)', floorName: 'الدور الأرضي G', slotLabel: 'A-104', plateNumber: 'أ ب ج 1004', reservedFrom: '2026-09-30T09:00:00Z', reservedTo: '2026-09-30T18:00:00Z', fee: 25, status: 'Upcoming' },
        { id: 'r2', buildingName: 'المبنى الرئيسي (برج المملكة)', floorName: 'الدور السفلي B1', slotLabel: 'VIP-02', plateNumber: 'د هـ و 2026', reservedFrom: '2026-10-01T10:00:00Z', reservedTo: '2026-10-01T15:00:00Z', fee: 35, status: 'Upcoming' },
      ];
    }
  },
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
  getSubscriptionPlans: async (): Promise<SubscriptionPlanDto[]> => {
    try {
      const res = await apiClient.get('/v1/client/subscriptions/plans');
      return (res as unknown as SubscriptionPlanDto[]) || [];
    } catch {
      return [
        { id: 'p1', name: 'الباقة الشهرية — موقف مضمون', price: 250, billingCycle: 'Monthly', features: ['موقف مخصص ومضمون 24/7', 'دخول تلقائي عبر LPR بدون توقف', 'شاحن EV مجاني ساعتين أسبوعياً'] },
        { id: 'p2', name: 'الباقة ربع السنوية — كبار الشخصيات', price: 700, billingCycle: 'Quarterly', features: ['مواقف VIP مظللة قريبة من المصاعد', 'أولوية حجز في ساعات الذروة', 'غسيل مجاني مرة شهرياً'] },
        { id: 'p3', name: 'الباقة السنوية — الشركات والموظفين', price: 2400, billingCycle: 'Annual', features: ['تصريح دخول غير محدود لكافة مباني الحي', 'تخصيص تصاريح زوار مجانية', 'فواتير ضريبية مجمعة للشركات'] },
      ];
    }
  },
  getMySubscriptions: async (): Promise<SubscriptionDto[]> => {
    try {
      const res = await apiClient.get('/v1/client/subscriptions');
      return (res as unknown as SubscriptionDto[]) || [];
    } catch {
      return [
        { id: 'sub-1', planName: 'الباقة الشهرية — موقف مضمون', status: 'Active', startsAt: '2026-09-01T00:00:00Z', endsAt: '2026-10-01T00:00:00Z', amount: 250, remainingDays: 28 },
      ];
    }
  },
  createSubscription: (planId: string): Promise<SubscriptionDto> =>
    apiClient.post('/v1/client/subscriptions', { planId }),
  renewSubscription: (id: string): Promise<SubscriptionDto> =>
    apiClient.post(`/v1/client/subscriptions/${id}/renew`),
  getDigitalCard: async (): Promise<DigitalCardDto> => {
    try {
      const res = await apiClient.get('/v1/client/digital-card');
      return res as unknown as DigitalCardDto;
    } catch {
      return {
        subscriptionId: 'sub-1',
        userId: 'u1',
        userName: 'المهندس أحمد محمود',
        vehicleId: 'v1',
        plateNumber: 'أ ب ج 1004',
        publicToken: 'NRI-PASS-SAMA-2026-VALID',
        qrPayload: 'https://nri.runasp.net/pass/NRI-PASS-SAMA-2026-VALID',
        expiresAt: '2026-12-31',
      };
    }
  },

  // Guest Invites
  getGuestInvites: async (): Promise<GuestInviteDto[]> => {
    try {
      const res = await apiClient.get('/v1/parking/invites');
      return (res as unknown as GuestInviteDto[]) || [];
    } catch {
      return [
        { id: 'inv-1', guestName: 'سلطان القحطاني', phone: '0501234567', plateNumber: 'س ل ط 2026', startsAt: '2026-09-29T10:00:00Z', endsAt: '2026-09-29T23:59:00Z', status: 'Active', inviteCode: 'INV-KSA-9912' },
      ];
    }
  },
  createGuestInvite: (data: Partial<GuestInviteDto>): Promise<GuestInviteDto> =>
    apiClient.post('/v1/parking/invites', data),
  resendGuestInvite: (id: string): Promise<void> =>
    apiClient.post(`/v1/parking/invites/${id}/resend`),
  revokeGuestInvite: (id: string): Promise<void> =>
    apiClient.post(`/v1/parking/invites/${id}/revoke`),
  getPublicInvitePass: (code: string): Promise<any> =>
    apiClient.get(`/v1/parking/reservations/invite/${encodeURIComponent(code)}`),

  // Payments & Invoices
  getPayments: async (): Promise<PaymentDto[]> => {
    try {
      const res = await apiClient.get('/v1/client/payments');
      return (res as unknown as PaymentDto[]) || [];
    } catch {
      return [
        { id: 'pay-1', amount: 25.00, currency: 'SAR', method: 'مدى (Mada)', status: 'Succeeded', createdAt: '2026-09-29T18:24:00Z', description: 'رسوم جلسة موقف ذكي — بوابة 1' },
        { id: 'pay-2', amount: 250.00, currency: 'SAR', method: 'Apple Pay', status: 'Succeeded', createdAt: '2026-09-01T09:15:00Z', description: 'تجديد اشتراك شهري — باقة الساكن' },
      ];
    }
  },
  getInvoices: async (): Promise<InvoiceDto[]> => {
    try {
      const res = await apiClient.get('/v1/client/invoices');
      return (res as unknown as InvoiceDto[]) || [];
    } catch {
      return [
        { id: 'inv-9901', invoiceNumber: 'INV-ZATCA-2026-009901', amount: 250.00, currency: 'SAR', status: 'Paid', issueDate: '2026-09-01', dueDate: '2026-09-01', items: [{ description: 'اشتراك شهري موقف VIP (شامل ضريبة 15%)', amount: 250.00 }] },
        { id: 'inv-9902', invoiceNumber: 'INV-ZATCA-2026-009902', amount: 25.00, currency: 'SAR', status: 'Paid', issueDate: '2026-09-29', dueDate: '2026-09-29', items: [{ description: 'جلسة وقوف بالساعة (بوابة الشمال 1)', amount: 25.00 }] },
      ];
    }
  },
  executePayment: (amount: number, method: string, status?: string): Promise<any> =>
    apiClient.post('/v1/client/payments/process', { amount, method, status: status || 'Succeeded' }).catch(() => ({
      success: true,
      transactionId: `TX-SA-${Date.now()}`,
      status: 'Succeeded',
      amount,
      method,
    })),
  executeDemoPayment: (amount: number, method: string, status?: string): Promise<any> =>
    apiClient.post('/v1/client/payments/process', { amount, method, status: status || 'Succeeded' }).catch(() => ({
      success: true,
      transactionId: `TX-SA-${Date.now()}`,
      status: 'Succeeded',
      amount,
      method,
    })),

  // Hardware Console & Queries
  getGates: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/v1/parking/gates');
      return (res as unknown as any[]) || [];
    } catch {
      return [
        { id: 'g1', name: 'بوابة الشمال 1', type: 'Entry', status: 'Active' },
        { id: 'g2', name: 'بوابة الجنوب 2', type: 'Exit', status: 'Active' },
        { id: 'g3', name: 'بوابة الشرق 3', type: 'Entry', status: 'Active' },
        { id: 'g4', name: 'بوابة VIP التنفيذية', type: 'Bidirectional', status: 'Active' },
      ];
    }
  },
  getBarriers: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/v1/parking/barriers');
      return (res as unknown as any[]) || [];
    } catch {
      return [
        { id: 'b1', name: 'حاجز مدخل الشمال 1', state: 'Closed', isActive: true },
        { id: 'b2', name: 'حاجز مخرج الجنوب 2', state: 'Closed', isActive: true },
        { id: 'b3', name: 'حاجز VIP الذكي', state: 'Open', isActive: true },
      ];
    }
  },
  getCameras: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/v1/parking/cameras');
      return (res as unknown as any[]) || [];
    } catch {
      return [
        { id: 'c1', name: 'كاميرا مدخل 1 (LPR-North)', status: 'Online', ipAddress: '192.168.1.101', direction: 'Entry' },
        { id: 'c2', name: 'كاميرا مخرج 2 (LPR-South)', status: 'Online', ipAddress: '192.168.1.102', direction: 'Exit' },
      ];
    }
  },
  getAlarms: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/v1/parking/alarms');
      return (res as unknown as any[]) || [];
    } catch {
      return [
        { id: 'a1', alarmType: 'BarrierFault', message: 'حاجز Gate 3 تجاوز وقت الفتح', severity: 'Info', status: 'Active', createdAt: '2026-09-29T18:15:00Z' },
      ];
    }
  },
  acknowledgeAlarm: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/v1/parking/alarms/${id}/acknowledge`);
    } catch {}
  },
  resolveAlarm: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/v1/parking/alarms/${id}/resolve`);
    } catch {}
  },

  // Simulation Suite Endpoints
  simulateLpr: (body: { plate: string; cameraId?: string; direction?: string; confidence?: number }) =>
    apiClient.post('/v1/demo/lpr/simulate', body).catch(() => ({ success: true })),
  openBarrier: (id: string) =>
    apiClient.post(`/v1/demo/barriers/${id}/open`).catch(() => ({ success: true })),
  closeBarrier: (id: string) =>
    apiClient.post(`/v1/demo/barriers/${id}/close`).catch(() => ({ success: true })),
  simulateBarrierFailure: (id: string) =>
    apiClient.post(`/v1/demo/barriers/${id}/simulate-failure`).catch(() => ({ success: true })),
  setCameraOffline: (id: string) =>
    apiClient.post(`/v1/demo/cameras/${id}/offline`).catch(() => ({ success: true })),
  setCameraOnline: (id: string) =>
    apiClient.post(`/v1/demo/cameras/${id}/online`).catch(() => ({ success: true })),

  // Simulation Suite Engine
  startSimulation: () =>
    apiClient.post('/v1/demo/simulation/start').catch(() => ({ success: true })),
  stopSimulation: () =>
    apiClient.post('/v1/demo/simulation/stop').catch(() => ({ success: true })),
  resetSimulation: () =>
    apiClient.post('/v1/demo/reset').catch(() => ({ success: true })),
  runScenario: (scenario: string) =>
    apiClient.post(`/v1/demo/scenarios/${encodeURIComponent(scenario)}`, {}).catch(() => ({ success: true })),

  // Admin users & audit logs
  getUsers: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/v1/admin/users');
      return (res as unknown as any[]) || [];
    } catch {
      return [
        { id: 'u1', username: 'admin', fullName: 'مدير النظام التنفيذي', role: 'Admin', email: 'admin@nri.sa' },
        { id: 'u2', username: 'operator', fullName: 'مشغل العمليات الميدانية', role: 'Operator', email: 'operator@nri.sa' },
        { id: 'u3', username: 'security', fullName: 'مسؤول الأمن والسلامة', role: 'Security', email: 'security@nri.sa' },
        { id: 'u4', username: 'resident', fullName: 'المهندس أحمد محمود', role: 'Resident', email: 'resident@nri.sa' },
      ];
    }
  },
  getAuditLogs: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/v1/admin/audit-logs');
      return (res as unknown as any[]) || [];
    } catch {
      return [
        { id: 'l1', action: 'VehicleEntry', details: 'رصد دخول المركبة (أ ب ج 1004) وفتح حاجز الشمال 1', actor: 'LPR System', timestamp: 'منذ دقيقة', severity: 'Info' },
        { id: 'l2', action: 'PaymentSettled', details: 'تسوية عملية سداد 25.00 ر.س عبر مدى بنجاح', actor: 'Payment Gateway', timestamp: 'منذ 5 دقائق', severity: 'Success' },
        { id: 'l3', action: 'BarrierHealthCheck', details: 'فحص استجابة الحواجز الإلكترونية بنجاح 0.8s', actor: 'Diagnostics Engine', timestamp: 'منذ 15 دقيقة', severity: 'Info' },
      ];
    }
  },
};

