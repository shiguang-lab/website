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

export const PLASMIC_DOWNLOADS: PlasmicDownload[] = typeof __PLASMIC_DOWNLOADS__ === 'undefined' ? [] : __PLASMIC_DOWNLOADS__;
