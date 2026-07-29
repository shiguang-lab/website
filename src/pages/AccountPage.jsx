import { useCallback, useEffect, useMemo, useState } from 'react';
import IconChevronRight from '@douyinfe/semi-icons/lib/es/icons/IconChevronRight';
import IconIdCard from '@douyinfe/semi-icons/lib/es/icons/IconIdCard';
import IconKey from '@douyinfe/semi-icons/lib/es/icons/IconKey';
import IconUserGroup from '@douyinfe/semi-icons/lib/es/icons/IconUserGroup';
import IconEdit from '@douyinfe/semi-icons/lib/es/icons/IconEdit';
import IconCamera from '@douyinfe/semi-icons/lib/es/icons/IconCamera';
import IconSave from '@douyinfe/semi-icons/lib/es/icons/IconSave';
import IconCoinMoneyStroked from '@douyinfe/semi-icons/lib/es/icons/IconCoinMoneyStroked';
import IconCalendarStroked from '@douyinfe/semi-icons/lib/es/icons/IconCalendarStroked';
import IconGiftStroked from '@douyinfe/semi-icons/lib/es/icons/IconGiftStroked';
import IconHistory from '@douyinfe/semi-icons/lib/es/icons/IconHistory';
import IconRefresh from '@douyinfe/semi-icons/lib/es/icons/IconRefresh';
import IconTickCircle from '@douyinfe/semi-icons/lib/es/icons/IconTickCircle';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginHref } from '../auth/loginRedirect';
import { useAuth } from '../auth/useAuth';
import { AuthProviderIcon } from '../components/AuthProviderIcons';
import { SiteHeader } from '../components/SiteHeader';
import { useHomeEffects } from '../hooks/useHomeEffects';

/** @typedef {{ id: string, name: string, roles: string[] }} Organization */
/** @typedef {{ userId: string, displayName?: string, loginName?: string, roles: string[] }} OrgMember */
/** @typedef {{ id: string, loginName?: string, displayName?: string, givenName?: string, familyName?: string, nickName?: string, preferredLanguage?: string, gender?: string, email?: string, emailVerified?: boolean, phone?: string, phoneVerified?: boolean, state?: string, avatarURL?: string }} AccountProfile */
/** @typedef {{ userId: string, accountId: string, balance: number, totalCredited: number, totalDebited: number, version: number }} PointsSummary */
/** @typedef {{ id: string, businessDate: string, timezone: string, streakDays: number, rewardPoints: number, ledgerId: string, createdAt: string, created: boolean }} CheckIn */
/** @typedef {{ checkedIn: boolean, checkIn: CheckIn | null }} TodayCheckIn */
/** @typedef {{ id: string, entryType: string, delta: number, balanceAfter: number, businessRefType: string, businessRefId: string, reason?: string, occurredAt: string }} LedgerEntry */

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

/** @type {Record<string, string>} */
const ledgerLabels = {
  REGISTER_BONUS: '注册赠送',
  DAILY_CHECK_IN: '每日签到',
  ADMIN_ADJUST: '积分调整',
  CONSUME: '积分消费',
  REFUND: '积分退回',
  EXPIRE: '积分过期',
  TRANSFER_IN: '组织转入',
  TRANSFER_OUT: '组织转出',
};

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
    id: 'points',
    label: '积分中心',
    description: '余额、签到与积分明细',
    icon: IconCoinMoneyStroked,
  },
  {
    id: 'organizations',
    label: '组织与成员',
    description: '管理组织角色权限',
    icon: IconUserGroup,
  },
];

/** @param {string} value */
function formatLedgerTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/** @param {number} value */
function formatPoints(value) {
  return new Intl.NumberFormat('zh-CN').format(Number.isFinite(value) ? value : 0);
}

/** @param {string[] | undefined} roles */
function roleText(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return '成员';
  return roles.map((role) => roleLabels[role] || role).join(' · ');
}

/** @param {string | undefined} state */
function accountStateText(state) {
  if (!state || state === 'USER_STATE_ACTIVE' || state === 'STATE_ACTIVE') return '账号正常';
  if (state.includes('INACTIVE')) return '账号已停用';
  if (state.includes('LOCKED')) return '账号已锁定';
  return state;
}

