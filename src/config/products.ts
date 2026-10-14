import IconAIImageLevel2 from '@douyinfe/semi-icons/lib/es/icons/IconAIImageLevel2';
import IconVideo from '@douyinfe/semi-icons/lib/es/icons/IconVideo';
import IconPulse from '@douyinfe/semi-icons/lib/es/icons/IconPulse';
import IconCoinMoneyStroked from '@douyinfe/semi-icons/lib/es/icons/IconCoinMoneyStroked';
import type { ComponentType } from 'react';
import { HUIGUANG_WEB_URL, LINGGUANG_WEB_URL, POINTS_WEB_URL, SICHEN_LANDING_PATH, YINGGUANG_WEB_URL, ZHIXU_LANDING_PATH, ZHIJIE_LANDING_PATH } from './productUrls';
import { SichenMark } from '../components/SichenMark';
import { ZhijieMark } from '../components/ZhijieMark';
import { ZhixuMark } from '../components/ZhixuMark';

export interface Product {
  name: string;
  category: string;
  description: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  tone: string;
  href: string;
  external?: boolean;
  available?: boolean;
}

export const products: Product[] = [
  {
    name: '织界',
    category: '可视化应用搭建',
    description: '连接设计、组件与数据，把想法织成可用的应用',
    icon: ZhijieMark,
    tone: 'violet',
    href: ZHIJIE_LANDING_PATH,
    available: true,
  },
  {
    name: '司辰',
    category: '多智能体协作',
    description: '组织多个 Agent 分工协作，推进复杂任务',
    icon: SichenMark,
    tone: 'violet',
    href: SICHEN_LANDING_PATH,
    available: true,
  },
  {
    name: '知序',
    category: 'AI 知识与创作',
    description: '汇聚文档、知识与研究，让每次探索沉淀为可复用资产',
    icon: ZhixuMark,
    tone: 'emerald',
    href: ZHIXU_LANDING_PATH,
    available: true,
  },
  {
    name: '绘光',
    category: 'AI 图片生成',
    description: '从灵感到高质量视觉，一句话完成创作',
    icon: IconAIImageLevel2,
    tone: 'cyan',
    href: HUIGUANG_WEB_URL,
    external: true,
    available: true,
  },
  {
    name: '映光',
    category: 'AI 视频生成',
    description: '创建视频任务，集中管理成片与创作资产',
    icon: IconVideo,
    tone: 'rose',
    href: YINGGUANG_WEB_URL,
    external: true,
    available: true,
  },
  {
    name: '灵光',
    category: 'Skills 应用市场',
    description: '发现和安装 Skills，让 AI 拥有更多专业能力',
    icon: IconPulse,
    tone: 'green',
    href: LINGGUANG_WEB_URL,
    external: true,
    available: true,
  },
  {
    name: '积分系统',
    category: '积分能力中台',
    description: '管理个人积分、应用接入、账本与报表',
    icon: IconCoinMoneyStroked,
    tone: 'gold',
    href: POINTS_WEB_URL,
    external: true,
    available: true,
  },
];
