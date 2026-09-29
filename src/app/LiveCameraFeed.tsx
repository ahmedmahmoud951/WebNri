import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { brand } from './theme';
import { Glyphs, IconTile } from './icons';
import { config } from '../core/config';
import { useAuth } from '../core/auth/authContext';
import type { CameraRow } from '../core/api/opsTypes';
import {
  buildDirectStreamCandidates,
  buildLanProxyFrameUrl,
  getCameraPreviewPassword,
  isContinuousDirectKind,
  lanProxyAvailable,
  resolvePreviewCredentials,
  setCameraPreviewPassword,
} from '../core/camera/cameraDirectStream';

type FeedMode = 'mjpeg' | 'poll' | 'direct-mjpeg' | 'direct-poll' | 'lpr' | 'empty';

function apiRoot() {
  return config.apiOrigin.replace(/\/$/, '');
}

/** DEV → /api proxy (logs in VS Code terminal). PROD → direct API host. */
function cameraApiBase() {
  if (import.meta.env.DEV) {
    return `${config.apiBase}/parking/cameras`;
  }
  return `${apiRoot()}/api/parking/cameras`;
}

function liveMjpegUrl(cameraId: number, token: string | null) {
  const q = new URLSearchParams({ fps: '5' });
  if (token) q.set('access_token', token);
  return `${cameraApiBase()}/${cameraId}/live.mjpeg?${q}`;
}

export function cameraSnapshotUrl(cameraId: number, token: string | null, bust: number) {
  const q = new URLSearchParams({ _: String(bust) });
  if (token) q.set('access_token', token);
  return `${cameraApiBase()}/${cameraId}/snapshot.jpg?${q}`;
}

