import assert from 'node:assert/strict';
import test from 'node:test';

let importSequence = 0;

function createBrowser() {
  const trackerListeners = new Map<string, () => void>();
  const tracker = {
    dataset: {},
    addEventListener(name: string, listener: EventListenerOrEventListenerObject) {
      trackerListeners.set(name, listener as () => void);
    },
  } as unknown as HTMLScriptElement;

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { pathname: '/', href: 'https://example.test/' } } as unknown as Window & typeof globalThis,
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
    createElement: () => tracker,
    head: { append: () => undefined },
    addEventListener: () => undefined,
    } as unknown as Document,
  });

  return { tracker, trackerListeners };
}

async function loadAnalytics() {
  importSequence += 1;
  return import(`./umami.ts?test=${importSequence}`);
}

test.afterEach(() => {
  Reflect.deleteProperty(globalThis, 'document');
  Reflect.deleteProperty(globalThis, 'window');
});

test('applies a queued user identity when the Umami SDK loads', async () => {
  const { trackerListeners } = createBrowser();
  const identifyCalls: unknown[][] = [];
  const analytics = await loadAnalytics();

  analytics.syncUmamiIdentity('  zitadel-user-1  ');
  analytics.startUmamiAutoTracking();
  window.umami = {
    identify: (...args) => identifyCalls.push(args),
    track: () => undefined,
  };
  const handleLoad = trackerListeners.get('load');
  assert.ok(handleLoad);
  handleLoad();

  assert.deepEqual(identifyCalls, [
    ['zitadel-user-1', { userId: 'zitadel-user-1' }],
  ]);
});

test('deduplicates an identity and clears it after logout', async () => {
  createBrowser();
  const identifyCalls: unknown[][] = [];
  window.umami = {
    identify: (...args) => identifyCalls.push(args),
    track: () => undefined,
  };
  const analytics = await loadAnalytics();

  analytics.syncUmamiIdentity('zitadel-user-1');
  analytics.syncUmamiIdentity('zitadel-user-1');
  analytics.syncUmamiIdentity(null);

  assert.deepEqual(identifyCalls, [
    ['zitadel-user-1', { userId: 'zitadel-user-1' }],
    [''],
  ]);
});

test('keeps a fresh anonymous tracker anonymous without an identify request', async () => {
  createBrowser();
  const identifyCalls: string[] = [];
  window.umami = {
    identify: (id) => identifyCalls.push(id),
    track: () => undefined,
  };
  const analytics = await loadAnalytics();

  analytics.syncUmamiIdentity(null);

  assert.deepEqual(identifyCalls, []);
});
