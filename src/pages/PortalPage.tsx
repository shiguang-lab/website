import { useMemoizedFn } from 'ahooks';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import IconAIImageLevel2 from '@douyinfe/semi-icons/lib/es/icons/IconAIImageLevel2';
import IconArrowRight from '@douyinfe/semi-icons/lib/es/icons/IconArrowRight';
import IconExternalOpen from '@douyinfe/semi-icons/lib/es/icons/IconExternalOpen';
import IconIdCard from '@douyinfe/semi-icons/lib/es/icons/IconIdCard';
import IconKey from '@douyinfe/semi-icons/lib/es/icons/IconKey';
import IconPulse from '@douyinfe/semi-icons/lib/es/icons/IconPulse';
import IconRefresh from '@douyinfe/semi-icons/lib/es/icons/IconRefresh';
import IconShield from '@douyinfe/semi-icons/lib/es/icons/IconShield';
import IconUserGroup from '@douyinfe/semi-icons/lib/es/icons/IconUserGroup';
import IconVideo from '@douyinfe/semi-icons/lib/es/icons/IconVideo';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginHref } from '../auth/loginRedirect';
import { useAuth } from '../auth/useAuth';
import { SiteHeader } from '../components/SiteHeader';
import { PageMeta } from '../components/PageMeta';
import {
  PORTAL_PRODUCTS,
  normalizeProductRoles,
  productRoles,
  type PortalProductDefinition,
  type PortalProductId,
} from '../portal/catalog';

interface PortalAccessItem {
  id: PortalProductId;
  status: 'active' | 'unassigned' | 'pending';
  roles: string[];
  source?: string;
}

interface PortalAccessResponse {
  products: PortalAccessItem[];
  revision?: string;
}

interface DirectoryUser {
  id: string;
  loginName: string;
  displayName: string;
  state: string;
  roles: string[];
}

interface ApiError extends Error {
  status: number;
  apiError?: string;
}

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

const productIcons = {
  huiguang: IconAIImageLevel2,
  yingguang: IconVideo,
  lingguang: IconPulse,
  points: IconKey,
};

const apiMessages: Record<string, string> = {
  iam_admin_forbidden: '当前账号没有管理产品授权的权限。',
  iam_role_not_manageable: '提交内容包含未开放的产品角色。',
  iam_role_change_unavailable: 'IAM 角色写入服务尚未配置，请联系平台运维。',
  iam_role_directory_unavailable: 'IAM 用户目录暂时不可用。',
  iam_self_role_change_forbidden: '管理员不能修改自己的高权限角色。',
  idempotency_conflict: '该操作标识已用于其他授权变更，请刷新后重试。',
};

async function requestJSON<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const value = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) {
    throw Object.assign(new Error(value.error || 'request_failed'), {
      status: response.status,
      apiError: value.error,
    } satisfies Partial<ApiError>);
  }
  return value;
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && 'apiError' in error) {
    const code = String((error as ApiError).apiError || '');
    return apiMessages[code] || fallback;
  }
  return fallback;
}

function displayName(user: { displayName?: string; preferredUsername?: string } | null) {
  return user?.displayName || user?.preferredUsername || '拾光用户';
}

function ProductMark({ product }: { product: PortalProductDefinition }) {
  const Icon = productIcons[product.id];
  return <span className={`portal-product-mark ${product.tone}`}><Icon aria-hidden="true" /></span>;
}

function ProductAccessRow({ product, access }: { product: PortalProductDefinition; access?: PortalAccessItem }) {
  const assignedRoles = productRoles(product, access?.roles);
  const active = access?.status === 'active';
  return (
    <article className="portal-product-row">
      <ProductMark product={product} />
      <div className="portal-product-copy">
        <span><strong>{product.name}</strong><small>{product.category}</small></span>
        <p>{product.description}</p>
      </div>
      <div className="portal-product-permission">
        <span className={`portal-access-status ${access?.status || 'unassigned'}`}>
          {active ? '已授权' : access?.status === 'pending' ? '待生效' : '未授权'}
        </span>
        <small>
          {assignedRoles.length > 0
            ? assignedRoles.map((role) => role.label).join(' · ')
            : product.basicAccess || '需要 IAM 管理员分配产品角色'}
        </small>
      </div>
      {active ? (
        <a className="portal-open-button" href={product.href} target="_blank" rel="noopener noreferrer">
          进入系统 <IconExternalOpen aria-hidden="true" />
        </a>
      ) : (
        <button className="portal-open-button disabled" type="button" disabled>尚未开放</button>
      )}
    </article>
  );
}

