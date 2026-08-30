import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { PORTAL_PRODUCTS, MANAGEABLE_PRODUCT_ROLES, normalizeProductRoles } from '../src/portal/catalog.ts';

const host = '127.0.0.1';
const port = Number(process.env.PORTAL_FIXTURE_PORT || 18119);
const baseURL = `http://${host}:${port}`;
const knownProductIds = new Set(PORTAL_PRODUCTS.map((product) => product.id));
const forbiddenKeys = new Set([
  'accessKey',
  'apiKey',
  'clientSecret',
  'credential',
  'externalIdentity',
  'href',
  'machineToken',
  'origin',
  'packageUrl',
  'password',
  'pat',
  'rawPayload',
  'secret',
  'signature',
  'token',
  'url',
]);

function assertNoForbiddenKeys(value, path = '$') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenKeys(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    assert.ok(!forbiddenKeys.has(key), `${path}.${key} must not be exposed by Portal fixture`);
    assertNoForbiddenKeys(child, `${path}.${key}`);
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${baseURL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const value = await response.json().catch(() => ({}));
  return { response, value };
}

async function waitForFixture(child) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`portal fixture exited early with ${child.exitCode}`);
    try {
      const { response } = await request('/api/auth/session');
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  }
  throw new Error('portal fixture did not become ready');
}

function revisionNumber(revision) {
  const value = Number(String(revision || '').replace(/^r/, ''));
  assert.ok(Number.isInteger(value), `revision must be numeric, got ${revision}`);
  return value;
}

async function main() {
  const child = spawn(process.execPath, ['scripts/portal-fixture-server.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, PORTAL_FIXTURE_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));

  try {
    await waitForFixture(child);

    const session = await request('/api/auth/session');
    assert.equal(session.response.status, 200);
    assert.equal(session.value.authenticated, true);
    assert.equal(session.value.subject, 'local-portal-admin');
    assert.ok(session.value.platformRoles.includes('opc:system-admin'));
    assert.equal(session.value.iamCapabilities.productRoleAssignments.read, true);
    assert.equal(session.value.iamCapabilities.productRoleAssignments.write, true);
    assert.deepEqual(
      [...session.value.iamCapabilities.productRoleAssignments.manageableRoles].sort(),
      [...MANAGEABLE_PRODUCT_ROLES].sort(),
    );
    assertNoForbiddenKeys(session.value);

    const access = await request('/api/auth/portal/access');
    assert.equal(access.response.status, 200);
    assert.ok(Array.isArray(access.value.products));
    assert.ok(access.value.products.length > 0);
    assert.ok(access.value.products.every((product) => knownProductIds.has(product.id)));
    assert.ok(access.value.products.every((product) => ['id', 'status', 'roles', 'source'].every((key) => key in product)));
    assertNoForbiddenKeys(access.value);
    const initialRevision = revisionNumber(access.value.revision);

    const shortSearch = await request('/api/auth/iam/product-role-assignments/search', {
      method: 'POST',
      body: JSON.stringify({ query: 'al', limit: 10 }),
    });
    assert.equal(shortSearch.response.status, 422);
    assert.equal(shortSearch.value.error, 'invalid_request');

    const search = await request('/api/auth/iam/product-role-assignments/search', {
      method: 'POST',
      body: JSON.stringify({ query: 'alice', limit: 10 }),
    });
    assert.equal(search.response.status, 200);
    assert.equal(search.value.users.length, 1);
    const [alice] = search.value.users;
    assert.deepEqual(Object.keys(alice).sort(), ['displayName', 'id', 'loginName', 'roles', 'state'].sort());
    assert.equal(alice.id, 'portal-alice');
    assert.equal(alice.state, 'ACTIVE');
    assert.deepEqual([...alice.roles].sort(), normalizeProductRoles(alice.roles));
    assertNoForbiddenKeys(search.value);

    const missingIdempotency = await request(`/api/auth/iam/product-role-assignments/${alice.id}`, {
      method: 'PUT',
      body: JSON.stringify({ roles: ['huiguang:user'] }),
    });
    assert.equal(missingIdempotency.response.status, 400);
    assert.equal(missingIdempotency.value.error, 'idempotency_key_required');

    const forbiddenRole = await request(`/api/auth/iam/product-role-assignments/${alice.id}`, {
      method: 'PUT',
      headers: { 'Idempotency-Key': `portal-smoke-${randomUUID()}` },
      body: JSON.stringify({ roles: ['platform:admin', 'opc:system-admin'] }),
    });
    assert.equal(forbiddenRole.response.status, 422);
    assert.equal(forbiddenRole.value.error, 'iam_role_not_manageable');

    const desiredRoles = ['huiguang:user', 'yingguang:user'];
    const update = await request(`/api/auth/iam/product-role-assignments/${alice.id}`, {
      method: 'PUT',
      headers: { 'Idempotency-Key': `portal-smoke-${randomUUID()}` },
      body: JSON.stringify({ roles: desiredRoles }),
    });
    assert.equal(update.response.status, 200);
    assert.equal(update.value.changed, true);
    assert.deepEqual(update.value.user.roles, normalizeProductRoles(desiredRoles));
    assertNoForbiddenKeys(update.value);

    const changedAccess = await request('/api/auth/portal/access');
    const changedRevision = revisionNumber(changedAccess.value.revision);
    assert.equal(changedRevision, initialRevision + 1);

    const replayEquivalent = await request(`/api/auth/iam/product-role-assignments/${alice.id}`, {
      method: 'PUT',
      headers: { 'Idempotency-Key': `portal-smoke-${randomUUID()}` },
      body: JSON.stringify({ roles: [...desiredRoles].reverse() }),
    });
    assert.equal(replayEquivalent.response.status, 200);
    assert.equal(replayEquivalent.value.changed, false);
    assert.deepEqual(replayEquivalent.value.user.roles, normalizeProductRoles(desiredRoles));

    const unchangedAccess = await request('/api/auth/portal/access');
    assert.equal(revisionNumber(unchangedAccess.value.revision), changedRevision);

    console.log('Portal fixture smoke passed');
  } finally {
    child.kill('SIGTERM');
    await Promise.race([
      once(child, 'exit'),
      new Promise((resolve) => setTimeout(resolve, 500)),
    ]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
