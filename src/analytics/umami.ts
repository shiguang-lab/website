const AUTO_TRACK_SELECTOR = 'a[href], button';
const MAX_LABEL_LENGTH = 80;
const pendingEvents: Array<[string, Record<string, string>]> = [];
let pendingIdentity: string | undefined;
let appliedIdentity: string | undefined;

function normalizeLabel(value: string | null | undefined) {
  return value?.replace(/\s+/g, ' ').trim().slice(0, MAX_LABEL_LENGTH) || '';
}

function getLabel(element: HTMLAnchorElement | HTMLButtonElement) {
  return normalizeLabel(
    element.getAttribute('data-analytics-label')
      || element.getAttribute('aria-label')
      || element.getAttribute('title')
      || element.id
      || element.textContent,
  );
}

function getSection(element: HTMLAnchorElement | HTMLButtonElement) {
  const section = element.closest('section[id], header, main, footer');
  if (!section) return '';
  return section.id || section.tagName.toLowerCase();
}

function getSafeHref(anchor: HTMLAnchorElement) {
  try {
    const url = new URL(anchor.href, window.location.href);
    const path = `${url.pathname}${url.hash}`;
    return url.origin === window.location.origin ? path : `${url.origin}${url.pathname}`;
  } catch {
    return '';
  }
}

function flushPendingAnalytics() {
  if (window.umami?.identify && pendingIdentity !== undefined) {
    const identity = pendingIdentity;
    pendingIdentity = undefined;

    if (identity !== appliedIdentity) {
      if (identity) {
        window.umami.identify(identity, { userId: identity });
      } else {
        window.umami.identify('');
      }
      appliedIdentity = identity;
    }
  }

  if (!window.umami?.track) return;
  for (const [name, data] of pendingEvents.splice(0)) {
    window.umami.track(name, data);
  }
}

/**
 * Associates subsequent analytics with the authenticated IAM subject. Passing
 * null clears an identity previously applied in the current page lifecycle.
 */
export function syncUmamiIdentity(userId: string | null | undefined) {
  const identity = userId?.trim() || '';

  // A fresh tracker is anonymous already, so avoid sending an empty identify
  // request on every public page load.
  if (!identity && appliedIdentity === undefined) {
    pendingIdentity = undefined;
    appliedIdentity = '';
    return;
  }

  pendingIdentity = identity;
  flushPendingAnalytics();
}

export function trackEvent(name: string, data: Record<string, string> = {}) {
  if (window.umami?.track) {
    window.umami.track(name, data);
    return;
  }

  if (pendingEvents.length < 20) pendingEvents.push([name, data]);
}

function handleClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) return;

  const element = event.target.closest(AUTO_TRACK_SELECTOR);
  if (!(element instanceof HTMLAnchorElement || element instanceof HTMLButtonElement)) return;
  if (element.closest('[data-umami-ignore]')) return;

  // Umami natively handles explicitly named events; avoid reporting them twice.
  if (element.closest('[data-umami-event]')) return;
  if (element instanceof HTMLButtonElement && (element.disabled || element.getAttribute('aria-disabled') === 'true')) return;

  const isLink = element instanceof HTMLAnchorElement;
  const data: Record<string, string> = {
    label: getLabel(element) || (isLink ? 'unnamed-link' : 'unnamed-button'),
    page: window.location.pathname,
    section: getSection(element),
  };

  if (isLink) data.href = getSafeHref(element);
  trackEvent(isLink ? 'link_click' : 'button_click', data);
}

export function startUmamiAutoTracking() {
  if (window.location.pathname === '/login' || window.location.pathname.startsWith('/login/')) return;
  if (window.__SHIGUANG_UMAMI_AUTO_TRACKING__) return;
  window.__SHIGUANG_UMAMI_AUTO_TRACKING__ = true;

  const tracker = document.createElement('script');
  tracker.defer = true;
  tracker.src = 'https://analytics.shiguanglab.com/script.js';
  tracker.dataset.websiteId = 'bc04a3d8-e637-4b26-82e0-ffd2ad86053d';
  tracker.dataset.autoTrack = 'true';
  tracker.addEventListener('load', flushPendingAnalytics, { once: true });
  document.head.append(tracker);

  document.addEventListener('click', handleClick, { capture: true });
  flushPendingAnalytics();
}
