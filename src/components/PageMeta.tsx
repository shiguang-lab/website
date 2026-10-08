import { useEffect } from 'react';

export function PageMeta({ title, description, language = 'zh-CN' }: { title: string; description: string; language?: string }) {
  useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    document.documentElement.lang = language;
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute('content', description);
    return () => { document.documentElement.lang = previousLanguage; };
  }, [description, language, title]);

  return null;
}
