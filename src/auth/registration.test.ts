import assert from 'node:assert/strict';
import test from 'node:test';
import { passwordRequirements, passwordValidationMessage, readRegistrationJSON, registrationErrorMessage, type PasswordPolicy } from './registration.ts';

const policy: PasswordPolicy = { minLength: 8, hasUppercase: true, hasLowercase: true, hasNumber: true, hasSymbol: true };

test('registration validates all effective password rules before submitting', () => {
  for (const [password, reason] of [
    ['Ab1!', '至少需要 8 位'],
    ['PASSWORD1!', '小写字母'],
    ['password1!', '大写字母'],
    ['Password!!', '数字'],
    ['Password123', '符号'],
    ['Ab1!' + 'a'.repeat(197), '密码过长'],
  ]) {
    assert.ok(passwordValidationMessage(password, policy).includes(reason), reason);
  }
  assert.equal(passwordValidationMessage('Password123!', policy), '');
  assert.equal(passwordValidationMessage('Ab1!' + 'a'.repeat(196), policy), '');
  assert.match(passwordRequirements(policy), /大写字母、小写字母、数字、符号/);
});

test('registration follows changed organization policy and ZITADEL byte length semantics', () => {
  const relaxed = { ...policy, minLength: 12, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSymbol: false };
  assert.equal(passwordValidationMessage('abcdefghijkl', relaxed), '');
  assert.match(passwordValidationMessage('Password1!', relaxed), /12 位/);
  assert.equal(passwordRequirements(relaxed), '至少 12 位。');
  assert.equal(passwordValidationMessage('Ab1中文', policy), '');
  assert.match(passwordValidationMessage('Ab1!' + '中'.repeat(66), policy), /密码过长/);
});

test('registration displays the backend rejection reason', async () => {
  await assert.rejects(
    readRegistrationJSON(Response.json({ error: 'registration_rejected', message: '密码必须包含符号 (COMMA-ZDLwA)' }, { status: 400 })),
    error => registrationErrorMessage(error) === '密码必须包含符号 (COMMA-ZDLwA)',
  );
});

test('registration distinguishes expired transactions, CSRF, duplicate accounts, throttling and network failures', async () => {
  for (const [status, code, reason] of [
    [400, 'expired_registration', '注册会话已过期'],
    [400, 'provider_email_missing', 'Google 未返回有效邮箱'],
    [400, 'provider_email_mismatch', 'Google 注册邮箱不可修改'],
    [403, 'invalid_csrf', '安全校验失败'],
    [403, 'invalid_origin', '页面地址未获准'],
    [409, 'account_exists', '用户名或邮箱已被使用'],
    [429, 'try_again_later', '请求过于频繁'],
    [500, 'temporarily_unavailable', '认证服务暂时不可用'],
  ] as const) {
    await assert.rejects(readRegistrationJSON(Response.json({ error: code }, { status })), error => registrationErrorMessage(error).includes(reason));
  }
  await assert.rejects(readRegistrationJSON(new Response('<html>bad gateway</html>', { status: 502 })), error => registrationErrorMessage(error).includes('HTTP 502'));
  await assert.rejects(readRegistrationJSON(Response.json({ error: 'registration_rejected' }, { status: 400 })), error => registrationErrorMessage(error).includes('注册信息被认证服务拒绝'));
  assert.match(registrationErrorMessage(new TypeError('Failed to fetch')), /网络连接失败/);
  assert.deepEqual(await readRegistrationJSON(Response.json({ redirect: '/portal' })), { redirect: '/portal' });
});