export function looksLikeLanOnly(camera: CameraRow | null): boolean {
  if (!camera) return false;
  const urls = [camera.snapshotUrl, camera.rtspUrl, camera.ip, camera.streamUrl].filter(Boolean).join(' ');
  return /(?:^|[^\d])(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(urls)
    || /localhost|127\.0\.0\.1/i.test(urls);
}

/** Cloud-hosted API cannot pull frames from private LAN cameras. */
export function isRemoteApiHost(): boolean {
  const origin = apiRoot().toLowerCase();
  return !origin.includes('localhost') && !origin.includes('127.0.0.1') && !origin.includes('192.168.');
}

/** API host cannot reach the camera — browser may still load it on the same LAN. */
export function isLanCameraOnCloudApi(camera: CameraRow | null): boolean {
  return Boolean(camera && isRemoteApiHost() && looksLikeLanOnly(camera));
}

export function LiveCameraFeed({
  camera,
  fallbackSrc,
  height = 360,
}: {
  camera: CameraRow | null;
  /** LPR plate/vehicle image used when live stream is unavailable */
  fallbackSrc?: string | null;
  height?: number;
}) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [mode, setMode] = useState<FeedMode>('empty');
  const [message, setMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [pollBust, setPollBust] = useState(0);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [pwInput, setPwInput] = useState('');
  const [showPwPrompt, setShowPwPrompt] = useState(false);
  const streamLoadedRef = useRef(false);

  const useDirectLan = isLanCameraOnCloudApi(camera);
  const previewPassword = camera ? getCameraPreviewPassword(camera.id) : null;

  const directCandidates = useMemo(() => {
    if (!camera || !useDirectLan) return [];
    return buildDirectStreamCandidates(camera, previewPassword);
  }, [camera, useDirectLan, previewPassword, tick]);

  const mjpegSrc = useMemo(
    () => (camera && !useDirectLan ? liveMjpegUrl(camera.id, token) : null),
    [camera, token, tick, useDirectLan],
  );

  const jpgSrc = useMemo(
    () => (camera && !useDirectLan ? cameraSnapshotUrl(camera.id, token, pollBust) : null),
    [camera, token, pollBust, useDirectLan],
  );

  const directCandidate = directCandidates[candidateIdx] ?? null;

  const directStreamSrc = useMemo(() => {
    if ((mode !== 'direct-mjpeg' && mode !== 'direct-poll') || !directCandidate || !camera) return null;
    const creds = resolvePreviewCredentials(camera, previewPassword);
    if (!lanProxyAvailable()) return null;
    return buildLanProxyFrameUrl(
      directCandidate,
      creds.user,
      creds.password,
      mode === 'direct-poll' ? pollBust : undefined,
    );
  }, [mode, directCandidate, camera, previewPassword, pollBust]);

  const tryNextDirectCandidate = useCallback(() => {
    const next = candidateIdx + 1;
    if (next < directCandidates.length) {
      setCandidateIdx(next);
      const kind = directCandidates[next]?.kind;
      setMode(isContinuousDirectKind(kind!) ? 'direct-mjpeg' : 'direct-poll');
      return true;
    }
    return false;
  }, [candidateIdx, directCandidates]);

  useEffect(() => {
    streamLoadedRef.current = false;
    setCandidateIdx(0);
    setShowPwPrompt(false);

    if (!camera) {
      setMode('empty');
      setMessage(null);
      return;
    }

    if (useDirectLan) {
      if (!lanProxyAvailable()) {
        setMode('empty');
        setMessage(t('opsLpr.directLanDevOnly'));
        return;
      }

      const needsPassword =
        !previewPassword &&
        !camera.snapshotUrl?.includes('@') &&
        (camera.hasPassword || Boolean(camera.userName));

      if (needsPassword && directCandidates.length === 0) {
        setShowPwPrompt(true);
        setMode('empty');
        setMessage(t('opsLpr.directLanPasswordHint'));
        return;
      }

      const liveIdx = directCandidates.findIndex((c) => isContinuousDirectKind(c.kind));
      const startIdx = liveIdx >= 0 ? liveIdx : directCandidates.length > 0 ? 0 : -1;

      if (startIdx >= 0) {
        const kind = directCandidates[startIdx]?.kind;
        setCandidateIdx(startIdx);
        setMode(isContinuousDirectKind(kind!) ? 'direct-mjpeg' : 'direct-poll');
        setMessage(t('opsLpr.directLanHint'));
      } else if (needsPassword) {
        setShowPwPrompt(true);
        setMode('empty');
        setMessage(t('opsLpr.directLanPasswordHint'));
      } else if (fallbackSrc) {
        setMode('lpr');
        setMessage(t('opsLpr.usingLprFallback'));
      } else {
        setMode('empty');
        setMessage(t('opsLpr.directLanFailed'));
      }
      return;
    }

    setMode('mjpeg');
    setMessage(null);

    const hangTimer = window.setTimeout(() => {
      if (streamLoadedRef.current) return;
      if (fallbackSrc) {
        setMode('lpr');
        setMessage(t('opsLpr.usingLprFallback'));
      } else {
        setMode('empty');
        setMessage(t('opsLpr.snapshotUnavailable'));
      }
    }, 8000);

    return () => window.clearTimeout(hangTimer);
  }, [camera, fallbackSrc, t, tick, useDirectLan, directCandidates, previewPassword]);

  useEffect(() => {
    if (mode !== 'direct-mjpeg' && mode !== 'direct-poll') return;
    streamLoadedRef.current = false;

    const hangTimer = window.setTimeout(() => {
      if (streamLoadedRef.current) return;
      if (mode === 'direct-mjpeg' || mode === 'direct-poll') {
        if (tryNextDirectCandidate()) return;
        setMode(fallbackSrc ? 'lpr' : 'empty');
        setMessage(
          fallbackSrc ? t('opsLpr.usingLprFallback') : t('opsLpr.directLanFailed'),
        );
      }
    }, 6000);

    return () => window.clearTimeout(hangTimer);
  }, [mode, candidateIdx, directStreamSrc, fallbackSrc, t, tryNextDirectCandidate]);

  useEffect(() => {
    if (!camera) return;
    const polling = mode === 'poll' || mode === 'direct-poll';
    if (!polling) return;
    setPollBust(Date.now());
    const timer = window.setInterval(() => setPollBust(Date.now()), 800);
    return () => window.clearInterval(timer);
  }, [camera, mode, tick, candidateIdx]);

  const displaySrc =
    mode === 'mjpeg' && mjpegSrc
      ? mjpegSrc
      : mode === 'poll' && jpgSrc
        ? jpgSrc
        : (mode === 'direct-mjpeg' || mode === 'direct-poll') && directStreamSrc
          ? directStreamSrc
          : mode === 'lpr'
            ? fallbackSrc ?? null
            : null;

  const badge =
    mode === 'mjpeg' || mode === 'direct-mjpeg'
      ? t('opsLpr.badgeLive')
      : mode === 'poll' || mode === 'direct-poll'
        ? mode === 'direct-poll'
          ? t('opsLpr.badgeDirectLan')
          : t('opsLpr.badgePoll')
        : mode === 'lpr'
          ? t('opsLpr.badgeLpr')
          : t('opsLpr.badgeOffline');

  const badgeColor =
    mode === 'mjpeg' || mode === 'direct-mjpeg'
      ? brand.teal
      : mode === 'poll' || mode === 'direct-poll'
        ? mode === 'direct-poll'
          ? brand.tealDeep
          : brand.amber
        : mode === 'lpr'
          ? brand.violet
          : brand.coral;

  const applyPassword = () => {
    if (!camera || !pwInput.trim()) return;
    setCameraPreviewPassword(camera.id, pwInput.trim());
    setPwInput('');
    setShowPwPrompt(false);
    setTick((n) => n + 1);
  };

  return (
    <Box
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        minHeight: height,
        display: 'grid',
        placeItems: 'center',
        bgcolor: alpha('#000', 0.55),
        border: `1px solid ${alpha('#fff', 0.1)}`,
        boxShadow: `inset 0 0 60px ${alpha(brand.coral, 0.08)}, 0 0 28px ${alpha(brand.coral, 0.12)}`,
        position: 'relative',
      }}
    >
      {displaySrc ? (
        <Box
          component="img"
          key={
            mode === 'mjpeg'
              ? `${mjpegSrc}-${tick}`
              : mode === 'poll'
                ? jpgSrc ?? 'jpg'
                : mode === 'direct-mjpeg'
                  ? `direct-mjpeg-${candidateIdx}-${tick}`
                  : mode === 'direct-poll'
                    ? `direct-poll-${candidateIdx}-${pollBust}`
                    : 'lpr'
          }
          src={displaySrc}
          alt={camera?.name ?? 'camera'}
          onLoad={() => {
            streamLoadedRef.current = true;
            if (mode === 'direct-poll' || mode === 'direct-mjpeg') setMessage(null);
          }}
          onError={() => {
            if (mode === 'direct-mjpeg' || mode === 'direct-poll') {
              if (tryNextDirectCandidate()) return;
              if (!previewPassword && camera?.hasPassword) {
                setShowPwPrompt(true);
              }
              setMode(fallbackSrc ? 'lpr' : 'empty');
              setMessage(
                fallbackSrc ? t('opsLpr.usingLprFallback') : t('opsLpr.directLanFailed'),
              );
              return;
            }
            if (mode === 'mjpeg') {
              setMode(fallbackSrc ? 'lpr' : 'poll');
              if (fallbackSrc) setMessage(t('opsLpr.usingLprFallback'));
              return;
            }
            if (mode === 'poll') {
              setMode(fallbackSrc ? 'lpr' : 'empty');
              setMessage(
                fallbackSrc
                  ? t('opsLpr.usingLprFallback')
                  : t('opsLpr.snapshotUnavailable'),
              );
            }
          }}
          sx={{ width: '100%', height: '100%', maxHeight: height + 40, objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <Stack spacing={1.25} alignItems="center" sx={{ p: 3, maxWidth: 480 }}>
          <IconTile tone="ink" size={56}>
            {Glyphs.find}
          </IconTile>
          <Typography color="text.secondary" textAlign="center">
            {message || t('opsLpr.streamNote')}
          </Typography>
          {(showPwPrompt || (useDirectLan && mode === 'empty' && !previewPassword)) && camera && (
            <Stack spacing={1} sx={{ width: '100%', maxWidth: 320 }}>
              <Typography variant="body2" color="warning.main" textAlign="center" fontWeight={700}>
                {t('opsLpr.directLanPasswordHint')}
              </Typography>
              <TextField
                size="small"
                type="password"
                label={t('opsCameras.password')}
                value={pwInput}
                onChange={(e) => setPwInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyPassword()}
              />
              <Button variant="contained" color="secondary" onClick={applyPassword} disabled={!pwInput.trim()}>
                {t('opsLpr.applyPassword')}
              </Button>
            </Stack>
          )}
          <Typography variant="caption" color="text.secondary" textAlign="center">
            {t('opsLpr.liveHint')}
          </Typography>
          {camera?.ip && (
            <Typography variant="caption" color="text.secondary">
              IP: {camera.ip}
            </Typography>
          )}
          {camera?.streamUrl && (
            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              StreamUrl (IPRO listen — not browser video): {camera.streamUrl}
            </Typography>
          )}
        </Stack>
      )}

      <Stack
        direction="row"
        spacing={1}
        sx={{ position: 'absolute', top: 12, insetInlineEnd: 12 }}
      >
        <Chip
          size="small"
          label={badge}
          sx={{
            fontWeight: 800,
            bgcolor: alpha(badgeColor, 0.2),
            color: badgeColor,
            border: `1px solid ${alpha(badgeColor, 0.45)}`,
            boxShadow: `0 0 14px ${alpha(badgeColor, 0.3)}`,
          }}
        />
        {camera && (
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={() => setTick((n) => n + 1)}
            sx={{ minHeight: 28, py: 0 }}
          >
            {t('opsLpr.refresh')}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
