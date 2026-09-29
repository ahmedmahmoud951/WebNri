import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/authContext';
import {
  applyLotUpdate,
  applyZoneUpdate,
  sameId,
  type Occupancy,
  type OccupancyLot,
  type ParkingSession,
  type TicketType,
  type Vehicle,
} from '../api/types';
import { saveReceipt } from '../parking/receipts';
import { useEffect } from 'react';

export const queryKeys = {
  me: ['me'] as const,
  buildings: ['buildings'] as const,
  occupancy: (buildingId: number) => ['occupancy', buildingId] as const,
  occupancyDetails: (buildingId: number) => ['occupancy-details', buildingId] as const,
  occupancyDetailsAll: ['occupancy-details-all'] as const,
  liveSessions: ['ops-sessions-live'] as const,
  session: ['session', 'current'] as const,
  tickets: ['tickets'] as const,
  history: ['history'] as const,
  receipt: (sessionId: number) => ['receipt', sessionId] as const,
  bundles: ['bundles'] as const,
  subscription: ['subscription'] as const,
  reservations: ['reservations'] as const,
  plates: (plate: string) => ['plates', plate] as const,
  plateBindings: (plate: string) => ['plate-bindings', plate] as const,
  report: ['admin-report'] as const,
  adminUsers: ['admin-users'] as const,
  grace: ['admin-grace'] as const,
  invite: (code: string) => ['invite', code] as const,
  adminTickets: ['admin-tickets'] as const,
  pass: ['pass'] as const,
  chargers: (buildingId: number) => ['ev-chargers', buildingId] as const,
  invoices: ['billing-invoices'] as const,
  myVehicles: ['me-vehicles'] as const,
  findCar: (plate: string) => ['find-car', plate] as const,
  findCarHistory: (vehicleId: number) => ['find-car-history', vehicleId] as const,
  gates: ['ops-gates'] as const,
  gate: (id: number) => ['ops-gates', id] as const,
  barriers: ['ops-barriers'] as const,
  barrier: (id: number) => ['ops-barriers', id] as const,
  barrierStatus: (id: number) => ['ops-barrier-status', id] as const,
  operationsCenter: ['ops-center-overview'] as const,
  alarms: (params?: unknown) => ['ops-alarms', params] as const,
};


export function useBuildings() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.buildings,
    queryFn: () => api.listBuildings(),
  });
}

export function useOccupancy(buildingId: number | null | undefined) {
  const { api, hub } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.occupancy(buildingId ?? 0),
    queryFn: () => api.getOccupancy(buildingId!),
    enabled: Boolean(buildingId),
  });

  useEffect(() => {
    if (!buildingId) return undefined;
    return hub.onOccupancyUpdated((event) => {
      if (!sameId(event.buildingId, buildingId)) return;
      queryClient.setQueryData<Occupancy>(queryKeys.occupancy(buildingId), (current) =>
        current ? applyZoneUpdate(current, event) : current,
      );
    });
  }, [buildingId, hub, queryClient]);

  return query;
}

export function useOccupancyDetails(
  buildingId: number | null | undefined,
  options?: { allLots?: boolean },
) {
  const { api, hub } = useAuth();
  const queryClient = useQueryClient();
  const allLots = Boolean(options?.allLots);
  const query = useQuery({
    queryKey: allLots ? queryKeys.occupancyDetailsAll : queryKeys.occupancyDetails(buildingId ?? 0),
    queryFn: () => (allLots ? api.getAllOccupancyDetails() : api.getOccupancyDetails(buildingId!)),
    enabled: allLots || Boolean(buildingId),
  });

  useEffect(() => {
    if (!allLots && !buildingId) return undefined;
    const key = allLots ? queryKeys.occupancyDetailsAll : queryKeys.occupancyDetails(buildingId!);
    return hub.onOccupancyUpdated((event) => {
      if (!allLots && event.buildingId && !sameId(event.buildingId, buildingId ?? undefined)) return;
      queryClient.setQueryData<OccupancyLot[]>(key, (current) =>
        current ? applyLotUpdate(current, event) : current,
      );
    });
  }, [allLots, buildingId, hub, queryClient]);

  return query;
}

