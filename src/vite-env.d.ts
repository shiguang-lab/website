/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_CHAT_URL?: string;
  readonly VITE_APP_KNOWLEDGE_URL?: string;
  readonly VITE_APP_WORKFLOW_URL?: string;
  readonly VITE_APP_MARKET_URL?: string;
  readonly VITE_APP_TEAM_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __SICHEN_DOWNLOAD_SIZES__: Partial<Record<'windows' | 'mac' | 'linux', number | null>>;

interface Window {
  umami?: {
    track: (name: string, data?: Record<string, string>) => void;
    identify: (id: string, data?: Record<string, unknown>) => void;
  };
  __SHIGUANG_UMAMI_AUTO_TRACKING__?: boolean;
}
