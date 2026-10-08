import { useEffect, useState } from 'react';
import { PLASMIC_DOWNLOADS } from '../config/plasmicDownloads';
import { loadPlasmicDownloads } from '../config/plasmicReleases';

export function usePlasmicDownloads() {
  const [downloads, setDownloads] = useState(PLASMIC_DOWNLOADS);
  useEffect(() => {
    let active = true;
    const base = new URL(__PLASMIC_UPDATE_URL__);
    void loadPlasmicDownloads(base.href, (url, init) => {
      const release = new URL(url);
      return fetch(`/plasmic-updates/${release.pathname.slice(base.pathname.length)}`, init);
    }).then(releases => {
      if (active) setDownloads(releases);
    });
    return () => { active = false; };
  }, []);
  return downloads;
}
