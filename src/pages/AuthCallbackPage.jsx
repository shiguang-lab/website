import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const query = useMemo(
    () => new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search),
    [],
  );
  const status = query.get('status') === 'success' ? 'success' : 'error';
  const target = query.get('return_to');
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let active = true;
    refresh().catch(() => undefined).finally(() => {
      if (!active) return;
      setSettled(true);
      if (status === 'success' && target && target.startsWith('/') && !target.startsWith('//')) {
        const timer = window.setTimeout(() => navigate(target, { replace: true }), 700);
        return () => window.clearTimeout(timer);
      }
      return undefined;
    });
    return () => {
      active = false;
    };
  }, [navigate, refresh, status, target]);

  return (
    <main className="login-page auth-callback-page">
      <section className="login-story" aria-hidden="true">
        <div className="login-story-backdrop" />
        <a className="login-brand" href="/">
          <img src="/assets/微信图片_20260722101545_795_4.svg" alt="" />
          <span><strong>拾光</strong><small>SHIGUANG</small></span>
        </a>
        <div className="login-story-content">
          <p className="login-story-eyebrow">SHIGUANG ACCOUNT</p>
          <h1>让每次登录<br /><em>都回到拾光。</em></h1>
          <p className="login-story-copy">统一身份，连接你的工作与创作。</p>
        </div>
      </section>
      <section className="login-account auth-callback-panel">
        <div className="login-account-inner">
          <div className={`auth-callback-icon ${status}`} aria-hidden="true">{status === 'success' ? '✓' : '!'}</div>
          <p className="login-account-eyebrow">SHIGUANG</p>
          <h1>{status === 'success' ? '登录成功' : '登录未完成'}</h1>
          <p className="auth-callback-message">
            {status === 'success' ? '正在为你打开拾光。' : '第三方登录没有完成，请返回登录页重试。'}
          </p>
          {status === 'error' && <Link className="login-submit" to="/login">返回登录</Link>}
          {status === 'success' && !settled && <span className="auth-callback-loading">正在同步账号信息…</span>}
        </div>
      </section>
    </main>
  );
}
