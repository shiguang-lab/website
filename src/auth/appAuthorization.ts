export interface RegisteredApp {
  client_id: string;
  name: string;
  logo_url: string;
  app_callback_url: string;
}
export interface AppCallback {
  state: string;
  code?: string;
  error?: string;
}

/** A code is handed to the native client; tokens and PKCE verifiers stay in the app. */
export function readAppCallback(search: string): AppCallback | null {
  const query = new URLSearchParams(search);
  const state = query.get('state');
  const code = query.get('code');
  const error = query.get('error');
  if (!state || state.length > 512 || query.getAll('state').length !== 1) return null;
  if (error === 'access_denied' && !code && query.getAll('error').length === 1) return { state, error };
  if (!error && code && /^[A-Za-z0-9_-]{43}$/.test(code) && query.getAll('code').length === 1) return { state, code };
  return null;
}

export function appCallbackLink(app: RegisteredApp, callback: AppCallback): string | null {
  let target: URL;
  try { target = new URL(app.app_callback_url); } catch { return null; }
  if (!/^[a-z][a-z0-9+.-]*:$/.test(target.protocol) || ['http:', 'https:', 'file:', 'javascript:', 'data:', 'blob:', 'about:'].includes(target.protocol)
    || target.host !== 'oauth' || target.pathname !== '/callback' || target.username || target.password || target.search || target.hash) return null;
  target.search = new URLSearchParams({ state: callback.state, ...(callback.code ? { code: callback.code } : { error: callback.error || 'access_denied' }) }).toString();
  return target.href;
}

export async function readAppResponse<T>(response: Response): Promise<T> {
  const value = await response.json().catch(() => ({})) as T & { login_url?: string };
  if (!response.ok) throw Object.assign(new Error('Authorization request failed'), { loginUrl: value.login_url });
  return value;
}
