/** @param {{ pathname: string, search: string, hash: string }} location */
export function currentReturnTo(location) {
  if (location.pathname === '/login' || location.pathname === '/register') return '/';
  const pathname = location.pathname.startsWith('/') ? location.pathname : '/';
  return `${pathname}${location.search || ''}${location.hash || ''}`;
}

/** @param {{ pathname: string, search: string, hash: string }} location */
export function loginHref(location) {
  const search = new URLSearchParams({ return_to: currentReturnTo(location) });
  return `/login?${search.toString()}`;
}
