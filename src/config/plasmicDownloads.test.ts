import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import test from 'node:test';
import { loadPlasmicDownloads } from './plasmicReleases.ts';

test('live JSON exposes verified installers without rebuilding the website', async (t) => {
  let installerName = 'Plasmic-1.2.3-mac-universal.dmg';
  let artifactSize = 1048576;
  let version = '1.2.3';
  let published = true;
  const requests: string[] = [];
  const server = createServer((request, response) => {
    requests.push(`${request.method} ${request.url}`);
    if (published && request.url === '/updates/latest.json') {
      const host = `http://${request.headers.host}/updates`;
      const installer = (id: string, platform: string, arch: string, name: string) => ({ id, platform, arch, version, size: 1048576, sha512: 'a'.repeat(86) + '==', url: `${host}/${platform}/${arch}/${name}` });
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ schemaVersion: 1, version, installers: [
        installer('mac', 'darwin', 'universal', installerName),
        installer('windows', 'win32', 'x64', `Plasmic-${version}-win-x64.exe`),
      ] }));
    } else if (request.method === 'HEAD') {
      response.writeHead(200, { 'Content-Length': artifactSize });
      response.end();
    } else {
      response.writeHead(404);
      response.end();
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}/updates`;

  await t.test('selects DMG and EXE, preserving version, architecture and size', async () => {
    const downloads = await loadPlasmicDownloads(base);
    assert.equal(downloads.length, 3);
    assert.equal(downloads[0].url, `${base}/darwin/universal/Plasmic-1.2.3-mac-universal.dmg`);
    assert.equal(downloads[0].version, '1.2.3');
    assert.equal(downloads[0].sizeMb, 1);
    assert.equal(downloads[1].url, `${base}/win32/x64/Plasmic-1.2.3-win-x64.exe`);
    assert.equal(downloads[2].url, undefined);
    assert.ok(!requests.some(url => url.endsWith('.zip')));
    assert.ok(!requests.some(url => /darwin\/(arm64|x64)\//.test(url)));
    assert.match(downloads[0].packaging, /Apple Silicon & Intel/);
  });
  await t.test('refreshes an older snapshot through a transport while retaining official download links', async () => {
    const snapshot = await loadPlasmicDownloads(base);
    version = '1.2.4';
    installerName = `Plasmic-${version}-mac-universal.dmg`;
    const officialBase = 'https://studio.example.com/desktop-updates/';
    const refreshed = await loadPlasmicDownloads(officialBase, async (url, init) => {
      assert.equal(init?.cache, 'no-store');
      assert.equal(init?.credentials, 'omit');
      assert.equal(new URL(url).origin, 'https://studio.example.com');
      const path = new URL(url).pathname.slice('/desktop-updates/'.length);
      const response = await fetch(`${base}/${path}`, init);
      if (path === 'latest.json') {
        const json = await response.json();
        for (const installer of json.installers) installer.url = installer.url.replace(base + '/', officialBase);
        return Response.json(json);
      }
      return response;
    });
    assert.equal(snapshot[0].version, '1.2.3');
    assert.equal(refreshed[0].version, '1.2.4');
    assert.equal(refreshed[0].url, `${officialBase}darwin/universal/Plasmic-1.2.4-mac-universal.dmg`);
    assert.equal(refreshed[1].version, '1.2.4');
    assert.equal(refreshed[0].sizeMb, 1);
    version = '1.2.3';
    installerName = 'Plasmic-1.2.3-mac-universal.dmg';
  });
  await t.test('leaves a missing release unavailable', async () => {
    published = false;
    const downloads = await loadPlasmicDownloads(base);
    assert.ok(downloads.every(build => build.url === undefined));
    published = true;
  });
  await t.test('does not expose an installer with a mismatched size', async () => {
    artifactSize = 8;
    const downloads = await loadPlasmicDownloads(base);
    assert.ok(downloads.every(build => build.url === undefined));
    artifactSize = 1048576;
  });
  await t.test('rejects paths outside the immutable release directory', async () => {
    requests.length = 0;
    installerName = '../Plasmic-1.2.3-mac-universal.dmg';
    const downloads = await loadPlasmicDownloads(base);
    assert.equal(downloads[0].url, undefined);
    assert.ok(!requests.some(url => url.startsWith('HEAD') && url.endsWith('.dmg')));
  });
});
