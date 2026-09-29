import type { ApiClient } from './client';
import { ApiError } from './errors';
import {
  addMockVehicle,
  currentProfile,
  delay,
  deleteMockVehicle,
  DEMO_PASSWORD,
  emitOccupancyTick,
  ensureVisitorSession,
  mockStore,
  nowIso,
  resetForLogin,
  updateMockVehicle,
} from './mockStore';
import { config } from '../config';
import { mergeReceipts } from '../parking/receipts';
import type { Building, EvCharger, EvChargerWrite, OccupancyLot, PaymentCapture, PaymentIntent, SupportTicket } from './types';
import {
  fallbackAdminTickets,
  fallbackBundles,
  fallbackChargers,
  fallbackGraceViolations,
  fallbackHistory,
  fallbackInvoices,
  fallbackInvite,
  fallbackPass,
  fallbackPlateSearch,
  fallbackRemoveReservation,
  fallbackReport,
  fallbackReservations,
  fallbackSaveReservation,
  fallbackSaveSubscription,
  fallbackSubscriptions,
  fallbackUsers,
  nextLocalId,
} from './fallback';

export { DEMO_PASSWORD };

export class MockApiClient implements ApiClient {
  async login(username: string, password: string) {
    await delay(null);
    if (password !== DEMO_PASSWORD) {
      throw new ApiError({
        code: 'invalid_credentials',
        message: 'Invalid username or password',
        statusCode: 401,
      });
    }
    resetForLogin(username, password);
    return {
      accessToken: `mock-jwt-${mockStore.role}`,
      refreshToken: `mock-refresh-${mockStore.role}`,
      expiresIn: 28800,
      tokenType: 'Bearer',
      role: mockStore.role,
    };
  }

  async logout() {
    await delay(null);
  }

  getMe() {
    return delay(currentProfile());
  }

  addVehicle(vehicle: { plate: string; make?: string; model?: string }) {
    return delay(addMockVehicle(vehicle));
  }

  updateVehicle(id: number, vehicle: { plate: string; make?: string; model?: string }) {
    return delay(updateMockVehicle(id, vehicle));
  }

  deleteVehicle(id: number) {
    return delay(deleteMockVehicle(id));
  }

  listMyVehicles() {
    return delay([...currentProfile().vehicles]);
  }

  listVehicleLocationHistory(vehicleId: number) {
    return delay([
      {
        vehicleId,
        placeName: 'A-12',
        zoneName: 'B-01',
        floorId: 1,
        capturedAt: new Date().toISOString(),
        locationAccuracy: 'Exact' as const,
        isCurrent: true,
      },
      {
        vehicleId,
        laneName: 'Entry A',
        zoneName: 'B-01',
        capturedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
        locationAccuracy: 'ZoneOnly' as const,
        isCurrent: false,
      },
    ]);
  }

  findVehicleLocation(plate: string) {
    const owned = mockStore.vehicles.some(
      (item) => item.plate.trim().toUpperCase() === plate.trim().toUpperCase(),
    );
    if (!owned) {
      return Promise.reject(
        new ApiError({
          code: 'FORBIDDEN',
          message: 'You do not have permission for this action.',
          statusCode: 403,
        }),
      );
    }
    const session = mockStore.session;
    const parked = session?.plate?.toUpperCase() === plate.trim().toUpperCase();
    if (!parked && mockStore.role !== 'visitor') {
      return delay({
        found: false,
        plate,
        isCurrent: false,
        message: 'Vehicle is not in the parking right now.',
      });
    }
    return delay({
      found: true,
      plate,
      vehicleId: 101,
      isCurrent: true,
      locationType: 'indoor',
      areaName: 'B-01',
      zoneName: 'B-01',
      parkingLotName: 'B-01',
      floorId: 1,
      laneName: 'A',
      placeName: 'A-12',
      locationAccuracy: 'Exact' as const,
      capturedAt: nowIso(),
      indoorX: 18,
      indoorY: 8,
      indoorZ: 0,
      route: {
        totalDistance: 42,
        estimatedTimeSeconds: 55,
        nodes: [
          { id: 'gate', x: 2, y: 12, name: 'Entry' },
          { id: 'turn', x: 10, y: 12 },
          { id: 'slot', x: 18, y: 8, name: 'A-12' },
        ],
        edges: [
          { fromId: 'gate', toId: 'turn' },
          { fromId: 'turn', toId: 'slot' },
        ],
        instructions: ['Enter at the visitor gate', 'Turn right at lane A', 'Bay A-12 is on the left'],
      },
    });
  }

  getOccupancy(buildingId: number) {
    const id = buildingId || config.mockBuildingId;
    return delay({ ...mockStore.occupancy, buildingId: id });
  }

  listBuildings(): Promise<Building[]> {
    return delay([]);
  }

  getOccupancyDetails(): Promise<OccupancyLot[]> {
    return delay([]);
  }

