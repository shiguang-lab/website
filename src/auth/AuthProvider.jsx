import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { startUmamiAutoTracking, syncUmamiIdentity } from '../analytics/umami';
import { AuthContext } from './auth-context';

/** @typedef {import('./auth-context').AuthUser} AuthUser */
/** @typedef {'loading' | 'anonymous' | 'authenticated'} AuthStatus */

/** @param {Response} response */
async function readJSON(response) {
  const value = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(value.error || 'request_failed'), { status: response.status });
  }
  return value;
}

/** @param {AbortSignal=} signal @returns {Promise<AuthUser | null>} */
async function requestSession(signal) {
  const response = await fetch('/api/auth/session', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });
  if (response.status === 401) return null;
  return readJSON(response);
}

/** @param {{ children: import('react').ReactNode }} props */
export function AuthProvider({ children }) {
  const { pathname } = useLocation();
  const [status, setStatus] = useState(/** @type {AuthStatus} */ ('loading'));
  const [user, setUser] = useState(/** @type {AuthUser | null} */ (null));

  const applySession = useCallback((/** @type {AuthUser | null} */ value) => {
    setUser(value);
    setStatus(value ? 'authenticated' : 'anonymous');
    return value;
  }, []);

  /** @type {(signal?: AbortSignal) => Promise<AuthUser | null>} */
  const refresh = useCallback(async (signal) => {
    try {
      return applySession(await requestSession(signal));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return null;
      return applySession(null);
    }
  }, [applySession]);

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

  const logout = useCallback(async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    const value = await readJSON(response);
    applySession(null);
    return value;
  }, [applySession]);

  const value = useMemo(() => ({ status, user, refresh, logout }), [logout, refresh, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