/** @param {string | undefined} gender */
function genderText(gender) {
  if (!gender) return '未设置';
  if (gender.includes('FEMALE')) return '女';
  if (gender.includes('MALE')) return '男';
  if (gender.includes('DIVERSE')) return '多元';
  return '未设置';
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
  const { refresh: refreshAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const requestedSection = location.pathname.split('/')[2];
  const orgPathId = location.pathname.split('/')[3]; // for /account/organizations/:orgId
  const orgSubSection = location.pathname.split('/')[4] || 'members'; // members|settings
  const activeSection = accountSections.some((item) => item.id === requestedSection)
    ? requestedSection
    : 'profile';
  const sectionMeta = accountSections.find((item) => item.id === activeSection) || accountSections[0];
  const [profile, setProfile] = useState(/** @type {AccountProfile | null} */ (null));
  const [profileStatus, setProfileStatus] = useState('loading');
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState(/** @type {Partial<AccountProfile>} */ ({}));
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(/** @type {{ type: 'error' | 'success', text: string } | null} */ (null));

  const [pointsSummary, setPointsSummary] = useState(/** @type {PointsSummary | null} */ (null));
  const [todayCheckIn, setTodayCheckIn] = useState(/** @type {TodayCheckIn | null} */ (null));
  const [ledgerEntries, setLedgerEntries] = useState(/** @type {LedgerEntry[]} */ ([]));
  const [pointsStatus, setPointsStatus] = useState('idle');
  const [checkInStatus, setCheckInStatus] = useState('idle');
  const [pointsMessage, setPointsMessage] = useState(/** @type {{ type: 'error' | 'success', text: string } | null} */ (null));

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
    () => orgs.find((org) => org.id === (selectedOrgId || orgPathId)) || null,
    [orgs, selectedOrgId, orgPathId],
  );
  const isAdmin = Boolean(selectedOrg && selectedOrg.roles && selectedOrg.roles.includes('org:admin'));

  const loadProfile = useCallback(async () => {
    setProfileStatus('loading');
    try {
      const value = await requestJSON('/api/account/profile');
      setProfile(value);
      setProfileStatus('ready');
      await refreshAuth();
    } catch (error) {
      if (!isStatus(error, 401)) setProfileStatus('error');
    }
  }, [refreshAuth]);

  useEffect(() => {
    if (activeSection !== 'profile') return;
    window.setTimeout(() => loadProfile(), 0);
  }, [activeSection, loadProfile]);

  const saveProfile = useCallback(async (/** @type {Partial<AccountProfile>} */ values) => {
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const updated = await requestJSON('/api/account/profile', {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      setProfile(updated);
      setEditing(false);
      setProfileMessage({ type: 'success', text: '资料已更新。' });
      await refreshAuth();
    } catch (error) {
      if (!isStatus(error, 401)) {
        setProfileMessage({ type: 'error', text: '保存失败，请稍后重试。' });
      }
    } finally {
      setSavingProfile(false);
    }
  }, [refreshAuth]);

  const startEditing = useCallback(() => {
    if (!profile) return;
    setEditValues({
      displayName: profile.displayName || '',
      familyName: profile.familyName || '',
      givenName: profile.givenName || '',
      nickName: profile.nickName || '',
      preferredLanguage: profile.preferredLanguage || '',
      gender: profile.gender || '',
      email: profile.email || '',
      phone: profile.phone || '',
    });
    setProfileMessage(null);
    setEditing(true);
  }, [profile]);

  const cancelEditing = useCallback(() => {
    setEditing(false);
    setProfileMessage(null);
  }, []);

  const loadPoints = useCallback(async () => {
    setPointsStatus('loading');
    setPointsMessage(null);
    try {
      const [summary, today, ledger] = await Promise.all([
        requestJSON('/api/platform/v1/me/points'),
        requestJSON('/api/platform/v1/me/check-ins/today'),
        requestJSON('/api/platform/v1/me/points/ledger?limit=50'),
      ]);
      setPointsSummary(summary);
      setTodayCheckIn(today);
      setLedgerEntries(Array.isArray(ledger?.items) ? ledger.items : []);
      setPointsStatus('ready');
    } catch (error) {
      if (!isStatus(error, 401)) setPointsStatus('error');
    }
  }, []);

  useEffect(() => {
    if (activeSection !== 'points') return;
    window.setTimeout(() => loadPoints(), 0);
  }, [activeSection, loadPoints]);

  const submitCheckIn = useCallback(async () => {
    if (checkInStatus === 'submitting' || todayCheckIn?.checkedIn) return;
    setCheckInStatus('submitting');
    setPointsMessage(null);
    try {
      const value = await requestJSON('/api/platform/v1/me/check-ins', { method: 'POST' });
      setTodayCheckIn({ checkedIn: true, checkIn: value });
      const [summary, ledger] = await Promise.all([
        requestJSON('/api/platform/v1/me/points'),
        requestJSON('/api/platform/v1/me/points/ledger?limit=50'),
      ]);
      setPointsSummary(summary);
      setLedgerEntries(Array.isArray(ledger?.items) ? ledger.items : []);
      setPointsMessage({
        type: 'success',
        text: value.created ? `签到成功，获得 ${formatPoints(value.rewardPoints)} 积分。` : '今日已签到。',
      });
      setCheckInStatus('idle');
    } catch (error) {
      if (!isStatus(error, 401)) {
        setPointsMessage({ type: 'error', text: '签到失败，请稍后重试。' });
        setCheckInStatus('idle');
      }
    }
  }, [checkInStatus, todayCheckIn]);

  const handleAvatarChange = useCallback(async (/** @type {import('react').ChangeEvent<HTMLInputElement>} */ event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/account/avatar', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'upload_failed' }));
        throw Object.assign(new Error(err.error || 'upload_failed'), { status: response.status });
      }
      const result = await response.json();
      setProfile(prev => prev ? { ...prev, avatarURL: result.avatarURL } : prev);
      setProfileMessage({ type: 'success', text: '头像已更新。' });
    } catch (error) {
      if (!isStatus(error, 401)) {
        setProfileMessage({ type: 'error', text: '头像上传失败。' });
      }
    }
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

  useEffect(() => {
    if (activeSection !== 'organizations') return undefined;
    let active = true;
    requestJSON('/api/account/orgs')
      .then((value) => {
        if (!active) return;
        const loaded = Array.isArray(value?.organizations) ? value.organizations : [];
        setOrgs(loaded);
        setOrgsStatus('ready');
        // If navigating directly to an org URL, load members
        if (orgPathId) {
          setSelectedOrgId(orgPathId);
          loadMembers(orgPathId);
        }
      })
      .catch((error) => {
        if (active && !isStatus(error, 401)) setOrgsStatus('error');
      });
    return () => {
      active = false;
    };
  }, [activeSection, loadMembers, orgPathId]);

  /** @param {Organization} org */
  const openOrg = (org) => {
    navigate(`/account/organizations/${org.id}/members`);
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
                <div className="account-card-head-actions">
                  <span>你的拾光统一账号信息</span>
                  {!editing && profileStatus === 'ready' && profile && (
                    <button type="button" className="account-edit-button" onClick={startEditing}>
                      <IconEdit aria-hidden="true" /> 编辑
                    </button>
                  )}
                </div>
              </div>
              {profileStatus === 'loading' && (
                <div className="account-loading"><span aria-hidden="true" />正在加载账号信息…</div>
              )}
              {profileStatus === 'error' && (
                <div className="account-empty">
                  <p className="account-error" role="alert">账号资料加载失败。</p>
                  <button type="button" className="account-ghost-button" onClick={loadProfile}>重新加载</button>
                </div>
              )}
              {profileStatus === 'ready' && profile && !editing && (
                <>
                  <div className="account-profile-summary">
                    <label className="account-avatar-upload">
                      {profile.avatarURL ? (
                      <img src={profile.avatarURL} alt="" className="account-avatar account-profile-avatar-img" />
                    ) : (
                      <span className="account-avatar account-profile-avatar" aria-hidden="true">
                        {(profile.displayName || profile.loginName || '拾').slice(0, 1)}
                      </span>
                    )}
                      <input type="file" accept="image/*" className="account-avatar-input" onChange={handleAvatarChange} />
                    </label>
                    <div>
                      <strong>{profile.displayName || profile.loginName || profile.id}</strong>
                      <span>{profile.email || profile.loginName || '拾光统一账号'}</span>
                    </div>
                    <span className="account-status-badge">{accountStateText(profile.state)}</span>
                  </div>
                  <dl className="account-profile-fields">
                    <div><dt>显示名称</dt><dd>{profile.displayName || '未设置'}</dd></div>
                    <div><dt>登录账号</dt><dd>{profile.loginName || '未设置'}</dd></div>
                    <div>
                      <dt>邮箱</dt>
                      <dd className="account-detail-value">
                        <span>{profile.email || '未绑定'}</span>
                        {profile.email && <em className={profile.emailVerified ? 'is-verified' : ''}>{profile.emailVerified ? '已验证' : '未验证'}</em>}
                      </dd>
                    </div>
                    <div>
                      <dt>手机号</dt>
                      <dd className="account-detail-value">
                        <span>{profile.phone || '未绑定'}</span>
                        {profile.phone && <em className={profile.phoneVerified ? 'is-verified' : ''}>{profile.phoneVerified ? '已验证' : '未验证'}</em>}
                      </dd>
                    </div>
                    <div><dt>姓名</dt><dd>{[profile.familyName, profile.givenName].filter(Boolean).join('') || '未设置'}</dd></div>
                    <div><dt>昵称</dt><dd>{profile.nickName || '未设置'}</dd></div>
                    <div><dt>语言</dt><dd>{profile.preferredLanguage || '未设置'}</dd></div>
                    <div><dt>性别</dt><dd>{genderText(profile.gender)}</dd></div>
                    <div><dt>账号 ID</dt><dd>{profile.id}</dd></div>
                  </dl>
                </>
              )}
              {profileStatus === 'ready' && profile && editing && (
                <>
                  <div className="account-profile-summary">
                    <label className="account-avatar-upload">
                      {profile.avatarURL ? (
                      <img src={profile.avatarURL} alt="" className="account-avatar account-profile-avatar-img" />
                    ) : (
                      <span className="account-avatar account-profile-avatar" aria-hidden="true">
                        {(profile.displayName || profile.loginName || '拾').slice(0, 1)}
                      </span>
                    )}
                      <span className="account-avatar-hint"><IconCamera aria-hidden="true" /></span>
                      <input type="file" accept="image/*" className="account-avatar-input" onChange={handleAvatarChange} />
                    </label>
                    <div>
                      <strong>{profile.displayName || profile.loginName || profile.id}</strong>
                      <span>{profile.email || profile.loginName || '拾光统一账号'}</span>
                    </div>
                    <span className="account-status-badge">{accountStateText(profile.state)}</span>
                  </div>
                  <dl className="account-profile-fields account-profile-fields-editing">
                    <div>
                      <dt>显示名称</dt>
                      <dd>
                        <input type="text" value={editValues.displayName || ''} maxLength={60}
                          onChange={(e) => setEditValues(v => ({ ...v, displayName: e.target.value }))}
                          className="account-edit-input" placeholder="你的显示名称" />
                      </dd>
                    </div>
                    <div>
                      <dt>姓</dt>
                      <dd>
                        <input type="text" value={editValues.familyName || ''} maxLength={40}
                          onChange={(e) => setEditValues(v => ({ ...v, familyName: e.target.value }))}
                          className="account-edit-input" placeholder="姓氏" />
                      </dd>
                    </div>
                    <div>
                      <dt>名</dt>
                      <dd>
                        <input type="text" value={editValues.givenName || ''} maxLength={40}
                          onChange={(e) => setEditValues(v => ({ ...v, givenName: e.target.value }))}
                          className="account-edit-input" placeholder="名字" />
                      </dd>
                    </div>
                    <div>
                      <dt>昵称</dt>
                      <dd>
                        <input type="text" value={editValues.nickName || ''} maxLength={40}
                          onChange={(e) => setEditValues(v => ({ ...v, nickName: e.target.value }))}
                          className="account-edit-input" placeholder="昵称" />
                      </dd>
                    </div>
                    <div>
                      <dt>语言</dt>
                      <dd>
                        <select value={editValues.preferredLanguage || ''}
                          onChange={(e) => setEditValues(v => ({ ...v, preferredLanguage: e.target.value }))}
                          className="account-edit-select">
                          <option value="">未设置</option>
                          <option value="zh-CN">简体中文</option>
                          <option value="zh-TW">繁体中文</option>
                          <option value="en">English</option>
                          <option value="ja">日本語</option>
                        </select>
                      </dd>
                    </div>
                    <div>
                      <dt>性别</dt>
                      <dd>
                        <select value={editValues.gender || ''}
                          onChange={(e) => setEditValues(v => ({ ...v, gender: e.target.value }))}
                          className="account-edit-select">
                          <option value="">未设置</option>
                          <option value="GENDER_MALE">男</option>
                          <option value="GENDER_FEMALE">女</option>
                          <option value="GENDER_DIVERSE">多元</option>
                        </select>
                      </dd>
                    </div>
                    <div>
                      <dt>邮箱</dt>
                      <dd>
                        <input type="email" value={editValues.email || ''} maxLength={120}
                          onChange={(e) => setEditValues(v => ({ ...v, email: e.target.value }))}
                          className="account-edit-input" placeholder="邮箱地址" />
                      </dd>
                    </div>
                    <div>
                      <dt>手机号</dt>
                      <dd>
                        <input type="tel" value={editValues.phone || ''} maxLength={20}
                          onChange={(e) => setEditValues(v => ({ ...v, phone: e.target.value }))}
                          className="account-edit-input" placeholder="手机号码" />
                      </dd>
                    </div>
                    <div><dt>登录账号</dt><dd>{profile.loginName || '未设置'}</dd></div>
                    <div><dt>账号 ID</dt><dd>{profile.id}</dd></div>
                  </dl>
                  <div className="account-edit-actions">
                    <button type="button" className="account-submit" onClick={() => saveProfile(editValues)} disabled={savingProfile}>
                      {savingProfile ? '保存中…' : <><IconSave aria-hidden="true" /> 保存</>}
                    </button>
                    <button type="button" className="account-ghost-button" onClick={cancelEditing} disabled={savingProfile}>
                      取消
                    </button>
                  </div>
                </>
              )}
              {profileMessage && (
                <p className={profileMessage.type === 'error' ? 'account-error' : 'account-success'} role={profileMessage.type === 'error' ? 'alert' : 'status'}>
                  {profileMessage.text}
                </p>
              )}
            </section>
          )}

          {activeSection === 'points' && (
            <section className="account-card account-points-card" aria-labelledby="account-points-title">
              <div className="account-card-head">
                <h2 id="account-points-title">个人积分</h2>
                <button
                  type="button"
                  className="account-icon-button"
                  onClick={loadPoints}
                  disabled={pointsStatus === 'loading'}
                  title="刷新积分"
                  aria-label="刷新积分"
                >
                  <IconRefresh aria-hidden="true" />
                </button>
              </div>

              {pointsStatus === 'loading' && (
                <div className="account-loading account-points-loading"><span aria-hidden="true" />正在加载积分…</div>
              )}
              {pointsStatus === 'error' && (
                <div className="account-empty account-points-empty">
                  <p className="account-error" role="alert">积分信息加载失败。</p>
                  <button type="button" className="account-ghost-button" onClick={loadPoints}>重新加载</button>
                </div>
              )}

              {pointsStatus === 'ready' && pointsSummary && todayCheckIn && (
                <>
                  <div className="account-points-overview">
                    <div className="account-points-balance">
                      <span className="account-points-icon"><IconCoinMoneyStroked aria-hidden="true" /></span>
                      <div>
                        <span>可用积分</span>
                        <strong>{formatPoints(pointsSummary.balance)}</strong>
                      </div>
                    </div>

                    <dl className="account-points-stats">
                      <div>
                        <dt><IconGiftStroked aria-hidden="true" />累计获得</dt>
                        <dd>{formatPoints(pointsSummary.totalCredited)}</dd>
                      </div>
                      <div>
                        <dt><IconHistory aria-hidden="true" />累计使用</dt>
                        <dd>{formatPoints(pointsSummary.totalDebited)}</dd>
                      </div>
                    </dl>

                    <div className="account-check-in">
                      <div>
                        <span><IconCalendarStroked aria-hidden="true" />每日签到</span>
                        <strong>
                          {todayCheckIn.checkedIn
                            ? `连续 ${todayCheckIn.checkIn?.streakDays || 1} 天`
                            : '今日待签到'}
                        </strong>
                      </div>
                      <button
                        type="button"
                        className={todayCheckIn.checkedIn ? 'account-check-in-button is-complete' : 'account-check-in-button'}
                        onClick={submitCheckIn}
                        disabled={todayCheckIn.checkedIn || checkInStatus === 'submitting'}
                      >
                        {todayCheckIn.checkedIn
                          ? <><IconTickCircle aria-hidden="true" />已签到</>
                          : checkInStatus === 'submitting'
                            ? '签到中…'
                            : <><IconCalendarStroked aria-hidden="true" />立即签到</>}
                      </button>
                    </div>
                  </div>

                  {pointsMessage && (
                    <p className={pointsMessage.type === 'error' ? 'account-error' : 'account-success'} role={pointsMessage.type === 'error' ? 'alert' : 'status'}>
                      {pointsMessage.text}
                    </p>
                  )}

                  <div className="account-ledger-head">
                    <div>
                      <h3>积分明细</h3>
                      <span>最近 {ledgerEntries.length} 条</span>
                    </div>
                  </div>

                  {ledgerEntries.length === 0 ? (
                    <p className="account-empty account-ledger-empty">暂无积分记录。</p>
                  ) : (
                    <ol className="account-ledger-list">
                      {ledgerEntries.map((entry) => (
                        <li key={entry.id}>
                          <span className={entry.delta > 0 ? 'account-ledger-direction is-credit' : 'account-ledger-direction is-debit'} aria-hidden="true">
                            {entry.delta > 0 ? '+' : '−'}
                          </span>
                          <div className="account-ledger-main">
                            <strong>{ledgerLabels[entry.entryType] || entry.entryType}</strong>
                            <span>{entry.reason || formatLedgerTime(entry.occurredAt)}</span>
                          </div>
                          <div className="account-ledger-amount">
                            <strong className={entry.delta > 0 ? 'is-credit' : 'is-debit'}>
                              {entry.delta > 0 ? '+' : ''}{formatPoints(entry.delta)}
                            </strong>
                            <span>余额 {formatPoints(entry.balanceAfter)}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
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

          {activeSection === 'organizations' && !orgPathId && (
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
                        onClick={() => openOrg(org)}
                      >
                        <span className="account-org-name">{org.name}</span>
                        <span className="account-org-role">{roleText(org.roles)}</span>
                        <b aria-hidden="true">管理</b>
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
          )}

          {activeSection === 'organizations' && orgPathId && selectedOrg && (
            <div className="account-org-detail">
              <div className="account-org-detail-header">
                <button type="button" className="account-back-button" onClick={() => navigate('/account/organizations')}>
                  <IconChevronRight style={{ transform: 'rotate(180deg)' }} aria-hidden="true" /> 返回组织列表
                </button>
                <h2>{selectedOrg.name}</h2>
                <span className="account-org-role">{roleText(selectedOrg.roles)}</span>
              </div>

              <nav className="account-org-nav" aria-label="组织设置导航">
                <Link
                  to={`/account/organizations/${selectedOrg.id}/members`}
                  className={orgSubSection === 'members' ? 'is-active' : ''}
                >成员管理</Link>
                <Link
                  to={`/account/organizations/${selectedOrg.id}/settings`}
                  className={orgSubSection === 'settings' ? 'is-active' : ''}
                >组织设置</Link>
              </nav>

              {orgSubSection === 'members' && (
                <section className="account-card account-org-members" aria-labelledby="account-members-title">
                  <div className="account-card-head">
                    <h2 id="account-members-title">成员管理</h2>
                    <span>共 {membersStatus === 'ready' ? members.length : '...'} 人</span>
                  </div>

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
                </section>
              )}

              {orgSubSection === 'settings' && (
                <section className="account-card account-org-settings" aria-labelledby="account-org-settings-title">
                  <div className="account-card-head">
                    <h2 id="account-org-settings-title">组织设置</h2>
                  </div>
                  <p className="account-member-hint">组织级别的配置项，此区域后续扩展。</p>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
