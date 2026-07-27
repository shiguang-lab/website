import { useCallback, useEffect, useMemo, useState } from 'react';
import IconChevronRight from '@douyinfe/semi-icons/lib/es/icons/IconChevronRight';
import IconIdCard from '@douyinfe/semi-icons/lib/es/icons/IconIdCard';
import IconKey from '@douyinfe/semi-icons/lib/es/icons/IconKey';
import IconUserGroup from '@douyinfe/semi-icons/lib/es/icons/IconUserGroup';
import { Link, useLocation } from 'react-router-dom';
import { loginHref } from '../auth/loginRedirect';
import { AuthProviderIcon } from '../components/AuthProviderIcons';
import { SiteHeader } from '../components/SiteHeader';
import { useHomeEffects } from '../hooks/useHomeEffects';

/** @typedef {{ id: string, name: string, roles: string[] }} Organization */
/** @typedef {{ userId: string, displayName?: string, loginName?: string, roles: string[] }} OrgMember */

/** @type {Record<string, string>} */
const roleLabels = {
  'org:admin': '管理员',
  'org:member': '成员',
  'org:viewer': '只读',
};

const assignableRoles = ['org:admin', 'org:member', 'org:viewer'];
const externalProviders = [
  { id: 'github', label: 'GitHub' },
  { id: 'google', label: 'Google' },
];

const accountSections = [
  {
    id: 'profile',
    label: '个人资料',
    description: '查看账号身份信息',
    icon: IconIdCard,
  },
  {
    id: 'security',
    label: '登录与安全',
    description: '管理登录账号关联',
    icon: IconKey,
  },
  {
    id: 'organizations',
    label: '组织与成员',
    description: '管理组织角色权限',
    icon: IconUserGroup,
  },
];

/** @param {string[] | undefined} roles */
function roleText(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return '成员';
  return roles.map((role) => roleLabels[role] || role).join(' · ');
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  window.location.assign(loginHref(window.location));
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: string }=} options
 */
async function requestJSON(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body,
  });
  if (response.status === 401) {
    redirectToLogin();
    throw Object.assign(new Error('unauthorized'), { status: 401 });
  }
  if (response.status === 204) return null;
  const value = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(value.error || 'request_failed'), {
      status: response.status,
      error: value.error,
    });
  }
  return value;
}

/** @param {unknown} error @param {number} status */
function isStatus(error, status) {
  return error instanceof Error && 'status' in error && error.status === status;
}

/** @param {unknown} error */
function isLastAdmin(error) {
  return isStatus(error, 409) && /** @type {{ error?: string }} */ (error).error === 'last_admin';
}

