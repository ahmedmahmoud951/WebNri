import { useEffect, useMemo, useState, type ReactElement } from 'react';
import {
  Alert,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { Glyphs, IconTile } from '../../app/icons';
import { brand, glassPanel } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';
import type { CameraRow, CameraViewRow, LprEvent } from '../../core/api/opsTypes';
import { normalizeLprEvent } from '../../core/api/opsNormalize';
import {
  LPR_VISIBLE_CAP,
  LprMonitorCell,
  keepNewestPerCamera,
  newestPlates,
} from './LprMonitorCell';

const VIEW_STORAGE_KEY = 'nri-lpr-active-view-id';
const electric = '#00b4ff';
const gold = '#f5d08a';

function cameraById(cameras: CameraRow[], id?: number | null) {
  if (id == null) return null;
  return cameras.find((c) => c.id === id) ?? null;
}

export function LprMonitorPage() {
  const { t } = useTranslation();
  const { api, hub } = useAuth();
  const [viewId, setViewId] = useState<number | null>(null);
  const [live, setLive] = useState<LprEvent[]>([]);

  const viewsQ = useQuery({
    queryKey: ['ops-camera-views'],
    queryFn: () => api.listCameraViews(),
  });

  const camerasQ = useQuery({
    queryKey: ['ops-cameras'],
    queryFn: () => api.listCameras(),
  });

  const activeViews = useMemo(
    () => (viewsQ.data ?? []).filter((v) => v.isActive),
    [viewsQ.data],
  );

  const selectedView: CameraViewRow | null =
    activeViews.find((v) => v.id === viewId) ?? activeViews[0] ?? null;

  useEffect(() => {
    if (viewId != null && activeViews.some((v) => v.id === viewId)) return;
    try {
      const stored = sessionStorage.getItem(VIEW_STORAGE_KEY);
      const parsed = stored ? Number(stored) : NaN;
      if (Number.isFinite(parsed) && activeViews.some((v) => v.id === parsed)) {
        setViewId(parsed);
        return;
      }
    } catch {
      /* ignore */
    }
    if (activeViews[0]) setViewId(activeViews[0].id);
  }, [activeViews, viewId]);

  useEffect(() => {
    if (viewId == null) return;
    try {
      sessionStorage.setItem(VIEW_STORAGE_KEY, String(viewId));
    } catch {
      /* ignore */
    }
  }, [viewId]);

  const cameraIdsInView = useMemo(() => {
    if (!selectedView) return [];
    return [...new Set(selectedView.slots.map((s) => s.cameraId))];
  }, [selectedView]);

  const liveQ = useQuery({
    queryKey: ['lpr-live-grid', cameraIdsInView.join(',')],
    queryFn: () => api.listLprLive(undefined, 1, Math.max(LPR_VISIBLE_CAP * 4, 40)),
    enabled: cameraIdsInView.length > 0,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (!liveQ.data?.items) return;
    setLive((prev) => keepNewestPerCamera([...liveQ.data.items, ...prev], LPR_VISIBLE_CAP));
  }, [liveQ.data]);

  useEffect(() => {
    return hub.onPlateRecognized((event) => {
      const row = normalizeLprEvent({
        id: event.eventId ?? crypto.randomUUID(),
        plateNumber: event.plate,
        cameraId: event.cameraId,
        cameraName: event.cameraName,
        direction: event.direction,
        eventDateTime: event.occurredAt,
        confidence: event.confidence,
        plateImagePath: event.plateImage,
        imagePath: event.vehicleImage,
        chars: event.plateChars,
        number: event.plateDigits,
        vehicleType: event.vehicleType,
        vehicleColor: event.vehicleColor,
        vehicleBrand: event.vehicleBrand,
        vehicleModel: event.vehicleModel,
        carSpeed: event.carSpeed,
        state: event.state,
        isSpeeding: event.isSpeeding,
        speedLimit: event.speedLimit,
        authorized: event.authorized,
        reason: event.reason,
      });
      if (row.cameraId != null && cameraIdsInView.length > 0 && !cameraIdsInView.includes(row.cameraId)) {
        return;
      }
      setLive((prev) => keepNewestPerCamera([...prev, row], LPR_VISIBLE_CAP));
    });
  }, [hub, cameraIdsInView]);

  const eventsByCamera = useMemo(() => {
    const map = new Map<number, LprEvent[]>();
    const ordered = [...live].sort((a, b) => +new Date(b.eventDateTime) - +new Date(a.eventDateTime));
    for (const ev of ordered) {
      if (ev.cameraId == null) continue;
      const list = map.get(ev.cameraId) ?? [];
      if (list.length >= LPR_VISIBLE_CAP) continue;
      list.push(ev);
      map.set(ev.cameraId, list);
    }
    return map;
  }, [live]);

  const cameras = camerasQ.data ?? [];
  const compact = (selectedView?.rowCount ?? 1) * (selectedView?.columnCount ?? 1) > 2;
  const viewCameras = cameras.filter((camera) => cameraIdsInView.includes(camera.id));
  const onlineCount = viewCameras.filter((camera) => camera.status?.toLowerCase() === 'online').length;
  const history = newestPlates(live, LPR_VISIBLE_CAP);

  return (
    <Stack spacing={2}>
      <PageHeader
        eyebrow={t('nav.groupOps')}
        title={t('opsLpr.title')}
        hint={t('opsLpr.gridHint')}
        actions={
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label={t('opsLpr.operationalActive')}
              sx={{
                fontWeight: 800,
                bgcolor: alpha(brand.teal, 0.18),
                color: brand.teal,
                border: `1px solid ${alpha(brand.teal, 0.4)}`,
              }}
            />
            <IconTile tone="coral" size={48} label={t('opsLpr.title')} showLabel>
              {Glyphs.car}
            </IconTile>
          </Stack>
        }
      />

      <Box
        sx={{
          ...glassPanel(),
          p: { xs: 1.35, md: 1.9 },
          borderRadius: '20px',
          border: `1px solid ${alpha(gold, 0.28)}`,
          background: `
            radial-gradient(circle at 8% 0%, ${alpha(gold, 0.16)}, transparent 30%),
            radial-gradient(circle at 92% 0%, ${alpha(electric, 0.16)}, transparent 32%),
            linear-gradient(135deg, ${alpha('#070d18', 0.98)}, ${alpha('#0a1220', 0.94)})
          `,
          boxShadow: `0 0 0 1px ${alpha(gold, 0.08)}, 0 22px 48px ${alpha('#000', 0.42)}`,
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ lg: 'center' }} justifyContent="space-between">
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>{t('opsLpr.selectView')}</InputLabel>
            <Select
              label={t('opsLpr.selectView')}
              value={selectedView?.id ?? ''}
              onChange={(e) => setViewId(Number(e.target.value))}
              disabled={activeViews.length === 0}
            >
              {activeViews.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.name} ({v.rowCount}×{v.columnCount})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedView && <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ me: 1 }}>
              {t('opsLpr.viewLayout', {
                name: selectedView.name,
                rows: selectedView.rowCount,
                cols: selectedView.columnCount,
              })}
            </Typography>
            {[
              [<VideocamOutlinedIcon fontSize="small" />, t('opsLpr.camerasLive', { count: viewCameras.length })],
              [<SensorsOutlinedIcon fontSize="small" />, t('opsLpr.camerasHealthy', { online: onlineCount, total: viewCameras.length })],
              [<BoltOutlinedIcon fontSize="small" />, t('opsLpr.liveEvents', { count: history.length })],
            ].map(([icon, label], index) => <Chip key={index} icon={icon as ReactElement} label={label as string} size="small" sx={{ bgcolor: alpha(index === 1 ? brand.teal : electric, 0.1), color: index === 1 ? brand.teal : '#bfefff', border: `1px solid ${alpha(index === 1 ? brand.teal : electric, 0.25)}`, fontWeight: 800, '& .MuiChip-icon': { color: 'inherit' } }} />)}
          </Stack>}
        </Stack>
      </Box>

      <AsyncBody
        isLoading={viewsQ.isLoading || camerasQ.isLoading}
        error={viewsQ.error ?? camerasQ.error}
        onRetry={() => {
          void viewsQ.refetch();
          void camerasQ.refetch();
        }}
        isEmpty={!selectedView}
        empty={
          <Stack spacing={2} alignItems="center" sx={{ py: 5 }}>
            <IconTile tone="sky" size={64}>
              {Glyphs.grid}
            </IconTile>
            <Typography color="text.secondary" textAlign="center" maxWidth={420}>
              {t('opsLpr.noViewConfigured')}
            </Typography>
            <Typography
              component={RouterLink}
              to="/admin/views"
              variant="body2"
              sx={{ color: electric, fontWeight: 700, textDecoration: 'none' }}
            >
              {t('opsLpr.createViewLink')} →
            </Typography>
          </Stack>
        }
      >
        {selectedView && (
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                lg: `repeat(${Math.min(selectedView.columnCount, 2)}, minmax(0, 1fr))`,
                xl: `repeat(${selectedView.columnCount}, minmax(0, 1fr))`,
              },
              gridTemplateRows: `repeat(${selectedView.rowCount}, minmax(${compact ? 180 : 260}px, auto))`,
            }}
          >
            {Array.from({ length: selectedView.rowCount * selectedView.columnCount }).map((_, i) => {
              const r = Math.floor(i / selectedView.columnCount);
              const c = i % selectedView.columnCount;
              const slot = selectedView.slots.find((s) => s.rowIndex === r && s.columnIndex === c);
              const camera = cameraById(cameras, slot?.cameraId);
              const cellEvents = slot ? eventsByCamera.get(slot.cameraId) ?? [] : [];
              return (
                <LprMonitorCell
                  key={`${selectedView.id}-${r}-${c}`}
                  camera={camera}
                  events={cellEvents}
                  compact={compact}
                />
              );
            })}
          </Box>
        )}
      </AsyncBody>

      <Alert severity="info" sx={{ ...glassPanel(), borderRadius: '12px' }}>
        {t('opsLpr.hybridNote')}
      </Alert>
    </Stack>
  );
}
