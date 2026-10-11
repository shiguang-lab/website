import type { NavigateFunction } from 'react-router-dom';

interface LocationParts {
  pathname: string;
  search: string;
  hash: string;
}

export async function readAuthorizationRedirect(response: Response): Promise<string> {
  const value = await response.json().catch(() => ({})) as { redirect?: string; error?: string };
  if (!response.ok || !value.redirect) throw new Error(value.error || '无法继续授权，请返回应用重新发起登录。');
  return value.redirect;
}

/** Process the OAuth endpoint on the server before entering a Website route. */
export async function completeLoginRedirect(target: string | undefined, navigate: NavigateFunction) {
  let url = new URL(target || '/', window.location.origin);
  if (url.origin === window.location.origin && url.pathname === '/oauth/authorize') {
    const response = await fetch(url.href, { credentials: 'include', headers: { Accept: 'application/json' }, redirect: 'error' });
    url = new URL(await readAuthorizationRedirect(response), window.location.origin);
  }
  if (url.origin === window.location.origin &&
    !url.pathname.startsWith('/api/') &&
    (!url.pathname.startsWith('/oauth/') || url.pathname === '/oauth/device')) {
    await navigate(url.pathname + url.search + url.hash, { replace: true });
  } else {
    window.location.assign(url.href);
  }
}

export function currentReturnTo(location: LocationParts) {
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') return '/portal';
  const pathname = location.pathname.startsWith('/') ? location.pathname : '/';
  return `${pathname}${location.search || ''}${location.hash || ''}`;
}

export function loginHref(location: LocationParts) {
  const search = new URLSearchParams({ return_to: currentReturnTo(location) });
  return `/login?${search.toString()}`;
}
