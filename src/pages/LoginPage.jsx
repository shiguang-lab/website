import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthProviderIcon } from '../components/AuthProviderIcons';
import { authProviders } from '../config/authProviders';
import { useAuth } from '../auth/useAuth';

const genericError = '登录失败，请检查账号和密码后重试。';

/**
 * 登录方式。`enabled: false` 的方式以禁用态展示(不可切换):
 * - email-code:邮箱验证码登录,等 SMTP 与 auth-service 流程接通后放开;
 * - sso:企业 SSO,等企业 IdP 接入后放开。
 */
const loginModes = [
  {
    id: 'account',
    label: '账号登录',
    inputLabel: '账号',
    placeholder: '请输入用户名或邮箱',
    autoComplete: 'username',
    enabled: true,
  },
  {
    id: 'email-code',
    label: '邮箱登录',
    inputLabel: '邮箱地址',
    placeholder: '请输入邮箱地址',
    autoComplete: 'email',
    enabled: false,
    disabledHint: '邮箱验证码登录即将开放',
  },
  {
    id: 'sso',
    label: '企业 SSO',
    inputLabel: '企业账号',
    placeholder: '请输入企业账号',
    autoComplete: 'username',
    enabled: false,
    disabledHint: '企业 SSO 暂未开放',
  },
];

/** @typedef {{ transactionId: string, csrfToken: string }} LoginContext */

/** @param {Response} response */
async function readJSON(response) {
  const value = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = Object.assign(new Error(value.error || 'request_failed'), { status: response.status });
    throw error;
  }
  return value;
}

/** @param {string} returnTo @param {AbortSignal=} signal */
async function createLoginContext(returnTo, signal) {
  const response = await fetch('/api/auth/login/context', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ returnTo }),
    signal,
  });
  return readJSON(response);
}

/** @param {{ name: 'user' | 'lock' | 'eye' | 'eyeOff' }} props */
function LoginIcon({ name }) {
  if (name === 'user') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.75 19c.55-3.3 2.64-5 6.25-5s5.7 1.7 6.25 5" />
      </svg>
    );
  }

  if (name === 'lock') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5.5" y="10" width="13" height="10" rx="2" />
        <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10M12 14v2.5" />
      </svg>
    );
  }

  if (name === 'eyeOff') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3l18 18M10.1 6.25A8.6 8.6 0 0 1 12 6c5 0 8.5 6 8.5 6a15.2 15.2 0 0 1-2.22 3.05M6.2 7.5A16.4 16.4 0 0 0 3.5 12s3.5 6 8.5 6a8.7 8.7 0 0 0 2.27-.3M9.88 9.88a3 3 0 0 0 4.24 4.24" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 12s3.5-6 8.5-6 8.5 6 8.5 6-3.5 6-8.5 6-8.5-6-8.5-6Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}


/**
 * 登录/注册成功后的回跳:本站路径走路由切换(先刷新会话上下文),
 * 跨源地址(其它产品域)才整页跳转。
 * @param {string} target
 * @param {(to: string) => void} navigate
 * @param {() => Promise<unknown>} refresh
 */
async function settleRedirect(target, navigate, refresh) {
  const value = typeof target === 'string' && target ? target : '/';
  if (value.startsWith('/') && !value.startsWith('//')) {
    await refresh().catch(() => undefined);
    navigate(value);
    return;
  }
  window.location.assign(value);
}

