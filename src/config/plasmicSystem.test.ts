import assert from 'node:assert/strict';
import test from 'node:test';
import { detectPlasmicSystem } from './plasmicDownloads.ts';

const mac = { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 0 };

test('Mac recommendations use architecture hints rather than the Intel UA string', async () => {
  for (const [architecture, arch] of [['arm', 'arm64'], ['x86', 'x64']]) {
    const detected = await detectPlasmicSystem({ ...mac, userAgentData: { getHighEntropyValues: async hints => {
      assert.deepEqual(hints, ['architecture', 'bitness']);
      return { architecture, bitness: '64' };
    } } });
    assert.deepEqual(detected, { platform: 'mac', arch });
  }
});

test('Safari, withheld hints and an iPad never produce a guessed CPU recommendation', async () => {
  assert.deepEqual(await detectPlasmicSystem(mac), { platform: 'mac', arch: null });
  assert.deepEqual(await detectPlasmicSystem({ ...mac, userAgentData: { getHighEntropyValues: async () => ({}) } }), { platform: 'mac', arch: null });
  assert.deepEqual(await detectPlasmicSystem({ ...mac, userAgentData: { getHighEntropyValues: async () => { throw new Error('Denied'); } } }), { platform: 'mac', arch: null });
  assert.deepEqual(await detectPlasmicSystem({ ...mac, maxTouchPoints: 5 }), { platform: null, arch: null });
  assert.deepEqual(await detectPlasmicSystem({ userAgent: 'Windows NT 10.0', maxTouchPoints: 0 }), { platform: 'windows', arch: null });
});
