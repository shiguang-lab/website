import { useCreation, useMemoizedFn } from 'ahooks';
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { startUmamiAutoTracking, syncUmamiIdentity } from '../analytics/umami';
import { AuthContext, type AuthStatus, type AuthUser } from './auth-context';

interface ErrorPayload {
  error?: string;
}

async function readJSON<T>(response: Response): Promise<T> {
  const value = await response.json().catch(() => ({})) as T & ErrorPayload;
  if (!response.ok) {
    throw Object.assign(new Error(value.error || 'request_failed'), { status: response.status });
  }
  return value;
}

async function requestSession(signal?: AbortSignal): Promise<AuthUser | null> {
  const response = await fetch('/api/auth/session', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (response.status === 401) return null;
  return readJSON<AuthUser>(response);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  const applySession = useMemoizedFn((value: AuthUser | null) => {
    setUser(value);
    setStatus(value ? 'authenticated' : 'anonymous');
    return value;
  });

  const refresh = useMemoizedFn(async (signal?: AbortSignal): Promise<AuthUser | null> => {
    try {
      return applySession(await requestSession(signal));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return null;
      return applySession(null);
    }
  });

  useEffect(() => {
    const controller = new AbortController();
    requestSession(controller.signal).then(applySession).catch((error) => {
      if (!(error instanceof Error) || error.name !== 'AbortError') applySession(null);
    });
    return () => controller.abort();
  }, [applySession]);

  useEffect(() => {
    startUmamiAutoTracking();
  }, [pathname]);

  useEffect(() => {
    if (status === 'loading') return;
    syncUmamiIdentity(status === 'authenticated' ? user?.subject : null);
  }, [status, user?.subject]);

  const logout = useMemoizedFn(async (): Promise<{ redirect?: string }> => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    const value = await readJSON<{ redirect?: string }>(response);
    applySession(null);
    return value;
  });

  const value = useCreation(() => ({ status, user, refresh, logout }), [logout, refresh, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