export function useCurrentSession() {
  const { api, hub } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.session,
    queryFn: () => api.getCurrentSession(),
  });

  useEffect(() => {
    return hub.onSessionUpdated((event) => {
      queryClient.setQueryData<ParkingSession | null>(queryKeys.session, (current) => {
        if (event.status === 'Closed') {
          if (current && sameId(current.sessionId, event.sessionId)) return null;
          return current ?? null;
        }
        if (current && !sameId(current.sessionId, event.sessionId)) return current;
        return {
          sessionId: event.sessionId,
          status: event.status,
          buildingId: event.buildingId ?? current?.buildingId,
          plate: event.plate ?? current?.plate,
          gateId: event.gateId ?? current?.gateId,
          startedAt: current?.startedAt,
          graceUntil: event.graceUntil ?? current?.graceUntil ?? null,
          amountDue: event.amountDue ?? current?.amountDue,
          currency: event.currency ?? current?.currency,
        };
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.session });
    });
  }, [hub, queryClient]);

  return query;
}

export function useSession(id?: number) {
  const { api } = useAuth();
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => (id ? api.getSession(id) : null),
    enabled: Boolean(id && id > 0),
  });
}

export function useTickets() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.tickets,
    queryFn: () => api.getTickets(),
  });
}

export function useCreateTicket() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { type: TicketType; note?: string }) => api.createTicket(params),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets });
    },
  });
}


export function useSaveVehicle() {
  const { api, setUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicle: Vehicle) => api.addVehicle(vehicle),
    onSuccess: (user) => {
      setUser(user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.myVehicles });
    },
  });
}

export function useUpdateVehicle() {
  const { api, setUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: number; vehicle: Vehicle }) => api.updateVehicle(params.id, params.vehicle),
    onSuccess: (user) => {
      setUser(user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.myVehicles });
    },
  });
}

export function useDeleteVehicle() {
  const { api, setUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteVehicle(id),
    onSuccess: (user) => {
      setUser(user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.myVehicles });
    },
  });
}

export function useCapturePayment() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (session: ParkingSession) => {
      const key = crypto.randomUUID();
      const intent = await api.createPaymentIntent({
        sessionId: session.sessionId,
        amount: session.amountDue ?? 0,
        currency: session.currency ?? 'EGP',
        idempotencyKey: key,
      });
      return api.capturePayment({ intentId: intent.id, idempotencyKey: key });
    },
    onSuccess: (capture, session) => {
      saveReceipt({
        sessionId: session.sessionId,
        plate: session.plate,
        buildingId: session.buildingId,
        gateId: session.gateId,
        amount: capture.amount ?? session.amountDue ?? 0,
        currency: capture.currency ?? session.currency ?? 'EGP',
        paidAt: new Date().toISOString(),
        graceUntil: capture.graceUntil ?? session.graceUntil ?? null,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.session });
      void queryClient.invalidateQueries({ queryKey: queryKeys.liveSessions });
      void queryClient.invalidateQueries({ queryKey: queryKeys.history });
      void queryClient.invalidateQueries({ queryKey: queryKeys.pass });
      void queryClient.invalidateQueries({ queryKey: ['occupancy'] });
      void queryClient.invalidateQueries({ queryKey: ['occupancy-details'] });
    },
  });
}

export function useEndSession() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => api.endSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.session });
      void queryClient.invalidateQueries({ queryKey: queryKeys.liveSessions });
      void queryClient.invalidateQueries({ queryKey: queryKeys.history });
      void queryClient.invalidateQueries({ queryKey: ['occupancy'] });
      void queryClient.invalidateQueries({ queryKey: ['occupancy-details'] });
    },
  });
}

export function useHistory() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.history,
    queryFn: () => api.listHistory(),
  });
}