  getAllOccupancyDetails(): Promise<OccupancyLot[]> {
    return delay([
      { parkingId: 1, name: 'Seed Parking', buildingId: 1, free: 6, occupied: 0, total: 6 },
      { parkingId: 2, name: 'MTI', buildingId: 2, free: 6, occupied: 0, total: 6 },
    ]);
  }

  getCurrentSession() {
    return delay(ensureVisitorSession());
  }

  async getSession(id: number) {
    const current = await this.getCurrentSession();
    if (!current || current.sessionId !== id) {
      throw new ApiError({
        code: 'NO_CURRENT_SESSION',
        message: 'Session not found',
        statusCode: 404,
      });
    }
    return current;
  }

  createPaymentIntent(params: {
    sessionId: number;
    amount: number;
    currency: string;
    idempotencyKey: string;
  }): Promise<PaymentIntent> {
    return delay({
      id: 501,
      sessionId: params.sessionId,
      amount: params.amount,
      currency: params.currency,
      status: 'RequiresCapture',
      replay: false,
      graceUntil: null,
    });
  }

  async capturePayment(params: {
    intentId: number;
    idempotencyKey: string;
  }): Promise<PaymentCapture> {
    if (mockStore.lastIdempotencyKey === params.idempotencyKey && mockStore.lastCapture) {
      return delay({ ...mockStore.lastCapture, replay: true });
    }
    const session = ensureVisitorSession();
    if (!session) {
      throw new ApiError({
        code: 'NO_CURRENT_SESSION',
        message: 'No current session',
        statusCode: 404,
      });
    }
    const graceUntil = new Date(Date.now() + config.graceMinutes * 60 * 1000).toISOString();
    mockStore.session = { ...session, status: 'Paid', graceUntil, amountDue: 0 };
    mockStore.lastIdempotencyKey = params.idempotencyKey;
    mockStore.lastCapture = {
      id: params.intentId,
      status: 'Captured',
      sessionId: session.sessionId,
      amount: config.pilotPaymentAmount,
      currency: config.currency,
      replay: false,
      graceUntil,
    };
    return delay(mockStore.lastCapture);
  }

  createTicket(params: { type: SupportTicket['type']; note?: string }) {
    const ticket: SupportTicket = {
      id: mockStore.nextTicketId,
      userId: currentProfile().userId,
      type: params.type,
      note: params.note || '',

      status: 'Open',
      createdAt: nowIso(),
    };
    mockStore.nextTicketId += 1;
    mockStore.tickets.unshift(ticket);
    return delay(ticket);
  }

  getTickets() {
    return delay([...mockStore.tickets]);
  }

  listHistory() {
    return delay(mergeReceipts(fallbackHistory()));
  }

  listLiveSessions() {
    if (mockStore.role === 'visitor') {
      const current = ensureVisitorSession();
      return delay(current ? [current] : []);
    }
    return delay([
      {
        sessionId: 201,
        status: 'Open' as const,
        plate: 'MTI 1234',
        parkingName: 'MTI',
        placeName: 'A-01',
        startedAt: new Date(Date.now() - 18 * 60_000).toISOString(),
        amountDue: 15,
        currency: config.currency,
        buildingId: 1,
      },
      {
        sessionId: 202,
        status: 'Paid' as const,
        plate: 'B01 7788',
        parkingName: 'B-01',
        placeName: 'B-03',
        startedAt: new Date(Date.now() - 42 * 60_000).toISOString(),
        graceUntil: new Date(Date.now() + 12 * 60_000).toISOString(),
        amountDue: 0,
        currency: config.currency,
        buildingId: 1,
      },
    ]);
  }

  endSession(sessionId: number) {
    if (mockStore.session?.sessionId === sessionId) {
      mockStore.session = { ...mockStore.session, status: 'Closed', endedAt: new Date().toISOString() };
    }
    return delay({
      sessionId,
      status: 'Closed' as const,
      plate: 'CLOSED',
      endedAt: new Date().toISOString(),
    });
  }

  listOpsReceipts() {
    return delay(mergeReceipts(fallbackHistory()));
  }

  getSessionReceipt(sessionId: number) {
    const found = mergeReceipts(fallbackHistory()).find((row) => row.sessionId === sessionId) ?? null;
    return delay(found);
  }

  getPass() {
    if (mockStore.role === 'visitor' && mockStore.session?.status !== 'Paid') {
      return delay(null);
    }
    return delay(fallbackPass(mockStore.role, mockStore.vehicles[0]?.plate));
  }

  listEvChargers() {
    return delay([...mockChargers]);
  }

  createEvCharger(_buildingId: number, body: EvChargerWrite) {
    const created = chargerFromWrite(nextLocalId(40), body);
    mockChargers = [...mockChargers, created];
    return delay(created);
  }

  updateEvCharger(id: number, body: EvChargerWrite) {
    const exists = mockChargers.some((row) => row.id === id);
    if (!exists) {
      return Promise.reject(new ApiError({ code: 'NOT_FOUND', message: 'EV charger was not found.', statusCode: 404 }));
    }
    const updated = chargerFromWrite(id, body);
    mockChargers = mockChargers.map((row) => (row.id === id ? { ...row, ...updated } : row));
    return delay(updated);
  }

