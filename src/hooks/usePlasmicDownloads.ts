import { useEffect, useState } from 'react';
import { PLASMIC_DOWNLOADS } from '../config/plasmicDownloads';
import { loadPlasmicDownloads } from '../config/plasmicReleases';

export function usePlasmicDownloads() {
  const [downloads, setDownloads] = useState(PLASMIC_DOWNLOADS);
  useEffect(() => {
    let active = true;
    void loadPlasmicDownloads(__PLASMIC_UPDATE_URL__).then(releases => {
      if (active) setDownloads(releases);
    });
    return () => { active = false; };
  }, []);
  return downloads;
}