function PortalOverview({ access, status, error, reload }: {
  access: PortalAccessResponse | null;
  status: LoadStatus;
  error: string;
  reload: () => void;
}) {
  const accessByProduct = useMemo(
    () => new Map((access?.products || []).map((item) => [item.id, item])),
    [access],
  );
  const activeCount = access?.products.filter((item) => item.status === 'active').length || 0;

  return (
    <>
      <section className="portal-summary" aria-label="Portal 授权摘要">
        <div><span>可访问系统</span><strong>{status === 'ready' ? activeCount : '--'}</strong><small>共 {PORTAL_PRODUCTS.length} 个子系统</small></div>
        <div><span>身份状态</span><strong>{status === 'ready' ? '已验证' : '检查中'}</strong><small>拾光统一会话</small></div>
        <div><span>权限同步</span><strong>{access?.revision || '--'}</strong><small>IAM 权限版本</small></div>
      </section>

      <section className="portal-panel" aria-labelledby="portal-products-title">
        <div className="portal-panel-head">
          <div><h2 id="portal-products-title">我的系统</h2><p>每个系统独立运行，Portal 只负责统一身份和入口授权。</p></div>
          <button className="portal-icon-button" type="button" onClick={reload} disabled={status === 'loading'} aria-label="刷新授权" title="刷新授权"><IconRefresh /></button>
        </div>
        {status === 'loading' && <div className="portal-state"><span className="portal-spinner" />正在同步 IAM 授权…</div>}
        {status === 'error' && <div className="portal-state error"><IconShield /><div><strong>授权信息加载失败</strong><p>{error}</p></div><button type="button" onClick={reload}>重试</button></div>}
        {status === 'ready' && (
          <div className="portal-product-list">
            {PORTAL_PRODUCTS.map((product) => <ProductAccessRow key={product.id} product={product} access={accessByProduct.get(product.id)} />)}
          </div>
        )}
      </section>
    </>
  );
}