  deleteEvCharger(id: number) {
    mockChargers = mockChargers.filter((row) => row.id !== id);
    return delay(undefined);
  }

  listInvoices() {
    return delay(fallbackInvoices());
  }

  listBundles() {
    return delay(fallbackBundles);
  }

  getMySubscription() {
    const current = fallbackSubscriptions().find((row) => row.status === 'Active') ?? null;
    if (!current) return delay(null);
    return delay({
      ...current,
      mainArea: 'Main basement',
      slotReserved: true,
      slotLabel: 'A-12',
      optionalAreas: ['Visitor deck'],
    });
  }

  subscribe(params: { bundleId: number; plate?: string }) {
    const bundle = fallbackBundles.find((item) => item.id === params.bundleId) ?? fallbackBundles[0];
    const startsAt = nowIso();
    const ends = new Date();
    if (bundle.period === 'annual') ends.setFullYear(ends.getFullYear() + 1);
    else if (bundle.period === 'quarterly') ends.setMonth(ends.getMonth() + 3);
    else ends.setMonth(ends.getMonth() + 1);
    return delay(
      fallbackSaveSubscription({
        id: nextLocalId(9000),
        bundleId: bundle.id,
        bundleName: bundle.name,
        status: 'Active',
        plate: params.plate,
        buildingId: bundle.buildingId,
        startsAt,
        endsAt: ends.toISOString(),
        price: bundle.price,
        currency: bundle.currency,
      }),
    );
  }

  renewSubscription(id: number) {
    const current = fallbackSubscriptions().find((row) => row.id === id);
    if (!current) {
      throw new ApiError({ code: 'NOT_FOUND', message: 'Subscription not found', statusCode: 404 });
    }
    const ends = new Date(current.endsAt);
    ends.setMonth(ends.getMonth() + 1);
    return delay(fallbackSaveSubscription({ ...current, status: 'Active', endsAt: ends.toISOString() }));
  }

  listReservations() {
    return delay(fallbackReservations());
  }

  createReservation(params: {
    buildingId: number;
    zoneId?: number;
    plate: string;
    startsAt: string;
    endsAt: string;
    guestName?: string;
    guestPhone?: string;
  }) {
    return delay(
      fallbackSaveReservation({
        id: nextLocalId(8000),
        ...params,
        status: 'Booked',
        inviteCode: `NRI-${nextLocalId(10)}`,
      }),
    );
  }

  async cancelReservation(id: number) {
    fallbackRemoveReservation(id);
    await delay(null);
  }

  inviteReservationGuest(id: number, params: { guestName: string; guestPhone?: string; plate?: string }) {
    const current = fallbackReservations().find((row) => row.id === id);
    if (!current) {
      throw new ApiError({ code: 'NOT_FOUND', message: 'Reservation not found', statusCode: 404 });
    }
    return delay(
      fallbackSaveReservation({
        ...current,
        ...params,
        plate: params.plate || current.plate,
        inviteCode: current.inviteCode ?? `NRI-${nextLocalId(10)}`,
      }),
    );
  }

  searchPlate(plate: string) {
    return delay(fallbackPlateSearch(plate));
  }

  searchPlateBindings(_plate: string) {
    return delay([]);
  }

  unlinkVehicleBinding(_vehicleId: number) {
    return delay(undefined);
  }

  getOccupancyReport() {
    return delay(fallbackReport());
  }

  listAdminUsers() {
    return delay(fallbackUsers());
  }

  listGraceViolations() {
    return delay(fallbackGraceViolations());
  }

  async lookupInvite(code: string) {
    const found = fallbackInvite(code);
    return delay(found);
  }

  listAdminTickets() {
    return delay(fallbackAdminTickets());
  }

  async triggerRealtimeDemo() {
    emitOccupancyTick();
  }

  listManagedUsers() {
    return delay(
      fallbackUsers().map((u) => ({
        id: u.userId,
        userName: u.userName,
        displayName: u.displayName,
        roleName: u.role,
        isActive: u.isActive,
        buildingId: u.buildingId,
      })),
    );
  }

  createManagedUser(body: import('./opsTypes').ManagedUserWrite) {
    return delay({
      id: nextLocalId(100),
      userName: body.userName,
      displayName: body.displayName || body.userName,
      email: body.email ?? undefined,
      phoneNumber: body.phoneNumber ?? undefined,
      roleId: body.roleId ?? undefined,
      isActive: body.isActive ?? true,
    });
  }

  updateManagedUser(id: number, body: import('./opsTypes').ManagedUserWrite) {
    return delay({
      id,
      userName: body.userName,
      displayName: body.displayName || body.userName,
      email: body.email ?? undefined,
      phoneNumber: body.phoneNumber ?? undefined,
      roleId: body.roleId ?? undefined,
      isActive: body.isActive ?? true,
    });
  }

