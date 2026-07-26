import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import './styles/semi.less';
import './styles/tailwind.less';
import './styles/home.less';
import './styles/sichen.less';
import './styles/login.less';
import './styles/account.less';
import { App } from './App';
import { AuthProvider } from './auth/AuthProvider';
import { SICHEN_LANDING_PATH } from './config/productUrls';

const homeMeta = {
  title: '拾光 · 让 AI 成为你的生产力',
  description: '拾光——为 AI 而生的全能平台，让灵感、知识与协作在同一处发生。',
};

const sichenMeta = {
  title: '司辰 · 多智能体协作平台 | 拾光',
  description: '司辰帮助个人与团队组织多个 AI Agent 分工协作，用技能、工作流和工具连接推进复杂任务。',
};

/** @param {string} url */
export function render(url) {
  const html = renderToString(
    <StaticRouter location={url}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StaticRouter>,
  );

  return { html, meta: url.startsWith(SICHEN_LANDING_PATH) ? sichenMeta : homeMeta };
}
