import { useEffect } from 'react';

/** @param {{ title: string, description: string }} props */
export function PageMeta({ title, description }) {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute('content', description);
  }, [description, title]);

  return null;
}