  async activateManagedUser() {
    await delay(null);
  }

  async deactivateManagedUser() {
    await delay(null);
  }

  async resetManagedUserPassword() {
    await delay(null);
  }

  async assignManagedUserRole() {
    await delay(null);
  }

  listRoles() {
    return delay([
      { id: 1, name: 'Admin', isActive: true },
      { id: 2, name: 'Citizen', isActive: true },
      { id: 3, name: 'Visitor', isActive: true },
    ]);
  }

  createRole(name: string) {
    return delay({ id: nextLocalId(10), name, isActive: true });
  }

  listPermissions() {
    return delay([
      { id: 1, code: 'users.manage', description: 'users.manage', isActive: true },
      { id: 2, code: 'cameras.manage', description: 'cameras.manage', isActive: true },
    ]);
  }

  createPermission(code: string) {
    return delay({ id: nextLocalId(20), code, description: code, isActive: true });
  }

  listCameras() {
    return delay([
      {
        id: 1,
        name: 'LPR Entry',
        ip: '192.168.1.50',
        streamUrl: '192.168.1.229:40000',
        rtspUrl: 'rtsp://192.168.1.50/stream1',
        typeCode: 'LPR',
        groupNum: 1,
        cameraTypeId: '2',
        status: 'Online',
        isActive: true,
        manufacturer: 'Panasonic',
        model: 'i-PRO',
        direction: 'Entry',
        parkingId: 1,
        latitude: 30.0444,
        longitude: 31.2357,
      },
    ]);
  }

  getCamera(id: number) {
    return this.listCameras().then((list) => list.find((c) => c.id === id) ?? list[0]);
  }

  probeCamera() {
    return delay({
      success: true,
      usedOnvif: true,
      manufacturer: 'Panasonic',
      model: 'i-PRO',
      brandKey: 'panasonic',
      streamUrl: 'rtsp://192.168.1.50/stream1',
      snapshotUrl: 'http://192.168.1.50/snapshot',
      httpPort: 80,
      message: 'OK',
    });
  }

  createCamera(body: import('./opsTypes').CameraWrite) {
    return delay({
      id: nextLocalId(50),
      name: body.name || `Cam ${body.ip}`,
      ip: body.ip,
      streamUrl: body.streamUrl,
      rtspUrl: body.rtspUrl,
      snapshotUrl: body.snapshotUrl,
      userName: body.userName,
      typeCode: body.typeCode,
      groupNum: body.groupNum ?? 0,
      cameraTypeId: body.cameraTypeId,
      status: 'Online',
      isActive: true,
      direction: body.direction,
      manufacturer: body.manufacturer,
      model: body.model,
      parkingId: body.parkingId ?? undefined,
      latitude: body.latitude,
      longitude: body.longitude,
      indoorX: body.indoorX,
      indoorY: body.indoorY,
    });
  }

  updateCamera(id: number, body: import('./opsTypes').CameraWrite) {
    return delay({
      id,
      name: body.name || `Cam ${body.ip}`,
      ip: body.ip,
      streamUrl: body.streamUrl,
      rtspUrl: body.rtspUrl,
      snapshotUrl: body.snapshotUrl,
      userName: body.userName,
      typeCode: body.typeCode,
      groupNum: body.groupNum ?? 0,
      cameraTypeId: body.cameraTypeId,
      status: 'Online',
      isActive: true,
      direction: body.direction,
      parkingId: body.parkingId ?? undefined,
      latitude: body.latitude,
      longitude: body.longitude,
      indoorX: body.indoorX,
      indoorY: body.indoorY,
    });
  }

  async deleteCamera() {
    await delay(null);
  }

  listCameraViews() {
    return delay([
      {
        id: 1,
        name: 'Main Gate',
        rowCount: 1,
        columnCount: 2,
        isActive: true,
        slots: [
          { rowIndex: 0, columnIndex: 0, cameraId: 1, cameraName: 'LPR Entry', cameraIp: '192.168.1.50' },
          { rowIndex: 0, columnIndex: 1, cameraId: 1, cameraName: 'LPR Entry', cameraIp: '192.168.1.50' },
        ],
      },
    ]);
  }

  getCameraView(id: number) {
    return this.listCameraViews().then((list) => list.find((v) => v.id === id) ?? list[0]);
  }

  createCameraView(body: import('./opsTypes').CameraViewWrite) {
    return delay({
      id: Date.now(),
      name: body.name,
      rowCount: body.rowCount,
      columnCount: body.columnCount,
      isActive: body.isActive ?? true,
      slots: (body.slots ?? [])
        .filter((s) => s.cameraId)
        .map((s) => ({
          rowIndex: s.rowIndex,
          columnIndex: s.columnIndex,
          cameraId: s.cameraId!,
          cameraName: `Camera ${s.cameraId}`,
        })),
    });
  }

  updateCameraView(id: number, body: import('./opsTypes').CameraViewWrite) {
    return this.createCameraView(body).then((v) => ({ ...v, id }));
  }

