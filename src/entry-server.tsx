import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import './styles/semi.less';
import './styles/tailwind.less';
import './styles/home.less';
import './styles/sichen.less';
import './styles/zhixu.less';
import './styles/login.less';
import './styles/legal.less';
import './styles/account.less';
import { App } from './App';
import { AuthProvider } from './auth/AuthProvider';
import { SICHEN_LANDING_PATH, ZHIXU_LANDING_PATH } from './config/productUrls';

const homeMeta = {
  title: '拾光 · 让 AI 成为你的生产力',
  description: '拾光——为 AI 而生的全能平台，让灵感、知识与协作在同一处发生。',
};

const sichenMeta = {
  title: '司辰 · 多智能体协作平台 | 拾光',
  description: '司辰帮助个人与团队组织多个 AI Agent 分工协作，用技能、工作流和工具连接推进复杂任务。',
};

const zhixuMeta = {
  title: '知序 · AI 知识与创作空间 | 拾光',
  description: '知序把文档、知识库、深度调研、任务与在线演示放进同一个 AI 工作空间，让每次探索都沉淀为可复用成果。',
};

interface PageMetadata {
  title: string;
  description: string;
}

const routeMeta: Record<string, PageMetadata> = {
  '/terms': {
    title: '拾光用户协议',
    description: '拾光统一账号及 AI 助手、知识库、工作流、应用、插件与团队服务的使用规则。',
  },
  '/privacy': {
    title: '拾光隐私政策',
    description: '了解拾光如何收集、使用、存储、共享和保护您的个人信息，以及您如何行使相关权利。',
  },
  '/login-help': {
    title: '无法登录 · 拾光',
    description: '拾光账号登录、密码、第三方登录与企业 SSO 问题处理指引。',
  },
};

export function render(url: string) {
  const html = renderToString(
    <StaticRouter location={url}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StaticRouter>,
  );

  const pathname = url.split('?')[0];
  const meta = routeMeta[pathname]
    || (pathname.startsWith(SICHEN_LANDING_PATH) ? sichenMeta : null)
    || (pathname.startsWith(ZHIXU_LANDING_PATH) ? zhixuMeta : homeMeta);
  return { html, meta };
}