function AccessManagement() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DirectoryUser[]>([]);
  const [searchStatus, setSearchStatus] = useState<LoadStatus>('idle');
  const [selected, setSelected] = useState<DirectoryUser | null>(null);
  const [draftRoles, setDraftRoles] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const search = async (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (value.length < 3 || searchStatus === 'loading') return;
    setSearchStatus('loading');
    setMessage(null);
    setSelected(null);
    try {
      const response = await requestJSON<{ users: DirectoryUser[] }>('/api/auth/iam/product-role-assignments/search', {
        method: 'POST',
        body: JSON.stringify({ query: value, limit: 10 }),
      });
      setResults(response.users || []);
      setSearchStatus('ready');
    } catch (error) {
      setResults([]);
      setSearchStatus('error');
      setMessage({ type: 'error', text: errorMessage(error, '用户搜索失败，请稍后重试。') });
    }
  };

  const choose = (user: DirectoryUser) => {
    setSelected(user);
    setDraftRoles(normalizeProductRoles(user.roles || []));
    setMessage(null);
  };

  const toggleRole = (role: string) => {
    setDraftRoles((current) => current.includes(role)
      ? current.filter((item) => item !== role)
      : normalizeProductRoles([...current, role]));
  };

  const save = async () => {
    if (!selected || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      const result = await requestJSON<{ user: DirectoryUser; changed: boolean }>(
        `/api/auth/iam/product-role-assignments/${encodeURIComponent(selected.id)}`,
        {
          method: 'PUT',
          headers: { 'Idempotency-Key': crypto.randomUUID() },
          body: JSON.stringify({ roles: normalizeProductRoles(draftRoles) }),
        },
      );
      const updated = { ...selected, ...result.user, roles: normalizeProductRoles(result.user.roles || draftRoles) };
      setSelected(updated);
      setDraftRoles(updated.roles);
      setResults((items) => items.map((item) => item.id === updated.id ? updated : item));
      setMessage({ type: 'success', text: result.changed ? '产品授权已更新，新的会话断言将按 IAM 版本生效。' : '授权未发生变化。' });
      setConfirming(false);
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error, '授权更新失败，未确认的变更不会被当作成功。') });
    } finally {
      setSaving(false);
    }
  };

  const changed = Boolean(selected) && normalizeProductRoles(selected?.roles || []).join('|') !== normalizeProductRoles(draftRoles).join('|');

  return (
    <section className="portal-panel portal-access-panel" aria-labelledby="portal-access-title">
      <div className="portal-panel-head">
        <div><h2 id="portal-access-title">子系统授权管理</h2><p>仅分配 IAM 产品角色；组织成员和产品内资源权限由对应系统维护。</p></div>
        <span className="portal-admin-badge"><IconShield /> IAM 管理员</span>
      </div>

      <div className="portal-access-layout">
        <div className="portal-directory">
          <form className="portal-search" onSubmit={search}>
            <label htmlFor="portal-user-query">搜索用户</label>
            <div><input id="portal-user-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="登录名或显示名称，至少 3 个字符" /><button type="submit" disabled={query.trim().length < 3 || searchStatus === 'loading'}>搜索</button></div>
          </form>
          <div className="portal-user-results">
            {searchStatus === 'idle' && <p>搜索并选择一个 ACTIVE 用户后配置产品角色。</p>}
            {searchStatus === 'loading' && <p>正在查询 IAM 用户目录…</p>}
            {searchStatus === 'ready' && results.length === 0 && <p>没有找到匹配的可授权用户。</p>}
            {results.map((user) => (
              <button key={user.id} type="button" className={selected?.id === user.id ? 'active' : ''} onClick={() => choose(user)}>
                <span><strong>{user.displayName || user.loginName}</strong><small>{user.loginName}</small></span>
                <em>{user.state === 'ACTIVE' ? '正常' : user.state}</em>
              </button>
            ))}
          </div>
        </div>

        <div className="portal-role-editor">
          {!selected && <div className="portal-role-placeholder"><IconUserGroup /><strong>等待选择用户</strong><p>授权变更必须绑定到 IAM 中的精确用户 ID。</p></div>}
          {selected && (
            <>
              <div className="portal-role-target"><span><strong>{selected.displayName || selected.loginName}</strong><small>{selected.loginName}</small></span><code>{selected.id}</code></div>
              <div className="portal-role-products">
                {PORTAL_PRODUCTS.map((product) => (
                  <section key={product.id}>
                    <div className="portal-role-product-head"><ProductMark product={product} /><span><strong>{product.name}</strong><small>{product.basicAccess || product.category}</small></span></div>
                    <div className="portal-role-options">
                      {product.roles.map((role) => (
                        <label key={role.id} className={draftRoles.includes(role.id) ? 'checked' : ''}>
                          <input type="checkbox" checked={draftRoles.includes(role.id)} onChange={() => toggleRole(role.id)} />
                          <span><strong>{role.label}</strong><small>{role.description}</small></span>
                          {role.risk === 'elevated' && <em>高权限</em>}
                        </label>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
              <div className="portal-role-actions">
                <span>{draftRoles.length} 个产品角色</span>
                <button type="button" disabled={!changed || saving} onClick={() => setConfirming(true)}>审核并保存</button>
              </div>
            </>
          )}
        </div>
      </div>
      {message && <p className={`portal-feedback ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</p>}

      {confirming && selected && (
        <div className="portal-modal-backdrop" role="presentation">
          <section className="portal-modal" role="dialog" aria-modal="true" aria-labelledby="portal-confirm-title">
            <div><span>授权变更确认</span><h3 id="portal-confirm-title">确认修改 {selected.displayName || selected.loginName} 的产品角色</h3><p>提交后 Auth Service 将重新校验用户状态、角色白名单和幂等键。</p></div>
            <dl><div><dt>当前角色</dt><dd>{normalizeProductRoles(selected.roles || []).join('、') || '无'}</dd></div><div><dt>目标角色</dt><dd>{normalizeProductRoles(draftRoles).join('、') || '无'}</dd></div></dl>
            <footer><button type="button" onClick={() => setConfirming(false)} disabled={saving}>取消</button><button className="primary" type="button" onClick={save} disabled={saving}>{saving ? '提交中…' : '确认修改'}</button></footer>
          </section>
        </div>
      )}
    </section>
  );
}

export function PortalPage() {
  const { status: authStatus, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const requested = location.pathname.split('/')[2];
  const canManage = Boolean(user?.iamCapabilities?.productRoleAssignments?.read);
  const section = requested === 'access' && canManage ? 'access' : 'overview';
  const [access, setAccess] = useState<PortalAccessResponse | null>(null);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [error, setError] = useState('');

  const load = useMemoizedFn(async () => {
    if (authStatus !== 'authenticated') return;
    setStatus('loading');
    setError('');
    try {
      setAccess(await requestJSON<PortalAccessResponse>('/api/auth/portal/access'));
      setStatus('ready');
    } catch (loadError) {
      setStatus('error');
      setError(errorMessage(loadError, 'Portal 授权聚合服务暂时不可用。'));
    }
  });

  useEffect(() => { load(); }, [authStatus, load]);
  useEffect(() => {
    if (requested === 'access' && authStatus === 'authenticated' && !canManage) navigate('/portal', { replace: true });
  }, [authStatus, canManage, navigate, requested]);

  if (authStatus === 'loading') return <><PageMeta title="统一工作台 · 拾光" description="从拾光 Portal 进入已授权的产品系统。" /><div className="portal-auth-state"><span className="portal-spinner" />正在确认拾光统一登录…</div></>;
  if (authStatus === 'anonymous') {
    return (
      <div className="portal-page">
        <PageMeta title="统一工作台 · 拾光" description="从拾光 Portal 进入已授权的产品系统。" />
        <SiteHeader productPage />
        <main className="portal-login-required"><IconShield /><h1>登录后进入拾光 Portal</h1><p>统一登录后查看可访问的子系统和当前 IAM 授权。</p><Link to={loginHref(location)}>统一登录 <IconArrowRight /></Link></main>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <PageMeta title="统一工作台 · 拾光" description="查看绘光、映光、灵光和积分系统的统一身份授权与入口。" />
      <SiteHeader productPage />
      <main className="portal-layout">
        <aside className="portal-sidebar" aria-label="Portal 导航">
          <div className="portal-sidebar-title"><span>P</span><div><strong>拾光 Portal</strong><small>统一工作台</small></div></div>
          <nav>
            <Link className={section === 'overview' ? 'active' : ''} to="/portal"><IconPulse /><span><strong>工作台</strong><small>系统入口与授权状态</small></span><IconArrowRight className="portal-nav-arrow" /></Link>
            {canManage && <Link className={section === 'access' ? 'active' : ''} to="/portal/access"><IconShield /><span><strong>授权管理</strong><small>分配子系统 IAM 角色</small></span><IconArrowRight className="portal-nav-arrow" /></Link>}
            <Link to="/account/profile"><IconIdCard /><span><strong>账号中心</strong><small>资料、登录与组织</small></span><IconArrowRight className="portal-nav-arrow" /></Link>
          </nav>
          <div className="portal-sidebar-identity"><span>{Array.from(displayName(user))[0]}</span><div><strong>{displayName(user)}</strong><small>{canManage ? 'IAM 管理员' : '拾光用户'}</small></div></div>
        </aside>

        <div className="portal-content">
          <header className="portal-content-head"><span>SHIGUANG PORTAL</span><h1>{section === 'access' ? '授权管理' : `你好，${displayName(user)}`}</h1><p>{section === 'access' ? '集中管理产品入口角色，不介入各系统内部资源授权。' : '从一个入口进入你的拾光产品，权限始终以 IAM 实时结果为准。'}</p></header>
          {section === 'overview' ? <PortalOverview access={access} status={status} error={error} reload={load} /> : <AccessManagement />}
        </div>
      </main>
    </div>
  );
}
