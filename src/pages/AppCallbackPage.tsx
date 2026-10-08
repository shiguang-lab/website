import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppAuthLayout } from '../components/AppAuthLayout';
import { appCallbackLink, readAppCallback, readAppResponse, type RegisteredApp } from '../auth/appAuthorization';

export function AppCallbackPage() {
  const { clientId } = useParams();
  const [callback] = useState(() => readAppCallback(typeof window === 'undefined' ? '' : window.location.search));
  const [app, setApp] = useState<RegisteredApp | null>(null);
  const [failed, setFailed] = useState(false);
  const opened = useRef(false);
  // Remove the single-use code before page analytics run or links are followed.
  useLayoutEffect(() => { window.history.replaceState(null, '', window.location.pathname); }, []);
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/oauth/app?${new URLSearchParams({ client_id: clientId || '' })}`, { signal: controller.signal })
      .then(readAppResponse<RegisteredApp>)
      .then(value => {
        if (value.client_id !== clientId || (callback && !appCallbackLink(value, callback))) throw new Error('Unknown app callback');
        setApp(value);
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [clientId, callback]);
  const target = app && callback ? appCallbackLink(app, callback) : null;
  useEffect(() => {
    if (target && !opened.current) {
      opened.current = true;
      window.location.assign(target);
    }
  }, [target]);
  const invalid = !callback || failed;
  const denied = callback?.error === 'access_denied';
  return <AppAuthLayout app={app}>
    {invalid ? <><h2>登录请求已失效</h2><p className="app-auth-copy" role="alert">请返回应用，重新发起拾光登录。</p><a className="app-auth-secondary" href="/">返回拾光首页</a></>
      : !app ? <><h2>正在连接应用</h2><p className="app-auth-copy">请稍候…</p></>
        : <>
          <div className={`app-auth-status ${denied ? 'cancelled' : 'approved'}`} role="status">{denied ? '已取消授权' : '授权已确认'}</div>
          <h2>{denied ? '返回应用' : '在 App 中完成登录'}</h2>
          <p className="app-auth-copy">{denied ? `你已取消向 ${app.name} 授权。` : `请允许浏览器打开 ${app.name}，在应用中完成登录。`}</p>
          {target && <a className="login-submit app-auth-open" href={target}>打开 {app.name}</a>}
          <p className="app-auth-hint">浏览器会自动请求打开应用。<br />如果没有弹出提示，请点击上方按钮。<br />返回应用后，可以关闭此页面。</p>
        </>}
  </AppAuthLayout>;
}
