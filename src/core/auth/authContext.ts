import { createContext, useContext } from 'react';
import type { ApiClient } from '../api/client';
import type { LiveHub } from '../realtime/liveHub';
import type { UserProfile } from '../api/types';

export interface AuthContextValue {
  status: 'unknown' | 'anonymous' | 'authenticated';
  token: string | null;
  user: UserProfile | null;
  api: ApiClient;
  hub: LiveHub;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: UserProfile) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
