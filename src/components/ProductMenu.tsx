import IconAIImageLevel2 from '@douyinfe/semi-icons/lib/es/icons/IconAIImageLevel2';
import IconArrowRight from '@douyinfe/semi-icons/lib/es/icons/IconArrowRight';
import IconChevronDown from '@douyinfe/semi-icons/lib/es/icons/IconChevronDown';
import IconPulse from '@douyinfe/semi-icons/lib/es/icons/IconPulse';
import IconVideo from '@douyinfe/semi-icons/lib/es/icons/IconVideo';
import IconBookOpenStroked from '@douyinfe/semi-icons/lib/es/icons/IconBookOpenStroked';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { HUIGUANG_WEB_URL, LINGGUANG_WEB_URL, POINTS_WEB_URL, SICHEN_LANDING_PATH, YINGGUANG_WEB_URL, ZHIXU_LANDING_PATH } from '../config/productUrls';
import { SichenMark } from './SichenMark';

interface Product {
  name: string;
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
    description: '视频任务、成片资产与运营恢复',
    icon: IconVideo,
    tone: 'rose',
    href: YINGGUANG_WEB_URL,
    external: true,
    available: true,
  },
  {
    name: '灵光',
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
    icon: IconBookOpenStroked,
    tone: 'emerald',
    href: ZHIXU_LANDING_PATH,
    available: true,
  },
];

export function ProductMenu({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="mobile-products">
        <span className="mobile-products-label">产品</span>
        {products.map((product) => (
          <ProductItem key={product.name} product={product} mobile />
        ))}
      </div>
    );
  }

  return (
    <div className="product-menu">
      <button className="product-menu-trigger" type="button" aria-haspopup="true">
        产品
        <IconChevronDown size="small" aria-hidden="true" />
      </button>
      <div className="product-menu-panel" role="menu" aria-label="拾光产品">
        <div className="product-menu-heading">
          <div>
            <span>拾光产品</span>
            <strong>让每一种创作，都有趁手的 AI</strong>
          </div>
        </div>
        <div className="product-menu-grid">
          {products.map((product) => (
            <ProductItem key={product.name} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductItem({ product, mobile = false }: { product: Product; mobile?: boolean }) {
  const Icon = product.icon;
  const content = (
    <>
      <span className={`product-menu-icon ${product.tone}`}><Icon aria-hidden /></span>
      <span className="product-menu-copy">
        <span className="product-menu-title">
          <strong>{product.name}</strong>
          <small>{product.category}</small>
        </span>
        {!mobile && <span className="product-menu-description">{product.description}</span>}
      </span>
      {product.available
        ? <IconArrowRight className="product-menu-arrow" aria-hidden="true" />
        : <span className="product-menu-status">即将上线</span>}
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
