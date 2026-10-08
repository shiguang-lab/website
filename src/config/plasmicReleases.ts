import { PLASMIC_DOWNLOADS, type PlasmicDownload } from './plasmicDownloads.ts';

const targets = [
  { platform: 'darwin', arch: 'universal', extension: '.dmg' },
  { platform: 'win32', arch: 'x64', extension: '.exe' },
  { platform: 'linux', arch: 'x64', extension: '.AppImage' },
];
interface ReleaseInstaller {
  id: string;
  platform: string;
  arch: string;
  version: string;
  size: number;
  sha512: string;
  url: string;
}

/** Fetch the release JSON at page load, independently of website builds. */
export async function loadPlasmicDownloads(updateUrl: string, request: (url: URL | string, init?: RequestInit) => Promise<Response> = fetch): Promise<PlasmicDownload[]> {
  const base = new URL(updateUrl.replace(/\/?$/, '/'));
  try {
    const response = await request(new URL('latest.json', base), { cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(8000) });
    if (response.status === 404) return PLASMIC_DOWNLOADS;
    if (!response.ok) throw new Error(`Release JSON HTTP ${response.status}`);
    const release = await response.json();
    if (release.schemaVersion !== 1 || typeof release.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(release.version) || !Array.isArray(release.installers)) {
      throw new Error('Invalid release JSON');
    }
    return await Promise.all(PLASMIC_DOWNLOADS.map(async (build, index) => {
      const target = targets[index];
      const file: ReleaseInstaller | undefined = release.installers.find((entry: ReleaseInstaller) => entry.id === build.id);
      if (!file) return build;
      const partition = `${target.platform}/${target.arch}/`;
      const filename = typeof file.url === 'string' ? file.url.slice(file.url.lastIndexOf('/') + 1) : '';
      if (file.platform !== target.platform || file.arch !== target.arch || file.version !== release.version ||
        !/^[a-zA-Z0-9._-]+$/.test(filename) || !filename.includes(`-${release.version}-`) || !filename.endsWith(target.extension) ||
        file.url !== new URL(partition + filename, base).href || !Number.isSafeInteger(file.size) || file.size <= 0 ||
        typeof file.sha512 !== 'string' || !/^[A-Za-z0-9+/]{86}==$/.test(file.sha512)) return build;
      const artifact = await request(file.url, { method: 'HEAD', cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(8000) });
      if (!artifact.ok || Number(artifact.headers.get('content-length')) !== file.size) return build;
      return { ...build, url: file.url, version: release.version, sizeMb: Math.round(file.size / 1024 / 1024) };
    }));
  } catch (error) {
    console.warn(`Plasmic downloads unavailable: ${error instanceof Error ? error.message : String(error)}`);
    return PLASMIC_DOWNLOADS;
  }
}
