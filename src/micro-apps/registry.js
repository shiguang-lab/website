const env = import.meta.env;

/** @typedef {{ name: string, title: string, url?: string }} MicroApp */

/** @type {Record<string, MicroApp>} */
export const microApps = {
  huiguang: {
    name: 'shiguang-huiguang',
    title: '绘光',
    url: env.VITE_APP_HUIGUANG_URL || 'https://huiguang.shiguanglab.com',
  },
  sichen: {
    name: 'shiguang-sichen',
    title: '司辰',
    url: env.VITE_APP_SICHEN_URL,
  },
  chat: {
    name: 'shiguang-chat',
    title: '智能助手',
    url: env.VITE_APP_CHAT_URL,
  },
  knowledge: {
    name: 'shiguang-knowledge',
    title: '知识库',
    url: env.VITE_APP_KNOWLEDGE_URL,
  },
  workflow: {
    name: 'shiguang-workflow',
    title: '工作流',
    url: env.VITE_APP_WORKFLOW_URL,
  },
  market: {
    name: 'shiguang-market',
    title: '应用广场',
    url: env.VITE_APP_MARKET_URL,
  },
  team: {
    name: 'shiguang-team',
    title: '团队空间',
    url: env.VITE_APP_TEAM_URL,
  },
};

/** @param {string} appId */
export function getMicroApp(appId) {
  return microApps[appId];
}
