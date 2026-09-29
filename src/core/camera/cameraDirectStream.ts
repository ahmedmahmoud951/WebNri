import type { CameraRow } from '../api/opsTypes';

const PREVIEW_PW_PREFIX = 'cam-preview-pw-';

export type DirectStreamCandidate = { url: string; kind: 'rtsp-live' | 'live' | 'mjpeg' | 'snapshot' };

function injectCredentials(url: string, user?: string, password?: string): string {
  if (!user || url.includes('@')) return url;
  try {
    const u = new URL(url);
    u.username = user;
    if (password) u.password = password;
    return u.toString();
  } catch {
    return url;
  }
}

function normalizeBrand(manufacturer?: string): string {
  const key = (manufacturer ?? '').trim().toLowerCase();
  if (key.includes('hik')) return 'Hikvision';
  if (key.includes('dahua') || key.includes('amcrest')) return 'Dahua';
  if (key.includes('axis')) return 'Axis';
  if (key.includes('panasonic')) return 'Panasonic';
  return 'Generic';
}

function inferBrand(camera: CameraRow): string {
  const fromName = normalizeBrand(camera.manufacturer);
  if (fromName !== 'Generic') return fromName;
  const rtsp = (camera.rtspUrl ?? '').toLowerCase();
  if (rtsp.includes('stream_1') || rtsp.includes(':554/live') || rtsp.includes('/live')) {
    return 'Panasonic';
  }
  const name = (camera.name ?? '').toLowerCase();
  if (name.includes('panasonic')) return 'Panasonic';
  return 'Generic';
}

/** Deep Guard / OnvifCameraProbe RTSP paths per brand. */
function brandRtspPaths(brand: string): string[] {
  switch (brand) {
    case 'Panasonic':
      return ['/MediaInput/h264/stream_1', '/MediaInput/mpeg4/stream_1', '/live'];
    case 'Hikvision':
      return ['/Streaming/Channels/101', '/Streaming/Channels/1'];
    case 'Dahua':
      return ['/cam/realmonitor?channel=1&subtype=0'];
    case 'Axis':
      return ['/axis-media/media.amp'];
    default:
      return ['/live', '/stream1', '/h264Preview_01_main'];
  }
}

function brandSnapshotPaths(brand: string): string[] {
  switch (brand) {
    case 'Hikvision':
      return ['/ISAPI/Streaming/channels/101/picture'];
    case 'Dahua':
      return ['/cgi-bin/snapshot.cgi'];
    case 'Axis':
      return ['/axis-cgi/jpg/image.cgi'];
    case 'Panasonic':
      return ['/cgi-bin/camera?resolution=640', '/SnapshotJPEG?ResolutionCode=640x480'];
    default:
      return ['/cgi-bin/camera?resolution=640', '/cgi-bin/snapshot.cgi', '/snapshot.jpg'];
  }
}

function brandMjpegPaths(brand: string): string[] {
  switch (brand) {
    case 'Panasonic':
      return ['/cgi-bin/mjpeg', '/nphMotionJpeg?Resolution=640x480&Quality=Standard'];
    case 'Dahua':
      return ['/cgi-bin/mjpg/video.cgi'];
    case 'Axis':
      return ['/axis-cgi/mjpg/video.cgi'];
    default:
      return ['/cgi-bin/mjpeg', '/videostream.cgi'];
  }
}

export function getCameraPreviewPassword(cameraId: number): string | null {
  try {
    return sessionStorage.getItem(`${PREVIEW_PW_PREFIX}${cameraId}`);
  } catch {
    return null;
  }
}

export function setCameraPreviewPassword(cameraId: number, password: string): void {
  if (!password) return;
  try {
    sessionStorage.setItem(`${PREVIEW_PW_PREFIX}${cameraId}`, password);
  } catch {
    /* ignore */
  }
}

export function resolvePreviewCredentials(
  camera: CameraRow,
  sessionPassword?: string | null,
): { user?: string; password?: string } {
  const user = camera.userName?.trim();
  if (sessionPassword) return { user, password: sessionPassword };
  for (const raw of [camera.rtspUrl, camera.snapshotUrl]) {
    if (!raw) continue;
    const parsed = parseCameraUrlAuth(raw);
    if (parsed.password) {
      return { user: parsed.user ?? user, password: parsed.password };
    }
  }
  return { user };
}

function isGenericLiveRtspPath(url: string): boolean {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '').toLowerCase();
    return path === '/live' || path === '/stream1';
  } catch {
    return false;
  }
}

function buildRtspCandidates(camera: CameraRow, user?: string, pw?: string): string[] {
  const ip = (camera.ip ?? '').trim();
  if (!ip || ip.includes('/')) return [];
  const brand = inferBrand(camera);
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (url: string) => {
    const clean = parseCameraUrlAuth(url).cleanUrl;
    if (!seen.has(clean)) {
      seen.add(clean);
      out.push(clean);
    }
  };

  const port = 554;
  // Brand-specific paths first — probe often stores wrong Generic `/live` (404 on Panasonic).
  for (const path of brandRtspPaths(brand)) {
    add(injectCredentials(`rtsp://${ip}:${port}${path}`, user, pw));
  }

  if (camera.rtspUrl?.startsWith('rtsp://')) {
    const dbRtsp = parseCameraUrlAuth(camera.rtspUrl).cleanUrl;
    if (brand === 'Panasonic' && isGenericLiveRtspPath(dbRtsp)) {
      /* skip — already tried `/live` via brandRtspPaths */
    } else {
      add(dbRtsp);
    }
  }

  return out;
}

