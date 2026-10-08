import type { ReactNode } from 'react';
import type { RegisteredApp } from '../auth/appAuthorization';

export function AppAuthLayout({ app, children }: { app: RegisteredApp | null; children: ReactNode }) {
  return (
    <main className="login-page app-auth-page">
      <section className="login-story" aria-label="拾光品牌介绍">
        <div className="login-story-backdrop" aria-hidden="true" />
        <a className="login-brand" href="/" aria-label="返回拾光首页"><img src="/assets/微信图片_20260722101545_795_4.svg" alt="" /><span><strong>拾光</strong><small>SHIGUANG</small></span></a>
        <div className="login-story-content">
          <p className="login-story-eyebrow">SHIGUANG CONNECT</p>
          <h1>一次授权<br /><em>连接你的创作空间。</em></h1>
          <p className="login-story-copy">使用拾光统一账号，连接你信任的应用。<br />账号和密码始终只在拾光登录页中使用。</p>
          <div className="login-values"><span>安全可靠</span><span>统一账号</span><span>由你掌控</span></div>
        </div>
      </section>
      <section className="login-account app-auth-panel">
        <div className="login-account-inner">
          <div className="app-auth-identity">
            {app?.logo_url && <div className="app-auth-connection">
              <span className="app-auth-logo shiguang"><img src="/assets/微信图片_20260722101545_795_4.svg" alt="拾光" /></span>
              <span className="app-auth-connection-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-5-5 5 5-5 5" /></svg></span>
              <span className="app-auth-logo"><img src={app.logo_url} alt={`${app.name} Logo`} /></span>
            </div>}
            <span className="login-kicker">SHIGUANG CONNECT</span>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
