import { useEffect, useRef, useState } from 'react';
import IconArrowRight from '@douyinfe/semi-icons/lib/es/icons/IconArrowRight';
import IconChevronDown from '@douyinfe/semi-icons/lib/es/icons/IconChevronDown';
import { Link } from 'react-router-dom';
import { products, type Product } from '../config/products';

export function ProductMenu({ mobile = false }: { mobile?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  useEffect(() => () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
  }, []);

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
    <div
      className="product-menu"
      data-hovered={hovered}
      onMouseEnter={() => {
        cancelClose();
        setHovered(true);
      }}
      onMouseLeave={() => {
        cancelClose();
        closeTimer.current = setTimeout(() => {
          setHovered(false);
          closeTimer.current = null;
        }, 300);
      }}
    >
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
