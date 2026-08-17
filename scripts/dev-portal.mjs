import { spawn } from 'node:child_process';

const root = process.cwd();
const children = [];

function start(args, env = {}) {
  const child = spawn(process.execPath, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
  children.push(child);
  child.on('exit', (code) => {
    if (code && !shuttingDown) shutdown(code);
  });
  return child;
}

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 100).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

start(['scripts/portal-fixture-server.mjs']);
start(['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '3010'], {
  AUTH_PROXY_TARGET: 'http://127.0.0.1:18110',
});
