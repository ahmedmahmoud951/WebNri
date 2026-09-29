/** Resolve LPR/camera image payloads for <img src>. Mirrors WPF PlateImageDecoder rules. */

function stripDataUrl(value: string): { mime: string; payload: string } | null {
  const comma = value.indexOf(',');
  if (!value.toLowerCase().startsWith('data:') || comma < 0) return null;
  const header = value.slice(0, comma);
  const mimeMatch = /^data:([^;]+)/i.exec(header);
  return {
    mime: mimeMatch?.[1] || 'image/jpeg',
    payload: value.slice(comma + 1).replace(/\s/g, ''),
  };
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value) || value.startsWith('blob:');
}

/** Absolute disk / UNC paths are not browser-loadable. */
function isLocalFilePath(value: string) {
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\');
}

/**
 * Relative API/media paths. Must not treat JPEG base64 (`/9j/...`) as a path —
 * standard JPEG base64 always starts with `/9j/`.
 */
function isShortRelativePath(value: string) {
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/9j/')) return false;
  if (value.length > 400) return false;
  return /^\/[\w./%@+\-]+$/i.test(value);
}

function looksLikeBase64(value: string) {
  const compact = value.replace(/\s/g, '');
  if (compact.length < 80) return false;
  if (!/^[A-Za-z0-9+/]+=*$/.test(compact)) return false;
  return (
    compact.startsWith('/9j/') ||
    compact.startsWith('iVBOR') ||
    compact.startsWith('R0lGOD') ||
    compact.startsWith('Qk') ||
    compact.length >= 120
  );
}

function mimeFromBase64(payload: string) {
  if (payload.startsWith('/9j/')) return 'image/jpeg';
  if (payload.startsWith('iVBOR')) return 'image/png';
  if (payload.startsWith('R0lGOD')) return 'image/gif';
  if (payload.startsWith('Qk')) return 'image/bmp';
  return 'image/jpeg';
}

function compactBase64(value: string) {
  const data = stripDataUrl(value);
  return (data?.payload ?? value).replace(/\s/g, '');
}

/** Legacy bug stored JPEG as a 2000-char "path" — those payloads never decode. */
export function isLikelyTruncatedJpeg(value?: string | null) {
  if (!value) return false;
  const compact = compactBase64(value);
  if (!compact.startsWith('/9j/')) return false;
  return compact.length <= 2500;
}

function padBase64(value: string) {
  const mod = value.length % 4;
  return mod === 0 ? value : value + '='.repeat(4 - mod);
}

/** Incomplete JPEG (no EOI) — append FFD9 so the browser can paint the partial scan. */
export function salvageJpegDataUri(value?: string | null): string | null {
  if (!value) return null;
  const compact = compactBase64(value.trim());
  if (!compact.startsWith('/9j/') || compact.length < 80) return null;
  try {
    const binary = atob(padBase64(compact));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
    const hasEoi = bytes.length >= 2 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
    const out = hasEoi ? bytes : (() => {
      const next = new Uint8Array(bytes.length + 2);
      next.set(bytes);
      next[bytes.length] = 0xff;
      next[bytes.length + 1] = 0xd9;
      return next;
    })();
    let raw = '';
    out.forEach((b) => {
      raw += String.fromCharCode(b);
    });
    return `data:image/jpeg;base64,${btoa(raw)}`;
  } catch {
    return null;
  }
}

export function resolveLprImageSrc(value?: string | null, apiOrigin?: string): string | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;

  if (isHttpUrl(raw)) return raw;

  const data = stripDataUrl(raw);
  if (data) {
    if (data.payload.length < 32) return null;
    if (data.payload.startsWith('/9j/')) return salvageJpegDataUri(data.payload) ?? `data:${data.mime};base64,${data.payload}`;
    return `data:${data.mime};base64,${data.payload}`;
  }

  if (isLocalFilePath(raw)) return null;

  // Base64 before path check — JPEG payloads start with "/9j/"
  if (looksLikeBase64(raw)) {
    const payload = raw.replace(/\s/g, '');
    if (payload.startsWith('/9j/')) return salvageJpegDataUri(payload);
    return `data:${mimeFromBase64(payload)};base64,${payload}`;
  }

  if (isShortRelativePath(raw)) {
    const origin = (apiOrigin ?? '').replace(/\/$/, '');
    if (!origin) return null;
    return `${origin}${raw}`;
  }

  return null;
}

/** Prefer a real plate crop; skip legacy 2000-char truncated JPEGs in favor of the vehicle frame. */
export function pickLprEvidenceSrc(
  plateImagePath?: string | null,
  imagePath?: string | null,
  apiOrigin?: string,
): { src: string; kind: 'crop' | 'vehicle' } | null {
  const cropWeak = isLikelyTruncatedJpeg(plateImagePath);
  const crop = cropWeak ? null : resolveLprImageSrc(plateImagePath, apiOrigin);
  if (crop) return { src: crop, kind: 'crop' };
  const vehicle = resolveLprImageSrc(imagePath, apiOrigin);
  if (vehicle) return { src: vehicle, kind: 'vehicle' };
  const salvaged = resolveLprImageSrc(plateImagePath, apiOrigin);
  if (salvaged) return { src: salvaged, kind: 'crop' };
  return null;
}

/** Always show the full plate/vehicle. Cover-crop hid plates behind grey letterbox. */
export function plateWellObjectFit(_naturalWidth?: number, _naturalHeight?: number): 'contain' | 'cover' {
  return 'contain';
}

export function toDataUri(base64?: string | null, contentType = 'image/jpeg'): string | null {
  if (!base64) return null;
  if (base64.startsWith('data:')) return base64;
  const payload = base64.replace(/\s/g, '');
  if (!payload) return null;
  return `data:${contentType || 'image/jpeg'};base64,${payload}`;
}
