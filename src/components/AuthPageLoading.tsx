import { AppAuthLayout } from './AppAuthLayout';

export function AuthPageLoading() {
  return <AppAuthLayout app={null}>
    <div role="status" aria-live="polite" aria-busy="true">
      <h2>正在加载页面</h2>
      <p className="app-auth-copy">请稍候…</p>
    </div>
  </AppAuthLayout>;
}
