interface LocationParts {
  pathname: string;
  search: string;
  hash: string;
}

/** Authentication redirects may target server endpoints, so always reload the document. */
export function completeLoginRedirect(target: string | undefined) {
  window.location.assign(target || '/');
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