export function useLiveSessions(enabled: boolean) {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.liveSessions,
    queryFn: () => api.listLiveSessions(),
    enabled,
    refetchInterval: enabled ? 5000 : false,
  });
}

export function useBundles() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.bundles,
    queryFn: () => api.listBundles(),
  });
}

export function useMySubscription() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: () => api.getMySubscription(),
  });
}

export function useSubscribe() {
  const { api, user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bundleId: number) => api.subscribe({ bundleId, plate: user?.vehicles[0]?.plate }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
    },
  });
}

export function useRenewSubscription() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.renewSubscription(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
    },
  });
}

export function useReservations() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.reservations,
    queryFn: () => api.listReservations(),
  });
}

export function useCreateReservation() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      buildingId: number;
      zoneId?: number;
      plate: string;
      startsAt: string;
      endsAt: string;
      guestName?: string;
      guestPhone?: string;
    }) => api.createReservation(params),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservations });
    },
  });
}

export function useCancelReservation() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.cancelReservation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservations });
    },
  });
}

export function useInviteGuest() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: number; guestName: string; guestPhone?: string; plate?: string }) =>
      api.inviteReservationGuest(params.id, {
        guestName: params.guestName,
        guestPhone: params.guestPhone,
        plate: params.plate,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservations });
    },
  });
}

export function usePlateSearch(plate: string, enabled: boolean) {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.plates(plate),
    queryFn: () => api.searchPlate(plate),
    enabled,
  });
}

export function usePlateBindings(plate: string, enabled: boolean) {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.plateBindings(plate),
    queryFn: () => api.searchPlateBindings(plate),
    enabled,
  });
}

export function useUnlinkVehicleBinding() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vehicleId: number) => api.unlinkVehicleBinding(vehicleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['plate-bindings'] });
    },
  });
}

export function useOccupancyReport() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.report,
    queryFn: () => api.getOccupancyReport(),
  });
}

export function useAdminUsers() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: () => api.listAdminUsers(),
  });
}

export function useGraceViolations() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.grace,
    queryFn: () => api.listGraceViolations(),
  });
}

export function useInviteLookup(code: string, enabled: boolean) {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.invite(code),
    queryFn: () => api.lookupInvite(code),
    enabled,
    retry: false,
  });
}

export function useAdminTickets() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.adminTickets,
    queryFn: () => api.listAdminTickets(),
  });
}

export function usePass() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.pass,
    queryFn: () => api.getPass(),
  });
}

export function useEvChargers(buildingId: number | null | undefined) {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.chargers(buildingId ?? 0),
    queryFn: () => api.listEvChargers(buildingId!),
    enabled: Boolean(buildingId),
  });
}

export function useInvoices() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.invoices,
    queryFn: () => api.listInvoices(),
  });
}

export function useSessionReceipt(sessionId: number) {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.receipt(sessionId),
    queryFn: () => api.getSessionReceipt(sessionId),
    enabled: Number.isFinite(sessionId) && sessionId > 0,
    retry: false,
  });
}

export function useMyVehicles() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.myVehicles,
    queryFn: () => api.listMyVehicles(),
  });
}

export function useVehicleLocation(plate: string | undefined) {
  const { api, hub } = useAuth();
  const queryClient = useQueryClient();
  const normalized = (plate ?? '').trim();
  const query = useQuery({
    queryKey: queryKeys.findCar(normalized.toUpperCase()),
    queryFn: () => api.findVehicleLocation(normalized),
    enabled: normalized.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (!normalized) return undefined;
    const matches = (eventPlate: string) =>
      eventPlate.trim().toUpperCase() === normalized.toUpperCase();
    const offUpdated = hub.onVehicleLocationUpdated((event) => {
      if (!matches(event.plate)) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.findCar(normalized.toUpperCase()) });
    });
    const offCleared = hub.onVehicleLocationCleared((event) => {
      if (!matches(event.plate)) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.findCar(normalized.toUpperCase()) });
    });
    return () => {
      offUpdated();
      offCleared();
    };
  }, [hub, normalized, queryClient]);

  return query;
}

