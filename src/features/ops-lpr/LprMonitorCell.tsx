import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Dialog,
  LinearProgress,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import { useTranslation } from 'react-i18next';
import { LiveCameraFeed, cameraSnapshotUrl, isLanCameraOnCloudApi } from '../../app/LiveCameraFeed';
import { PlateText } from '../../app/PlateText';
import { brand } from '../../app/theme';
import { config } from '../../core/config';
import { useAuth } from '../../core/auth/authContext';
import type { CameraRow, LprEvent } from '../../core/api/opsTypes';
import { pickLprEvidenceSrc } from '../../core/media/lprImage';
import {
  buildDirectStreamCandidates,
  buildLanProxyFrameUrl,
  getCameraPreviewPassword,
  isContinuousDirectKind,
  lanProxyAvailable,
  resolvePreviewCredentials,
} from '../../core/camera/cameraDirectStream';

const electric = '#3ee8ff';
const gold = '#f5d08a';
const wellInk = '#070b10';

/** Visible FIFO window: newest in, oldest out. */
export const LPR_VISIBLE_CAP = 10;

export function newestPlates(events: LprEvent[], cap = LPR_VISIBLE_CAP): LprEvent[] {
  const byId = new Map<string, LprEvent>();
  for (const event of events) byId.set(String(event.id), event);
  return [...byId.values()]
    .sort((a, b) => +new Date(b.eventDateTime) - +new Date(a.eventDateTime))
    .slice(0, cap);
}

export function keepNewestPerCamera(events: LprEvent[], perCamera = LPR_VISIBLE_CAP): LprEvent[] {
  const byId = new Map<string, LprEvent>();
  for (const event of events) byId.set(String(event.id), event);
  const sorted = [...byId.values()].sort((a, b) => +new Date(b.eventDateTime) - +new Date(a.eventDateTime));
  const counts = new Map<number, number>();
  const out: LprEvent[] = [];
  for (const event of sorted) {
    const cam = event.cameraId ?? -1;
    const n = counts.get(cam) ?? 0;
    if (n >= perCamera) continue;
    counts.set(cam, n + 1);
    out.push(event);
  }
  return out;
}

export function plateLabel(event: LprEvent) {
  return event.plateNumber || [event.chars, event.number].filter(Boolean).join(' ') || '—';
}

export function eventTime(value: string) {
  if (!value) return '—';
  let str = String(value).trim();
  if (!str) return '—';
  if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
    str += 'Z';
  }
  const date = new Date(str);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function latestSceneFallback(camera: CameraRow, token: string | null, bust: number) {
  if (isLanCameraOnCloudApi(camera) && lanProxyAvailable()) {
    const password = getCameraPreviewPassword(camera.id);
    const candidates = buildDirectStreamCandidates(camera, password);
    const poll = candidates.find((c) => !isContinuousDirectKind(c.kind)) ?? candidates[0];
    if (poll) {
      const creds = resolvePreviewCredentials(camera, password);
      return buildLanProxyFrameUrl(poll, creds.user, creds.password, bust);
    }
  }
  return cameraSnapshotUrl(camera.id, token, bust);
}

function EgyptPlateFace({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <Box
      dir="ltr"
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        minHeight: compact ? 52 : 92,
        overflow: 'hidden',
        bgcolor: '#f4f1ea',
      }}
    >
      <Box
        sx={{
          width: compact ? 22 : 34,
          background: 'linear-gradient(180deg, #1d4ed8 0%, #1e3a8a 100%)',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: compact ? 8 : 10,
          fontWeight: 900,
          letterSpacing: '0.18em',
        }}
      >
        EGY
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          placeItems: 'center',
          px: 1,
          background: 'linear-gradient(180deg, #fffef8 0%, #efe6d6 100%)',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Sora", ui-monospace, Consolas, monospace',
            fontWeight: 800,
            fontSize: compact ? '1.05rem' : '1.55rem',
            letterSpacing: '0.12em',
            color: '#111827',
            lineHeight: 1,
            textAlign: 'center',
          }}
        >
          <PlateText>{text}</PlateText>
        </Typography>
      </Box>
    </Box>
  );
}

