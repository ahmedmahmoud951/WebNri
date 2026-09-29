import type {
  AccessPass,
  AdminUserRow,
  AuthTokens,
  Building,
  DistrictInvoice,
  EvCharger,
  EvChargerWrite,
  Occupancy,
  OccupancyLot,
  GraceViolation,
  OccupancyReport,
  ParkingBundle,
  ParkingReceipt,
  ParkingReservation,
  ParkingSession,
  ParkingSubscription,
  PaymentCapture,
  PaymentIntent,
  PlateBinding,
  PlateSearchHit,
  SupportTicket,
  TicketType,
  UserProfile,
  Vehicle,
  VehicleLocation,
  VehicleLocationPoint,
} from './types';

export interface ApiClient {
  login(username: string, password: string): Promise<AuthTokens>;
  logout(refreshToken?: string): Promise<void>;
  getMe(): Promise<UserProfile>;
  addVehicle(vehicle: Vehicle): Promise<UserProfile>;
  updateVehicle(id: number, vehicle: Vehicle): Promise<UserProfile>;
  deleteVehicle(id: number): Promise<UserProfile>;
  listMyVehicles(): Promise<Vehicle[]>;
  findVehicleLocation(
    plate: string,
    from?: { x: number; y: number; floorId?: number },
  ): Promise<VehicleLocation>;
  listVehicleLocationHistory(vehicleId: number, take?: number): Promise<VehicleLocationPoint[]>;
  listBuildings(): Promise<Building[]>;
  getOccupancy(buildingId: number): Promise<Occupancy>;
  getOccupancyDetails(buildingId: number): Promise<OccupancyLot[]>;
  getAllOccupancyDetails(): Promise<OccupancyLot[]>;
  getCurrentSession(): Promise<ParkingSession | null>;
  getSession(id: number): Promise<ParkingSession>;
  listHistory(): Promise<ParkingReceipt[]>;
  listLiveSessions(): Promise<ParkingSession[]>;
  endSession(sessionId: number): Promise<ParkingSession>;
  listOpsReceipts(): Promise<ParkingReceipt[]>;
  getSessionReceipt(sessionId: number): Promise<ParkingReceipt | null>;
  listBundles(): Promise<ParkingBundle[]>;
  getMySubscription(): Promise<ParkingSubscription | null>;
  subscribe(params: { bundleId: number; plate?: string }): Promise<ParkingSubscription>;
  renewSubscription(id: number): Promise<ParkingSubscription>;
  listReservations(): Promise<ParkingReservation[]>;
  createReservation(params: {
    buildingId: number;
    zoneId?: number;
    plate: string;
    startsAt: string;
    endsAt: string;
    guestName?: string;
    guestPhone?: string;
  }): Promise<ParkingReservation>;
  cancelReservation(id: number): Promise<void>;
  inviteReservationGuest(
    id: number,
    params: { guestName: string; guestPhone?: string; plate?: string },
  ): Promise<ParkingReservation>;
  searchPlate(plate: string): Promise<PlateSearchHit[]>;
  searchPlateBindings(plate: string): Promise<PlateBinding[]>;
  unlinkVehicleBinding(vehicleId: number): Promise<void>;
  getOccupancyReport(): Promise<OccupancyReport>;
  listAdminUsers(): Promise<AdminUserRow[]>;
  listGraceViolations(): Promise<GraceViolation[]>;
  lookupInvite(code: string): Promise<ParkingReservation | null>;
  listAdminTickets(): Promise<SupportTicket[]>;
  createPaymentIntent(params: {
    sessionId: number;
    amount: number;
    currency: string;
    idempotencyKey: string;
  }): Promise<PaymentIntent>;
  capturePayment(params: {
    intentId: number;
    idempotencyKey: string;
  }): Promise<PaymentCapture>;
  createTicket(params: { type: TicketType; note?: string }): Promise<SupportTicket>;
  getTickets(): Promise<SupportTicket[]>;