export function AccountPage() {
  useHomeEffects();
  const location = useLocation();
  const requestedSection = location.pathname.split('/')[2];
  const activeSection = accountSections.some((item) => item.id === requestedSection)
    ? requestedSection
    : 'profile';
  const sectionMeta = accountSections.find((item) => item.id === activeSection) || accountSections[0];
  const [session, setSession] = useState(/** @type {Record<string, any> | null} */ (null));
  const [sessionStatus, setSessionStatus] = useState('loading');

  const [orgs, setOrgs] = useState(/** @type {Organization[]} */ ([]));
  const [orgsStatus, setOrgsStatus] = useState('loading');

  const [createName, setCreateName] = useState('');
  const [createStatus, setCreateStatus] = useState('idle');
  const [createMessage, setCreateMessage] = useState(/** @type {{ type: 'error' | 'success', text: string } | null} */ (null));

  const [selectedOrgId, setSelectedOrgId] = useState(/** @type {string | null} */ (null));
  const [members, setMembers] = useState(/** @type {OrgMember[]} */ ([]));
  const [membersStatus, setMembersStatus] = useState('idle');
  const [memberMessage, setMemberMessage] = useState(/** @type {{ type: 'error' | 'success', text: string } | null} */ (null));
  const [busyMemberId, setBusyMemberId] = useState(/** @type {string | null} */ (null));

  const [inviteLoginName, setInviteLoginName] = useState('');
  const [inviteRole, setInviteRole] = useState('org:member');
  const [inviteStatus, setInviteStatus] = useState('idle');
  const [inviteMessage, setInviteMessage] = useState(/** @type {{ type: 'error' | 'success', text: string } | null} */ (null));

  const [idpLinks, setIdpLinks] = useState(/** @type {{ provider: string, userName?: string, userId?: string }[]} */ ([]));
  const [idpStatus, setIdpStatus] = useState('loading');
  const [idpMessage, setIdpMessage] = useState(/** @type {{ type: 'error' | 'success', text: string } | null} */ (null));
  const [busyProvider, setBusyProvider] = useState(/** @type {string | null} */ (null));

  const selectedOrg = useMemo(
    () => orgs.find((org) => org.id === selectedOrgId) || null,
    [orgs, selectedOrgId],
  );
  const isAdmin = Boolean(selectedOrg && selectedOrg.roles.includes('org:admin'));

  useEffect(() => {
    let active = true;
    requestJSON('/api/auth/session')
      .then((value) => {
        if (!active) return;
        setSession(value);
        setSessionStatus('ready');
      })
      .catch((error) => {
        if (!active || isStatus(error, 401)) return;
        setSessionStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const loadIDPLinks = useCallback(async () => {
    setIdpStatus('loading');
    try {
      const value = await requestJSON('/api/auth/idp-links');
      setIdpLinks(Array.isArray(value?.links) ? value.links : []);
      setIdpStatus('ready');
    } catch (error) {
      if (!isStatus(error, 401)) setIdpStatus('error');
    }
  }, []);

  useEffect(() => {
    if (activeSection !== 'security') return undefined;
    window.setTimeout(() => loadIDPLinks(), 0);
    const params = new URLSearchParams(window.location.search);
    const status = params.get('link_status');
    const provider = params.get('provider');
    if (status) {
      const label = externalProviders.find((item) => item.id === provider)?.label || '第三方账号';
      /** @type {{ type: 'error' | 'success', text: string }} */
      const message = status === 'success'
        ? { type: 'success', text: `${label} 已成功关联。` }
        : status === 'conflict'
          ? { type: 'error', text: `${label} 已关联到其他拾光账号。` }
          : { type: 'error', text: `${label} 关联失败，请重试。` };
      window.setTimeout(() => setIdpMessage(message), 0);
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);
    }
    return undefined;
  }, [activeSection, loadIDPLinks]);

  /** @param {string} provider */
  const startIDPLink = (provider) => {
    if (busyProvider) return;
    setBusyProvider(provider);
    window.location.assign(`/api/auth/idp-links/start?provider=${encodeURIComponent(provider)}&return_to=%2Faccount%2Fsecurity`);
  };

  const loadOrgs = useCallback(async () => {
    setOrgsStatus('loading');
    try {
      const value = await requestJSON('/api/account/orgs');
      setOrgs(Array.isArray(value?.organizations) ? value.organizations : []);
      setOrgsStatus('ready');
    } catch (error) {
      if (!isStatus(error, 401)) setOrgsStatus('error');
    }
  }, []);

  useEffect(() => {
    if (activeSection !== 'organizations') return undefined;
    let active = true;
    requestJSON('/api/account/orgs')
      .then((value) => {
        if (!active) return;
        setOrgs(Array.isArray(value?.organizations) ? value.organizations : []);
        setOrgsStatus('ready');
      })
      .catch((error) => {
        if (active && !isStatus(error, 401)) setOrgsStatus('error');
      });
    return () => {
      active = false;
    };
  }, [activeSection]);

  const loadMembers = useCallback(async (/** @type {string} */ orgId) => {
    setMembersStatus('loading');
    setMemberMessage(null);
    try {
      const value = await requestJSON(`/api/account/orgs/${encodeURIComponent(orgId)}/members`);
      setMembers(Array.isArray(value?.members) ? value.members : []);
      setMembersStatus('ready');
    } catch (error) {
      if (!isStatus(error, 401)) setMembersStatus('error');
    }
  }, []);

  /** @param {Organization} org */
  const openOrg = (org) => {
    if (selectedOrgId === org.id) {
      setSelectedOrgId(null);
      return;
    }
    setSelectedOrgId(org.id);
    setMembers([]);
    setInviteLoginName('');
    setInviteRole('org:member');
    setInviteMessage(null);
    loadMembers(org.id);
  };

  /** @param {import('react').FormEvent<HTMLFormElement>} event */
  const createOrg = async (event) => {
    event.preventDefault();
    if (createStatus === 'submitting') return;
    const name = createName.trim();
    if (name.length < 2 || name.length > 60) {
      setCreateMessage({ type: 'error', text: '组织名称需为 2～60 个字符。' });
      return;
    }
    setCreateStatus('submitting');
    setCreateMessage(null);
    try {
      const created = await requestJSON('/api/account/orgs', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setOrgs((value) => [...value, created]);
      setCreateName('');
      setCreateMessage({ type: 'success', text: `组织「${created.name}」创建成功。` });
    } catch (error) {
      if (isStatus(error, 409)) {
        setCreateMessage({ type: 'error', text: '组织名已存在。' });
      } else if (!isStatus(error, 401)) {
        setCreateMessage({ type: 'error', text: '创建组织失败，请稍后重试。' });
      }
    } finally {
      setCreateStatus('idle');
    }
  };

  /** @param {import('react').FormEvent<HTMLFormElement>} event */
  const inviteMember = async (event) => {
    event.preventDefault();
    if (!selectedOrg || inviteStatus === 'submitting') return;
    const loginName = inviteLoginName.trim();
    if (!loginName) {
      setInviteMessage({ type: 'error', text: '请输入要邀请的账号。' });
      return;
    }
    setInviteStatus('submitting');
    setInviteMessage(null);
    try {
      await requestJSON(`/api/account/orgs/${encodeURIComponent(selectedOrg.id)}/members`, {
        method: 'POST',
        body: JSON.stringify({ loginName, role: inviteRole }),
      });
      setInviteLoginName('');
      setInviteMessage({ type: 'success', text: `已邀请 ${loginName} 加入组织。` });
      loadMembers(selectedOrg.id);
    } catch (error) {
      if (isStatus(error, 404)) {
        setInviteMessage({ type: 'error', text: '用户不存在。' });
      } else if (isStatus(error, 409)) {
        setInviteMessage({ type: 'error', text: '该用户已是组织成员。' });
      } else if (!isStatus(error, 401)) {
        setInviteMessage({ type: 'error', text: '邀请失败，请稍后重试。' });
      }
    } finally {
      setInviteStatus('idle');
    }
  };

  /** @param {OrgMember} member @param {string} role */
  const changeMemberRole = async (member, role) => {
    if (!selectedOrg || busyMemberId) return;
    setBusyMemberId(member.userId);
    setMemberMessage(null);
    try {
      await requestJSON(
        `/api/account/orgs/${encodeURIComponent(selectedOrg.id)}/members/${encodeURIComponent(member.userId)}`,
        { method: 'PATCH', body: JSON.stringify({ role }) },
      );
      setMembers((value) => value.map((item) => (item.userId === member.userId ? { ...item, roles: [role] } : item)));
      setMemberMessage({
        type: 'success',
        text: `已将 ${member.displayName || member.loginName || member.userId} 的角色调整为${roleLabels[role] || role}。`,
      });
    } catch (error) {
      if (isLastAdmin(error)) {
        setMemberMessage({ type: 'error', text: '组织至少保留一名管理员。' });
      } else if (!isStatus(error, 401)) {
        setMemberMessage({ type: 'error', text: '调整角色失败，请稍后重试。' });
      }
    } finally {
      setBusyMemberId(null);
    }
  };

  /** @param {OrgMember} member */
  const removeMember = async (member) => {
    if (!selectedOrg || busyMemberId) return;
    const label = member.displayName || member.loginName || member.userId;
    if (typeof window !== 'undefined' && !window.confirm(`确认将 ${label} 移出组织「${selectedOrg.name}」吗？`)) return;
    setBusyMemberId(member.userId);
    setMemberMessage(null);
    try {
      await requestJSON(
        `/api/account/orgs/${encodeURIComponent(selectedOrg.id)}/members/${encodeURIComponent(member.userId)}`,
        { method: 'DELETE' },
      );
      setMembers((value) => value.filter((item) => item.userId !== member.userId));
      setMemberMessage({ type: 'success', text: `已将 ${label} 移出组织。` });
    } catch (error) {
      if (isLastAdmin(error)) {
        setMemberMessage({ type: 'error', text: '组织至少保留一名管理员。' });
      } else if (!isStatus(error, 401)) {
        setMemberMessage({ type: 'error', text: '移除成员失败，请稍后重试。' });
      }
    } finally {
      setBusyMemberId(null);
    }
  };

  return (
    <div className="account-page">
      <SiteHeader productPage />
      <main className="account-layout">
        <aside className="account-sidebar" aria-label="账号中心导航">
          <div className="account-sidebar-title">
            <span className="account-sidebar-title-icon"><IconIdCard /></span>
            <strong>账号中心</strong>
          </div>
          <nav className="account-nav">
            {accountSections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <Link
                  key={section.id}
                  className={activeSection === section.id ? 'is-active' : ''}
                  to={`/account/${section.id}`}
                  aria-current={activeSection === section.id ? 'page' : undefined}
                >
                  <SectionIcon aria-hidden="true" />
                  <span><strong>{section.label}</strong><small>{section.description}</small></span>
                  <IconChevronRight className="account-nav-arrow" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>
          <a className="account-sidebar-home" href="/">返回拾光首页 <IconChevronRight aria-hidden="true" /></a>
        </aside>

        <div className="account-content">
          <header className="account-content-header">
            <span>账号中心</span>
            <h1>{sectionMeta.label}</h1>
            <p>{sectionMeta.description}</p>
          </header>

          {activeSection === 'profile' && (
            <section className="account-card account-profile-card" aria-labelledby="account-profile-title">
              <div className="account-card-head">
                <h2 id="account-profile-title">基本资料</h2>
                <span>你的拾光统一账号信息</span>
              </div>
              {sessionStatus === 'loading' && (
                <div className="account-loading"><span aria-hidden="true" />正在加载账号信息…</div>
              )}
              {sessionStatus === 'error' && (
                <p className="account-error" role="alert">账号信息加载失败，请刷新页面重试。</p>
              )}
              {sessionStatus === 'ready' && session && (
                <>
                  <div className="account-profile-summary">
                    <span className="account-avatar account-profile-avatar" aria-hidden="true">
                      {(session.displayName || session.subject || '拾').slice(0, 1)}
                    </span>
                    <div>
                      <strong>{session.displayName || session.subject}</strong>
                      <span>{session.email || '拾光统一账号'}</span>
                    </div>
                    <span className="account-status-badge">账号正常</span>
                  </div>
                  <dl className="account-profile-fields">
                    <div><dt>显示名称</dt><dd>{session.displayName || '未设置'}</dd></div>
                    <div><dt>登录账号</dt><dd>{session.preferredUsername || session.email || session.subject}</dd></div>
                    <div><dt>邮箱</dt><dd>{session.email || '未绑定'}</dd></div>
                    <div><dt>账号 ID</dt><dd>{session.subject}</dd></div>
                    <div><dt>默认组织</dt><dd>{session.organization || '暂无默认组织'}</dd></div>
                    <div>
                      <dt>账号角色</dt>
                      <dd className="account-inline-roles">
                        {(Array.isArray(session.roles) && session.roles.length > 0)
                          ? session.roles.map((/** @type {string} */ role) => <em key={role}>{roleLabels[role] || role}</em>)
                          : '普通用户'}
                      </dd>
                    </div>
                  </dl>
                </>
              )}
            </section>
          )}

          {activeSection === 'security' && (
            <section className="account-card account-links-card" aria-labelledby="account-links-title">
          <div className="account-card-head">
            <h2 id="account-links-title">登录方式</h2>
            <span>关联后可用于登录当前账号</span>
          </div>
          <p className="account-member-hint">将常用的第三方账号关联到当前拾光账号，不会通过邮箱自动合并账号。</p>
          {idpStatus === 'loading' && <div className="account-loading"><span aria-hidden="true" />正在加载关联方式…</div>}
          {idpStatus === 'error' && <div className="account-empty"><p className="account-error" role="alert">登录方式加载失败。</p><button type="button" className="account-ghost-button" onClick={loadIDPLinks}>重新加载</button></div>}
          {idpStatus === 'ready' && (
            <div className="account-links-list">
              {externalProviders.map((provider) => {
                const link = idpLinks.find((item) => item.provider === provider.id);
                return (
                  <div className="account-link-row" key={provider.id}>
                    <span className={`account-link-icon account-link-icon-${provider.id}`}><AuthProviderIcon name={provider.id} /></span>
                    <div className="account-link-main"><strong>{provider.label}</strong><span>{link ? (link.userName || '已关联') : '尚未关联'}</span></div>
                    {link ? <span className="account-link-state">已关联</span> : <button type="button" className="account-ghost-button" onClick={() => startIDPLink(provider.id)} disabled={busyProvider === provider.id}>{busyProvider === provider.id ? '跳转中…' : '关联账号'}</button>}
                  </div>
                );
              })}
            </div>
          )}
          {idpMessage && <p className={idpMessage.type === 'error' ? 'account-error' : 'account-success'} role={idpMessage.type === 'error' ? 'alert' : 'status'}>{idpMessage.text}</p>}
            </section>
          )}

          {activeSection === 'organizations' && (
            <div className="account-columns">
          <section className="account-card" aria-labelledby="account-orgs-title">
            <div className="account-card-head">
              <h2 id="account-orgs-title">我的组织</h2>
              <span>{orgsStatus === 'ready' ? `共 ${orgs.length} 个` : ''}</span>
            </div>

            {orgsStatus === 'loading' && (
              <div className="account-loading"><span aria-hidden="true" />正在加载组织列表…</div>
            )}
            {orgsStatus === 'error' && (
              <div className="account-empty">
                <p className="account-error" role="alert">组织列表加载失败。</p>
                <button type="button" className="account-ghost-button" onClick={loadOrgs}>重新加载</button>
              </div>
            )}
            {orgsStatus === 'ready' && orgs.length === 0 && (
              <p className="account-empty">你还没有加入任何组织，先创建一个吧。</p>
            )}
            {orgsStatus === 'ready' && orgs.length > 0 && (
              <ul className="account-org-list">
                {orgs.map((org) => (
                  <li key={org.id}>
                    <button
                      type="button"
                      className={org.id === selectedOrgId ? 'is-active' : ''}
                      onClick={() => openOrg(org)}
                      aria-expanded={org.id === selectedOrgId}
                    >
                      <span className="account-org-name">{org.name}</span>
                      <span className="account-org-role">{roleText(org.roles)}</span>
                      <b aria-hidden="true">{org.id === selectedOrgId ? '收起' : '管理'}</b>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form className="account-create" onSubmit={createOrg}>
              <h3>创建组织</h3>
              <div className="account-create-row">
                <label className="account-field" htmlFor="account-org-name">
                  <span className="sr-only">组织名称</span>
                  <input
                    id="account-org-name"
                    type="text"
                    placeholder="组织名称（2～60 个字符）"
                    value={createName}
                    minLength={2}
                    maxLength={60}
                    onChange={(event) => {
                      setCreateName(event.target.value);
                      setCreateMessage(null);
                    }}
                    disabled={createStatus === 'submitting'}
                    required
                  />
                </label>
                <button className="account-submit" type="submit" disabled={createStatus === 'submitting'}>
                  {createStatus === 'submitting' ? '创建中…' : '创建组织'}
                </button>
              </div>
              {createMessage && (
                <p
                  className={createMessage.type === 'error' ? 'account-error' : 'account-success'}
                  role={createMessage.type === 'error' ? 'alert' : 'status'}
                >
                  {createMessage.text}
                </p>
              )}
            </form>
          </section>

          <section className="account-card" aria-labelledby="account-members-title">
            <div className="account-card-head">
              <h2 id="account-members-title">成员管理</h2>
              <span>{selectedOrg ? selectedOrg.name : ''}</span>
            </div>

            {!selectedOrg && <p className="account-empty">从左侧选择一个组织，查看并管理成员。</p>}

            {selectedOrg && (
              <>
                <p className="account-member-hint">
                  {isAdmin
                    ? '你是该组织的管理员，可以邀请成员、调整角色或移除成员。'
                    : `你在该组织中的角色为「${roleText(selectedOrg.roles)}」，仅可查看成员列表。`}
                </p>

                {isAdmin && (
                  <form className="account-invite" onSubmit={inviteMember}>
                    <label className="account-field" htmlFor="account-invite-name">
                      <span className="sr-only">被邀请人账号</span>
                      <input
                        id="account-invite-name"
                        type="text"
                        placeholder="输入对方的登录账号"
                        value={inviteLoginName}
                        autoCapitalize="none"
                        spellCheck="false"
                        onChange={(event) => {
                          setInviteLoginName(event.target.value);
                          setInviteMessage(null);
                        }}
                        disabled={inviteStatus === 'submitting'}
                        required
                      />
                    </label>
                    <label className="account-select" htmlFor="account-invite-role">
                      <span className="sr-only">角色</span>
                      <select
                        id="account-invite-role"
                        value={inviteRole}
                        onChange={(event) => setInviteRole(event.target.value)}
                        disabled={inviteStatus === 'submitting'}
                      >
                        {assignableRoles.map((role) => (
                          <option key={role} value={role}>{roleLabels[role]}</option>
                        ))}
                      </select>
                    </label>
                    <button className="account-submit" type="submit" disabled={inviteStatus === 'submitting'}>
                      {inviteStatus === 'submitting' ? '邀请中…' : '邀请'}
                    </button>
                  </form>
                )}
                {inviteMessage && (
                  <p
                    className={inviteMessage.type === 'error' ? 'account-error' : 'account-success'}
                    role={inviteMessage.type === 'error' ? 'alert' : 'status'}
                  >
                    {inviteMessage.text}
                  </p>
                )}

                {membersStatus === 'loading' && (
                  <div className="account-loading"><span aria-hidden="true" />正在加载成员列表…</div>
                )}
                {membersStatus === 'error' && (
                  <div className="account-empty">
                    <p className="account-error" role="alert">成员列表加载失败。</p>
                    <button type="button" className="account-ghost-button" onClick={() => loadMembers(selectedOrg.id)}>
                      重新加载
                    </button>
                  </div>
                )}
                {membersStatus === 'ready' && members.length === 0 && (
                  <p className="account-empty">该组织暂无成员。</p>
                )}
                {membersStatus === 'ready' && members.length > 0 && (
                  <ul className="account-member-list">
                    {members.map((member) => (
                      <li key={member.userId} className={busyMemberId === member.userId ? 'is-busy' : ''}>
                        <span className="account-avatar" aria-hidden="true">
                          {(member.displayName || member.loginName || '员').slice(0, 1)}
                        </span>
                        <div className="account-member-main">
                          <strong>{member.displayName || member.loginName || member.userId}</strong>
                          <span>{member.loginName || member.userId}</span>
                        </div>
                        {isAdmin ? (
                          <div className="account-member-actions">
                            <label className="account-select" htmlFor={`account-role-${member.userId}`}>
                              <span className="sr-only">调整角色</span>
                              <select
                                id={`account-role-${member.userId}`}
                                value={assignableRoles.find((role) => member.roles?.includes(role)) || 'org:member'}
                                onChange={(event) => changeMemberRole(member, event.target.value)}
                                disabled={busyMemberId === member.userId}
                              >
                                {assignableRoles.map((role) => (
                                  <option key={role} value={role}>{roleLabels[role]}</option>
                                ))}
                              </select>
                            </label>
                            <button
                              type="button"
                              className="account-danger-button"
                              onClick={() => removeMember(member)}
                              disabled={busyMemberId === member.userId}
                            >
                              移除
                            </button>
                          </div>
                        ) : (
                          <span className="account-member-role">{roleText(member.roles)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {memberMessage && (
                  <p
                    className={memberMessage.type === 'error' ? 'account-error' : 'account-success'}
                    role={memberMessage.type === 'error' ? 'alert' : 'status'}
                  >
                    {memberMessage.text}
                  </p>
                )}
              </>
            )}
          </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
