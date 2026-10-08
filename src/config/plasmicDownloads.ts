import type { PlatformName } from '../components/PlatformGlyph';

export interface PlasmicDownload {
  id: 'mac-arm64' | 'mac-x64' | 'windows' | 'linux';
  platform: Extract<PlatformName, 'mac' | 'windows' | 'linux'>;
  arch: 'arm64' | 'x64';
  name: string;
  packaging: string;
  url?: string;
  version?: string;
  sizeMb?: number;
}

// Product labels only. Versions and installers come from the live release JSON.
export const PLASMIC_DOWNLOADS: PlasmicDownload[] = [
  { id: 'mac-arm64', platform: 'mac', arch: 'arm64', name: 'macOS · Apple Silicon', packaging: 'M-series chips · DMG' },
  { id: 'mac-x64', platform: 'mac', arch: 'x64', name: 'macOS · Intel', packaging: 'Intel processors · DMG' },
  { id: 'windows', platform: 'windows', arch: 'x64', name: 'Windows', packaging: 'x64 · EXE' },
  { id: 'linux', platform: 'linux', arch: 'x64', name: 'Linux', packaging: 'x64 · AppImage' },
];

export interface PlasmicSystem {
  platform: PlasmicDownload['platform'] | null;
  arch: PlasmicDownload['arch'] | null;
}

export async function detectPlasmicSystem(browser: Pick<Navigator, 'userAgent' | 'maxTouchPoints'> & {
  userAgentData?: { getHighEntropyValues(hints: string[]): Promise<{ architecture?: string; bitness?: string }> };
}): Promise<PlasmicSystem> {
  const ua = browser.userAgent;
  const mobile = /Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && browser.maxTouchPoints > 1);
  const platform = mobile ? null : /Windows/i.test(ua) ? 'windows' : /Macintosh|Mac OS X/i.test(ua) ? 'mac' : /Linux/i.test(ua) ? 'linux' : null;
  let arch: PlasmicSystem['arch'] = null;
  if (platform === 'mac' && browser.userAgentData) {
    try {
      const hints = await browser.userAgentData.getHighEntropyValues(['architecture', 'bitness']);
      if (hints.bitness === '64') arch = hints.architecture === 'arm' ? 'arm64' : hints.architecture === 'x86' ? 'x64' : null;
    } catch { /* Keep both Mac choices available when the browser withholds architecture. */ }
  }
  return { platform, arch };
}
