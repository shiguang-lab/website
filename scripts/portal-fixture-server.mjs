import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const host = '127.0.0.1';
const port = Number(process.env.PORTAL_FIXTURE_PORT || 18110);
const manageableRoles = new Set([
  'huiguang:user',
  'huiguang:gray-creator',
  'huiguang:ops-admin',
  'yingguang:user',
  'yingguang:ops-admin',
  'lingguang:consumer',
  'lingguang:developer',
  'lingguang:reviewer',
  'lingguang:platform-admin',
  'platform:points-auditor',
  'platform:points-admin',
]);

const users = [
  {
    id: 'portal-alice',
    loginName: 'alice@local.test',
    displayName: '爱丽丝',
    state: 'ACTIVE',
    roles: ['huiguang:user', 'yingguang:user', 'lingguang:consumer'],
  },
  {
    id: 'portal-bob',
    loginName: 'bob@local.test',
    displayName: '鲍勃',
    state: 'ACTIVE',
    roles: ['lingguang:developer', 'platform:points-auditor'],
  },
  {
    id: 'portal-ops',
    loginName: 'ops@local.test',
    displayName: '产品运营',
    state: 'ACTIVE',
    roles: ['huiguang:ops-admin', 'yingguang:ops-admin', 'lingguang:reviewer'],
  },
];

const currentRoles = [
  'opc:system-admin',
  'huiguang:user',
  'yingguang:user',
  'lingguang:consumer',
  'platform:points-admin',
];
let revision = 42;

function json(response, status, value) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(value));
}

async function body(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16 * 1024) throw new Error('body_too_large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function accessItem(id, rolePrefix, always = false) {
  const roles = currentRoles.filter((role) => rolePrefix.some((prefix) => role.startsWith(prefix)));
  return { id, status: always || roles.length ? 'active' : 'unassigned', roles, source: 'iam' };
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${host}:${port}`);
  try {
    if (request.method === 'GET' && url.pathname === '/api/auth/session') {
      return json(response, 200, {
        authenticated: true,
        subject: 'local-portal-admin',
        displayName: 'Portal 管理员',
        preferredUsername: 'portal.admin@local.test',
        entitlements: ['platform:access'],
        platformRoles: currentRoles,
        iamCapabilities: {
          productRoleAssignments: {
            read: true,
            write: true,
            manageableRoles: [...manageableRoles],
          },
        },
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
      return json(response, 200, { redirect: '/login?return_to=%2Fportal' });
    }

    if (request.method === 'GET' && url.pathname === '/api/auth/portal/access') {
      return json(response, 200, {
        revision: `r${revision}`,
        products: [
          accessItem('huiguang', ['huiguang:']),
          accessItem('yingguang', ['yingguang:']),
          accessItem('lingguang', ['lingguang:']),
          accessItem('points', ['platform:points-'], true),
        ],
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/iam/product-role-assignments/search') {
      const input = await body(request);
      const query = String(input.query || '').trim().toLocaleLowerCase('zh-CN');
      if (query.length < 3 || !Number.isInteger(input.limit) || input.limit < 1 || input.limit > 10) {
        return json(response, 422, { error: 'invalid_request' });
      }
      return json(response, 200, {
        users: users
          .filter((user) => `${user.loginName} ${user.displayName}`.toLocaleLowerCase('zh-CN').includes(query))
          .slice(0, input.limit),
      });
    }

    const updateMatch = url.pathname.match(/^\/api\/auth\/iam\/product-role-assignments\/([^/]+)$/);
    if (request.method === 'PUT' && updateMatch) {
      const idempotencyKey = String(request.headers['idempotency-key'] || '');
      if (idempotencyKey.length < 8) return json(response, 400, { error: 'idempotency_key_required' });
      const user = users.find((item) => item.id === decodeURIComponent(updateMatch[1]));
      if (!user) return json(response, 404, { error: 'iam_user_not_found' });
      const input = await body(request);
      if (!Array.isArray(input.roles) || input.roles.some((role) => typeof role !== 'string' || !manageableRoles.has(role))) {
        return json(response, 422, { error: 'iam_role_not_manageable' });
      }
      const desired = [...new Set(input.roles)].sort();
      const changed = desired.join('|') !== user.roles.join('|');
      user.roles = desired;
      if (changed) revision += 1;
      return json(response, 200, { user, changed, operationId: randomUUID(), replayed: false });
    }

    return json(response, 404, { error: 'not_found' });
  } catch {
    return json(response, 400, { error: 'invalid_request' });
  }
});

server.listen(port, host, () => {
  process.stdout.write(`Portal fixture listening on http://${host}:${port}\n`);
});
