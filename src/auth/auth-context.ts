import { createContext } from 'react';

export interface AuthUser {
  authenticated: boolean;
  subject: string;
  displayName?: string;
  email?: string;
  preferredUsername?: string;
  entitlements?: string[];
}

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated';

export interface AuthValue {
  status: AuthStatus;
  user: AuthUser | null;
  refresh: (signal?: AbortSignal) => Promise<AuthUser | null>;
  logout: () => Promise<{ redirect?: string }>;
}

export const AuthContext = createContext<AuthValue | null>(null);
