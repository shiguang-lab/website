import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AppAuthLayout } from '../components/AppAuthLayout';
import { readAppResponse, type RegisteredApp } from '../auth/appAuthorization';

interface AuthorizationContext {
  app: RegisteredApp;
  display_name: string;
  scopes: { scope: string; description: string }[];
}

export function AppAuthorizationPage() {
  const { clientId } = useParams();
  const [query] = useSearchParams();
  const request = query.get('request') || '';
  const [context, setContext] = useState<AuthorizationContext | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    void fetch(`/oauth/app/context?${new URLSearchParams({ request })}`, { credentials: 'include', signal: controller.signal })
      .then(readAppResponse<AuthorizationContext>)
      .then(value => {
        if (value.app.client_id !== clientId) throw new Error('Wrong app');
        setContext(value);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        const loginUrl = (cause as { loginUrl?: string })?.loginUrl;
        if (loginUrl) { window.location.replace(loginUrl); return; }
        setError('授权请求已失效或登录账号已变更，请返回应用重新登录。');
      });
    return () => controller.abort();
  }, [clientId, request]);

  const message = error || (!request ? '缺少授权请求，请从应用重新发起登录。' : '');
  return <AppAuthLayout app={context?.app || null}>
    {message ? <><h2>无法完成授权</h2><p className="app-auth-copy" role="alert">{message}</p><a className="app-auth-secondary" href="/">返回拾光首页</a></>
      : context ? <>
        <h2>授权登录</h2>
        <p className="app-auth-copy">允许 {context.app.name} 使用你的拾光账号？</p>
        <div className="app-auth-account"><span aria-hidden="true">✓</span><div><small>当前拾光账号</small><strong>{context.display_name || '已登录拾光账号'}</strong></div></div>
        <p className="app-auth-permissions-title">允许后，{context.app.name} 可以：</p>
        <ul className="oauth-device-scopes" aria-label="应用请求的权限">{context.scopes.map(scope => <li key={scope.scope}><span aria-hidden="true">✓</span><strong>{scope.description}</strong></li>)}</ul>
        <form method="post" action="/oauth/authorize">
          <input type="hidden" name="consent_id" value={request} />
          <div className="oauth-device-actions"><button type="submit" name="decision" value="deny">取消</button><button className="login-submit" type="submit" name="decision" value="allow">允许并继续</button></div>
        </form>
        <p className="app-auth-hint">仅在你允许后连接应用。<br />请确认这是你刚刚发起的登录请求。</p>
      </> : <><h2>正在验证授权请求</h2><p className="app-auth-copy">请稍候…</p></>}
  </AppAuthLayout>;
}
