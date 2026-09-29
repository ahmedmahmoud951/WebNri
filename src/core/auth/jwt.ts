import { normalizeRole, type AuthTokens, type UserProfile } from '../api/types';

interface JwtPayload {
  sub?: string;
  role?: string;
  roles?: string[] | string;
  username?: string;
  preferred_username?: string;
  name?: string;
  displayName?: string;
  buildingId?: string | number;
  exp?: number;
}

function decodePayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function isJwtUnexpired(token: string, now = Date.now()): boolean {
  const payload = decodePayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 > now + 5000;
}

export function profileFromAccessToken(
  token: string,
  extras?: Pick<AuthTokens, 'displayName' | 'role' | 'username'>,
  locale = 'ar',
): UserProfile {
  const payload = decodePayload(token) ?? {};
  const roleRaw =
    extras?.role ??
    payload.role ??
    (Array.isArray(payload.roles) ? payload.roles[0] : payload.roles);
  const building = payload.buildingId;
  return {
    userId: Number(payload.sub) || 0,
    displayName: String(
      extras?.displayName ?? payload.displayName ?? payload.name ?? extras?.username ?? payload.username ?? payload.preferred_username ?? '',
    ),
    role: normalizeRole(String(roleRaw ?? 'visitor')),
    locale,
    buildingId: building == null || building === '' ? 1 : Number(building),
    vehicles: [],
  };
}
