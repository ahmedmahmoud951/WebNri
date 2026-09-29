import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AsyncBody } from '../../app/AsyncBody';
import { PageHeader } from '../../app/PageHeader';
import { IconTile, Glyphs } from '../../app/icons';
import { LiveCameraFeed, isLanCameraOnCloudApi, isRemoteApiHost, looksLikeLanOnly } from '../../app/LiveCameraFeed';
import { setCameraPreviewPassword } from '../../core/camera/cameraDirectStream';
import { brand, glassPanel, glowPanel } from '../../app/theme';
import { useAuth } from '../../core/auth/authContext';
import { ApiError } from '../../core/api/errors';
import type { CameraRow, CameraWrite } from '../../core/api/opsTypes';
import { orderLatLng, osmEmbedSrc, parseCoord, parseLatLngPaste } from '../../core/geo/coords';

const TYPE_CODES = ['LPR', 'Entrance', 'Exit', 'Occupancy', 'Overview'] as const;
const CAMERA_TYPES = [
  { id: '1', label: 'ARH' },
  { id: '2', label: 'Panasonic / i-PRO' },
  { id: '3', label: 'Axis' },
  { id: '4', label: 'Dahua' },
] as const;

function isListenUrl(value: string) {
  if (!value.trim()) return true;
  if (value.includes('://')) return false;
  return /^\d{1,3}(\.\d{1,3}){3}:\d{2,5}$/.test(value.trim()) || /^[A-Za-z0-9.-]+:\d{2,5}$/.test(value.trim());
}

function emptyWrite(): CameraWrite {
  return {
    name: '',
    ip: '',
    streamUrl: '192.168.1.229:40000',
    rtspUrl: '',
    snapshotUrl: '',
    userName: 'admin',
    password: '',
    typeCode: 'LPR',
    cameraTypeId: '2',
    groupNum: 0,
    direction: 'Entry',
    parkingId: null,
  };
}

function optionalNum(value: number | string | null | undefined): number | undefined {
  return parseCoord(value);
}

function formatCoord(value?: number) {
  return value == null ? '' : String(value);
}

