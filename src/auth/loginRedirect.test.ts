import assert from 'node:assert/strict';
import test from 'node:test';
import type { NavigateFunction, NavigateOptions, To } from 'react-router-dom';
import { completeLoginRedirect, currentReturnTo, loginHref } from './loginRedirect.ts';

test('website login enters the authenticated portal by default', () => {
  assert.equal(currentReturnTo({ pathname: '/', search: '', hash: '' }), '/portal');
  assert.equal(loginHref({ pathname: '/', search: '', hash: '' }), '/login?return_to=%2Fportal');
  assert.equal(currentReturnTo({ pathname: '/login', search: '', hash: '' }), '/portal');
});

test('protected routes preserve their exact local return path', () => {
  assert.equal(currentReturnTo({ pathname: '/account/security', search: '?provider=github', hash: '#links' }), '/account/security?provider=github#links');
});

test('same-origin Website routes stay in the document; server and external targets navigate the browser', async () => {
  const documents: string[] = [];
  const routes: string[] = [];
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { origin: 'https://shiguanglab.com', assign: (url: string) => documents.push(url) } } });
  try {
    const navigate: NavigateFunction = (path: To | number, options?: NavigateOptions) => { assert.equal(options?.replace, true); assert.equal(typeof path, 'string'); routes.push(String(path)); };
    await completeLoginRedirect('/portal', navigate);
    await completeLoginRedirect('https://shiguanglab.com/auth/apps/plasmicapp/authorize?request=fixture', navigate);
    await completeLoginRedirect('/account/security?provider=github#links', navigate);
    await completeLoginRedirect('/oauth/device?user_code=ABCD-EFGH', navigate);
    await completeLoginRedirect('/api/auth/federated/start?provider=github', navigate);
    await completeLoginRedirect('https://plasmic-studio.shiguanglab.com/projects/fixture', navigate);
    assert.deepEqual(routes, ['/portal', '/auth/apps/plasmicapp/authorize?request=fixture', '/account/security?provider=github#links', '/oauth/device?user_code=ABCD-EFGH']);
    assert.deepEqual(documents, ['https://shiguanglab.com/api/auth/federated/start?provider=github', 'https://plasmic-studio.shiguanglab.com/projects/fixture']);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('OAuth resumes on the server with unchanged parameters before routing to consent', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousFetch = globalThis.fetch;
  const routes: string[] = [];
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { origin: 'https://shiguanglab.com', assign: () => assert.fail('must not reload the document') } } });
  const oauth = '/oauth/authorize?client_id=plasmicapp&code_challenge=fixture&redirect_uri=https%3A%2F%2Fshiguanglab.com%2Fauth%2Fapps%2Fplasmicapp%2Fcallback&state=fixture';
  globalThis.fetch = async (input, options) => {
    assert.equal(input, 'https://shiguanglab.com' + oauth);
    assert.equal(options?.credentials, 'include');
    assert.deepEqual(options?.headers, { Accept: 'application/json' });
    assert.equal(options?.redirect, 'error');
    return Response.json({ redirect: 'https://shiguanglab.com/auth/apps/plasmicapp/authorize?request=consent-fixture' });
  };
  try {
    await completeLoginRedirect(oauth, path => { assert.equal(typeof path, 'string'); routes.push(String(path)); });
    assert.deepEqual(routes, ['/auth/apps/plasmicapp/authorize?request=consent-fixture']);
    globalThis.fetch = async () => Response.json({ error: '授权请求参数不合法或不被支持。' }, { status: 400 });
    await assert.rejects(completeLoginRedirect(oauth, () => assert.fail('must not navigate after failure')), /授权请求参数不合法/);
    globalThis.fetch = async () => Response.json({});
    await assert.rejects(completeLoginRedirect(oauth, () => assert.fail('must not navigate without a redirect')), /无法继续授权/);
  } finally {
    globalThis.fetch = previousFetch;
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
