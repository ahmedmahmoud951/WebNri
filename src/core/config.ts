const apiOrigin = import.meta.env.VITE_API_ORIGIN?.trim() || 'http://nri.runasp.net';

export const config = {
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  /** Relative /api is proxied to apiOrigin in Vite DEV (browser still shows localhost:5173). */
  apiBase: '/api',
  /**
   * SignalR: hit the API host directly (CORS allows localhost:5173).
   * Avoids Vite WS proxy breakage. Override with VITE_HUB_URL if needed.
   */
  hubUrl:
    import.meta.env.VITE_HUB_URL?.trim() ||
    `${apiOrigin.replace(/\/$/, '')}/hubs/parking`,
  apiOrigin,
  mockBuildingId: 1,
  mockZoneId: 3,
  pilotPaymentAmount: 15,
  currency: 'SAR',
  /** MTI proposal default; configurable 15–30 on the platform, not in this UI. */
  graceMinutes: 20,
  tokenKey: 'nri.accessToken',
  refreshKey: 'nri.refreshToken',
  localeKey: 'nri.locale',
} as const;
