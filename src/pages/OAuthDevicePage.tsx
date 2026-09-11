import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

interface DeviceScope { scope: string; description: string }
interface DeviceContext { user_code: string; client_name: string; scopes: DeviceScope[] }
type PageState = 'loading' | 'ready' | 'submitting' | 'approved' | 'denied' | 'error';

async function readResponse<T>(response: Response): Promise<T> {
  const value = await response.json().catch(() => ({})) as T & { error?: string; login_url?: string };
  if (!response.ok) throw Object.assign(new Error(value.error || 'request_failed'), { status: response.status, loginUrl: value.login_url });
  return value;
}

export function OAuthDevicePage() {
  const { status } = useAuth();
  const [query] = useSearchParams();
  const userCode = query.get('user_code') || '';
  const [context, setContext] = useState<DeviceContext | null>(null);
  const [pageState, setPageState] = useState<PageState>(userCode ? 'loading' : 'error');
  const [message, setMessage] = useState(userCode ? '' : '缺少设备验证码，请返回发起连接的应用重新打开授权页面。');

  useEffect(() => {
    if (!userCode) return;
    if (status === 'loading') return;
    const returnTo = `/oauth/device?${new URLSearchParams({ user_code: userCode }).toString()}`;
    if (status === 'anonymous') {
      window.location.replace(`/login?${new URLSearchParams({ return_to: returnTo }).toString()}`);
      return;
    }
    const controller = new AbortController();
    fetch(`/oauth/device/context?${new URLSearchParams({ user_code: userCode }).toString()}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then((response) => readResponse<DeviceContext>(response))
      .then((value) => { setContext(value); setPageState('ready'); })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        const loginUrl = (error as { loginUrl?: unknown })?.loginUrl;
        if (typeof loginUrl === 'string' && loginUrl) { window.location.replace(loginUrl); return; }
        setMessage('设备验证码无效或已过期，请返回发起连接的应用重新尝试。');
        setPageState('error');
      });
    return () => controller.abort();
  }, [status, userCode]);

  const decide = async (decision: 'allow' | 'deny') => {
    setPageState('submitting');
    try {
      const response = await fetch('/oauth/device/decision', {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ user_code: userCode, decision }).toString(),
      });
      await readResponse<{ status: string }>(response);
      setPageState(decision === 'allow' ? 'approved' : 'denied');
    } catch {
      setMessage('授权请求已失效，请返回发起连接的应用重新尝试。');
      setPageState('error');
    }
  };

  const complete = pageState === 'approved' || pageState === 'denied';
  return (
    <main className="login-page oauth-device-page">
      <section className="login-story" aria-hidden="true">
        <div className="login-story-backdrop" />
        <a className="login-brand" href="/"><img src="/assets/微信图片_20260722101545_795_4.svg" alt="" /><span><strong>拾光</strong><small>SHIGUANG</small></span></a>
        <div className="login-story-content"><p className="login-story-eyebrow">SHIGUANG CONNECT</p><h1>一次授权<br /><em>连接你的创作空间。</em></h1><p className="login-story-copy">账号和密码始终只在拾光登录页中使用。</p></div>
      </section>
      <section className="login-account oauth-device-panel">
        <div className="login-account-inner">
          <p className="login-account-eyebrow">APP AUTHORIZATION</p>
          {pageState === 'loading' && <><h1>正在验证连接请求</h1><p className="oauth-device-copy">请稍候…</p></>}
          {pageState === 'error' && <><div className="auth-callback-icon error">!</div><h1>无法完成连接</h1><p className="oauth-device-copy">{message}</p></>}
          {complete && <><div className={`auth-callback-icon ${pageState === 'approved' ? 'success' : 'error'}`}>{pageState === 'approved' ? '✓' : '×'}</div><h1>{pageState === 'approved' ? '连接成功' : '已拒绝连接'}</h1><p className="oauth-device-copy">可以关闭此页面并返回应用。</p></>}
          {(pageState === 'ready' || pageState === 'submitting') && context && <>
            <h1>{context.client_name} 请求连接</h1>
            <p className="oauth-device-copy">请确认发起连接的应用中显示相同验证码。</p>
            <div className="oauth-device-code">{context.user_code}</div>
            <ul className="oauth-device-scopes">{context.scopes.map((item) => <li key={item.scope}><span>✓</span><div><strong>{item.description}</strong><small>{item.scope}</small></div></li>)}</ul>
            <div className="oauth-device-actions"><button type="button" disabled={pageState === 'submitting'} onClick={() => void decide('deny')}>拒绝</button><button className="login-submit" type="button" disabled={pageState === 'submitting'} onClick={() => void decide('allow')}>{pageState === 'submitting' ? '正在处理…' : '确认连接'}</button></div>
          </>}
        </div>
      </section>
    </main>
  );
}
