import { parse } from 'yaml';
import type { PlasmicDownload } from '../src/config/plasmicDownloads.ts';

const builds = [
  { id: 'mac', platform: 'mac', name: 'macOS', packaging: 'Universal · Apple Silicon & Intel · DMG', directory: 'darwin/universal/', manifest: 'latest-mac.yml', extension: '.dmg' },
  { id: 'windows', platform: 'windows', name: 'Windows', packaging: 'x64 · EXE', directory: 'win32/x64/', manifest: 'latest.yml', extension: '.exe' },
  { id: 'linux', platform: 'linux', name: 'Linux', packaging: 'x64 · AppImage', directory: 'linux/x64/', manifest: 'latest-linux.yml', extension: '.AppImage' },
] as const;

/** Resolve published installers at build time; missing releases stay unavailable. */
export async function loadPlasmicDownloads(updateUrl: string): Promise<PlasmicDownload[]> {
  const base = updateUrl.replace(/\/?$/, '/');
  return Promise.all(builds.map(async ({ id, platform, name, packaging, directory, manifest, extension }) => {
    const build: PlasmicDownload = { id, platform, name, packaging };
    try {
      const manifestUrl = new URL(directory + manifest, base);
      const response = await fetch(manifestUrl, { signal: AbortSignal.timeout(8000) });
      if (response.status === 404) return build;
      if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
      const release = parse(await response.text());
      if (typeof release?.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(release.version) || !Array.isArray(release.files)) {
        throw new Error('Invalid stable release manifest');
      }
      const file = release.files.find((entry: { url?: unknown }) => typeof entry?.url === 'string' && entry.url.endsWith(extension));
      if (!file || !/^[a-zA-Z0-9._-]+$/.test(file.url) || !file.url.includes(`-${release.version}-`) || !Number.isSafeInteger(file.size) || file.size <= 0) {
        throw new Error('Missing or invalid installer');
      }
      const url = new URL(file.url, manifestUrl).href;
      const artifact = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      if (!artifact.ok || Number(artifact.headers.get('content-length')) !== file.size) {
        throw new Error('Installer unavailable or size mismatch');
      }
      return { ...build, url, version: release.version, sizeMb: Math.round(file.size / 1024 / 1024) };
    } catch (error) {
      console.warn(`Plasmic download ${id} unavailable: ${error instanceof Error ? error.message : String(error)}`);
      return build;
    }
  }));
}
