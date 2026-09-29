import axios, { AxiosError, type AxiosInstance } from 'axios';
import { config } from '../config';
import type { ApiClient } from './client';
import { ApiError, isEmptyBusinessError, isUnimplementedRoute } from './errors';
import {
  normalizeAccessPass,
  normalizeAdminUser,
  normalizeAuthTokens,
  normalizeBuildings,
  normalizeBundles,
  normalizeEvChargers,
  normalizeEvCharger,
  normalizeGraceViolation,
  normalizeInvoices,
  normalizeOccupancy,
  normalizeOccupancyLots,
  overlaySubscription,
  normalizePayment,
  normalizePlateBinding,
  normalizePlateHit,
  normalizeReceipt,
  normalizeReceipts,
  normalizeReport,
  normalizeReservation,
  normalizeReservations,
  normalizeSession,
  normalizeSubscription,
  normalizeTicket,
  normalizeUser,
  normalizeVehicle,
  normalizeVehicleLocation,
  normalizeVehicleLocationPoint,
} from './normalize';
import {
  normalizeBarrier,
  normalizeBarrierStatus,
  normalizeCamera,
  normalizeCameraSnapshot,
  normalizeCameraStatus,
  normalizeCameraTest,
  normalizeCameraView,
  normalizeGate,
  normalizeLprEvent,
  normalizeManagedUser,
  normalizePermission,
  normalizeProbe,
  normalizeRole,
  pageMeta,
} from './opsNormalize';
import { parseTickets, unwrapList, type OccupancyLot, type SupportTicket, type Vehicle } from './types';
import type {
  BarrierRow,
  BarrierStatusResult,
  BarrierWrite,
  CameraProbeRequest,
  CameraRow,
  CameraWrite,
  GateRow,
  GateWrite,
  ManagedUserWrite,
  ParkingLotRef,
  ParkingPlace,
  ParkingPlaceWrite,
  ParkingWrite,
  ParkingZoneRef,
} from './opsTypes';

import { mergeReceipts } from '../parking/receipts';
import {
  fallbackAdminTickets,
  fallbackBundles,
  fallbackChargers,
  fallbackGraceViolations,
  fallbackInvoices,
  fallbackInvite,
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

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retried?: boolean;
    optional?: boolean;
  }
}

export interface HttpApiDeps {
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  getLanguage: () => string;
  onTokens: (accessToken: string, refreshToken?: string) => void;
  onUnauthorized: () => void;
}

function liveOrLocal(error: unknown): boolean {
  if (isEmptyBusinessError(error)) return false;
  if (isUnimplementedRoute(error)) return true;
  if (error instanceof ApiError) {
    return error.statusCode === 404 || error.statusCode === 500 || error.statusCode === 502 || error.statusCode === 503;
  }
  return false;
}

function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status;
  const data = error.response?.data;
  if (data && typeof data === 'object') {
    const body = data as {
      code?: string;
      errorCode?: string;
      message?: string;
      correlationId?: string;
    };
    return ApiError.fromBody(
      {
        code: body.code ?? body.errorCode,
        message: body.message,
        correlationId: body.correlationId,
      },
      status,
    );
  }
  if (status === 429) {
    return ApiError.fromBody({ code: 'rate_limited' }, 429);
  }
  if (status === 401) {
    return ApiError.unauthorized();
  }
  return ApiError.network(error.message);
}

export class HttpApiClient implements ApiClient {
  private readonly http: AxiosInstance;
  private readonly deps: HttpApiDeps;
  private refreshInFlight: Promise<boolean> | null = null;

