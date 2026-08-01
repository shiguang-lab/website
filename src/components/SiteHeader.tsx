import { useState } from 'react';
import IconIdCard from '@douyinfe/semi-icons/lib/es/icons/IconIdCard';
import IconExternalOpen from '@douyinfe/semi-icons/lib/es/icons/IconExternalOpen';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { loginHref } from '../auth/loginRedirect';
import { SICHEN_LANDING_PATH, SICHEN_WEB_URL } from '../config/productUrls';
import { ProductMenu } from './ProductMenu';
import type { AuthUser } from '../auth/auth-context';

function accountDisplayName(user: AuthUser | null | undefined) {
  return user?.displayName || user?.preferredUsername || '拾光用户';
}

function accountSecondary(user: AuthUser | null | undefined, displayName: string) {
  const email = user?.email?.trim();
  const identityLabels = [displayName, user?.preferredUsername]
    .filter(Boolean)
    .map((value) => String(value).trim().toLocaleLowerCase());

  return email && !identityLabels.includes(email.toLocaleLowerCase())
    ? email
    : '拾光账号';
}

function AccountMenu() {
  const { logout, user } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState('');
  const displayName = accountDisplayName(user);
  const secondary = accountSecondary(user, displayName);
  const initial = Array.from(displayName)[0]?.toUpperCase() || '光';

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setMessage('');
    try {
      await logout();
    } catch {
      setMessage('退出失败，请稍后重试');
      setLoggingOut(false);
    }
  };

  return (
    <div className="header-account">
      <button className="header-account-trigger" type="button" aria-label={`当前账号：${displayName}`}>
        <span className="header-account-avatar" aria-hidden="true">{initial}</span>
      </button>
      <div className="header-account-panel">
        <div className="header-account-identity">
          <span className="header-account-avatar large" aria-hidden="true">{initial}</span>
          <span><strong>{displayName}</strong><small>{secondary}</small></span>
        </div>
        <Link to="/account/profile">账号中心 <IconIdCard aria-hidden="true" /></Link>
        <a href={SICHEN_WEB_URL}>进入司辰工作台 <IconExternalOpen aria-hidden="true" /></a>
        <button type="button" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? '正在退出…' : '退出登录'}
        </button>
        {message && <p role="status">{message}</p>}
      </div>
    </div>
  );
}

export function SiteHeader({ productPage = false }: { productPage?: boolean }) {
  const prefix = productPage ? '/' : '';
  const location = useLocation();
  const { status, user, logout } = useAuth();
  const signInHref = loginHref(location);
  const displayName = accountDisplayName(user);
  const secondary = accountSecondary(user, displayName);

  return (
    <header className="site-header" data-header>
      <div className="container nav-wrap">
        <a className="brand" href="/" aria-label="拾光首页">
          <img className="brand-mark-image" src="/assets/微信图片_20260722101545_795_4.svg" alt="" aria-hidden="true" />
          <span className="brand-copy"><strong>拾光</strong><small>SHIGUANG</small></span>
        </a>
        <nav className="desktop-nav" aria-label="主导航">
          <ProductMenu />
          <a href={`${prefix}#solutions`}>解决方案</a>
          <a href={`${prefix}#pricing`}>定价</a>
          <a href={`${prefix}#developers`}>开发者</a>
          <a href={`${prefix}#resources`}>文档</a>
          <a href={`${prefix}#about`}>关于我们</a>
        </nav>
        <div className="header-actions">
          {status === 'loading' && <span className="header-auth-loading" aria-label="正在检查登录状态" />}
          {status === 'authenticated' && user && <AccountMenu />}
          {status === 'anonymous' && <Link className="btn btn-ghost btn-sm" to={signInHref} data-umami-ignore>登录</Link>}
          {productPage ? (
            <a className="btn btn-primary btn-sm" href={SICHEN_WEB_URL} target="_blank" rel="noopener noreferrer">免费体验</a>
          ) : (
            <Link className="btn btn-primary btn-sm" to={SICHEN_LANDING_PATH}>免费体验</Link>
          )}
          <button className="menu-button" type="button" aria-label="打开菜单" aria-expanded="false" data-menu-button>
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className="mobile-panel" data-mobile-panel>
        <ProductMenu mobile />
        <a href={`${prefix}#solutions`}>解决方案</a>
        <a href={`${prefix}#pricing`}>定价</a>
        <a href={`${prefix}#developers`}>开发者</a>
        <a href={`${prefix}#resources`}>文档</a>
        {status === 'authenticated' && user ? (
          <div className="mobile-account">
            <span><b>{displayName}</b><small>{secondary}</small></span>
            <div className="mobile-account-actions">
              <Link to="/account/profile">账号中心</Link>
              <button type="button" onClick={() => logout().catch(() => undefined)}>退出登录</button>
            </div>
          </div>
        ) : (
          <Link to={signInHref} data-umami-ignore>登录</Link>
        )}
      </div>
    </header>
  );
}