export function CamerasPage() {
  const { t } = useTranslation();
  const { api, user, hub } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === 'admin';

  const camerasQ = useQuery({ queryKey: ['ops-cameras'], queryFn: () => api.listCameras() });
  const parkingsQ = useQuery({ queryKey: ['ops-parkings'], queryFn: () => api.listParkings() });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CameraRow | null>(null);
  const [form, setForm] = useState<CameraWrite>(emptyWrite());
  const [latText, setLatText] = useState('');
  const [lngText, setLngText] = useState('');
  const [indoorXText, setIndoorXText] = useState('');
  const [indoorYText, setIndoorYText] = useState('');
  const [probeMsg, setProbeMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [snapshotMap, setSnapshotMap] = useState<Record<number, string>>({});
  const [previewId, setPreviewId] = useState<number | null>(null);

  useEffect(() => {
    const offOnline = hub.onCameraOnline((id) => {
      qc.setQueryData<CameraRow[]>(['ops-cameras'], (cur) =>
        cur?.map((c) => (c.id === id ? { ...c, status: 'Online' } : c)),
      );
    });
    const offOffline = hub.onCameraOffline((id) => {
      qc.setQueryData<CameraRow[]>(['ops-cameras'], (cur) =>
        cur?.map((c) => (c.id === id ? { ...c, status: 'Offline' } : c)),
      );
    });
    return () => {
      offOnline();
      offOffline();
    };
  }, [hub, qc]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyWrite());
    setLatText('');
    setLngText('');
    setIndoorXText('');
    setIndoorYText('');
    setProbeMsg(null);
    setDialogOpen(true);
  };

  const openEdit = (cam: CameraRow) => {
    setEditing(cam);
    setForm({
      name: cam.name,
      ip: cam.ip,
      streamUrl: cam.streamUrl ?? '',
      rtspUrl: cam.rtspUrl ?? '',
      snapshotUrl: cam.snapshotUrl ?? '',
      userName: cam.userName ?? 'admin',
      password: '',
      typeCode: cam.typeCode ?? 'LPR',
      cameraTypeId: cam.cameraTypeId ?? '2',
      groupNum: cam.groupNum,
      direction: cam.direction ?? '',
      manufacturer: cam.manufacturer,
      model: cam.model,
      httpPort: cam.httpPort,
      parkingId: cam.parkingId ?? null,
      latitude: cam.latitude,
      longitude: cam.longitude,
      indoorX: cam.indoorX,
      indoorY: cam.indoorY,
    });
    setLatText(formatCoord(cam.latitude));
    setLngText(formatCoord(cam.longitude));
    setIndoorXText(formatCoord(cam.indoorX));
    setIndoorYText(formatCoord(cam.indoorY));
    setProbeMsg(null);
    setDialogOpen(true);
  };

  const probeMut = useMutation({
    mutationFn: () =>
      api.probeCamera({
        ip: form.ip,
        userName: form.userName,
        password: form.password || 'admin',
        port: form.httpPort,
      }),
    onSuccess: (probe) => {
      setProbeMsg(
        probe.success
          ? `${probe.usedOnvif ? 'ONVIF' : 'Fallback'}: ${probe.manufacturer ?? ''} ${probe.model ?? ''} — RTSP ready`
          : probe.message || t('opsCameras.probeFail'),
      );
      if (probe.success) {
        setForm((f) => ({
          ...f,
          // WPF: probe.StreamUrl is RTSP → saved as RtspUrl
          rtspUrl: probe.streamUrl || f.rtspUrl,
          snapshotUrl: probe.snapshotUrl || f.snapshotUrl,
          manufacturer: probe.manufacturer || f.manufacturer,
          model: probe.model || f.model,
          httpPort: probe.httpPort || f.httpPort,
          name: f.name || `${probe.brandKey || 'Cam'} ${f.ip}`,
        }));
      }
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : t('common.error')),
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!form.ip.trim() || !form.userName.trim()) {
        throw new ApiError({ code: 'validation', message: t('opsCameras.ipUserRequired') });
      }
      if (form.streamUrl && !isListenUrl(form.streamUrl)) {
        throw new ApiError({ code: 'validation', message: t('opsCameras.streamUrlHint') });
      }
      if (!editing && !form.password) {
        throw new ApiError({ code: 'validation', message: t('opsCameras.passwordRequired') });
      }
      const pasted = parseLatLngPaste(latText);
      const ordered =
        pasted ??
        (optionalNum(latText) != null && optionalNum(lngText) != null
          ? orderLatLng(optionalNum(latText)!, optionalNum(lngText)!)
          : null);
      const body: CameraWrite = {
        ...form,
        name: form.name || `Cam ${form.ip}`,
        groupNum: Number(form.groupNum) || 0,
        parkingId: form.parkingId || null,
        latitude: ordered?.latitude,
        longitude: ordered?.longitude,
        indoorX: optionalNum(indoorXText),
        indoorY: optionalNum(indoorYText),
      };
      if (editing) {
        if (!body.password) delete body.password;
        return api.updateCamera(editing.id, body);
      }
      // Ensure probe ran so RTSP is filled when possible
      if (!body.rtspUrl && body.password) {
        const probe = await api.probeCamera({
          ip: body.ip,
          userName: body.userName,
          password: body.password,
          port: body.httpPort,
        });
        if (probe.success) {
          body.rtspUrl = probe.streamUrl;
          body.snapshotUrl = probe.snapshotUrl || body.snapshotUrl;
          body.manufacturer = probe.manufacturer || body.manufacturer;
          body.model = probe.model || body.model;
        }
      }
      return api.createCamera(body);
    },
    onSuccess: async (saved) => {
      if (form.password?.trim()) {
        setCameraPreviewPassword(saved.id, form.password.trim());
      }
      setDialogOpen(false);
      setMessage(editing ? t('opsCameras.updated') : t('opsCameras.created'));
      qc.setQueryData<CameraRow[]>(['ops-cameras'], (cur) => {
        if (!cur) return [saved];
        if (cur.some((c) => c.id === saved.id)) {
          return cur.map((c) => (c.id === saved.id ? { ...c, ...saved } : c));
        }
        return [saved, ...cur];
      });
      await qc.invalidateQueries({ queryKey: ['ops-cameras'] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : t('common.error')),
  });

  const loadSnapshot = async (cam: CameraRow) => {
    setPreviewId(cam.id);
    if (isLanCameraOnCloudApi(cam)) return;
    try {
      const snap = await api.getCameraSnapshot(cam.id);
      if (snap.success && snap.imageBase64) {
        const src = snap.imageBase64.startsWith('data:')
          ? snap.imageBase64
          : `data:${snap.contentType || 'image/jpeg'};base64,${snap.imageBase64}`;
        setSnapshotMap((m) => ({ ...m, [cam.id]: src }));
      } else {
        setError(snap.message || t('opsCameras.snapshotFail'));
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('common.error'));
    }
  };

  const cameras = camerasQ.data ?? [];
  const parkings = parkingsQ.data ?? [];
  const parkingName = (id?: number) => parkings.find((p) => p.id === id)?.name;
  const lprish = useMemo(
    () =>
      cameras.filter((c) => {
        const code = (c.typeCode ?? '').toLowerCase();
        return !code || ['lpr', 'entrance', 'exit', 'in', 'out'].includes(code);
      }),
    [cameras],
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t('nav.groupOps')}
        title={t('opsCameras.title')}
        hint={t('opsCameras.hint')}
        actions={
          canManage ? (
            <Button variant="contained" color="secondary" onClick={openCreate}>
              {t('opsCameras.add')}
            </Button>
          ) : undefined
        }
      />

      {message && <Alert severity="success" onClose={() => setMessage(null)}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Alert severity="info" sx={{ ...glassPanel() }}>
        <Typography fontWeight={700}>{t('opsCameras.streamExplainTitle')}</Typography>
        <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7 }}>
          {t('opsCameras.streamExplain')}
        </Typography>
      </Alert>

      {isRemoteApiHost() && cameras.some((c) => looksLikeLanOnly(c)) && (
        <Alert severity="warning">
          {t('opsCameras.probeCloudWarning')}
        </Alert>
      )}

      <AsyncBody
        isLoading={camerasQ.isLoading}
        error={camerasQ.error}
        onRetry={() => void camerasQ.refetch()}
        isEmpty={cameras.length === 0}
        empty={<Typography color="text.secondary">{t('opsCameras.empty')}</Typography>}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
          }}
        >
          {cameras.map((cam) => {
            const online = (cam.status ?? '').toLowerCase() === 'online';
            return (
              <Box key={cam.id} className="nri-glow-card" sx={{ ...glowPanel(brand.teal), p: 2.25 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <IconTile tone={online ? 'mint' : 'ink'} size={42}>
                      {Glyphs.find}
                    </IconTile>
                    <Box>
                      <Typography fontWeight={800}>{cam.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[cam.manufacturer, cam.model].filter(Boolean).join(' · ') || cam.ip}
                      </Typography>
                    </Box>
                  </Stack>
                  <Chip size="small" color={online ? 'success' : 'default'} label={cam.status || '—'} />
                </Stack>

                <Stack spacing={0.75} sx={{ mt: 2 }}>
                  <Meta label={t('opsCameras.type')} value={cam.typeCode || '—'} />
                  <Meta label="IP" value={cam.ip} />
                  <Meta label={t('opsCameras.group')} value={String(cam.groupNum)} />
                  <Meta label={t('opsCameras.streamUrl')} value={cam.streamUrl || '—'} />
                  <Meta label={t('opsCameras.rtspUrl')} value={cam.rtspUrl || '—'} />
                  <Meta label={t('opsCameras.snapshotUrl')} value={cam.snapshotUrl || '—'} />
                  <Meta label={t('opsCameras.direction')} value={cam.direction || '—'} />
                  <Meta label={t('opsCameras.parking')} value={parkingName(cam.parkingId) || (cam.parkingId ? `#${cam.parkingId}` : '—')} />
                  <Meta
                    label={t('opsCameras.location')}
                    value={
                      cam.latitude != null && cam.longitude != null
                        ? `${cam.latitude.toFixed(5)}, ${cam.longitude.toFixed(5)}`
                        : t('opsCameras.noLocation')
                    }
                  />
                </Stack>

                {previewId === cam.id && (
                  <Box sx={{ mt: 1.5 }}>
                    <LiveCameraFeed camera={cam} fallbackSrc={snapshotMap[cam.id]} height={200} />
                  </Box>
                )}

                <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setPreviewId(cam.id);
                    }}
                  >
                    {t('opsCameras.livePreview')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => void loadSnapshot(cam)}
                  >
                    {t('opsCameras.snapshot')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      void api
                        .getCameraStatus(cam.id)
                        .then((s) => setMessage(`${cam.name}: ${s.status || (s.online ? 'Online' : 'Offline')}`))
                        .catch((e) => setError(e instanceof ApiError ? e.message : t('common.error')))
                    }
                  >
                    {t('opsCameras.status')}
                  </Button>
                  {canManage && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          void api
                            .testCamera(cam.id)
                            .then((r) => setMessage(r.message || (r.success ? 'OK' : 'Fail')))
                            .catch((e) => setError(e instanceof ApiError ? e.message : t('common.error')))
                        }
                      >
                        {t('opsCameras.test')}
                      </Button>
                      <Button size="small" onClick={() => openEdit(cam)}>
                        {t('opsCameras.edit')}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          if (!window.confirm(t('opsCameras.confirmDelete', { name: cam.name }))) return;
                          void api
                            .deleteCamera(cam.id)
                            .then(async () => {
                              setMessage(t('opsCameras.deleted'));
                              setPreviewId((cur) => (cur === cam.id ? null : cur));
                              setSnapshotMap((m) => {
                                const next = { ...m };
                                delete next[cam.id];
                                return next;
                              });
                              await qc.invalidateQueries({ queryKey: ['ops-cameras'] });
                            })
                            .catch((e) =>
                              setError(
                                e instanceof ApiError
                                  ? e.message
                                  : t('opsCameras.deleteFail'),
                              ),
                            );
                        }}
                      >
                        {t('opsCameras.delete')}
                      </Button>
                    </>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Box>
      </AsyncBody>

      <Typography variant="caption" color="text.secondary">
        {t('opsCameras.lprCount', { count: lprish.length })}
      </Typography>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? t('opsCameras.editTitle') : t('opsCameras.addTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">{t('opsCameras.addFlow')}</Alert>
            {probeMsg && <Alert severity="success">{probeMsg}</Alert>}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label={t('opsCameras.name')} value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth />
              <TextField label="IP *" value={form.ip} onChange={(e) => setForm((f) => ({ ...f, ip: e.target.value }))} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label={t('opsCameras.userName')} value={form.userName} onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))} fullWidth />
              <TextField
                label={t('opsCameras.password')}
                type="password"
                value={form.password ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                fullWidth
                helperText={editing ? t('opsCameras.passwordOptional') : undefined}
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label={t('opsCameras.streamUrl')}
                value={form.streamUrl ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, streamUrl: e.target.value }))}
                fullWidth
                helperText={t('opsCameras.streamUrlHint')}
              />
              <TextField
                label={t('opsCameras.group')}
                type="number"
                value={form.groupNum ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, groupNum: Number(e.target.value) }))}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label={t('opsCameras.cameraType')}
                value={form.cameraTypeId ?? '2'}
                onChange={(e) => setForm((f) => ({ ...f, cameraTypeId: e.target.value }))}
                fullWidth
              >
                {CAMERA_TYPES.map((ct) => (
                  <MenuItem key={ct.id} value={ct.id}>
                    {ct.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={t('opsCameras.type')}
                value={form.typeCode ?? 'LPR'}
                onChange={(e) => setForm((f) => ({ ...f, typeCode: e.target.value }))}
                fullWidth
              >
                {TYPE_CODES.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={t('opsCameras.direction')}
                value={form.direction ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value }))}
                fullWidth
              >
                <MenuItem value="">—</MenuItem>
                <MenuItem value="Entry">Entry</MenuItem>
                <MenuItem value="Exit">Exit</MenuItem>
                <MenuItem value="Both">Both</MenuItem>
              </TextField>
            </Stack>
            <TextField
              select
              label={t('opsCameras.parking')}
              value={form.parkingId ? String(form.parkingId) : ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, parkingId: e.target.value === '' ? null : Number(e.target.value) }))
              }
              fullWidth
            >
              <MenuItem value="">—</MenuItem>
              {parkings.map((lot) => (
                <MenuItem key={lot.id} value={String(lot.id)}>
                  {lot.name}
                </MenuItem>
              ))}
            </TextField>
            <Alert severity="info">{t('opsCameras.locationHint')}</Alert>
            <TextField
              label={t('opsCameras.coordsPaste')}
              placeholder="30.06030, 31.20390"
              fullWidth
              onChange={(e) => {
                const pair = parseLatLngPaste(e.target.value);
                if (!pair) return;
                setLatText(String(pair.latitude));
                setLngText(String(pair.longitude));
              }}
              helperText={t('opsCameras.coordsPasteHint')}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label={t('opsCameras.latitude')}
                value={latText}
                onChange={(e) => {
                  const v = e.target.value;
                  const pair = parseLatLngPaste(v);
                  if (pair && (v.includes(',') || v.includes('@'))) {
                    setLatText(String(pair.latitude));
                    setLngText(String(pair.longitude));
                    return;
                  }
                  setLatText(v);
                }}
                fullWidth
                placeholder="30.0444"
                helperText={t('opsCameras.latitudeHelp')}
              />
              <TextField
                label={t('opsCameras.longitude')}
                value={lngText}
                onChange={(e) => setLngText(e.target.value)}
                fullWidth
                placeholder="31.2357"
                helperText={t('opsCameras.longitudeHelp')}
              />
            </Stack>
            {optionalNum(latText) != null && optionalNum(lngText) != null && (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider', height: 180 }}>
                <iframe
                  title="preview"
                  src={osmEmbedSrc(
                    orderLatLng(optionalNum(latText)!, optionalNum(lngText)!).latitude,
                    orderLatLng(optionalNum(latText)!, optionalNum(lngText)!).longitude,
                  )}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                />
              </Box>
            )}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label={t('opsCameras.indoorX')}
                value={indoorXText}
                onChange={(e) => setIndoorXText(e.target.value)}
                fullWidth
              />
              <TextField
                label={t('opsCameras.indoorY')}
                value={indoorYText}
                onChange={(e) => setIndoorYText(e.target.value)}
                fullWidth
              />
            </Stack>
            <TextField
              label={t('opsCameras.rtspUrl')}
              value={form.rtspUrl ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, rtspUrl: e.target.value }))}
              fullWidth
              helperText={t('opsCameras.rtspHint')}
            />
            <TextField
              label={t('opsCameras.snapshotUrl')}
              value={form.snapshotUrl ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, snapshotUrl: e.target.value }))}
              fullWidth
              helperText={t('opsCameras.snapshotHint')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            disabled={probeMut.isPending}
            onClick={() => {
              setError(null);
              probeMut.mutate();
            }}
          >
            {t('opsCameras.probe')}
          </Button>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" disabled={saveMut.isPending} onClick={() => saveMut.mutate()}>
            {editing ? t('opsCameras.save') : t('opsCameras.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" gap={2}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={700} sx={{ textAlign: 'end', wordBreak: 'break-all' }}>
        {value}
      </Typography>
    </Stack>
  );
}
