import assert from 'node:assert/strict';
import test from 'node:test';
import { MANAGEABLE_PRODUCT_ROLES, PORTAL_PRODUCTS, normalizeProductRoles, productForRole, productRoles } from './catalog.ts';

test('portal catalog keeps product roles namespaced and unique', () => {
  const roleIds = PORTAL_PRODUCTS.flatMap((product) => product.roles.map((role) => role.id));
  assert.equal(new Set(roleIds).size, roleIds.length);
  assert.equal(MANAGEABLE_PRODUCT_ROLES.size, roleIds.length);
  assert.ok(roleIds.every((role) => role.includes(':')));
  assert.ok(!roleIds.includes('platform:admin'));
});

test('portal catalog exposes conservative productization readiness for every product', () => {
  for (const product of PORTAL_PRODUCTS) {
    assert.ok(product.readiness.stage);
    assert.ok(product.readiness.signal);
    assert.ok(product.readiness.nextMilestone);
    assert.ok(product.readiness.evidence.length >= 2);
    assert.ok(product.readiness.gaps.length >= 2);
    assert.ok(product.readiness.gates.length >= 3);
    assert.ok(product.readiness.gates.every((gate) => ['verified', 'pending', 'blocked'].includes(gate.status)));
    assert.ok(product.readiness.gates.every((gate) => gate.label && gate.detail));
    assert.ok(!/已上线|可商用|推广完成/.test([
      product.readiness.stage,
      product.readiness.signal,
      product.readiness.nextMilestone,
      ...product.readiness.evidence,
      ...product.readiness.gaps,
      ...product.readiness.gates.flatMap((gate) => [gate.label, gate.detail]),
    ].join(' ')));
  }
});

test('portal readiness reflects current points and lingguang productization evidence', () => {
  const points = PORTAL_PRODUCTS.find((product) => product.id === 'points');
  const lingguang = PORTAL_PRODUCTS.find((product) => product.id === 'lingguang');
  const pointsEvidenceText = [
    ...(points?.readiness.evidence || []),
    ...(points?.readiness.gates.flatMap((gate) => [gate.label, gate.detail]) || []),
  ].join(' ');
  const lingguangEvidenceText = [
    ...(lingguang?.readiness.evidence || []),
    ...(lingguang?.readiness.gates.flatMap((gate) => [gate.label, gate.detail]) || []),
  ].join(' ');

  assert.match(pointsEvidenceText, /联调验收单/);
  assert.match(pointsEvidenceText, /脱敏 JSON/);
  assert.match(pointsEvidenceText, /\/v1\/points\/consumptions/);
  assert.match(pointsEvidenceText, /client secret/);
  assert.ok(points?.readiness.gates.some((gate) => gate.status === 'verified' && /接入联调/.test(gate.label)));
  assert.ok(lingguang?.readiness.evidence.includes('安装回执与操作时间线'));
  assert.match(lingguangEvidenceText, /安装操作脱敏证据复制/);
  assert.match(lingguangEvidenceText, /operation evidence/);
  assert.match(lingguangEvidenceText, /packageUrl/);
  assert.match(lingguangEvidenceText, /raw payload/);
  assert.ok(lingguang?.readiness.gates.some((gate) => gate.status === 'verified' && /安装回执/.test(gate.label)));
});

test('role helpers reject unknown IAM roles and preserve product boundaries', () => {
  assert.deepEqual(normalizeProductRoles([
    'yingguang:user',
    'unknown:admin',
    'yingguang:user',
    'platform:points-auditor',
  ]), ['platform:points-auditor', 'yingguang:user']);
  assert.equal(productForRole('yingguang:user')?.id, 'yingguang');
  assert.equal(productForRole('opc:system-admin'), undefined);
  assert.deepEqual(
    productRoles(PORTAL_PRODUCTS[0], ['huiguang:user', 'yingguang:user']).map((role) => role.id),
    ['huiguang:user'],
  );
});
