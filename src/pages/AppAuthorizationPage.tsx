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
        <p className="app-auth-copy">使用拾光账号登录 <strong>{context.app.name}</strong></p>
        <div className="app-auth-account"><span className="app-auth-avatar" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" /><path d="M5 20v-2a7 7 0 0 1 14 0v2" /></svg></span><div><small>当前登录账号</small><strong>{context.display_name || '已登录拾光账号'}</strong></div><span className="app-auth-account-status">已登录</span></div>
        <div className="app-auth-permissions">
          <p className="app-auth-permissions-title">允许此应用</p>
          <ul className="app-auth-scopes" aria-label="应用请求的权限">{context.scopes.map(scope => <li key={scope.scope}><span aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><path d="m4 10 4 4 8-8" /></svg></span><strong>{scope.description}</strong></li>)}</ul>
        </div>
        <form method="post" action="/oauth/authorize">
          <input type="hidden" name="consent_id" value={request} />
          <div className="app-auth-actions"><button type="submit" name="decision" value="deny">取消</button><button className="login-submit" type="submit" name="decision" value="allow">允许并继续</button></div>
        </form>
        <p className="app-auth-hint">仅授权你信任的应用。<br />确认后将返回应用，完成登录。</p>
      </> : <><h2>正在验证授权请求</h2><p className="app-auth-copy">请稍候…</p></>}
  </AppAuthLayout>;
}
