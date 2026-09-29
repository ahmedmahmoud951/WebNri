import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../app/PageHeader';
import { Glyphs, IconTile } from '../../app/icons';
import { brand, glassPanel, glowPanel } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';
import { ApiError } from '../../core/api/errors';
import { queryKeys, useBuildings } from '../../core/api/hooks';
import { displaySiteName } from '../../core/display';

const QUICK_PLATES = ['بلد 475', 'VIS1001', 'CIT2001', 'MTI 1234', 'PARK-01'];

interface SimulationEntryResult {
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
}

export function GateSimulatorPage() {
  const { t } = useTranslation();
  const { api, user } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === 'admin' || user?.role === 'building-op';

  const [plate, setPlate] = useState('بلد 475');
  const [buildingId, setBuildingId] = useState<number>(1);
  const [gateId, setGateId] = useState('Gate-01 (In)');
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | ''>('');

  const [lastEntryResult, setLastEntryResult] = useState<SimulationEntryResult | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buildingsQ = useBuildings();
  const buildings = buildingsQ.data ?? [];

  const parkingsQ = useQuery({
    queryKey: ['ops-parkings', buildingId],
    queryFn: () => api.listParkings(buildingId),
    enabled: canManage,
  });
  const parkings = parkingsQ.data ?? [];
  const activeParkingId = parkings[0]?.id;

  const placesQ = useQuery({
    queryKey: ['ops-places', activeParkingId],
    queryFn: () => api.listPlaces(activeParkingId!),
    enabled: canManage && activeParkingId != null,
  });
  const availablePlaces = useMemo(
    () => (placesQ.data ?? []).filter((p) => p.isEmpty),
    [placesQ.data],
  );

  const liveSessionsQ = useQuery({
    queryKey: ['ops-live-sessions'],
    queryFn: () => api.listLiveSessions(),
    refetchInterval: 3000,
    enabled: canManage,
  });
  const activeSessions = liveSessionsQ.data ?? [];


  const fail = (err: unknown) => {
    if (err instanceof ApiError) {
      const base = err.message || t('common.error');
      setError(err.correlationId ? `${base} (${err.correlationId})` : base);
      return;
    }
    if (err instanceof Error && err.message) {
      setError(err.message);
      return;
    }
    setError(t('common.error'));
  };

  const invalidateAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['ops-live-sessions'] }),
      qc.invalidateQueries({ queryKey: ['ops-places'] }),
      qc.invalidateQueries({ queryKey: ['ops-parkings'] }),
      qc.invalidateQueries({ queryKey: queryKeys.occupancyDetailsAll }),
      qc.invalidateQueries({ queryKey: queryKeys.buildings }),
    ]);
  };

  const simulateEntry = useMutation({
    mutationFn: async () => {
      if (!plate.trim()) throw new Error(t('simulator.plateHint'));
      return api.simulateGateEntry({
        plate: plate.trim(),
        buildingId: buildingId || undefined,
        parkingId: activeParkingId || undefined,
        gateId,
        placeId: selectedPlaceId ? Number(selectedPlaceId) : undefined,
      });
    },
    onSuccess: async (data) => {
      setLastEntryResult(data);
      setMessage(t('simulator.entrySuccess', { id: data.sessionId }));
      setError(null);
      await invalidateAll();
    },
    onError: fail,
  });

  const simulateExit = useMutation({
    mutationFn: async (targetPlate?: string) => {
      const exitPlate = targetPlate || plate.trim();
      if (!exitPlate) throw new Error(t('simulator.plateHint'));
      return api.simulateGateExit({
        plate: exitPlate,
        gateId: 'Gate-02 (Out)',
        force: false,
      });

    },
    onSuccess: async (data) => {
      setMessage(t('simulator.exitSuccess', { id: data.sessionId }));
      setError(null);
      await invalidateAll();
    },
    onError: fail,
  });

  const isPending = simulateEntry.isPending || simulateExit.isPending;

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t('simulator.kicker')}
        title={t('simulator.title')}
        hint={t('simulator.hint')}
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button component={RouterLink} to="/find-car" variant="outlined">
              {t('nav.findCar')}
            </Button>
            <Button component={RouterLink} to="/admin/free-places" variant="outlined">
              {t('nav.freePlaces')}
            </Button>
            <Button component={RouterLink} to="/occupancy" variant="contained">
              {t('nav.occupancy')}
            </Button>
          </Stack>
        }
      />

      {message && (
        <Alert severity="success" onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ── Simulation Control Panel ── */}
      <Box
        sx={{
          ...glowPanel(brand.teal),
          p: 3,
          boxShadow: `0 0 0 1px ${alpha(brand.teal, 0.35)}, 0 0 32px ${alpha(brand.teal, 0.15)}, 0 20px 40px ${alpha('#000', 0.4)}`,
        }}
      >
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconTile tone="mint" size={44}>
              {Glyphs.car}
            </IconTile>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {t('simulator.entrySection')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('simulator.hint')}
              </Typography>
            </Box>
          </Stack>

          {/* Quick Select Plates */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              {t('simulator.quickPlates')}:
            </Typography>
            {QUICK_PLATES.map((qp) => (
              <Chip
                key={qp}
                label={qp}
                size="small"
                onClick={() => setPlate(qp)}
                color={plate === qp ? 'primary' : 'default'}
                sx={{ cursor: 'pointer', fontWeight: 800 }}
              />
            ))}
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' },
            }}
          >
            <TextField
              fullWidth
              label={t('simulator.plate')}
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder={t('simulator.plateHint')}
              disabled={isPending}
            />

            <FormControl fullWidth>
              <InputLabel>{t('simulator.building')}</InputLabel>
              <Select
                value={buildingId}
                label={t('simulator.building')}
                onChange={(e) => setBuildingId(Number(e.target.value))}
                disabled={isPending}
              >
                {buildings.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {displaySiteName(b.name) || b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('simulator.gate')}</InputLabel>
              <Select
                value={gateId}
                label={t('simulator.gate')}
                onChange={(e) => setGateId(String(e.target.value))}
                disabled={isPending}
              >
                <MenuItem value="Gate-01 (In)">Gate-01 (In)</MenuItem>
                <MenuItem value="Gate-02 (In/Out)">Gate-02 (In/Out)</MenuItem>
                <MenuItem value="Main Gate (LPR)">Main Gate (LPR)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('simulator.place')}</InputLabel>
              <Select
                value={selectedPlaceId}
                label={t('simulator.place')}
                onChange={(e) => setSelectedPlaceId(e.target.value as number | '')}
                disabled={isPending}
              >
                <MenuItem value="">{t('simulator.autoAssignPlace')}</MenuItem>
                {availablePlaces.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} (شاغر)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={isPending || !plate.trim()}
              onClick={() => simulateEntry.mutate()}
              sx={{ flex: 1, py: 1.25, fontWeight: 800 }}
            >
              {simulateEntry.isPending ? <CircularProgress size={24} /> : `🟢 ${t('simulator.simulateEntry')}`}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              disabled={isPending || !plate.trim()}
              onClick={() => simulateExit.mutate(undefined)}
              sx={{ flex: 1, py: 1.25, fontWeight: 800 }}
            >
              {simulateExit.isPending ? <CircularProgress size={24} /> : `🔴 ${t('simulator.simulateExit')}`}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ── Last Simulation Result Banner ── */}
      {lastEntryResult && (
        <Box
          sx={{
            ...glassPanel(),
            p: 2.5,
            border: `1px solid ${alpha(brand.teal, 0.4)}`,
            borderRadius: 3,
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={800} color={brand.teal}>
                ✓ تم بدء الجلسة #{lastEntryResult.sessionId} للوحة {lastEntryResult.plate}
              </Typography>
              <Chip size="small" color="success" label="الحاجز: مفتوح 🟢" />
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">المبنى / الموقف</Typography>
                <Typography fontWeight={700}>{lastEntryResult.buildingName || 'Building 1'} → {lastEntryResult.parkingName || 'Seed Parking'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">المكان المخصص (Slot)</Typography>
                <Typography fontWeight={800} color={brand.amber}>{lastEntryResult.placeName || 'A-005'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">المبلغ المستحق</Typography>
                <Typography fontWeight={800} color={brand.coral}>{lastEntryResult.amountDue} {lastEntryResult.currency}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">تتبع الخريطة</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  component={RouterLink}
                  to={`/find-car/${encodeURIComponent(lastEntryResult.plate)}`}
                  sx={{ mt: 0.5 }}
                >
                  📍 عرض على الخريطة
                </Button>
              </Box>
            </Box>
          </Stack>
        </Box>
      )}

      {/* ── Live Active Sessions Table ── */}
      <Box
        sx={{
          ...glassPanel(),
          p: 2.5,
          borderRadius: 3,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={800}>
              {t('simulator.liveSessions')} ({activeSessions.length})
            </Typography>
            <Chip size="small" color="primary" label={t('occupancy.live')} />
          </Stack>

          {activeSessions.length === 0 ? (
            <Typography color="text.secondary">{t('simulator.noActiveSessions')}</Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('simulator.sessionCol')}</TableCell>
                    <TableCell>{t('simulator.plateCol')}</TableCell>
                    <TableCell>{t('simulator.userCol')}</TableCell>
                    <TableCell>{t('simulator.locationCol')}</TableCell>
                    <TableCell>{t('simulator.statusCol')}</TableCell>
                    <TableCell>{t('simulator.amountCol')}</TableCell>
                    <TableCell>{t('simulator.startedCol')}</TableCell>
                    <TableCell align="right">{t('simulator.actionsCol')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeSessions.map((s) => (
                    <TableRow key={s.sessionId} hover>
                      <TableCell sx={{ fontWeight: 700 }}>#{s.sessionId}</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: brand.teal }}>{s.plate || '—'}</TableCell>
                      <TableCell>{s.buildingId ? `Building #${s.buildingId}` : 'visitor1'}</TableCell>
                      <TableCell>{s.placeName ? `${s.parkingName || ''} · ${s.placeName}` : s.parkingName || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={s.status}
                          color={s.status === 'Paid' ? 'success' : s.status === 'Open' ? 'warning' : 'default'}
                          sx={{ fontWeight: 700 }}
                        />


                      </TableCell>
                      <TableCell>{s.amountDue ?? 25} {s.currency || 'EGP'}</TableCell>
                      <TableCell>{s.startedAt ? new Date(s.startedAt).toLocaleTimeString() : '—'}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {s.plate && (
                            <Button
                              size="small"
                              variant="outlined"
                              component={RouterLink}
                              to={`/find-car/${encodeURIComponent(s.plate)}`}
                            >
                              📍 موقعها
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            disabled={isPending}
                            onClick={() => s.plate && simulateExit.mutate(s.plate)}
                          >
                            {t('simulator.exitBtn')}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
