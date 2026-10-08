import IconAIImageLevel2 from '@douyinfe/semi-icons/lib/es/icons/IconAIImageLevel2';
import IconArrowRight from '@douyinfe/semi-icons/lib/es/icons/IconArrowRight';
import IconChevronDown from '@douyinfe/semi-icons/lib/es/icons/IconChevronDown';
import IconPulse from '@douyinfe/semi-icons/lib/es/icons/IconPulse';
import IconVideo from '@douyinfe/semi-icons/lib/es/icons/IconVideo';
import IconBookOpenStroked from '@douyinfe/semi-icons/lib/es/icons/IconBookOpenStroked';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { HUIGUANG_WEB_URL, LINGGUANG_WEB_URL, POINTS_WEB_URL, SICHEN_LANDING_PATH, YINGGUANG_WEB_URL, ZHIXU_LANDING_PATH, ZHIJIE_LANDING_PATH } from '../config/productUrls';
import { SichenMark } from './SichenMark';
import { ZhijieMark } from './ZhijieMark';

interface Product {
  name: string;
  english: { name: string; category: string; description: string };
  category: string;
  description: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  tone: string;
  href?: string;
  external?: boolean;
  available?: boolean;
}

const products: Product[] = [
  {
    name: '织界',
    english: { name: 'Zhijie', category: 'Visual app builder', description: 'Connect design, components, and data to build real apps' },
    category: '可视化应用搭建',
    description: '连接设计、组件与数据，把想法织成可用的应用',
    icon: ZhijieMark,
    tone: 'violet',
    href: ZHIJIE_LANDING_PATH,
    available: true,
  },
  {
    name: '绘光',
    english: { name: 'Huiguang', category: 'AI image generation', description: 'Turn a prompt into high-quality visuals' },
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
    english: { name: 'Yingguang', category: 'AI video generation', description: 'Manage video tasks, finished assets, and operations' },
    category: 'AI 视频生成',
    description: '视频任务、成片资产与运营恢复',
    icon: IconVideo,
    tone: 'rose',
    href: YINGGUANG_WEB_URL,
    external: true,
    available: true,
  },
  {
    name: '灵光',
    english: { name: 'Lingguang', category: 'Skills marketplace', description: 'Discover, install, publish, and review Skills' },
    category: 'Skills 应用市场',
    description: '发现、安装、发布与审核 Skills',
    icon: IconPulse,
    tone: 'green',
    href: LINGGUANG_WEB_URL,
    external: true,
    available: true,
  },
  {
    name: '积分系统',
    english: { name: 'Points', category: 'Points platform', description: 'Connect apps, ledgers, reports, and security audits' },
    category: '积分能力中台',
    description: '接入应用、账本、报表与安全审计',
    icon: IconPulse,
    tone: 'gold',
    href: POINTS_WEB_URL,
    external: true,
    available: true,
  },
  {
    name: '司辰',
    english: { name: 'Sichen', category: 'Multi-agent collaboration', description: 'Coordinate agents to work together on complex tasks' },
    category: '多智能体协作',
    description: '组织多个 Agent 分工协作，推进复杂任务',
    icon: SichenMark,
    tone: 'violet',
    href: SICHEN_LANDING_PATH,
    available: true,
  },
  {
    name: '知序',
    english: { name: 'Zhixu', category: 'AI knowledge and creation', description: 'Bring documents, knowledge, and research together' },
    category: 'AI 知识与创作',
    description: '汇聚文档、知识与研究，让每次探索沉淀为可复用资产',
    icon: IconBookOpenStroked,
    tone: 'emerald',
    href: ZHIXU_LANDING_PATH,
    available: true,
  },
];

export function ProductMenu({ mobile = false, english = false }: { mobile?: boolean; english?: boolean }) {
  if (mobile) {
    return (
      <div className="mobile-products">
        <span className="mobile-products-label">{english ? 'Products' : '产品'}</span>
        {products.map((product) => (
          <ProductItem key={product.name} product={product} english={english} mobile />
        ))}
      </div>
    );
  }

  return (
    <div className="product-menu">
      <button className="product-menu-trigger" type="button" aria-haspopup="true">
        {english ? 'Products' : '产品'}
        <IconChevronDown size="small" aria-hidden="true" />
      </button>
      <div className="product-menu-panel" role="menu" aria-label={english ? 'Shiguang products' : '拾光产品'}>
        <div className="product-menu-heading">
          <div>
            <span>{english ? 'Shiguang products' : '拾光产品'}</span>
            <strong>{english ? 'AI tools for every kind of creation' : '让每一种创作，都有趁手的 AI'}</strong>
          </div>
        </div>
        <div className="product-menu-grid">
          {products.map((product) => (
            <ProductItem key={product.name} product={product} english={english} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductItem({ product, mobile = false, english = false }: { product: Product; mobile?: boolean; english?: boolean }) {
  const Icon = product.icon;
  const copy = english ? product.english : product;
  const content = (
    <>
      <span className={`product-menu-icon ${product.tone}`}><Icon aria-hidden /></span>
      <span className="product-menu-copy">
        <span className="product-menu-title">
          <strong>{copy.name}</strong>
          <small>{copy.category}</small>
        </span>
        {!mobile && <span className="product-menu-description">{copy.description}</span>}
      </span>
      {product.available
        ? <IconArrowRight className="product-menu-arrow" aria-hidden="true" />
        : <span className="product-menu-status">{english ? 'Coming soon' : '即将上线'}</span>}
    </>
  );

  if (product.href) {
    if (product.external) {
      return <a className="product-menu-item active" href={product.href} target="_blank" rel="noopener noreferrer" role={mobile ? undefined : 'menuitem'}>{content}</a>;
    }
    return <Link className="product-menu-item active" to={product.href} role={mobile ? undefined : 'menuitem'}>{content}</Link>;
  }

  return <div className="product-menu-item" role={mobile ? undefined : 'menuitem'} aria-disabled="true">{content}</div>;
}
