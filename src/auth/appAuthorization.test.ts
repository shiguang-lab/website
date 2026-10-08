import assert from 'node:assert/strict';
import test from 'node:test';
import { appCallbackLink, readAppCallback, type RegisteredApp } from './appAuthorization.ts';
const code = 'c'.repeat(43);
const callback = { state: 'random-request-state', code };
const app: RegisteredApp = { client_id: 'plasmicapp', name: 'Plasmic Desktop', logo_url: '/assets/plasmic-app.png', app_callback_url: 'plasmic-desktop://oauth/callback' };
test('a public callback passes only its single-use code and state to a registered app', () => {
  const parsed = readAppCallback(new URLSearchParams({ ...callback, return_to: 'https://evil.example', access_token: 'must-not-forward' }).toString());
  assert.deepEqual(parsed, callback);
  const target = new URL(appCallbackLink(app, parsed!)!);
  assert.equal(target.protocol, 'plasmic-desktop:');
  assert.equal(target.host, 'oauth');
  assert.deepEqual(Object.fromEntries(target.searchParams), callback);
  assert.ok(!target.href.includes('must-not-forward'));
});
test('other registered apps use the same callback page with their own protocol', () => {
  const target = appCallbackLink({ ...app, client_id: 'another-app', name: 'Another App', app_callback_url: 'another-desktop://oauth/callback' }, callback);
  assert.equal(new URL(target!).protocol, 'another-desktop:');
});
test('expired, ambiguous and malformed callback parameters cannot trigger an app', () => {
  for (const query of ['', `code=${code}`, 'state=test&code=short', `state=one&state=two&code=${code}`, `state=test&code=${code}&code=${code}`, `state=test&code=${code}&error=access_denied`, 'state=test&error=other']) assert.equal(readAppCallback(query), null);
});
test('denial returns the original state to the app without a code', () => {
  const denied = readAppCallback('state=test&error=access_denied');
  assert.deepEqual(denied, { state: 'test', error: 'access_denied' });
  assert.equal(new URL(appCallbackLink(app, denied!)!).searchParams.get('code'), null);
});
test('untrusted executable URLs and alternate native destinations are rejected', () => {
  for (const uri of ['javascript:alert(1)', 'file://oauth/callback', 'https://oauth/callback', 'data:text/html,unsafe', 'plasmic-desktop://evil/callback', 'plasmic-desktop://oauth/callback?target=evil', 'plasmic-desktop://user@oauth/callback', 'plasmic-desktop://oauth/other']) assert.equal(appCallbackLink({ ...app, app_callback_url: uri }, callback), null);
});