  async deleteCameraView() {
    await delay(null);
  }

  getCameraStatus(id: number) {
    return delay({ cameraId: id, online: true, status: 'Online', rtspUrl: 'rtsp://demo' });
  }

  getCameraSnapshot(id: number) {
    // Tiny valid JPEG so mock UI can show a stream tile
    const jpeg =
      '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAQDxAQDw8QDw8PDw8PDw8QFRUWFhURFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAIDBQYBB//EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB2gP/xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAEFAl//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/AX//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/AX//2Q==';
    return delay({
      cameraId: id,
      success: true,
      contentType: 'image/jpeg',
      imageBase64: jpeg,
      message: 'ok',
    });
  }

  testCamera() {
    return delay({ success: true, status: 'Online', message: 'OK' });
  }

  listLprLive(cameraId?: number) {
    const jpeg =
      '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAQDxAQDw8QDw8PDw8PDw8QFRUWFhURFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAAEAAIDBQYBB//EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB2gP/xAAUEAEAAAAAAAAAAAAAAAAAAAAg/9oACAEBAAEFAl//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/AX//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/AX//2Q==';
    return delay({
      items: [
        {
          id: 1,
          plateNumber: 'بلد 475',
          chars: 'بلد',
          number: '475',
          cameraId: cameraId ?? 1,
          cameraName: 'LPR Entry',
          direction: 'Entry',
          eventDateTime: nowIso(),
          confidence: 0.95,
          authorized: true,
          vehicleBrand: 'Toyota',
          vehicleModel: 'Camry',
          vehicleColor: 'Red',
          plateImagePath: jpeg,
        },
        {
          id: 2,
          plateNumber: 'VIS1001',
          cameraId: cameraId ?? 1,
          cameraName: 'LPR Entry',
          direction: 'Exit',
          eventDateTime: nowIso(),
          confidence: 0.88,
          authorized: false,
          reason: 'Blacklist',
          plateImagePath: jpeg,
        },
      ],
      page: 1,
      pageSize: 20,
      totalCount: 2,
    });
  }

  listLprHistory(params: { page?: number; pageSize?: number }) {
    return this.listLprLive().then((live) => ({
      ...live,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    }));
  }

  listParkings() {
    return delay([{ id: 1, name: 'B-01', zoneId: 1, emptyPlaces: 0, totalPlaces: 2 }]);
  }

  listZones(areaId?: number) {
    const zones = [{ id: 1, name: 'Zone A', areaId: areaId && areaId > 0 ? areaId : 1, parkingCount: 1 }];
    return delay(zones);
  }

  createArea(body: { name: string }) {
    return delay({ id: Date.now(), name: body.name });
  }

  createZone(body: { name: string; areaId: number }) {
    return delay({ id: Date.now(), name: body.name, areaId: body.areaId, parkingCount: 0 });
  }

  updateArea(id: number, body: { name: string; isActive?: boolean }) {
    return delay({ id, name: body.name });
  }

  async deleteArea() {
    await delay(null);
  }

  updateZone(id: number, body: { name: string; areaId?: number; isActive?: boolean }) {
    return delay({ id, name: body.name, areaId: body.areaId ?? 1, parkingCount: 1 });
  }

  async deleteZone() {
    await delay(null);
  }

  createParking(body: { name: string; zoneId: number; latitude?: number; longitude?: number }) {
    return delay({
      id: Date.now(),
      name: body.name,
      zoneId: body.zoneId,
      emptyPlaces: 0,
      totalPlaces: 0,
      latitude: body.latitude,
      longitude: body.longitude,
    });
  }

  updateParking(id: number, body: { name: string; zoneId: number; latitude?: number; longitude?: number }) {
    return delay({
      id,
      name: body.name,
      zoneId: body.zoneId,
      emptyPlaces: 0,
      totalPlaces: 0,
      latitude: body.latitude,
      longitude: body.longitude,
    });
  }

  async deleteParking() {
    await delay(null);
  }

  listPlaces(parkingId: number) {
    return delay([
      { id: 1, name: 'A-01', parkingId, isEmpty: false },
      { id: 2, name: 'A-02', parkingId, isEmpty: false },
      { id: 3, name: 'A-03', parkingId, isEmpty: true },
    ]);
  }

  createPlace(body: { name: string; parkingId: number; isEmpty: boolean }) {
    return delay({ id: Date.now(), ...body });
  }

  updatePlace(id: number, body: { name: string; parkingId: number; isEmpty: boolean }) {
    return delay({ id, ...body });
  }

  async deletePlace() {
    await delay(null);
  }

  async setPlaceOccupancy() {
    await delay(null);
  }