export function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const query = useMemo(
    () => new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search),
    [],
  );
  const returnTo = query.get('return_to') || query.get('redirect') || '/';
  const registerHref = `/register?${new URLSearchParams({ return_to: returnTo }).toString()}`;
  const [context, setContext] = useState(/** @type {LoginContext | null} */ (null));
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('initializing');
  const [message, setMessage] = useState('');
  const activeMode = loginModes.find((item) => item.id === mode) || loginModes[0];

  useEffect(() => {
    const controller = new AbortController();
    createLoginContext(returnTo, controller.signal)
      .then((value) => {
        setContext(value);
        setStatus('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setMessage('安全登录初始化失败，请稍后重试。');
          setStatus('error');
        }
      });
    return () => controller.abort();
  }, [returnTo]);

  /** @param {string} provider */
  const startFederatedLogin = (provider) => {
    const search = new URLSearchParams({ provider, return_to: returnTo });
    window.location.assign(`/api/auth/federated/start?${search.toString()}`);
  };

  /** @param {import('react').FormEvent<HTMLFormElement>} event */
  const submit = async (event) => {
    event.preventDefault();
    if (status === 'submitting' || status === 'initializing') return;
    if (!context) {
      setStatus('initializing');
      setMessage('');
      try {
        const nextContext = await createLoginContext(returnTo);
        setContext(nextContext);
        setStatus('ready');
      } catch {
        setMessage('安全登录初始化失败，请稍后重试。');
        setStatus('error');
      }
      return;
    }
    setStatus('submitting');
    setMessage('');
    try {
      const response = await fetch('/api/auth/login/password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: context.transactionId,
          loginName,
          password,
          csrfToken: context.csrfToken,
        }),
      });
      const value = await readJSON(response);
      await settleRedirect(value.redirect, navigate, refresh);
    } catch (error) {
      setPassword('');
      setMessage(error instanceof Error && 'status' in error && error.status === 429 ? '尝试次数过多，请稍后再试。' : genericError);
      setContext(null);
      setStatus('initializing');
      try {
        const nextContext = await createLoginContext(returnTo);
        setContext(nextContext);
        setStatus('ready');
      } catch {
        setStatus('error');
      }
    }
  };

  return (
    <main className="login-page">
      <section className="login-story" aria-label="拾光品牌介绍">
        <div className="login-story-backdrop" aria-hidden="true" />
        <Link className="login-brand" to="/" aria-label="返回拾光首页">
          <img src="/assets/微信图片_20260722101545_795_4.svg" alt="" />
          <span><strong>拾光</strong><small>SHIGUANG</small></span>
        </Link>

        <div className="login-story-content">
          <p className="login-story-eyebrow">SHIGUANG AI PLATFORM</p>
          <h1>
            拾光 · 让 <em>AI</em><br />
            成为你的<span>生产力</span>
          </h1>
          <p className="login-story-copy">
            构建、训练、协作、部署 AI 的无限可能，<br />
            助力个人和企业高效构建与落地智能化生产平台。
          </p>
          <div className="login-values" aria-label="平台特点">
            <span>
              <i aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.5 2.7 7.8 7 10 4.3-2.2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
              </i>
              <b>安全可靠</b>
            </span>
            <span>
              <i aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="m13.5 2-8 12h6l-1 8 8-12h-6l1-8Z" /></svg>
              </i>
              <b>开箱即用</b>
            </span>
            <span>
              <i aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="m4 12 15-7-5.5 14-2.4-5.7L4 12Z" /><path d="m11.1 13.3 3.8-3.6" /></svg>
              </i>
              <b>持续进化</b>
            </span>
          </div>
        </div>
      </section>

      <section className="login-account" aria-labelledby="login-title">
        <div className="login-account-top">
          <span>还没有账号？</span>
          <Link to={registerHref}>去注册 <b aria-hidden="true">→</b></Link>
        </div>

        <div className="login-panel">
          <div className="login-heading">
            <span className="login-kicker">SHIGUANG ACCOUNT</span>
            <h2 id="login-title">欢迎登录拾光</h2>
            <p>使用统一账号，继续访问拾光旗下产品</p>
          </div>

          <div className="login-tabs" role="tablist" aria-label="登录方式">
            {loginModes.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={mode === item.id}
                aria-disabled={!item.enabled}
                disabled={!item.enabled}
                className={mode === item.id ? 'is-active' : ''}
                title={item.enabled ? undefined : item.disabledHint}
                onClick={() => {
                  if (!item.enabled) return;
                  setMode(item.id);
                  setMessage('');
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form className="login-form" onSubmit={submit}>
            <label className="login-field" htmlFor="login-name">
              <span className="sr-only">{activeMode.inputLabel}</span>
              <LoginIcon name="user" />
              <input
                id="login-name"
                name="username"
                type="text"
                inputMode="email"
                autoComplete={activeMode.autoComplete}
                autoCapitalize="none"
                spellCheck="false"
                placeholder={activeMode.placeholder}
                value={loginName}
                onChange={(event) => setLoginName(event.target.value)}
                disabled={status === 'submitting'}
                required
                autoFocus
              />
            </label>
            <label className="login-field" htmlFor="login-password">
              <span className="sr-only">密码</span>
              <LoginIcon name="lock" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="请输入密码"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={status === 'submitting'}
                required
              />
              <button
                className="login-password-toggle"
                type="button"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
                onClick={() => setShowPassword((value) => !value)}
              >
                <LoginIcon name={showPassword ? 'eye' : 'eyeOff'} />
              </button>
            </label>

            <div className="login-form-options">
              <span>{status === 'initializing' ? '正在建立安全登录连接…' : '统一账号 · 安全登录'}</span>
              <a href="mailto:support@shiguanglab.com">无法登录？</a>
            </div>

            {message && <p className="login-error" role="alert">{message}</p>}
            <button
              className="login-submit"
              type="submit"
              disabled={status === 'initializing' || status === 'submitting'}
            >
              {status === 'submitting'
                ? '正在验证...'
                : status === 'initializing'
                  ? '正在准备...'
                  : status === 'error'
                    ? '重新准备登录'
                    : '登录'}
            </button>
          </form>

          <p className="login-legal">
            登录即表示你同意拾光的
            <a href="/terms">《用户协议》</a>
            和
            <a href="/privacy">《隐私政策》</a>
          </p>
          <div className="login-divider"><span>或通过以下方式登录</span></div>
          <div className="login-providers" aria-label="其它登录方式">
            {authProviders.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.enabled ? `使用${item.label}登录` : `${item.label}登录暂未开放`}
                title={item.enabled ? `使用${item.label}登录` : `${item.label}登录暂未开放`}
                aria-disabled={!item.enabled}
                disabled={!item.enabled}
                onClick={() => item.enabled && startFederatedLogin(item.id)}
              >
                <AuthProviderIcon name={item.id} />
              </button>
            ))}
          </div>
          <div className="login-trust">
            <i aria-hidden="true">✓</i>
            密码加密传输 · 会话安全保护
          </div>
        </div>
      </section>
    </main>
  );
}