export function PlateCropFrame({
  event,
  size = 'hero',
  onOpen,
  sceneFallbackSrc,
}: {
  event: LprEvent;
  size?: 'hero' | 'card' | 'thumb';
  onOpen?: () => void;
  /** Live camera snapshot — hero only. Never overlay history thumbs. */
  sceneFallbackSrc?: string | null;
}) {
  const picked = pickLprEvidenceSrc(event.plateImagePath, event.imagePath, config.apiOrigin);
  const allowScene = size === 'hero' && Boolean(sceneFallbackSrc);
  const candidates = [picked?.src, allowScene ? sceneFallbackSrc : null].filter((value): value is string => Boolean(value));
  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(0);
  }, [event.id, picked?.src, sceneFallbackSrc, size]);
  const src = candidates[index] ?? null;
  const showImage = Boolean(src);
  const clickable = Boolean(showImage && onOpen);

  return (
    <Box
      component={clickable ? 'button' : 'div'}
      type={clickable ? 'button' : undefined}
      onClick={clickable ? onOpen : undefined}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: size === 'hero' ? '3.35 / 1' : '3.15 / 1',
        minHeight: size === 'hero' ? 112 : size === 'card' ? 76 : 64,
        p: 0,
        m: 0,
        border: 'none',
        cursor: clickable ? 'zoom-in' : 'default',
        color: 'inherit',
        textAlign: 'inherit',
        borderRadius: '12px',
        bgcolor: wellInk,
        boxShadow:
          size === 'hero'
            ? `0 0 0 1px ${alpha(gold, 0.5)}, 0 12px 28px ${alpha('#000', 0.4)}, inset 0 0 0 1px ${alpha('#fff', 0.06)}`
            : `0 0 0 1px ${alpha(gold, 0.22)}`,
        overflow: 'hidden',
        '&:focus-visible': { outline: `2px solid ${electric}`, outlineOffset: 2 },
      }}
    >
      {showImage ? (
        <Box
          component="img"
          src={src!}
          alt={plateLabel(event)}
          onError={() => setIndex((current) => current + 1)}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            display: 'block',
            imageRendering: 'auto',
            filter: 'contrast(1.08) saturate(1.04)',
            bgcolor: wellInk,
          }}
        />
      ) : (
        <EgyptPlateFace text={plateLabel(event)} compact={size !== 'hero'} />
      )}
      {size === 'hero' && showImage && (
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            insetInlineEnd: 6,
            width: 22,
            height: 22,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '8px',
            bgcolor: alpha('#041018', 0.55),
            color: '#fff',
            border: `1px solid ${alpha('#fff', 0.18)}`,
            pointerEvents: 'none',
          }}
        >
          <ZoomInOutlinedIcon sx={{ fontSize: 13 }} />
        </Box>
      )}
    </Box>
  );
}

function EvidenceDossier({
  event,
  camera,
  sceneFallbackSrc,
}: {
  event: LprEvent;
  camera: CameraRow;
  sceneFallbackSrc?: string | null;
}) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(false);
  const confidenceRaw = event.confidence ?? 0;
  const confidence = confidenceRaw <= 0 ? null : Math.round(confidenceRaw * (confidenceRaw <= 1 ? 100 : 1));
  const denied = event.authorized === false;
  const sealColor = denied ? brand.coral : brand.teal;
  const picked = pickLprEvidenceSrc(event.plateImagePath, event.imagePath, config.apiOrigin);
  const src = picked?.src ?? sceneFallbackSrc ?? null;
  const facts = [
    [t('opsLpr.dossierCamera'), event.cameraName || camera.name],
    [t('opsLpr.dossierDirection'), event.direction || '—'],
    [t('opsLpr.dossierVehicle'), [event.vehicleBrand, event.vehicleModel, event.vehicleColor].filter(Boolean).join(' · ') || event.vehicleType || '—'],
    [t('opsLpr.dossierTime'), eventTime(event.eventDateTime)],
  ];

  return (
    <Box sx={{ p: { xs: 1.4, sm: 1.8 }, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" sx={{ color: gold, fontWeight: 900, letterSpacing: '0.16em' }}>
          {t('opsLpr.evidenceDossier')}
        </Typography>
        <Chip
          icon={denied ? <GppBadOutlinedIcon /> : <GppGoodOutlinedIcon />}
          label={denied ? t('opsLpr.denied') : t('opsLpr.authorized')}
          size="small"
          sx={{
            color: sealColor,
            bgcolor: alpha(sealColor, 0.14),
            border: `1px solid ${alpha(sealColor, 0.52)}`,
            fontWeight: 900,
            '& .MuiChip-icon': { color: sealColor },
          }}
        />
      </Stack>

      <PlateCropFrame event={event} size="hero" sceneFallbackSrc={sceneFallbackSrc} onOpen={src ? () => setZoom(true) : undefined} />
      <Typography variant="caption" sx={{ color: gold, fontWeight: 800, letterSpacing: '0.08em' }}>
        {t('opsLpr.croppedPlate')}
      </Typography>

      <Box>
        <Typography
          sx={{
            fontFamily: '"Sora", ui-monospace, Consolas, monospace',
            fontWeight: 800,
            fontSize: { xs: '1.25rem', md: '1.55rem' },
            letterSpacing: '0.08em',
            color: gold,
            lineHeight: 1.05,
            textShadow: `0 0 22px ${alpha(gold, 0.28)}`,
          }}
        >
          <PlateText>{plateLabel(event)}</PlateText>
        </Typography>
        {confidence != null && (
          <>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.7 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={800}>
                {t('opsLpr.confidence')}
              </Typography>
              <Typography variant="caption" sx={{ color: confidence >= 80 ? brand.teal : gold, fontWeight: 950 }}>
                {confidence}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(confidence, 100))}
              sx={{
                mt: 0.5,
                height: 5,
                borderRadius: '99px',
                bgcolor: alpha('#fff', 0.08),
                '& .MuiLinearProgress-bar': { bgcolor: confidence >= 80 ? brand.teal : gold, borderRadius: '99px' },
              }}
            />
          </>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.8 }}>
        {facts.map(([label, value]) => (
          <Box
            key={label}
            sx={{
              px: 1,
              py: 0.85,
              borderRadius: '12px',
              bgcolor: alpha('#fff', 0.035),
              border: `1px solid ${alpha(gold, 0.12)}`,
              minWidth: 0,
            }}
          >
            <Typography variant="caption" sx={{ color: alpha('#cbd5e1', 0.58), display: 'block' }}>
              {label}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: '#e8f4fb', fontWeight: 800, display: 'block' }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Dialog
        open={zoom}
        onClose={() => setZoom(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#05080f',
            backgroundImage: 'none',
            border: `1px solid ${alpha(gold, 0.35)}`,
            p: 1.5,
          },
        }}
      >
        <Typography variant="caption" sx={{ color: gold, fontWeight: 900, letterSpacing: '0.12em', mb: 1, display: 'block' }}>
          {t('opsLpr.croppedPlate')} · <PlateText>{plateLabel(event)}</PlateText>
        </Typography>
        {src && (
          <Box
            component="img"
            src={src}
            alt={plateLabel(event)}
            sx={{
              width: '100%',
              maxHeight: '72vh',
              objectFit: 'contain',
              display: 'block',
              bgcolor: wellInk,
              borderRadius: '12px',
            }}
          />
        )}
      </Dialog>
    </Box>
  );
}

