import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { config } from '../config';
import { HttpApiClient } from '../api/http';
import { ApiError } from '../api/errors';
import { SignalRLiveHub } from '../realtime/signalrHub';
import type { LiveHub } from '../realtime/liveHub';
import type { AuthTokens, UserProfile } from '../api/types';
import { AuthContext, type AuthContextValue } from './authContext';
import { isJwtUnexpired, profileFromAccessToken } from './jwt';
import i18n from '../i18n';

function readToken(): string | null {
  return window.sessionStorage.getItem(config.tokenKey);
}

function readRefresh(): string | null {
  return window.sessionStorage.getItem(config.refreshKey);
}

function currentLocale(): 'ar' | 'en' {
  return i18n.language === 'en' ? 'en' : 'ar';
}

function profileFromSession(accessToken: string, tokens?: AuthTokens) {
  return profileFromAccessToken(accessToken, tokens, currentLocale());
}

function writeTokens(accessToken: string | null, refreshToken?: string | null): void {
  if (accessToken) {
    window.sessionStorage.setItem(config.tokenKey, accessToken);
  } else {
    window.sessionStorage.removeItem(config.tokenKey);
  }
  if (refreshToken) {
    window.sessionStorage.setItem(config.refreshKey, refreshToken);
  } else if (refreshToken === null || accessToken === null) {
    window.sessionStorage.removeItem(config.refreshKey);
  }
}

interface AuthProviderProps {
  queryClient: QueryClient;
  children: ReactNode;
}

export function AuthProvider({ queryClient, children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthContextValue['status']>('unknown');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const hub = useMemo<LiveHub>(
    () =>
      new SignalRLiveHub({
        getToken: readToken,
        onTokenExpired: () => {
          writeTokens(null, null);
          setToken(null);
          setUser(null);
          setStatus('anonymous');
          queryClient.clear();
        },
      }),
    [queryClient],
  );

  const api = useMemo(() => {
    return new HttpApiClient({
      getToken: () => window.sessionStorage.getItem(config.tokenKey),
      getRefreshToken: () => window.sessionStorage.getItem(config.refreshKey),
      getLanguage: () => (i18n.language === 'en' ? 'en' : 'ar'),
      onTokens: (accessToken, refreshToken) => {
        writeTokens(accessToken, refreshToken);
        setToken(accessToken);
      },
      onUnauthorized: () => {
        writeTokens(null, null);
        setToken(null);
        setUser(null);
        setStatus('anonymous');
        queryClient.clear();
        void hub.disconnect();
      },
    });
  }, [hub, queryClient]);

  const hubBootRef = useRef(0);

  useEffect(() => {
    const bootId = ++hubBootRef.current;
    const existing = readToken();
    if (!existing) {
      setStatus('anonymous');
      return;
    }
    if (!isJwtUnexpired(existing)) {
      writeTokens(null, null);
      setStatus('anonymous');
      return;
    }
    setToken(existing);
    void (async () => {
      try {
        let profile: UserProfile;
        try {
          profile = await api.getMe();
        } catch (error) {
          if (error instanceof ApiError && error.statusCode === 401) {
            throw error;
          }
          // API down / timeout — still open the app from the JWT.
          profile = profileFromSession(existing);
        }
        if (hubBootRef.current !== bootId) return;
        setUser(profile);
        setStatus('authenticated');
        try {
          await hub.connect(existing);
          if (hubBootRef.current !== bootId) return;
          if (profile.buildingId) await hub.joinBuilding(profile.buildingId);
        } catch {
          // REST occupancy still works while the hub is down (503 / WebSocket).
        }
      } catch (error) {
        if (hubBootRef.current !== bootId) return;
        if (error instanceof ApiError && error.statusCode === 401) {
          writeTokens(null, null);
        }
        setToken(null);
        setUser(null);
        setStatus('anonymous');
      }
    })();
    return () => {
      // Strict Mode remounts immediately; only disconnect if this boot is still current after a tick.
      window.setTimeout(() => {
        if (hubBootRef.current === bootId) void hub.disconnect();
      }, 0);
    };
  }, [api, hub]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      token,
      user,
      api,
      hub,
      setUser,
      refreshUser: async () => {
        try {
          setUser(await api.getMe());
        } catch {
          // GET /me still 401s on a valid JWT until Parking.Api applies ASKS-FROM-WEB-2026-08-18.
        }
      },
      login: async (username, password) => {
        const tokens = await api.login(username, password);
        writeTokens(tokens.accessToken, tokens.refreshToken);
        setToken(tokens.accessToken);
        let profile: UserProfile;
        try {
          profile = await api.getMe();
        } catch {
          profile = profileFromSession(tokens.accessToken, tokens);
        }
        setUser(profile);
        setStatus('authenticated');
        queryClient.clear();
        try {
          await hub.connect(tokens.accessToken);
          if (profile.buildingId) await hub.joinBuilding(profile.buildingId);
        } catch {
          // Keep the session; ConnectionBanner shows when live is down.
        }
      },
      logout: () => {
        const refresh = readRefresh();
        void api.logout(refresh ?? undefined);
        writeTokens(null, null);
        setToken(null);
        setUser(null);
        setStatus('anonymous');
        queryClient.clear();
        void hub.disconnect();
      },
    }),
    [api, hub, queryClient, status, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