  simulateGateEntry(params: { plate: string; buildingId?: number; parkingId?: number; gateId?: string; placeId?: number; userId?: number }) {
    return delay({
      sessionId: Date.now(),
      plate: params.plate,
      userId: params.userId ?? 5,
      buildingId: params.buildingId ?? 1,
      buildingName: 'Building 1',
      zoneId: 1,
      zoneName: 'Zone A',
      parkingId: params.parkingId ?? 1,
      parkingName: 'Seed Parking',
      placeId: params.placeId ?? 5,
      placeName: 'A-005',
      startedAt: new Date().toISOString(),
      status: 'Open',
      amountDue: 25.0,
      currency: 'EGP',
      barrierOpened: true,
      message: 'تمت محاكاة دخول السيارة وبدء الجلسة وتحديد الموقع بنجاح.',
    });
  }

  simulateGateExit(params: { plate?: string; sessionId?: number; gateId?: string; force?: boolean }) {
    return delay({
      sessionId: params.sessionId ?? Date.now(),
      plate: params.plate ?? 'بلد 475',
      endedAt: new Date().toISOString(),
      status: 'Closed',
      totalAmount: 25.0,
      barrierOpened: true,
      message: 'تمت محاكاة خروج السيارة وإغلاق الجلسة وتفريغ مكان الركن بنجاح.',
    });
  }

  // ── Gates & Barriers Mock ──
  listGates() {
    return delay([...mockGates]);
  }
  getGate(id: number) {
    const found = mockGates.find((g) => g.id === id);
    if (!found) throw new Error('Gate not found');
    return delay({ ...found });
  }
  createGate(body: import('./opsTypes').GateWrite) {
    const newGate: import('./opsTypes').GateRow = {
      id: Date.now(),
      name: body.name,
      parkingId: body.parkingId ?? null,
      parkingName: 'Central Parking Building 01',
      direction: body.direction ?? 'Bidirectional',
      isActive: body.isActive ?? true,
      status: body.isActive !== false ? 'Online' : 'Offline',
      lastEvent: 'Created',
    };
    mockGates.push(newGate);
    return delay(newGate);
  }
  updateGate(id: number, body: import('./opsTypes').GateWrite) {
    const idx = mockGates.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error('Gate not found');
    mockGates[idx] = {
      ...mockGates[idx],
      name: body.name,
      parkingId: body.parkingId ?? mockGates[idx].parkingId,
      direction: body.direction ?? mockGates[idx].direction,
      isActive: body.isActive ?? mockGates[idx].isActive,
      status: body.isActive !== false ? 'Online' : 'Offline',
    };
    return delay({ ...mockGates[idx] });
  }
  deleteGate(id: number) {
    mockGates = mockGates.filter((g) => g.id !== id);
    return delay(undefined);
  }

  listBarriers() {
    return delay([...mockBarriers]);
  }
  getBarrier(id: number) {
    const found = mockBarriers.find((b) => b.id === id);
    if (!found) throw new Error('Barrier not found');
    return delay({ ...found });
  }
  getBarrierStatus(id: number) {
    const found = mockBarriers.find((b) => b.id === id);
    return delay({
      barrierId: id,
      state: found?.state ?? 'Closed',
      status: found?.status ?? 'Closed',
      providerKey: found?.providerKey ?? 'simulated',
      message: `Device ping OK at ${found?.deviceAddress || '127.0.0.1:502'}`,
      checkedAt: new Date().toISOString(),
    });
  }
  createBarrier(body: import('./opsTypes').BarrierWrite) {
    const newBarrier: import('./opsTypes').BarrierRow = {
      id: Date.now(),
      name: body.name,
      gateId: body.gateId ?? null,
      gateName: mockGates.find((g) => g.id === body.gateId)?.name ?? null,
      state: 'Closed',
      status: 'Closed',
      providerKey: body.providerKey ?? 'simulated',
      deviceAddress: body.deviceAddress ?? '',
      isActive: body.isActive ?? true,
    };
    mockBarriers.push(newBarrier);
    return delay(newBarrier);
  }
  updateBarrier(id: number, body: import('./opsTypes').BarrierWrite) {
    const idx = mockBarriers.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Barrier not found');
    mockBarriers[idx] = {
      ...mockBarriers[idx],
      name: body.name,
      gateId: body.gateId ?? mockBarriers[idx].gateId,
      gateName:
        mockGates.find((g) => g.id === (body.gateId ?? mockBarriers[idx].gateId))?.name ??
        mockBarriers[idx].gateName,
      providerKey: body.providerKey ?? mockBarriers[idx].providerKey,
      deviceAddress: body.deviceAddress ?? mockBarriers[idx].deviceAddress,
      isActive: body.isActive ?? mockBarriers[idx].isActive,
    };
    return delay({ ...mockBarriers[idx] });
  }
  deleteBarrier(id: number) {
    mockBarriers = mockBarriers.filter((b) => b.id !== id);
    return delay(undefined);
  }
  openBarrier(id: number) {
    const idx = mockBarriers.findIndex((b) => b.id === id);
    if (idx !== -1) {
      mockBarriers[idx].state = 'Open';
      mockBarriers[idx].status = 'Open';
    }
    return delay(undefined);
  }
  closeBarrier(id: number) {
    const idx = mockBarriers.findIndex((b) => b.id === id);
    if (idx !== -1) {
      mockBarriers[idx].state = 'Closed';
      mockBarriers[idx].status = 'Closed';
    }
    return delay(undefined);
  }
  emergencyOpenBarrier(id: number) {
    const idx = mockBarriers.findIndex((b) => b.id === id);
    if (idx !== -1) {
      mockBarriers[idx].state = 'Emergency';
      mockBarriers[idx].status = 'Emergency';
    }
    return delay(undefined);
  }
  resetBarrier(id: number) {
    const idx = mockBarriers.findIndex((b) => b.id === id);
    if (idx !== -1) {
      mockBarriers[idx].state = 'Closed';
      mockBarriers[idx].status = 'Closed';
    }
    return delay(undefined);
  }

