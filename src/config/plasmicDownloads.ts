import type { PlatformName } from '../components/PlatformGlyph';

export interface PlasmicDownload {
  id: 'mac' | 'windows' | 'linux';
  platform: Extract<PlatformName, 'mac' | 'windows' | 'linux'>;
  name: string;
  packaging: string;
  url?: string;
  version?: string;
  sizeMb?: number;
}

// Product labels only. Versions and installers come from the live release JSON.
export const PLASMIC_DOWNLOADS: PlasmicDownload[] = [
  { id: 'mac', platform: 'mac', name: 'macOS', packaging: 'Universal · Apple Silicon & Intel · DMG' },
  { id: 'windows', platform: 'windows', name: 'Windows', packaging: 'x64 · EXE' },
  { id: 'linux', platform: 'linux', name: 'Linux', packaging: 'x64 · AppImage' },
];
