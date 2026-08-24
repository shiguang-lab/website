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
