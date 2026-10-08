import { useState } from 'react';
import IconIdCard from '@douyinfe/semi-icons/lib/es/icons/IconIdCard';
import IconExternalOpen from '@douyinfe/semi-icons/lib/es/icons/IconExternalOpen';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { loginHref } from '../auth/loginRedirect';
import { SICHEN_LANDING_PATH, SICHEN_WEB_URL, CONSOLE_WEB_URL } from '../config/productUrls';
import { ProductMenu } from './ProductMenu';
import type { AuthUser } from '../auth/auth-context';

function accountDisplayName(user: AuthUser | null | undefined, english = false) {
  return user?.displayName || user?.preferredUsername || (english ? 'Shiguang user' : '拾光用户');
}

function accountSecondary(user: AuthUser | null | undefined, displayName: string, english = false) {
  const email = user?.email?.trim();
  const identityLabels = [displayName, user?.preferredUsername]
    .filter(Boolean)
    .map((value) => String(value).trim().toLocaleLowerCase());

  return email && !identityLabels.includes(email.toLocaleLowerCase())
    ? email
    : english ? 'Shiguang account' : '拾光账号';
}

function AccountMenu({ english }: { english: boolean }) {
  const { logout, user } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState('');
  const displayName = accountDisplayName(user, english);
  const secondary = accountSecondary(user, displayName, english);
  const initial = Array.from(displayName)[0]?.toUpperCase() || (english ? 'S' : '光');

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setMessage('');
    try {
      await logout();
    } catch {
      setMessage(english ? 'Could not sign out. Please try again.' : '退出失败，请稍后重试');
      setLoggingOut(false);
    }
  };

  return (
    <div className="header-account">
      <button className="header-account-trigger" type="button" aria-label={`${english ? 'Current account' : '当前账号'}: ${displayName}`}>
        <span className="header-account-avatar" aria-hidden="true">{initial}</span>
      </button>
      <div className="header-account-panel">
        <div className="header-account-identity">
          <span className="header-account-avatar large" aria-hidden="true">{initial}</span>
          <span><strong>{displayName}</strong><small>{secondary}</small></span>
        </div>
        <Link to="/portal">{english ? 'Workspace' : '统一工作台'} <IconExternalOpen aria-hidden="true" /></Link>
        <Link to="/account/profile">{english ? 'Account' : '账号中心'} <IconIdCard aria-hidden="true" /></Link>
        <a href={SICHEN_WEB_URL}>{english ? 'Open Sichen' : '进入司辰工作台'} <IconExternalOpen aria-hidden="true" /></a>
        <a href={CONSOLE_WEB_URL}>{english ? 'Console' : '进入控制台'} <IconExternalOpen aria-hidden="true" /></a>
        <button type="button" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? (english ? 'Signing out…' : '正在退出…') : (english ? 'Sign out' : '退出登录')}
        </button>
        {message && <p role="status">{message}</p>}
      </div>
    </div>
  );
}

export function SiteHeader({
  productPage = false,
  english = false,
}: {
  productPage?: boolean;
  english?: boolean;
}) {
  const prefix = productPage ? '/' : '';
  const location = useLocation();
  const { status, user, logout } = useAuth();
  const signInHref = loginHref(location);
  const displayName = accountDisplayName(user, english);
  const secondary = accountSecondary(user, displayName, english);

  return (
    <header className="site-header" data-header>
      <div className="container nav-wrap">
        <a className="brand" href="/" aria-label={english ? 'Shiguang home' : '拾光首页'}>
          <img className="brand-mark-image" src="/assets/微信图片_20260722101545_795_4.svg" alt="" aria-hidden="true" />
          <span className="brand-copy"><strong>拾光</strong><small>SHIGUANG</small></span>
        </a>
        <nav className="desktop-nav" aria-label={english ? 'Main navigation' : '主导航'}>
          <ProductMenu english={english} />
          <a href={`${prefix}#solutions`}>{english ? 'Solutions' : '解决方案'}</a>
          <a href={`${prefix}#pricing`}>{english ? 'Pricing' : '定价'}</a>
          <a href={`${prefix}#developers`}>{english ? 'Developers' : '开发者'}</a>
          <a href={`${prefix}#resources`}>{english ? 'Docs' : '文档'}</a>
          <a href={`${prefix}#about`}>{english ? 'About us' : '关于我们'}</a>
        </nav>
        <div className="header-actions">
          {status === 'loading' && <span className="header-auth-loading" aria-label={english ? 'Checking sign-in status' : '正在检查登录状态'} />}
          {status === 'authenticated' && user && <AccountMenu english={english} />}
          {status === 'anonymous' && <Link className="btn btn-ghost btn-sm" to={signInHref} data-umami-ignore>{english ? 'Sign in' : '登录'}</Link>}
          {productPage ? (
            <Link className="btn btn-primary btn-sm" to="/portal">{english ? 'Workspace' : '工作台'}</Link>
          ) : (
            <Link className="btn btn-primary btn-sm" to={SICHEN_LANDING_PATH}>{english ? 'Try for free' : '免费体验'}</Link>
          )}
          <button className="menu-button" type="button" aria-label={english ? 'Open menu' : '打开菜单'} aria-expanded="false" data-menu-button>
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className="mobile-panel" data-mobile-panel>
        <ProductMenu mobile english={english} />
        <a href={`${prefix}#solutions`}>{english ? 'Solutions' : '解决方案'}</a>
        <a href={`${prefix}#pricing`}>{english ? 'Pricing' : '定价'}</a>
        <a href={`${prefix}#developers`}>{english ? 'Developers' : '开发者'}</a>
        <a href={`${prefix}#resources`}>{english ? 'Docs' : '文档'}</a>
        {status === 'authenticated' && user ? (
          <div className="mobile-account">
            <span><b>{displayName}</b><small>{secondary}</small></span>
            <div className="mobile-account-actions">
              <Link to="/portal">{english ? 'Workspace' : '统一工作台'}</Link>
              <Link to="/account/profile">{english ? 'Account' : '账号中心'}</Link>
              <button type="button" onClick={() => logout().catch(() => undefined)}>{english ? 'Sign out' : '退出登录'}</button>
            </div>
          </div>
        ) : (
          <Link to={signInHref} data-umami-ignore>{english ? 'Sign in' : '登录'}</Link>
        )}
      </div>
    </header>
  );
}
