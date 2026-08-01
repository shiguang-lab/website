import IconAIImageLevel2 from '@douyinfe/semi-icons/lib/es/icons/IconAIImageLevel2';
import IconArrowRight from '@douyinfe/semi-icons/lib/es/icons/IconArrowRight';
import IconChevronDown from '@douyinfe/semi-icons/lib/es/icons/IconChevronDown';
import IconPlayCircle from '@douyinfe/semi-icons/lib/es/icons/IconPlayCircle';
import IconVideo from '@douyinfe/semi-icons/lib/es/icons/IconVideo';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { HUIGUANG_WEB_URL, SICHEN_LANDING_PATH } from '../config/productUrls';
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
    name: '跃影',
    category: 'AI 视频生成',
    description: '生成连贯、可控、富有表现力的动态影像',
    icon: IconVideo,
    tone: 'blue',
  },
  {
    name: '入戏',
    category: 'AI 短剧生成',
    description: '从剧本、角色到成片的一站式短剧创作',
    icon: IconPlayCircle,
    tone: 'rose',
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