  constructor(deps: HttpApiDeps) {
    this.deps = deps;
    this.http = axios.create({
      baseURL: config.apiBase,
      timeout: 15_000,
    });
    this.http.interceptors.request.use((request) => {
      request.headers['Accept-Language'] = this.deps.getLanguage();
      request.headers['X-Correlation-ID'] = crypto.randomUUID();
      const token = this.deps.getToken();
      if (token && !request.skipAuth) {
        request.headers.Authorization = `Bearer ${token}`;
      }
      return request;
    });
    this.http.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config;
        const status = error.response?.status;
        if (
          status === 401 &&
          original &&
          !original._retried &&
          !original.skipAuth &&
          !original.optional
        ) {
          original._retried = true;
          const refreshed = await this.tryRefresh();
          if (refreshed) {
            return this.http.request(original);
          }
          this.deps.onUnauthorized();
        }
        return Promise.reject(toApiError(error));
      },
    );
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = this.deps.getRefreshToken();
    if (!refreshToken) return false;
    if (!this.refreshInFlight) {
      this.refreshInFlight = (async () => {
        try {
          const { data } = await this.http.post(
            '/v1/auth/refresh',
            { refreshToken },
            { skipAuth: true },
          );
          const tokens = normalizeAuthTokens(data);
          if (!tokens.accessToken) return false;
          this.deps.onTokens(tokens.accessToken, tokens.refreshToken ?? refreshToken);
          return true;
        } catch {
          return false;
        } finally {
          this.refreshInFlight = null;
        }
      })();
    }
    return this.refreshInFlight;
  }

  async login(username: string, password: string) {
    const { data } = await this.http.post(
      '/v1/auth/login',
      { username, password },
      { skipAuth: true },
    );
    return normalizeAuthTokens(data);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    try {
      await this.http.post('/v1/auth/logout', { refreshToken });
    } catch {
      // local logout still proceeds
    }
  }

  async getMe() {
    const { data } = await this.http.get('/v1/me', { optional: true });
    return normalizeUser(data);
  }

  async addVehicle(vehicle: Vehicle) {
    await this.http.post(
      '/v1/me/vehicles',
      {
        plate: vehicle.plate,
        make: vehicle.make,
        model: vehicle.model,
      },
      { optional: true },
    );
    return this.getMe();
  }

  async updateVehicle(id: number, vehicle: Vehicle) {
    await this.http.put(
      `/v1/me/vehicles/${id}`,
      {
        plate: vehicle.plate,
        make: vehicle.make,
        model: vehicle.model,
      },
      { optional: true },
    );
    return this.getMe();
  }

  async deleteVehicle(id: number) {
    await this.http.delete(`/v1/me/vehicles/${id}`, { optional: true });
    return this.getMe();
  }

  async listMyVehicles() {
    const { data } = await this.http.get('/v1/me/vehicles', { optional: true });
    return unwrapList(data).map((item) => normalizeVehicle(item));
  }

  async findVehicleLocation(plate: string, from?: { x: number; y: number; floorId?: number }) {
    try {
      const { data } = await this.http.get('/parking/vehicle-location/find', {
        params: {
          plate,
          fromX: from?.x,
          fromY: from?.y,
          fromFloorId: from?.floorId,
        },
        optional: true,
      });
      return normalizeVehicleLocation(data);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 403) throw error;
      if (
        isEmptyBusinessError(error) ||
        isUnimplementedRoute(error) ||
        (error instanceof ApiError && error.statusCode === 404)
      ) {
        return {
          found: false,
          plate,
          isCurrent: false,
          message: error instanceof ApiError ? error.message : undefined,
        };
      }
      throw error;
    }
  }

  async listVehicleLocationHistory(vehicleId: number, take = 12) {
    try {
      const { data } = await this.http.get(`/parking/vehicle-location/${vehicleId}/history`, {
        params: { take },
        optional: true,
      });
      return unwrapList(data).map((item) => normalizeVehicleLocationPoint(item));
    } catch (error) {
      if (liveOrLocal(error) || isEmptyBusinessError(error)) return [];
      throw error;
    }
  }

  async listBuildings() {
    const { data } = await this.http.get('/v1/buildings', { params: { page: 1, pageSize: 50 } });
    return normalizeBuildings(data);
  }

  async getOccupancy(buildingId: number) {
    const { data } = await this.http.get(`/v1/buildings/${buildingId}/occupancy`);
    return normalizeOccupancy(data);
  }

  async getOccupancyDetails(buildingId: number) {
    const { data } = await this.http.get(`/v1/buildings/${buildingId}/occupancy/details`, {
      params: { page: 1, pageSize: 50 },
    });
    return normalizeOccupancyLots(data);
  }

  async getAllOccupancyDetails() {
    const byId = new Map<number, OccupancyLot>();
    const absorb = (lots: OccupancyLot[]) => {
      for (const lot of lots) {
        if (lot.parkingId > 0) byId.set(lot.parkingId, lot);
      }
    };

    try {
      const { data } = await this.http.get('/parking/occupancy', {
        params: { page: 1, pageSize: 200 },
      });
      absorb(normalizeOccupancyLots(data));
    } catch {
      /* fall through to per-building + parkings */
    }

    if (byId.size === 0) {
      const buildings = await this.listBuildings();
      const nested = await Promise.all(
        buildings.map((building) => this.getOccupancyDetails(building.id).catch(() => [] as OccupancyLot[])),
      );
      for (const lots of nested) absorb(lots);
    }

    try {
      const parkings = await this.listParkings();
      for (const parking of parkings) {
        if (parking.id <= 0 || byId.has(parking.id)) continue;
        const total = parking.totalPlaces ?? 0;
        const free = parking.emptyPlaces ?? 0;
        byId.set(parking.id, {
          parkingId: parking.id,
          name: parking.name,
          zoneId: parking.zoneId,
          free,
          occupied: Math.max(0, total - free),
          total,
        });
      }
    } catch {
      /* parkings list is optional enrichment */
    }

    return [...byId.values()];
  }

  async getCurrentSession() {
    try {
      const { data } = await this.http.get('/v1/parking/sessions/current', { optional: true });
      const session = normalizeSession(data);
      return session.sessionId ? session : null;
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === 'NO_CURRENT_SESSION' || error.statusCode === 404 || error.statusCode === 401)
      ) {
        return null;
      }
      throw error;
    }
  }

  async getSession(id: number) {
    const { data } = await this.http.get(`/v1/parking/sessions/${id}`, { optional: true });
    return normalizeSession(data);
  }

  async createPaymentIntent(params: {
    sessionId: number;
    amount: number;
    currency: string;
    idempotencyKey: string;
  }) {
    const { data } = await this.http.post(
      '/v1/payments/intents',
      {
        sessionId: params.sessionId,
        amount: params.amount,
        currency: params.currency,
      },
      { headers: { 'Idempotency-Key': params.idempotencyKey }, optional: true },
    );
    return normalizePayment(data);
  }

  async capturePayment(params: { intentId: number; idempotencyKey: string }) {
    const { data } = await this.http.post(
      `/v1/payments/intents/${params.intentId}/capture`,
      {},
      { headers: { 'Idempotency-Key': params.idempotencyKey }, optional: true },
    );
    return normalizePayment(data);
  }

  async createTicket(params: { type: SupportTicket['type']; note?: string }) {
    const { data } = await this.http.post('/v1/tickets', params, { optional: true });

    return normalizeTicket(data);
  }

  async getTickets() {
    const { data } = await this.http.get('/v1/tickets', { params: { page: 1, pageSize: 50 }, optional: true });
    return parseTickets(data).map((item) => normalizeTicket(item));
  }

  async triggerRealtimeDemo(buildingId: number) {
    await this.http.post('/v1/realtime/demo', {}, { params: { buildingId }, optional: true });
  }

  async listHistory() {
    try {
      const { data } = await this.http.get('/v1/parking/sessions', {
        params: { mine: true, page: 1, pageSize: 50 },
        optional: true,
      });
      const sessions = unwrapList(data)
        .map((item) => {
          const session = normalizeSession(item);
          const raw = item as Record<string, unknown>;
          return normalizeReceipt({
            ...raw,
            sessionId: session.sessionId,
            amount: session.amountDue ?? raw.amount ?? raw.amountPaid,
            paidAt: raw.paidAt ?? session.endedAt ?? session.startedAt,
            status: session.status,
            plate: session.plate ?? raw.plate,
            parkingName: session.parkingName,
          });
        })
        .filter((row) => {
          const status = String(row.status ?? '');
          return row.sessionId > 0 && (status === 'Paid' || status === 'Closed' || status === 'Captured');
        });
      if (sessions.length) return mergeReceipts(sessions);
      try {
        const payments = await this.http.get('/v1/payments', {
          params: { mine: true, page: 1, pageSize: 50 },
          optional: true,
        });
        const mine = mergeReceipts(normalizeReceipts(payments.data));
        if (mine.length) return mine;
      } catch {
        /* fall through to ops history */
      }
      return this.listOpsReceipts();
    } catch (error) {
      if (liveOrLocal(error)) return this.listOpsReceipts();
      throw error;
    }
  }

  async listLiveSessions() {
    try {
      const { data } = await this.http.get('/parking/sessions', {
        params: { page: 1, pageSize: 50 },
        optional: true,
      });
      return unwrapList(data)
        .map(normalizeSession)
        .filter((row) => row.sessionId > 0 && row.status !== 'Closed');
    } catch (error) {
      if (liveOrLocal(error) || isEmptyBusinessError(error)) return [];
      throw error;
    }
  }

  async endSession(sessionId: number) {
    const { data } = await this.http.post(`/parking/sessions/${sessionId}/end`, {}, { optional: true });
    return normalizeSession(data);
  }

  async listOpsReceipts() {
    try {
      const { data } = await this.http.get('/parking/sessions/history', {
        params: { page: 1, pageSize: 50 },
        optional: true,
      });
      const fromSessions = unwrapList(data)
        .map((item) => {
          const session = normalizeSession(item);
          const raw = (item ?? {}) as Record<string, unknown>;
          return normalizeReceipt({
            ...raw,
            sessionId: session.sessionId,
            amount: session.amountDue ?? raw.amount,
            paidAt: raw.paidAt ?? session.endedAt ?? session.startedAt,
            status: session.status,
            plate: session.plate,
            parkingName: session.parkingName,
          });
        })
        .filter((row) => row.sessionId > 0);
      const paid = fromSessions.filter((row) => {
        const status = String(row.status ?? '');
        return status === 'Paid' || status === 'Closed' || status === 'Captured';
      });
      if (paid.length) return mergeReceipts(paid);
      const payments = await this.http.get('/parking/payments', {
        params: { page: 1, pageSize: 50 },
        optional: true,
      });
      return mergeReceipts(
        unwrapList(payments.data).map((item) => {
          const raw = (item ?? {}) as Record<string, unknown>;
          return normalizeReceipt({
            ...raw,
            paidAt: raw.paidAt ?? raw.createdAt,
            status: 'Captured',
          });
        }),
      );
    } catch (error) {
      if (liveOrLocal(error) || isEmptyBusinessError(error)) return mergeReceipts([]);
      throw error;
    }
  }

  async listBundles() {
    try {
      const { data } = await this.http.get('/v1/parking/bundles', { optional: true });
      return normalizeBundles(data);
    } catch (error) {
      if (liveOrLocal(error)) return fallbackBundles;
      throw error;
    }
  }

  async getMySubscription() {
    let current: ReturnType<typeof normalizeSubscription> | null = null;
    try {
      const { data } = await this.http.get('/v1/parking/subscriptions/current', { optional: true });
      current = normalizeSubscription(data);
    } catch (error) {
      if (!(isEmptyBusinessError(error) || (error instanceof ApiError && error.statusCode === 404))) {
        if (!liveOrLocal(error)) throw error;
      }
    }
    try {
      const { data } = await this.http.get('/v1/me/subscription', { optional: true });
      return overlaySubscription(current, normalizeSubscription(data));
    } catch (error) {
      if (isEmptyBusinessError(error) || (error instanceof ApiError && error.statusCode === 404)) {
        return current;
      }
      if (liveOrLocal(error)) return current;
      throw error;
    }
  }

  async subscribe(params: { bundleId: number; plate?: string }) {
    try {
      const { data } = await this.http.post('/v1/parking/subscriptions', params, {
        optional: true,
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      });
      return normalizeSubscription(data);
    } catch (error) {
      if (!liveOrLocal(error)) throw error;
      const bundle = fallbackBundles.find((item) => item.id === params.bundleId) ?? fallbackBundles[0];
      const startsAt = new Date().toISOString();
      const ends = new Date();
      if (bundle.period === 'annual') ends.setFullYear(ends.getFullYear() + 1);
      else if (bundle.period === 'quarterly') ends.setMonth(ends.getMonth() + 3);
      else ends.setMonth(ends.getMonth() + 1);
      return fallbackSaveSubscription({
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
      });
    }
  }

  async renewSubscription(id: number) {
    try {
      const { data } = await this.http.post(
        `/v1/parking/subscriptions/${id}/renew`,
        {},
        { optional: true, headers: { 'Idempotency-Key': crypto.randomUUID() } },
      );
      return normalizeSubscription(data);
    } catch (error) {
      if (!liveOrLocal(error)) throw error;
      const current = fallbackSubscriptions().find((row) => row.id === id);
      if (!current) {
        throw new ApiError({ code: 'NOT_FOUND', message: 'Subscription not found', statusCode: 404 });
      }
      const ends = new Date(current.endsAt);
      ends.setMonth(ends.getMonth() + 1);
      return fallbackSaveSubscription({ ...current, status: 'Active', endsAt: ends.toISOString() });
    }
  }

  async listReservations() {
    try {
      const { data } = await this.http.get('/v1/parking/reservations', {
        params: { page: 1, pageSize: 50 },
        optional: true,
      });
      return normalizeReservations(data);
    } catch (error) {
      if (liveOrLocal(error)) return fallbackReservations();
      throw error;
    }
  }

  async createReservation(params: {
    buildingId: number;
    zoneId?: number;
    plate: string;
    startsAt: string;
    endsAt: string;
    guestName?: string;
    guestPhone?: string;
  }) {
    try {
      const { data } = await this.http.post('/v1/parking/reservations', params, {
        optional: true,
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      });
      return normalizeReservation(data);
    } catch (error) {
      if (!liveOrLocal(error)) throw error;
      return fallbackSaveReservation({
        id: nextLocalId(8000),
        buildingId: params.buildingId,
        zoneId: params.zoneId,
        plate: params.plate,
        startsAt: params.startsAt,
        endsAt: params.endsAt,
        status: 'Booked',
        guestName: params.guestName,
        guestPhone: params.guestPhone,
        inviteCode: `NRI-${nextLocalId(10)}`,
      });
    }
  }

  async cancelReservation(id: number) {
    try {
      await this.http.delete(`/v1/parking/reservations/${id}`, { optional: true });
    } catch (error) {
      if (!liveOrLocal(error)) throw error;
      fallbackRemoveReservation(id);
    }
  }

  async inviteReservationGuest(
    id: number,
    params: { guestName: string; guestPhone?: string; plate?: string },
  ) {
    try {
      const { data } = await this.http.post(`/v1/parking/reservations/${id}/invite`, params, { optional: true });
      return normalizeReservation(data);
    } catch (error) {
      if (!liveOrLocal(error)) throw error;
      const current = fallbackReservations().find((row) => row.id === id);
      if (!current) {
        throw new ApiError({ code: 'NOT_FOUND', message: 'Reservation not found', statusCode: 404 });
      }
      return fallbackSaveReservation({
        ...current,
        guestName: params.guestName,
        guestPhone: params.guestPhone,
        plate: params.plate || current.plate,
        inviteCode: current.inviteCode ?? `NRI-${nextLocalId(10)}`,
      });
    }
  }

  async searchPlate(plate: string) {
    try {
      const { data } = await this.http.get('/v1/admin/vehicles/search', { params: { plate }, optional: true });
      return unwrapList(data).map(normalizePlateHit);
    } catch (error) {
      if (liveOrLocal(error)) {
        return fallbackPlateSearch(plate);
      }
      throw error;
    }
  }

  async searchPlateBindings(plate: string) {
    try {
      const { data } = await this.http.get('/v1/admin/vehicles/bindings', { params: { plate }, optional: true });
      return unwrapList(data).map(normalizePlateBinding);
    } catch (error) {
      if (liveOrLocal(error)) return [];
      throw error;
    }
  }

  async unlinkVehicleBinding(vehicleId: number) {
    await this.http.delete(`/v1/admin/vehicles/${vehicleId}/binding`, { optional: true });
  }

  async getOccupancyReport() {
    try {
      const { data } = await this.http.get('/v1/admin/reports/occupancy', { optional: true });
      return normalizeReport(data);
    } catch (error) {
      if (!liveOrLocal(error)) throw error;
      try {
        const buildings = await this.listBuildings();
        const total = buildings.reduce((sum, item) => sum + item.totalPlaces, 0);
        const free = buildings.reduce((sum, item) => sum + item.emptyPlaces, 0);
        return {
          ...fallbackReport(),
          buildingCount: buildings.length,
          free,
          occupied: Math.max(0, total - free),
          total,
        };
      } catch {
        return fallbackReport();
      }
    }
  }

  async listAdminUsers() {
    try {
      const { data } = await this.http.get('/v1/admin/users', { params: { page: 1, pageSize: 50 }, optional: true });
      return unwrapList(data).map(normalizeAdminUser);
    } catch (error) {
      if (liveOrLocal(error)) {
        return fallbackUsers();
      }
      throw error;
    }
  }

  async listGraceViolations() {
    try {
      const { data } = await this.http.get('/v1/admin/parking/grace-violations', {
        params: { page: 1, pageSize: 50 },
        optional: true,
      });
      return unwrapList(data).map(normalizeGraceViolation);
    } catch (error) {
      if (liveOrLocal(error)) return fallbackGraceViolations();
      throw error;
    }
  }

  async lookupInvite(code: string) {
    const trimmed = code.trim();
    try {
      const { data } = await this.http.get(`/v1/parking/reservations/invite/${encodeURIComponent(trimmed)}`, {
        optional: true,
      });
      return normalizeReservation(data);
    } catch (error) {
      if (isEmptyBusinessError(error) && error instanceof ApiError && error.code === 'INVITE_NOT_FOUND') {
        return null;
      }
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      if (!liveOrLocal(error)) throw error;
      return fallbackInvite(trimmed);
    }
  }

  async listAdminTickets() {
    try {
      const { data } = await this.http.get('/v1/admin/tickets', {
        params: { page: 1, pageSize: 50 },
        optional: true,
      });
      return unwrapList(data).map(normalizeTicket);
    } catch (error) {
      if (liveOrLocal(error)) return fallbackAdminTickets();
      throw error;
    }
  }

  async getPass() {
    try {
      const { data } = await this.http.get('/v1/me/pass', { optional: true });
      return normalizeAccessPass(data);
    } catch (error) {
      if (isEmptyBusinessError(error) || (error instanceof ApiError && error.statusCode === 404)) {
        return null;
      }
      if (liveOrLocal(error)) return null;
      throw error;
    }
  }

  async listEvChargers(buildingId: number) {
    try {
      const { data } = await this.http.get(`/v1/buildings/${buildingId}/ev-chargers`, { optional: true });
      return normalizeEvChargers(data);
    } catch (error) {
      if (liveOrLocal(error)) return fallbackChargers();
      throw error;
    }
  }

  async createEvCharger(buildingId: number, body: import('./types').EvChargerWrite) {
    const { data } = await this.http.post(`/v1/buildings/${buildingId}/ev-chargers`, {
      label: body.label,
      free: body.free,
      total: body.total,
      status: body.status,
    });
    return normalizeEvCharger(unwrapData(data) ?? data);
  }

  async updateEvCharger(id: number, body: import('./types').EvChargerWrite) {
    const { data } = await this.http.put(`/v1/ev-chargers/${id}`, {
      label: body.label,
      free: body.free,
      total: body.total,
      status: body.status,
    });
    return normalizeEvCharger(unwrapData(data) ?? data);
  }

  async deleteEvCharger(id: number) {
    await this.http.delete(`/v1/ev-chargers/${id}`);
  }

  async listInvoices() {
    try {
      const { data } = await this.http.get('/v1/billing/invoices', { optional: true });
      return normalizeInvoices(data);
    } catch (error) {
      if (liveOrLocal(error)) return fallbackInvoices();
      throw error;
    }
  }

  async getSessionReceipt(sessionId: number) {
    try {
      const { data } = await this.http.get(`/v1/parking/sessions/${sessionId}/receipt`, { optional: true });
      return normalizeReceipt(data);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 403) throw error;
      if (isEmptyBusinessError(error) || (error instanceof ApiError && error.statusCode === 404)) {
        return mergeReceipts([]).find((row) => row.sessionId === sessionId) ?? null;
      }
      if (liveOrLocal(error)) {
        return mergeReceipts([]).find((row) => row.sessionId === sessionId) ?? null;
      }
      throw error;
    }
  }

  // ── Ops users ──
  async listManagedUsers() {
    const { data } = await this.http.get('/parking/users', { params: { page: 1, pageSize: 200 } });
    return unwrapList(data).map(normalizeManagedUser);
  }

  async createManagedUser(body: ManagedUserWrite) {
    const { data } = await this.http.post('/parking/users', body);
    return normalizeManagedUser(data);
  }

  async updateManagedUser(id: number, body: ManagedUserWrite) {
    const { data } = await this.http.put(`/parking/users/${id}`, body);
    return normalizeManagedUser(data);
  }

  async activateManagedUser(id: number) {
    await this.http.post(`/parking/users/${id}/activate`);
  }

  async deactivateManagedUser(id: number) {
    await this.http.post(`/parking/users/${id}/deactivate`);
  }

  async resetManagedUserPassword(id: number, newPassword: string) {
    await this.http.post(`/parking/users/${id}/reset-password`, { newPassword });
  }

  async assignManagedUserRole(id: number, roleId: number) {
    await this.http.post(`/parking/users/${id}/roles`, { roleId });
  }

  async listRoles() {
    const { data } = await this.http.get('/parking/roles', { params: { page: 1, pageSize: 200 } });
    return unwrapList(data).map(normalizeRole);
  }

  async createRole(name: string) {
    const { data } = await this.http.post('/parking/roles', { name, isActive: true });
    return normalizeRole(unwrapData(data) ?? data);
  }

  async listPermissions() {
    const { data } = await this.http.get('/parking/permissions', { params: { page: 1, pageSize: 200 } });
    return unwrapList(data).map(normalizePermission);
  }

  async createPermission(code: string) {
    const { data } = await this.http.post('/parking/permissions', {
      code,
      description: code,
      isActive: true,
    });
    return normalizePermission(unwrapData(data) ?? data);
  }

  // ── Cameras ──
  async listCameras() {
    console.log('API call: listCameras()');
    const { data } = await this.http.get('/parking/cameras', { params: { page: 1, pageSize: 200 } });
    console.log('API response: listCameras', data);
    const cameras = unwrapList(data).map(normalizeCamera);
    await this.hydrateCameraLocations(cameras);
    return cameras;
  }

  async getCamera(id: number) {
    const { data } = await this.http.get(`/parking/cameras/${id}`);
    const camera = normalizeCamera(unwrapData(data) ?? data);
    await this.hydrateCameraLocations([camera]);
    return camera;
  }

  async probeCamera(body: CameraProbeRequest) {
    const { data } = await this.http.post('/parking/cameras/probe', body);
    return normalizeProbe(data);
  }

  async createCamera(body: CameraWrite) {
    const { data } = await this.http.post('/parking/cameras', body);
    const saved = normalizeCamera(unwrapData(data) ?? data);
    return this.persistCameraLocation(saved, body);
  }

  async updateCamera(id: number, body: CameraWrite) {
    const { data } = await this.http.put(`/parking/cameras/${id}`, body);
    const saved = normalizeCamera(unwrapData(data) ?? data);
    return this.persistCameraLocation(saved, body);
  }

  private applyLocation(camera: CameraRow, loc: Record<string, unknown>) {
    const lat = Number(loc.latitude);
    const lng = Number(loc.longitude);
    if (Number.isFinite(lat)) camera.latitude = lat;
    if (Number.isFinite(lng)) camera.longitude = lng;
    const ix = Number(loc.indoorX);
    const iy = Number(loc.indoorY);
    const iz = Number(loc.indoorZ);
    if (Number.isFinite(ix)) camera.indoorX = ix;
    if (Number.isFinite(iy)) camera.indoorY = iy;
    if (Number.isFinite(iz)) camera.indoorZ = iz;
    const floor = Number(loc.floorId);
    if (Number.isFinite(floor)) camera.floorId = floor;
    return camera;
  }

  private hasGeo(body: {
    latitude?: number;
    longitude?: number;
    indoorX?: number;
    indoorY?: number;
    indoorZ?: number;
  }) {
    return (
      body.latitude != null ||
      body.longitude != null ||
      body.indoorX != null ||
      body.indoorY != null ||
      body.indoorZ != null
    );
  }

  private geoAlreadyOn(
    saved: { latitude?: number; longitude?: number; indoorX?: number },
    body: { latitude?: number; longitude?: number; indoorX?: number },
  ) {
    const same = (have?: number, want?: number) => {
      if (want == null) return true;
      if (have == null) return false;
      return Math.abs(have - want) < 1e-5;
    };
    return same(saved.latitude, body.latitude) && same(saved.longitude, body.longitude) && same(saved.indoorX, body.indoorX);
  }

  private async persistEntityLocation(

    entityType: string,
    entityId: number,
    body: {
      latitude?: number;
      longitude?: number;
      indoorX?: number;
      indoorY?: number;
      indoorZ?: number;
      floorId?: number;
    },
    saved: { latitude?: number; longitude?: number; indoorX?: number },
  ) {
    if (!this.hasGeo(body)) return saved;
    if (this.geoAlreadyOn(saved, body)) return saved;
    try {
      const { data } = await this.http.put('/parking/locations', {
        entityType,
        entityId,
        latitude: body.latitude,
        longitude: body.longitude,
        indoorX: body.indoorX,
        indoorY: body.indoorY,
        indoorZ: body.indoorZ,
        floorId: body.floorId,
        locationSource: 'Manual',
      });
      const loc = (unwrapData(data) ?? data) as Record<string, unknown>;
      if (loc && typeof loc === 'object') {
        if (Number.isFinite(Number(loc.latitude))) saved.latitude = Number(loc.latitude);
        if (Number.isFinite(Number(loc.longitude))) saved.longitude = Number(loc.longitude);
        if (Number.isFinite(Number(loc.indoorX))) saved.indoorX = Number(loc.indoorX);
      } else {
        if (body.latitude != null) saved.latitude = body.latitude;
        if (body.longitude != null) saved.longitude = body.longitude;
      }
      return saved;
    } catch (error) {
      console.warn('Location coordinates sync warning:', error);
      return saved;
    }
  }

  private async hydrateCameraLocations(cameras: CameraRow[]) {
    await Promise.all(
      cameras.map(async (camera) => {
        if (camera.latitude != null && camera.longitude != null) return;
        try {
          const { data } = await this.http.get(`/parking/locations/Camera/${camera.id}`);
          const loc = (unwrapData(data) ?? data) as Record<string, unknown>;
          if (loc && typeof loc === 'object') this.applyLocation(camera, loc);
        } catch {
          // 404 = no saved coordinates yet
        }
      }),
    );
  }

  private async persistCameraLocation(saved: CameraRow, body: CameraWrite) {
    await this.persistEntityLocation('Camera', saved.id, body, saved);
    if (body.latitude != null) saved.latitude = saved.latitude ?? body.latitude;
    if (body.longitude != null) saved.longitude = saved.longitude ?? body.longitude;
    if (body.indoorX != null) saved.indoorX = saved.indoorX ?? body.indoorX;
    if (body.indoorY != null) saved.indoorY = saved.indoorY ?? body.indoorY;
    return saved;
  }

  async deleteCamera(id: number) {
    try {
      await this.http.delete(`/parking/cameras/${id}`);
    } catch (error) {
      // Already removed on server — treat as success so the UI can refresh.
      if (error instanceof ApiError && error.statusCode === 404) return;
      throw error;
    }
  }

  async getCameraStatus(id: number) {
    const { data } = await this.http.get(`/parking/cameras/${id}/status`);
    return normalizeCameraStatus(data);
  }

  async getCameraSnapshot(id: number) {
    const { data } = await this.http.get(`/parking/cameras/${id}/snapshot`, { timeout: 12_000 });
    return normalizeCameraSnapshot(data);
  }

  async testCamera(id: number) {
    const { data } = await this.http.post(`/parking/cameras/${id}/test`);
    return normalizeCameraTest(data);
  }

  // ── Camera views (LPR grid) ──
  async listCameraViews() {
    const { data } = await this.http.get('/parking/views', { params: { page: 1, pageSize: 200 } });
    return unwrapList(data).map(normalizeCameraView);
  }

  async getCameraView(id: number) {
    const { data } = await this.http.get(`/parking/views/${id}`);
    return normalizeCameraView(unwrapData(data) ?? data);
  }

  async createCameraView(body: import('./opsTypes').CameraViewWrite) {
    const { data } = await this.http.post('/parking/views', body);
    return normalizeCameraView(unwrapData(data) ?? data);
  }

  async updateCameraView(id: number, body: import('./opsTypes').CameraViewWrite) {
    const { data } = await this.http.put(`/parking/views/${id}`, body);
    return normalizeCameraView(unwrapData(data) ?? data);
  }

  async deleteCameraView(id: number) {
    try {
      await this.http.delete(`/parking/views/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) return;
      throw error;
    }
  }

  // ── LPR ──
  async listLprLive(cameraId?: number, page = 1, pageSize = 20) {
    const { data } = await this.http.get('/parking/lpr/live', {
      params: { cameraId, page, pageSize },
    });
    const meta = pageMeta(data, page, pageSize);
    return {
      ...meta,
      items: meta.items.map(normalizeLprEvent),
    };
  }

  async listLprHistory(params: {
    cameraId?: number;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const { data } = await this.http.get('/parking/lpr/history', {
      params: {
        cameraId: params.cameraId,
        from: params.from,
        to: params.to,
        page,
        pageSize,
      },
    });
    const meta = pageMeta(data, page, pageSize);
    return {
      ...meta,
      items: meta.items.map(normalizeLprEvent),
    };
  }

  async listParkings(buildingId?: number) {
    const { data } = await this.http.get('/parking/parkings', {
      params: {
        page: 1,
        pageSize: 200,
        ...(buildingId && buildingId > 0 ? { areaId: buildingId } : {}),
      },
    });
    return unwrapList(data).map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      return {
        id: Number(item.id ?? item.parkingId ?? 0),
        name: String(item.name ?? item.parkingName ?? item.id ?? item.parkingId ?? ''),
        zoneId: item.zoneId == null ? undefined : Number(item.zoneId),
        emptyPlaces: item.emptyPlaces == null ? undefined : Number(item.emptyPlaces),
        totalPlaces:
          item.totalPlaces == null
            ? item.totalSpaces == null
              ? item.placesCount == null
                ? undefined
                : Number(item.placesCount)
              : Number(item.totalSpaces)
            : Number(item.totalPlaces),
        latitude: Number.isFinite(Number(item.latitude)) ? Number(item.latitude) : undefined,
        longitude: Number.isFinite(Number(item.longitude)) ? Number(item.longitude) : undefined,
      } satisfies ParkingLotRef;
    });
  }

  async listZones(areaId?: number) {
    const { data } = await this.http.get('/parking/zones', {
      params: {
        page: 1,
        pageSize: 200,
        ...(areaId && areaId > 0 ? { areaId } : {}),
      },
    });
    return unwrapList(data).map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      return {
        id: Number(item.id ?? 0),
        name: String(item.name ?? item.id ?? ''),
        areaId: item.areaId == null && item.AreaId == null ? undefined : Number(item.areaId ?? item.AreaId),
        parkingCount: item.parkingCount == null ? undefined : Number(item.parkingCount),
      } satisfies ParkingZoneRef;
    });
  }

  async createArea(body: { name: string; isActive?: boolean }) {
    const { data } = await this.http.post('/parking/areas', {
      name: body.name.trim(),
      isActive: body.isActive ?? true,
    });
    const item = unwrapData(data) as Record<string, unknown>;
    return {
      id: Number(item.id ?? 0),
      name: String(item.name ?? body.name),
    };
  }

  async updateArea(id: number, body: { name: string; isActive?: boolean }) {
    const { data } = await this.http.put(`/parking/areas/${id}`, {
      name: body.name.trim(),
      isActive: body.isActive ?? true,
    });
    const item = unwrapData(data) as Record<string, unknown>;
    return {
      id: Number(item.id ?? id),
      name: String(item.name ?? body.name),
    };
  }

  async deleteArea(id: number) {
    await this.http.delete(`/parking/areas/${id}`);
  }

  async createZone(body: { name: string; areaId: number; isActive?: boolean }) {
    const { data } = await this.http.post('/parking/zones', {
      name: body.name.trim(),
      areaId: body.areaId,
      isActive: body.isActive ?? true,
    });
    const item = unwrapData(data) as Record<string, unknown>;
    return {
      id: Number(item.id ?? 0),
      name: String(item.name ?? body.name),
      areaId: item.areaId == null ? body.areaId : Number(item.areaId),
      parkingCount: item.parkingCount == null ? undefined : Number(item.parkingCount),
    } satisfies ParkingZoneRef;
  }

  async updateZone(id: number, body: { name: string; areaId?: number; isActive?: boolean }) {
    const { data } = await this.http.put(`/parking/zones/${id}`, {
      name: body.name.trim(),
      areaId: body.areaId,
      isActive: body.isActive ?? true,
    });
    const item = unwrapData(data) as Record<string, unknown>;
    return {
      id: Number(item.id ?? id),
      name: String(item.name ?? body.name),
      areaId: item.areaId == null ? body.areaId : Number(item.areaId),
      parkingCount: item.parkingCount == null ? undefined : Number(item.parkingCount),
    } satisfies ParkingZoneRef;
  }

  async deleteZone(id: number) {
    await this.http.delete(`/parking/zones/${id}`);
  }

  async createParking(body: ParkingWrite) {
    const { data } = await this.http.post('/parking/parkings', {
      name: body.name.trim(),
      zoneId: body.zoneId,
      costPerHour: body.costPerHour,
      isActive: body.isActive ?? true,
      latitude: body.latitude,
      longitude: body.longitude,
    });
    const item = unwrapData(data) as Record<string, unknown>;
    const saved = {
      id: Number(item.id ?? 0),
      name: String(item.name ?? body.name),
      zoneId: item.zoneId == null ? body.zoneId : Number(item.zoneId),
      emptyPlaces: item.emptyPlaces == null ? undefined : Number(item.emptyPlaces),
      totalPlaces:
        item.totalPlaces == null
          ? item.placesCount == null
            ? undefined
            : Number(item.placesCount)
          : Number(item.totalPlaces),
      latitude: Number.isFinite(Number(item.latitude)) ? Number(item.latitude) : undefined,
      longitude: Number.isFinite(Number(item.longitude)) ? Number(item.longitude) : undefined,
    } satisfies ParkingLotRef;
    await this.persistEntityLocation('Parking', saved.id, body, saved);
    if (body.latitude != null) saved.latitude = saved.latitude ?? body.latitude;
    if (body.longitude != null) saved.longitude = saved.longitude ?? body.longitude;
    return saved;
  }

  async updateParking(id: number, body: ParkingWrite) {
    const { data } = await this.http.put(`/parking/parkings/${id}`, {
      name: body.name.trim(),
      zoneId: body.zoneId,
      costPerHour: body.costPerHour,
      isActive: body.isActive ?? true,
      latitude: body.latitude,
      longitude: body.longitude,
    });
    const item = unwrapData(data) as Record<string, unknown>;
    const saved = {
      id: Number(item.id ?? id),
      name: String(item.name ?? body.name),
      zoneId: item.zoneId == null ? body.zoneId : Number(item.zoneId),
      emptyPlaces: item.emptyPlaces == null ? undefined : Number(item.emptyPlaces),
      totalPlaces:
        item.totalPlaces == null
          ? item.placesCount == null
            ? undefined
            : Number(item.placesCount)
          : Number(item.totalPlaces),
      latitude: Number.isFinite(Number(item.latitude)) ? Number(item.latitude) : undefined,
      longitude: Number.isFinite(Number(item.longitude)) ? Number(item.longitude) : undefined,
    } satisfies ParkingLotRef;
    await this.persistEntityLocation('Parking', saved.id, body, saved);
    if (body.latitude != null) saved.latitude = saved.latitude ?? body.latitude;
    if (body.longitude != null) saved.longitude = saved.longitude ?? body.longitude;
    return saved;
  }

  async deleteParking(id: number) {
    await this.http.delete(`/parking/parkings/${id}`);
  }

  async listPlaces(parkingId: number) {
    const { data } = await this.http.get('/parking/places', {
      params: { parkingId, page: 1, pageSize: 500 },
    });
    return unwrapList(data).map((raw) => {
      const item = (raw ?? {}) as Record<string, unknown>;
      return {
        id: Number(item.id ?? 0),
        name: String(item.name ?? item.id ?? ''),
        parkingId: item.parkingId == null ? parkingId : Number(item.parkingId),
        isEmpty: item.isEmpty == null ? true : Boolean(item.isEmpty),
        occupancyStatus: item.occupancyStatus == null ? undefined : Number(item.occupancyStatus),
        indexNo: item.indexNo == null ? undefined : Number(item.indexNo),
        cellNo: item.cellNo == null ? undefined : Number(item.cellNo),
        carStatus: item.carStatus ? String(item.carStatus) : undefined,
        carDirection: item.carDirection ? String(item.carDirection) : undefined,
        latitude: Number.isFinite(Number(item.latitude)) ? Number(item.latitude) : undefined,
        longitude: Number.isFinite(Number(item.longitude)) ? Number(item.longitude) : undefined,
      } satisfies ParkingPlace;
    });
  }

  async createPlace(body: ParkingPlaceWrite) {
    const { data } = await this.http.post('/parking/places', body);
    const item = unwrapData(data) as Record<string, unknown>;
    const saved = {
      id: Number(item.id ?? 0),
      name: String(item.name ?? body.name),
      parkingId: item.parkingId == null ? body.parkingId : Number(item.parkingId),
      isEmpty: item.isEmpty == null ? body.isEmpty : Boolean(item.isEmpty),
      occupancyStatus: item.occupancyStatus == null ? undefined : Number(item.occupancyStatus),
      indexNo: item.indexNo == null ? undefined : Number(item.indexNo),
      cellNo: item.cellNo == null ? undefined : Number(item.cellNo),
      carStatus: item.carStatus ? String(item.carStatus) : undefined,
      carDirection: item.carDirection ? String(item.carDirection) : undefined,
      latitude: Number.isFinite(Number(item.latitude)) ? Number(item.latitude) : undefined,
      longitude: Number.isFinite(Number(item.longitude)) ? Number(item.longitude) : undefined,
    } satisfies ParkingPlace;
    await this.persistEntityLocation('Place', saved.id, body, saved);
    if (body.latitude != null) saved.latitude = saved.latitude ?? body.latitude;
    if (body.longitude != null) saved.longitude = saved.longitude ?? body.longitude;
    return saved;
  }

  async updatePlace(id: number, body: ParkingPlaceWrite) {
    const { data } = await this.http.put(`/parking/places/${id}`, body);
    const item = unwrapData(data) as Record<string, unknown>;
    const saved = {
      id: Number(item.id ?? id),
      name: String(item.name ?? body.name),
      parkingId: item.parkingId == null ? body.parkingId : Number(item.parkingId),
      isEmpty: item.isEmpty == null ? body.isEmpty : Boolean(item.isEmpty),
      occupancyStatus: item.occupancyStatus == null ? undefined : Number(item.occupancyStatus),
      indexNo: item.indexNo == null ? undefined : Number(item.indexNo),
      cellNo: item.cellNo == null ? undefined : Number(item.cellNo),
      carStatus: item.carStatus ? String(item.carStatus) : undefined,
      carDirection: item.carDirection ? String(item.carDirection) : undefined,
      latitude: Number.isFinite(Number(item.latitude)) ? Number(item.latitude) : undefined,
      longitude: Number.isFinite(Number(item.longitude)) ? Number(item.longitude) : undefined,
    } satisfies ParkingPlace;
    await this.persistEntityLocation('Place', saved.id, body, saved);
    if (body.latitude != null) saved.latitude = saved.latitude ?? body.latitude;
    if (body.longitude != null) saved.longitude = saved.longitude ?? body.longitude;
    return saved;
  }

  async deletePlace(id: number) {
    await this.http.delete(`/parking/places/${id}`);
  }

  async setPlaceOccupancy(placeId: number, isEmpty: boolean) {
    await this.http.put('/parking/places/occupancy', { placeId, isEmpty });
  }

  // ── Gate Simulator ──
  async simulateGateEntry(params: {
    plate: string;
    buildingId?: number;
    parkingId?: number;
    gateId?: string;
    placeId?: number;
    userId?: number;
  }) {
    const { data } = await this.http.post('/v1/gate/simulate-entry', params, { optional: true });
    return unwrapData(data) as {
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
    };
  }

  async simulateGateExit(params: {
    plate?: string;
    sessionId?: number;
    gateId?: string;
    force?: boolean;
  }) {
    const { data } = await this.http.post('/v1/gate/simulate-exit', params, { optional: true });
    return unwrapData(data) as {
      sessionId: number;
      plate: string;
      endedAt: string;
      status: string;
      totalAmount: number;
      barrierOpened: boolean;
      message: string;
    };
  }

  // ── Gates & Barriers ──
  async listGates(): Promise<GateRow[]> {
    try {
      const { data } = await this.http.get('/parking/gates');
      return unwrapList(data).map(normalizeGate);
    } catch (error) {
      console.warn('[Gates] Fallback on error:', error);
      return [];
    }
  }

  async getGate(id: number): Promise<GateRow> {
    const { data } = await this.http.get(`/parking/gates/${id}`);
    return normalizeGate(data);
  }

  async createGate(body: GateWrite): Promise<GateRow> {
    const { data } = await this.http.post('/parking/gates', body);
    return normalizeGate(data);
  }

  async updateGate(id: number, body: GateWrite): Promise<GateRow> {
    const { data } = await this.http.put(`/parking/gates/${id}`, body);
    return normalizeGate(data);
  }

  async deleteGate(id: number): Promise<void> {
    await this.http.delete(`/parking/gates/${id}`);
  }

  async listBarriers(): Promise<BarrierRow[]> {
    try {
      const { data } = await this.http.get('/parking/barriers');
      return unwrapList(data).map(normalizeBarrier);
    } catch (error) {
      console.warn('[Barriers] Fallback on error:', error);
      return [];
    }
  }

  async getBarrier(id: number): Promise<BarrierRow> {
    const { data } = await this.http.get(`/parking/barriers/${id}`);
    return normalizeBarrier(data);
  }

  async getBarrierStatus(id: number): Promise<BarrierStatusResult> {
    const { data } = await this.http.get(`/parking/barriers/${id}/status`);
    return normalizeBarrierStatus(data);
  }

  async createBarrier(body: BarrierWrite): Promise<BarrierRow> {
    const { data } = await this.http.post('/parking/barriers', body);
    return normalizeBarrier(data);
  }

  async updateBarrier(id: number, body: BarrierWrite): Promise<BarrierRow> {
    const { data } = await this.http.put(`/parking/barriers/${id}`, body);
    return normalizeBarrier(data);
  }

  async deleteBarrier(id: number): Promise<void> {
    await this.http.delete(`/parking/barriers/${id}`);
  }

  async openBarrier(id: number): Promise<void> {
    await this.http.post(`/parking/barriers/${id}/open`, {});
  }

  async closeBarrier(id: number): Promise<void> {
    await this.http.post(`/parking/barriers/${id}/close`, {});
  }

  async emergencyOpenBarrier(id: number): Promise<void> {
    await this.http.post(`/parking/barriers/${id}/emergency-open`, {});
  }

  async resetBarrier(id: number): Promise<void> {
    await this.http.post(`/parking/barriers/${id}/reset`, {});
  }

  async getOperationsCenterOverview(): Promise<import('./opsTypes').OperationsCenterOverview> {
    const raw = await this.http.get('/parking/operations-center/overview');
    return (unwrapData(raw) ?? raw) as import('./opsTypes').OperationsCenterOverview;
  }

  async executeManualBarrierCommand(id: number, body: import('./opsTypes').ManualBarrierCommandBody): Promise<import('./opsTypes').BarrierRow> {
    const raw = await this.http.post(`/parking/operations-center/barriers/${id}/manual-command`, body);
    return (unwrapData(raw) ?? raw) as import('./opsTypes').BarrierRow;
  }

  async listAlarms(params?: {
    status?: string;
    severity?: string;
    alarmType?: string;
    isIncident?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<import('./opsTypes').PagedResult<import('./opsTypes').AlarmDto>> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.severity) query.set('severity', params.severity);
      if (params?.alarmType) query.set('alarmType', params.alarmType);
      if (params?.isIncident !== undefined) query.set('isIncident', String(params.isIncident));
      if (params?.page) query.set('page', String(params.page));
      if (params?.pageSize) query.set('pageSize', String(params.pageSize));

      const qs = query.toString();
      const raw = await this.http.get(`/parking/alarms${qs ? `?${qs}` : ''}`);
      const data = (unwrapData(raw) ?? raw) as any;
      return {
        items: data?.items ?? (Array.isArray(data) ? data : []),
        page: data?.page ?? params?.page ?? 1,
        pageSize: data?.pageSize ?? params?.pageSize ?? 50,
        totalCount: data?.totalCount ?? (Array.isArray(data) ? data.length : 0),
      };
    } catch (error) {
      console.warn('[Alarms] Fallback on error:', error);
      return {
        items: [],
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 50,
        totalCount: 0,
      };
    }
  }

  async acknowledgeAlarm(id: number): Promise<import('./opsTypes').AlarmDto> {
    const raw = await this.http.post(`/parking/alarms/${id}/acknowledge`, {});
    return (unwrapData(raw) ?? raw) as import('./opsTypes').AlarmDto;
  }

  async assignAlarm(id: number, body: { assignedToUserId?: number; note?: string }): Promise<import('./opsTypes').AlarmDto> {
    const raw = await this.http.post(`/parking/alarms/${id}/assign`, body);
    return (unwrapData(raw) ?? raw) as import('./opsTypes').AlarmDto;
  }

  async resolveAlarm(id: number, body: { note?: string }): Promise<import('./opsTypes').AlarmDto> {
    const raw = await this.http.post(`/parking/alarms/${id}/resolve`, body);
    return (unwrapData(raw) ?? raw) as import('./opsTypes').AlarmDto;
  }

  async closeAlarm(id: number, body: { note?: string }): Promise<import('./opsTypes').AlarmDto> {
    const raw = await this.http.post(`/parking/alarms/${id}/close`, body);
    return (unwrapData(raw) ?? raw) as import('./opsTypes').AlarmDto;
  }

  async convertAlarmToIncident(id: number, body: { note?: string }): Promise<import('./opsTypes').AlarmDto> {
    const raw = await this.http.post(`/parking/alarms/${id}/convert-to-incident`, body);
    return (unwrapData(raw) ?? raw) as import('./opsTypes').AlarmDto;
  }
}


function unwrapData(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: unknown }).data;
  }
  return payload;
}
