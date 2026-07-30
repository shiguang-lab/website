import assert from 'node:assert/strict';
import test from 'node:test';

let importSequence = 0;

function createBrowser() {
  /** @type {Map<string, () => void>} */
  const trackerListeners = new Map();
  const tracker = /** @type {HTMLScriptElement} */ (/** @type {unknown} */ ({
    dataset: {},
    /** @param {string} name @param {EventListenerOrEventListenerObject} listener */
    addEventListener(name, listener) {
      trackerListeners.set(name, /** @type {() => void} */ (listener));
    },
  }));

  globalThis.window = /** @type {Window & typeof globalThis} */ (/** @type {unknown} */ ({
    location: { pathname: '/' },
  }));
  globalThis.document = /** @type {Document} */ (/** @type {unknown} */ ({
    createElement: () => tracker,
    head: { append: () => undefined },
    addEventListener: () => undefined,
  }));

  return { tracker, trackerListeners };
}

async function loadAnalytics() {
  importSequence += 1;
  return import(`./umami.js?test=${importSequence}`);
}

test.afterEach(() => {
  Reflect.deleteProperty(globalThis, 'document');
  Reflect.deleteProperty(globalThis, 'window');
});

test('applies a queued user identity when the Umami SDK loads', async () => {
  const { trackerListeners } = createBrowser();
  /** @type {unknown[][]} */
  const identifyCalls = [];
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
  /** @type {unknown[][]} */
  const identifyCalls = [];
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
  /** @type {string[]} */
  const identifyCalls = [];
  window.umami = {
    identify: (id) => identifyCalls.push(id),
    track: () => undefined,
  };
  const analytics = await loadAnalytics();

  analytics.syncUmamiIdentity(null);

  assert.deepEqual(identifyCalls, []);
});
