import assert from 'node:assert/strict';
import test from 'node:test';
import { currentReturnTo, loginHref } from './loginRedirect.ts';

test('website login enters the authenticated portal by default', () => {
  assert.equal(currentReturnTo({ pathname: '/', search: '', hash: '' }), '/portal');
  assert.equal(loginHref({ pathname: '/', search: '', hash: '' }), '/login?return_to=%2Fportal');
  assert.equal(currentReturnTo({ pathname: '/login', search: '', hash: '' }), '/portal');
});

test('protected routes preserve their exact local return path', () => {
  assert.equal(currentReturnTo({ pathname: '/account/security', search: '?provider=github', hash: '#links' }), '/account/security?provider=github#links');
});
