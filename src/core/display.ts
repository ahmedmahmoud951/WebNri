/** Client-facing labels. Platform seed may still say EGP / Seed Area. */

export function displayCurrency(code?: string | null): string {
  const value = (code ?? '').trim().toUpperCase();
  if (!value || value === 'EGP') return 'SAR';
  return value;
}

export function displaySiteName(name?: string | number | null): string {
  if (name == null || name === '') return '';
  const text = String(name);
  // Only the seed building/zone labels map to B-01. Do not rename Seed Parking —
  // that made two lots look like B-01 vs MTI and hid which lot received new places.
  if (/^seed area$/i.test(text) || /^seed zone$/i.test(text)) return 'B-01';
  return text;
}

export function displayPersonName(name?: string | null): string {
  if (!name) return '';
  return name.replace(/^Demo\s+/i, '').trim() || name;
}

export function formatLocalDateTime(raw?: unknown): string {
  if (raw == null || raw === '') return '—';
  let str = String(raw).trim();
  if (!str) return '—';
  // If ISO string lacks 'Z' or timezone offset, append 'Z' so browser treats it as UTC and applies local timezone (+3 hrs in Egypt)
  if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(str)) {
    str += 'Z';
  }
  const date = new Date(str);
  if (isNaN(date.getTime())) return String(raw);
  return date.toLocaleString();
}