export function useVehicleLocationHistory(vehicleId: number | null | undefined) {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.findCarHistory(vehicleId ?? 0),
    queryFn: () => api.listVehicleLocationHistory(vehicleId!, 12),
    enabled: Boolean(vehicleId),
  });
}

// ── Gates Hooks ──
export function useGates() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.gates,
    queryFn: () => api.listGates(),
  });
}

export function useGate(id: number | null | undefined) {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.gate(id ?? 0),
    queryFn: () => api.getGate(id!),
    enabled: Boolean(id),
  });
}

export function useCreateGate() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: import('./opsTypes').GateWrite) => api.createGate(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gates });
    },
  });
}

export function useUpdateGate() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: import('./opsTypes').GateWrite }) => api.updateGate(id, body),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gates });
      void queryClient.invalidateQueries({ queryKey: queryKeys.gate(variables.id) });
    },
  });
}

export function useDeleteGate() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteGate(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gates });
    },
  });
}

// ── Barriers Hooks ──
export function useBarriers() {
  const { api, hub } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.barriers,
    queryFn: () => api.listBarriers(),
  });

  useEffect(() => {
    const off = hub.onBarrierOpened(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.barriers });
    });
    return () => {
      off();
    };
  }, [hub, queryClient]);

  return query;
}

export function useBarrier(id: number | null | undefined) {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.barrier(id ?? 0),
    queryFn: () => api.getBarrier(id!),
    enabled: Boolean(id),
  });
}

export function useBarrierStatus(id: number | null | undefined) {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.barrierStatus(id ?? 0),
    queryFn: () => api.getBarrierStatus(id!),
    enabled: Boolean(id),
    staleTime: 5000,
  });
}

export function useCreateBarrier() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: import('./opsTypes').BarrierWrite) => api.createBarrier(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.barriers });
    },
  });
}

export function useUpdateBarrier() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: import('./opsTypes').BarrierWrite }) => api.updateBarrier(id, body),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.barriers });
      void queryClient.invalidateQueries({ queryKey: queryKeys.barrier(variables.id) });
    },
  });
}

export function useDeleteBarrier() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteBarrier(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.barriers });
    },
  });
}

export function useOpenBarrier() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.openBarrier(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.barriers });
    },
  });
}

export function useCloseBarrier() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.closeBarrier(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.barriers });
    },
  });
}

export function useEmergencyOpenBarrier() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.emergencyOpenBarrier(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.barriers });
    },
  });
}

export function useResetBarrier() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.resetBarrier(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.barriers });
    },
  });
}

export function useOperationsCenterOverview() {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.operationsCenter,
    queryFn: () => api.getOperationsCenterOverview(),
    staleTime: 5000,
  });
}

export function useExecuteManualBarrierCommand() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: import('./opsTypes').ManualBarrierCommandBody }) =>
      api.executeManualBarrierCommand(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.operationsCenter });
      void queryClient.invalidateQueries({ queryKey: queryKeys.barriers });
    },
  });
}

export function useAlarms(params?: {
  status?: string;
  severity?: string;
  alarmType?: string;
  isIncident?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const { api } = useAuth();
  return useQuery({
    queryKey: queryKeys.alarms(params),
    queryFn: () => api.listAlarms(params),
    staleTime: 4000,
  });
}

export function useAcknowledgeAlarm() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.acknowledgeAlarm(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ops-alarms'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.operationsCenter });
    },
  });
}

export function useAssignAlarm() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: { assignedToUserId?: number; note?: string } }) =>
      api.assignAlarm(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ops-alarms'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.operationsCenter });
    },
  });
}

export function useResolveAlarm() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: { note?: string } }) => api.resolveAlarm(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ops-alarms'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.operationsCenter });
    },
  });
}

export function useCloseAlarm() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: { note?: string } }) => api.closeAlarm(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ops-alarms'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.operationsCenter });
    },
  });
}

export function useConvertAlarmToIncident() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: { note?: string } }) => api.convertAlarmToIncident(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ops-alarms'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.operationsCenter });
    },
  });
}


