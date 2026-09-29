/** Google / OSM paste is "latitude, longitude". GIS and some GPS apps send longitude first. */

export function parseCoord(value: string | number | null | undefined): number | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const n = Number(String(value).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

export function isValidLat(lat: number) {
  return lat >= -90 && lat <= 90;
}

export function isValidLng(lng: number) {
  return lng >= -180 && lng <= 180;
}

/**
 * Cairo/Giza stored as east-then-north (31.20, 30.06) lands in Alexandria.
 * Real Cairo is ~30.06 N, 31.20 E. Do not swap true Alexandria (~31.2 N, 29.9 E).
 */
export function looksLikeSwappedCairo(lat: number, lng: number) {
  const firstLooksLikeCairoEast = lat >= 31.02 && lat <= 31.55;
  const secondLooksLikeCairoNorth = lng >= 29.95 && lng <= 30.22;
  return firstLooksLikeCairoEast && secondLooksLikeCairoNorth;
}

export function orderLatLng(
  lat: number,
  lng: number,
): { latitude: number; longitude: number; swapped: boolean } {
  if (looksLikeSwappedCairo(lat, lng)) {
    return { latitude: lng, longitude: lat, swapped: true };
  }
  return { latitude: lat, longitude: lng, swapped: false };
}

/** Parse "30.0603, 31.2039", "30.0603 31.2039", or a Google Maps URL. */
export function parseLatLngPaste(text: string): { latitude: number; longitude: number; swapped: boolean } | null {
  const raw = text.trim();
  if (!raw) return null;

  const at = raw.match(/@(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (at) return orderLatLng(Number(at[1]), Number(at[2]));

  const query = raw.match(/[?&](?:q|ll|query)=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i);
  if (query) return orderLatLng(Number(query[1]), Number(query[2]));

  const nums = raw.match(/-?\d+(?:[.,]\d+)+/g);
  if (!nums || nums.length < 2) return null;
  const a = Number(nums[0].replace(',', '.'));
  const b = Number(nums[1].replace(',', '.'));
  if (!Number.isFinite(a) || !Number.isFinite(b) || !isValidLat(a) || !isValidLng(b)) return null;
  return orderLatLng(a, b);
}

export function osmEmbedSrc(lat: number, lng: number, span = 0.0035) {
  const bbox = `${lng - span},${lat - span},${lng + span},${lat + span}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function osmOpenLink(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
}