function buildHttpSnapshotCandidates(camera: CameraRow, user?: string, pw?: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (url: string) => {
    const clean = parseCameraUrlAuth(url).cleanUrl;
    if (!clean || seen.has(clean)) return;
    try {
      const u = new URL(clean);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
      if (!isPrivateHost(u.hostname)) return;
    } catch {
      return;
    }
    seen.add(clean);
    out.push(clean);
  };

  if (camera.snapshotUrl?.startsWith('http')) {
    add(parseCameraUrlAuth(camera.snapshotUrl).cleanUrl);
  }

  const ip = (camera.ip ?? '').trim();
  if (ip && !ip.includes('/')) {
    const brand = inferBrand(camera);
    const port = camera.httpPort && camera.httpPort > 0 && camera.httpPort !== 80 ? camera.httpPort : null;
    const origin = port ? `http://${ip}:${port}` : `http://${ip}`;
    for (const path of brandSnapshotPaths(brand)) {
      add(injectCredentials(`${origin}${path}`, user, pw));
    }
  }

  return out;
}

function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1') return true;
  const parts = h.split('.').map((x) => Number(x));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

export function buildDirectStreamCandidates(
  camera: CameraRow,
  password?: string | null,
): DirectStreamCandidate[] {
  const out: DirectStreamCandidate[] = [];
  const seen = new Set<string>();
  const add = (url: string, kind: DirectStreamCandidate['kind']) => {
    const trimmed = url.trim();
    const key = `${kind}:${trimmed}`;
    if (!trimmed || seen.has(key)) return;
    seen.add(key);
    out.push({ url: trimmed, kind });
  };

  const creds = resolvePreviewCredentials(camera, password);
  const user = creds.user;
  const pw = creds.password;
  const ip = (camera.ip ?? '').trim();
  const brand = inferBrand(camera);

  // 1) HTTP snapshot → multipart MJPEG — most reliable on LAN (Panasonic cgi-bin/camera).
  for (const snap of buildHttpSnapshotCandidates(camera, user, pw)) {
    add(snap, 'live');
    break;
  }

  if (ip && !ip.includes('/')) {
    const port = camera.httpPort && camera.httpPort > 0 && camera.httpPort !== 80 ? camera.httpPort : null;
    const origin = port ? `http://${ip}:${port}` : `http://${ip}`;

    // 2) Native camera MJPEG HTTP stream.
    for (const path of brandMjpegPaths(brand)) {
      add(injectCredentials(`${origin}${path}`, user, pw), 'mjpeg');
    }
  }

  // 3) FFmpeg RTSP → MJPEG (brand paths before DB `/live`).
  for (const rtsp of buildRtspCandidates(camera, user, pw)) {
    add(rtsp, 'rtsp-live');
  }

  // 4) Single-frame poll fallback.
  for (const snap of buildHttpSnapshotCandidates(camera, user, pw)) {
    add(snap, 'snapshot');
  }

  return out;
}

export function parseCameraUrlAuth(url: string): { cleanUrl: string; user?: string; password?: string } {
  try {
    const u = new URL(url);
    const user = u.username ? decodeURIComponent(u.username) : undefined;
    const password = u.password ? decodeURIComponent(u.password) : undefined;
    u.username = '';
    u.password = '';
    return { cleanUrl: u.toString(), user, password };
  } catch {
    return { cleanUrl: url };
  }
}

function proxyQuery(
  targetUrl: string,
  user?: string,
  password?: string,
  bust?: number,
): URLSearchParams {
  const parsed = parseCameraUrlAuth(targetUrl);
  const q = new URLSearchParams();
  q.set('url', parsed.cleanUrl);
  const u = user || parsed.user;
  const p = password ?? parsed.password;
  if (u) q.set('user', u);
  if (p !== undefined && p !== '') q.set('pw', p);
  if (bust) q.set('_', String(bust));
  return q;
}

export function buildLanProxyRtspLiveUrl(
  rtspUrl: string,
  user?: string,
  password?: string,
  fps = 10,
): string {
  const q = proxyQuery(rtspUrl, user, password);
  q.set('fps', String(fps));
  return `/lan-camera/rtsp-live.mjpeg?${q}`;
}

export function buildLanProxyLiveMjpegUrl(
  targetUrl: string,
  user?: string,
  password?: string,
  fps = 10,
): string {
  const q = proxyQuery(targetUrl, user, password);
  q.set('fps', String(fps));
  return `/lan-camera/live.mjpeg?${q}`;
}

export function buildLanProxyMjpegUrl(
  targetUrl: string,
  user?: string,
  password?: string,
): string {
  return `/lan-camera/mjpeg?${proxyQuery(targetUrl, user, password)}`;
}

export function buildLanProxySnapshotUrl(
  targetUrl: string,
  user?: string,
  password?: string,
  bust?: number,
): string {
  return `/lan-camera/snapshot?${proxyQuery(targetUrl, user, password, bust)}`;
}

export function buildLanProxyFrameUrl(
  candidate: DirectStreamCandidate,
  user?: string,
  password?: string,
  bust?: number,
): string {
  switch (candidate.kind) {
    case 'rtsp-live':
      return buildLanProxyRtspLiveUrl(candidate.url, user, password, 10);
    case 'live':
      return buildLanProxyLiveMjpegUrl(candidate.url, user, password, 10);
    case 'mjpeg':
      return buildLanProxyMjpegUrl(candidate.url, user, password);
    default:
      return buildLanProxySnapshotUrl(candidate.url, user, password, bust);
  }
}

export function isContinuousDirectKind(kind: DirectStreamCandidate['kind']): boolean {
  return kind === 'rtsp-live' || kind === 'live' || kind === 'mjpeg';
}

export function lanProxyAvailable(): boolean {
  return import.meta.env.DEV;
}
