import assert from 'node:assert/strict';
import test from 'node:test';
import { completeLoginRedirect, currentReturnTo, loginHref } from './loginRedirect.ts';

test('website login enters the authenticated portal by default', () => {
  assert.equal(currentReturnTo({ pathname: '/', search: '', hash: '' }), '/portal');
  assert.equal(loginHref({ pathname: '/', search: '', hash: '' }), '/login?return_to=%2Fportal');
  assert.equal(currentReturnTo({ pathname: '/login', search: '', hash: '' }), '/portal');
});

test('protected routes preserve their exact local return path', () => {
  assert.equal(currentReturnTo({ pathname: '/account/security', search: '?provider=github', hash: '#links' }), '/account/security?provider=github#links');
});

test('sign-in redirects request a new document and preserve the OAuth authorization parameters', () => {
  const requested: string[] = [];
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { assign: (url: string) => requested.push(url) } } });
  try {
    const oauth = '/oauth/authorize?client_id=plasmicapp&code_challenge=fixture&redirect_uri=http%3A%2F%2F127.0.0.1%3A54321%2Fcallback&state=fixture';
    completeLoginRedirect(oauth);
    completeLoginRedirect('/portal');
    completeLoginRedirect('https://studio.plasmic.shiguanglab.com/projects/fixture');
    assert.deepEqual(requested, [oauth, '/portal', 'https://studio.plasmic.shiguanglab.com/projects/fixture']);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