  getPass(): Promise<AccessPass | null>;
  listEvChargers(buildingId: number): Promise<EvCharger[]>;
  createEvCharger(buildingId: number, body: EvChargerWrite): Promise<EvCharger>;
  updateEvCharger(id: number, body: EvChargerWrite): Promise<EvCharger>;
  deleteEvCharger(id: number): Promise<void>;
  listInvoices(): Promise<DistrictInvoice[]>;
  triggerRealtimeDemo(buildingId: number): Promise<void>;

  // ── Ops (WPF parity: /api/parking) ──
  listManagedUsers(): Promise<import('./opsTypes').ManagedUser[]>;
  createManagedUser(body: import('./opsTypes').ManagedUserWrite): Promise<import('./opsTypes').ManagedUser>;
  updateManagedUser(id: number, body: import('./opsTypes').ManagedUserWrite): Promise<import('./opsTypes').ManagedUser>;
  activateManagedUser(id: number): Promise<void>;
  deactivateManagedUser(id: number): Promise<void>;
  resetManagedUserPassword(id: number, newPassword: string): Promise<void>;
  assignManagedUserRole(id: number, roleId: number): Promise<void>;
  listRoles(): Promise<import('./opsTypes').RoleRow[]>;
  createRole(name: string): Promise<import('./opsTypes').RoleRow>;
  listPermissions(): Promise<import('./opsTypes').PermissionRow[]>;
  createPermission(code: string): Promise<import('./opsTypes').PermissionRow>;

  listCameras(): Promise<import('./opsTypes').CameraRow[]>;
  getCamera(id: number): Promise<import('./opsTypes').CameraRow>;
  probeCamera(body: import('./opsTypes').CameraProbeRequest): Promise<import('./opsTypes').CameraProbeResult>;
  createCamera(body: import('./opsTypes').CameraWrite): Promise<import('./opsTypes').CameraRow>;
  updateCamera(id: number, body: import('./opsTypes').CameraWrite): Promise<import('./opsTypes').CameraRow>;
  deleteCamera(id: number): Promise<void>;
  getCameraStatus(id: number): Promise<import('./opsTypes').CameraStatus>;
  getCameraSnapshot(id: number): Promise<import('./opsTypes').CameraSnapshot>;
  testCamera(id: number): Promise<import('./opsTypes').CameraTestResult>;

  listCameraViews(): Promise<import('./opsTypes').CameraViewRow[]>;
  getCameraView(id: number): Promise<import('./opsTypes').CameraViewRow>;
  createCameraView(body: import('./opsTypes').CameraViewWrite): Promise<import('./opsTypes').CameraViewRow>;
  updateCameraView(id: number, body: import('./opsTypes').CameraViewWrite): Promise<import('./opsTypes').CameraViewRow>;
  deleteCameraView(id: number): Promise<void>;