  getOperationsCenterOverview(): Promise<import('./opsTypes').OperationsCenterOverview> {
    const overview: import('./opsTypes').OperationsCenterOverview = {
      totalCapacity: 450,
      totalOccupied: 184,
      totalFree: 266,
      occupancyPercent: 40.9,
      activeSessionsCount: 184,
      todayEntriesCount: 342,
      todayExitsCount: 158,
      deviceHealth: {
        totalDevices: 12,
        online: 10,
        warning: 1,
        offline: 1,
        error: 0,
        maintenance: 0,
        unknown: 0,
        byDeviceType: { Camera: 6, Barrier: 4, EdgeAgent: 2 },
      },
      activeProblems: [
        {
          id: 'dev-4',
          category: 'Camera',
          severity: 'Warning',
          title: "Camera 'North Entry LPR' is Offline",
          description: 'No heartbeat received in the last 4 minutes.',
          entityId: '4',
          occurredAt: new Date(Date.now() - 240000).toISOString(),
        },
      ],
      recentLprEvents: [],
      gates: mockGates,
      barriers: mockBarriers,
      cameras: [],
      edgeAgents: [],
    };
    return delay(overview);
  }

  executeManualBarrierCommand(id: number, body: import('./opsTypes').ManualBarrierCommandBody): Promise<import('./opsTypes').BarrierRow> {
    const idx = mockBarriers.findIndex((b) => b.id === id);
    const cmd = (body.command || 'OPEN').toUpperCase();
    if (idx !== -1) {
      mockBarriers[idx].state = cmd === 'CLOSE' ? 'Closed' : 'Open';
      mockBarriers[idx].status = mockBarriers[idx].state;
      return delay({ ...mockBarriers[idx] });
    }
    return delay({
      id,
      name: `Barrier #${id}`,
      state: cmd === 'CLOSE' ? 'Closed' : 'Open',
      status: cmd === 'CLOSE' ? 'Closed' : 'Open',
      isActive: true,
    });
  }