export function LprMonitorCell({
  camera,
  events,
  compact = false,
}: {
  camera: CameraRow | null;
  events: LprEvent[];
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const rail = useMemo(() => newestPlates(events, LPR_VISIBLE_CAP), [events]);
  const selected = rail[0];
  const online = (camera?.status ?? '').toLowerCase() === 'online';
  const latestMedia = useMemo(
    () =>
      rail
        .map((event) => pickLprEvidenceSrc(event.plateImagePath, event.imagePath, config.apiOrigin)?.src)
        .find(Boolean) ?? null,
    [rail],
  );
  const sceneFallbackSrc =
    camera && selected
      ? latestSceneFallback(camera, token, Number(selected.id) || Date.parse(selected.eventDateTime) || 1)
      : null;

  if (!camera) {
    return (
      <Box
        sx={{
          minHeight: compact ? 220 : 360,
          border: `1px dashed ${alpha(brand.muted, 0.35)}`,
          bgcolor: alpha('#020712', 0.7),
          display: 'grid',
          placeItems: 'center',
          borderRadius: '22px',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t('opsLpr.emptyCell')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: compact ? 260 : 420,
        overflow: 'hidden',
        borderRadius: '22px',
        border: `1px solid ${alpha(gold, 0.22)}`,
        bgcolor: '#060910',
        boxShadow: `0 22px 50px ${alpha('#000', 0.5)}, 0 0 40px ${alpha(electric, 0.08)}`,
        position: 'relative',
        '@keyframes lprScan': {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' },
        },
        '&:before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at 12% 0%, ${alpha(gold, 0.1)}, transparent 32%), linear-gradient(125deg, ${alpha(electric, 0.07)}, transparent 38%)`,
        },
      }}
    >
      <Box
        sx={{
          p: 1.35,
          borderBottom: `1px solid ${alpha(gold, 0.16)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '38%',
            height: 2,
            background: `linear-gradient(90deg, transparent, ${gold}, ${electric}, transparent)`,
            animation: 'lprScan 4.8s linear infinite',
            pointerEvents: 'none',
          },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
          <VideocamOutlinedIcon sx={{ color: electric, fontSize: 20 }} />
          <Typography fontWeight={900} noWrap>
            {camera.name}
          </Typography>
        </Stack>
        <Chip
          size="small"
          label={online ? t('opsLpr.statusActive') : t('opsLpr.statusOffline')}
          sx={{
            height: 24,
            fontWeight: 900,
            color: online ? brand.teal : brand.coral,
            bgcolor: alpha(online ? brand.teal : brand.coral, 0.12),
            border: `1px solid ${alpha(online ? brand.teal : brand.coral, 0.35)}`,
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: compact ? 'minmax(0, 1fr)' : 'minmax(0, 1.05fr) minmax(320px, 0.95fr)',
          },
          position: 'relative',
        }}
      >
        <Box sx={{ p: 1.25, minWidth: 0, borderInlineEnd: { lg: compact ? 'none' : `1px solid ${alpha(gold, 0.12)}` } }}>
          <Box
            sx={{
              position: 'relative',
              minHeight: compact ? 140 : 220,
              bgcolor: '#02050a',
              overflow: 'hidden',
              borderRadius: '16px',
              border: `1px solid ${alpha(electric, 0.16)}`,
            }}
          >
            <LiveCameraFeed camera={camera} fallbackSrc={latestMedia} height={compact ? 140 : 220} />
          </Box>
        </Box>
        {!compact &&
          (selected ? (
            <EvidenceDossier event={selected} camera={camera} sceneFallbackSrc={sceneFallbackSrc} />
          ) : (
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 300, p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t('opsLpr.waitingRecognition')}
              </Typography>
            </Box>
          ))}
      </Box>
    </Box>
  );
}