  listLprLive(cameraId?: number, page?: number, pageSize?: number): Promise<import('./opsTypes').PagedResult<import('./opsTypes').LprEvent>>;
  listLprHistory(params: {
    cameraId?: number;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<import('./opsTypes').PagedResult<import('./opsTypes').LprEvent>>;

  listParkings(buildingId?: number): Promise<import('./opsTypes').ParkingLotRef[]>;
  listZones(areaId?: number): Promise<import('./opsTypes').ParkingZoneRef[]>;
  createArea(body: { name: string; isActive?: boolean }): Promise<{ id: number; name: string }>;
  updateArea(id: number, body: { name: string; isActive?: boolean }): Promise<{ id: number; name: string }>;
  deleteArea(id: number): Promise<void>;
  createZone(body: { name: string; areaId: number; isActive?: boolean }): Promise<import('./opsTypes').ParkingZoneRef>;
  updateZone(id: number, body: { name: string; areaId?: number; isActive?: boolean }): Promise<import('./opsTypes').ParkingZoneRef>;
  deleteZone(id: number): Promise<void>;
  createParking(body: import('./opsTypes').ParkingWrite): Promise<import('./opsTypes').ParkingLotRef>;
  updateParking(id: number, body: import('./opsTypes').ParkingWrite): Promise<import('./opsTypes').ParkingLotRef>;
  deleteParking(id: number): Promise<void>;
  listPlaces(parkingId: number): Promise<import('./opsTypes').ParkingPlace[]>;
  createPlace(body: import('./opsTypes').ParkingPlaceWrite): Promise<import('./opsTypes').ParkingPlace>;
  updatePlace(id: number, body: import('./opsTypes').ParkingPlaceWrite): Promise<import('./opsTypes').ParkingPlace>;
  deletePlace(id: number): Promise<void>;
  setPlaceOccupancy(placeId: number, isEmpty: boolean): Promise<void>;

  // ── Gate Simulator ──
  simulateGateEntry(params: {
    plate: string;
    buildingId?: number;
    parkingId?: number;
    gateId?: string;
    placeId?: number;
    userId?: number;
  }): Promise<{
    sessionId: number;
    plate: string;
    userId?: number;
    buildingId?: number;
    buildingName?: string;
    zoneId?: number;
    zoneName?: string;
    parkingId?: number;
    parkingName?: string;
    placeId?: number;
    placeName?: string;
    startedAt: string;
    status: string;
    amountDue: number;
    currency: string;
    barrierOpened: boolean;
    message: string;
  }>;
  simulateGateExit(params: {
    plate?: string;
    sessionId?: number;
    gateId?: string;
    force?: boolean;
  }): Promise<{
    sessionId: number;
    plate: string;
    endedAt: string;
    status: string;
    totalAmount: number;
    barrierOpened: boolean;
    message: string;
  }>;

  // ── Gates & Barriers ──
  listGates(): Promise<import('./opsTypes').GateRow[]>;
  getGate(id: number): Promise<import('./opsTypes').GateRow>;
  createGate(body: import('./opsTypes').GateWrite): Promise<import('./opsTypes').GateRow>;
  updateGate(id: number, body: import('./opsTypes').GateWrite): Promise<import('./opsTypes').GateRow>;
  deleteGate(id: number): Promise<void>;

  listBarriers(): Promise<import('./opsTypes').BarrierRow[]>;
  getBarrier(id: number): Promise<import('./opsTypes').BarrierRow>;
  getBarrierStatus(id: number): Promise<import('./opsTypes').BarrierStatusResult>;
  createBarrier(body: import('./opsTypes').BarrierWrite): Promise<import('./opsTypes').BarrierRow>;
  updateBarrier(id: number, body: import('./opsTypes').BarrierWrite): Promise<import('./opsTypes').BarrierRow>;
  deleteBarrier(id: number): Promise<void>;
  openBarrier(id: number): Promise<void>;
  closeBarrier(id: number): Promise<void>;
  emergencyOpenBarrier(id: number): Promise<void>;
  resetBarrier(id: number): Promise<void>;

  getOperationsCenterOverview(): Promise<import('./opsTypes').OperationsCenterOverview>;
  executeManualBarrierCommand(id: number, body: import('./opsTypes').ManualBarrierCommandBody): Promise<import('./opsTypes').BarrierRow>;

  // ── Alarms & Incident Management ──
  listAlarms(params?: {
    status?: string;
    severity?: string;
    alarmType?: string;
    isIncident?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<import('./opsTypes').PagedResult<import('./opsTypes').AlarmDto>>;
  acknowledgeAlarm(id: number): Promise<import('./opsTypes').AlarmDto>;
  assignAlarm(id: number, body: { assignedToUserId?: number; note?: string }): Promise<import('./opsTypes').AlarmDto>;
  resolveAlarm(id: number, body: { note?: string }): Promise<import('./opsTypes').AlarmDto>;
  closeAlarm(id: number, body: { note?: string }): Promise<import('./opsTypes').AlarmDto>;
  convertAlarmToIncident(id: number, body: { note?: string }): Promise<import('./opsTypes').AlarmDto>;
}