  // ── Alarms & Incident Management Mock ──
  listAlarms(params?: {
    status?: string;
    severity?: string;
    alarmType?: string;
    isIncident?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<import('./opsTypes').PagedResult<import('./opsTypes').AlarmDto>> {
    const mockAlarms: import('./opsTypes').AlarmDto[] = [
      {
        id: 1,
        alarmType: 'BarrierError',
        severity: 'Critical',
        source: 'Main Entrance Barrier #1',
        deviceId: 1,
        buildingId: 1,
        zoneId: 1,
        status: 'Open',
        message: 'Barrier arm obstruction detected during closing sequence.',
        dedupKey: 'barrier-1-obstruction',
        occurrencesCount: 3,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        lastOccurredAt: new Date(Date.now() - 300000).toISOString(),
        isIncident: false,
      },
      {
        id: 2,
        alarmType: 'CameraOffline',
        severity: 'High',
        source: 'North LPR Camera #4',
        deviceId: 4,
        buildingId: 1,
        status: 'Acknowledged',
        message: 'Heartbeat missed for over 5 minutes.',
        dedupKey: 'cam-4-offline',
        occurrencesCount: 1,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        lastOccurredAt: new Date(Date.now() - 7200000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 5400000).toISOString(),
        acknowledgedByUserName: 'admin1',
        isIncident: true,
        incidentNumber: 'INC-20260831-0001',
      },
    ];
    return delay({
      items: mockAlarms,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 50,
      totalCount: mockAlarms.length,
    });
  }

  acknowledgeAlarm(id: number): Promise<import('./opsTypes').AlarmDto> {
    return delay({
      id,
      alarmType: 'BarrierError',
      severity: 'High',
      source: `Device #${id}`,
      status: 'Acknowledged',
      message: 'Alarm acknowledged by operator',
      occurrencesCount: 1,
      createdAt: new Date().toISOString(),
      lastOccurredAt: new Date().toISOString(),
      acknowledgedAt: new Date().toISOString(),
      acknowledgedByUserName: 'admin',
      isIncident: false,
    });
  }

  assignAlarm(id: number, body: { assignedToUserId?: number; note?: string }): Promise<import('./opsTypes').AlarmDto> {
    return delay({
      id,
      alarmType: 'BarrierError',
      severity: 'High',
      source: `Device #${id}`,
      status: 'Assigned',
      message: 'Alarm assigned',
      occurrencesCount: 1,
      createdAt: new Date().toISOString(),
      lastOccurredAt: new Date().toISOString(),
      assignedToUserId: body.assignedToUserId ?? 1,
      assignedToUserName: 'admin',
      isIncident: false,
    });
  }

  resolveAlarm(id: number, body: { note?: string }): Promise<import('./opsTypes').AlarmDto> {
    return delay({
      id,
      alarmType: 'BarrierError',
      severity: 'High',
      source: `Device #${id}`,
      status: 'Resolved',
      message: 'Alarm resolved',
      resolutionNote: body.note || 'Resolved by operator',
      occurrencesCount: 1,
      createdAt: new Date().toISOString(),
      lastOccurredAt: new Date().toISOString(),
      resolvedAt: new Date().toISOString(),
      resolvedByUserName: 'admin',
      isIncident: false,
    });
  }

  closeAlarm(id: number, body: { note?: string }): Promise<import('./opsTypes').AlarmDto> {
    return delay({
      id,
      alarmType: 'BarrierError',
      severity: 'High',
      source: `Device #${id}`,
      status: 'Closed',
      message: 'Alarm closed',
      resolutionNote: body.note || 'Closed and archived',
      occurrencesCount: 1,
      createdAt: new Date().toISOString(),
      lastOccurredAt: new Date().toISOString(),
      closedAt: new Date().toISOString(),
      closedByUserName: 'admin',
      isIncident: false,
    });
  }

  convertAlarmToIncident(id: number, body: { note?: string }): Promise<import('./opsTypes').AlarmDto> {
    return delay({
      id,
      alarmType: 'BarrierError',
      severity: 'Critical',
      source: `Device #${id}`,
      status: 'InProgress',
      message: 'Escalated to major incident',
      occurrencesCount: 1,
      createdAt: new Date().toISOString(),
      lastOccurredAt: new Date().toISOString(),
      isIncident: true,
      incidentNumber: `INC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-000${id}`,
      resolutionNote: body.note,
    });
  }
}

let mockGates: import('./opsTypes').GateRow[] = [
  {
    id: 1,
    name: 'Main Entrance Gate A',
    parkingId: 1,
    parkingName: 'Building 01 Central',
    direction: 'Inbound',
    isActive: true,
    status: 'Online',
    lastEvent: 'Vehicle Entered (ABC 123)',
  },
  {
    id: 2,
    name: 'Main Exit Gate B',
    parkingId: 1,
    parkingName: 'Building 01 Central',
    direction: 'Outbound',
    isActive: true,
    status: 'Online',
    lastEvent: 'Vehicle Exited (XYZ 999)',
  },
  {
    id: 3,
    name: 'VIP North Gate',
    parkingId: 2,
    parkingName: 'North VIP Lot',
    direction: 'Bidirectional',
    isActive: true,
    status: 'Online',
    lastEvent: 'Barrier Checked',
  },
  {
    id: 4,
    name: 'Emergency West Gate',
    parkingId: 1,
    parkingName: 'Building 01 Central',
    direction: 'Bidirectional',
    isActive: false,
    status: 'Offline',
    lastEvent: 'Maintenance Scheduled',
  },
];

let mockBarriers: import('./opsTypes').BarrierRow[] = [
  {
    id: 1,
    name: 'Barrier Arm Alpha (Entry)',
    gateId: 1,
    gateName: 'Main Entrance Gate A',
    state: 'Closed',
    status: 'Closed',
    providerKey: 'simulated',
    deviceAddress: '192.168.1.101:502',
    isActive: true,
  },
  {
    id: 2,
    name: 'Barrier Arm Beta (Exit)',
    gateId: 2,
    gateName: 'Main Exit Gate B',
    state: 'Closed',
    status: 'Closed',
    providerKey: 'simulated',
    deviceAddress: '192.168.1.102:502',
    isActive: true,
  },
  {
    id: 3,
    name: 'VIP High-Speed Barrier',
    gateId: 3,
    gateName: 'VIP North Gate',
    state: 'Closed',
    status: 'Closed',
    providerKey: 'http',
    deviceAddress: 'http://192.168.1.120:8080/barrier',
    isActive: true,
  },
  {
    id: 4,
    name: 'Emergency Manual Barrier',
    gateId: 4,
    gateName: 'Emergency West Gate',
    state: 'Closed',
    status: 'Closed',
    providerKey: 'simulated',
    deviceAddress: '192.168.1.130',
    isActive: false,
  },
];


let mockChargers: EvCharger[] = fallbackChargers();

function chargerFromWrite(id: number, body: EvChargerWrite): EvCharger {
  const status = body.status === 'offline' ? 'Offline' : body.free <= 0 ? 'Occupied' : 'Available';
  return {
    id,
    name: body.label.trim(),
    status,
    free: body.free,
    total: body.total,
    platformStatus: body.status,
  };
}
