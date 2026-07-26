import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthProviderIcon } from '../components/AuthProviderIcons';
import { authProviders } from '../config/authProviders';
import { useAuth } from '../auth/useAuth';

const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @typedef {{ transactionId: string, csrfToken: string }} RegisterContext */

/** @param {Response} response */
async function readJSON(response) {
  const value = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = Object.assign(new Error(value.error || 'request_failed'), { status: response.status });
    throw error;
  }
  return value;
}

/** @param {AbortSignal=} signal */
async function createRegisterContext(signal) {
  const response = await fetch('/api/auth/register/context', {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });
  return readJSON(response);
}

/** @param {{ name: 'user' | 'mail' | 'lock' | 'eye' | 'eyeOff' }} props */
function RegisterIcon({ name }) {
  if (name === 'user') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.75 19c.55-3.3 2.64-5 6.25-5s5.7 1.7 6.25 5" />
      </svg>
    );
  }

  if (name === 'mail') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
        <path d="m5 7 7 5 7-5" />
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

export function RegisterPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const query = useMemo(
    () => new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search),
    [],
  );
  const returnTo = query.get('return_to') || query.get('redirect') || '/';
  const loginHref = `/login?${new URLSearchParams({ return_to: returnTo }).toString()}`;
  const [context, setContext] = useState(/** @type {RegisterContext | null} */ (null));
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('initializing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    createRegisterContext(controller.signal)
      .then((value) => {
        setContext(value);
        setStatus('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setMessage('安全注册初始化失败，请稍后重试。');
          setStatus('error');
        }
      });
    return () => controller.abort();
  }, []);

  /** @param {import('react').FormEvent<HTMLFormElement>} event */
  const submit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!usernamePattern.test(username)) {
      setMessage('用户名应为 3–20 位字母、数字或下划线。');
      return;
    }
    if (!emailPattern.test(email)) {
      setMessage('请输入有效的邮箱地址。');
      return;
    }
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setMessage('密码至少 8 位，并同时包含字母和数字。');
      return;
    }
    if (password !== confirmation) {
      setMessage('两次输入的密码不一致。');
      return;
    }
    if (!accepted) {
      setMessage('请先阅读并同意用户协议和隐私政策。');
      return;
    }
    if (!context) {
      setMessage('安全注册初始化失败，请刷新页面后重试。');
      return;
    }

    setStatus('submitting');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: context.transactionId,
          csrfToken: context.csrfToken,
          username,
          email,
          password,
        }),
      });
      const value = await readJSON(response);
      if (value.redirect) {
        await settleRedirect(value.redirect, navigate, refresh);
        return;
      }
      setStatus('success');
      setMessage('账号已创建，请前往邮箱完成验证。');
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 409) {
        setMessage('用户名或邮箱已被使用，请更换后重试。');
      } else if (error instanceof Error && 'status' in error && error.status === 429) {
        setMessage('注册请求过于频繁，请稍后再试。');
      } else if (error instanceof Error && 'status' in error && error.status === 404) {
        setMessage('自助注册服务尚未启用，请联系管理员开通账号。');
      } else {
        setMessage('注册失败，请稍后重试。');
      }
      try {
        setContext(await createRegisterContext());
        setStatus('ready');
      } catch {
        setContext(null);
        setStatus('error');
      }
    }
  };

  /** @param {string} provider */
  const startProviderRegistration = (provider) => {
    const search = new URLSearchParams({ provider, return_to: returnTo });
    window.location.assign(`/api/auth/register/provider?${search.toString()}`);
  };

  return (
    <main className="login-page register-page">
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

      <section className="login-account register-account" aria-labelledby="register-title">
        <div className="login-account-top">
          <span>已有账号？</span>
          <Link to={loginHref}>去登录 <b aria-hidden="true">→</b></Link>
        </div>

        <div className="login-panel register-panel">
          <div className="login-heading register-heading">
            <span className="login-kicker">CREATE SHIGUANG ACCOUNT</span>
            <h2 id="register-title">创建你的拾光账号</h2>
            <p>开启你的 AI 之旅</p>
          </div>

          <form className="register-form" onSubmit={submit}>
            <div className="register-field-group">
              <label className="login-field" htmlFor="register-username">
                <span className="sr-only">用户名</span>
                <RegisterIcon name="user" />
                <input
                  id="register-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  placeholder="用户名"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={status !== 'ready'}
                  required
                  autoFocus
                />
              </label>
              <small>3–20 个字符，可包含字母、数字和下划线</small>
            </div>

            <div className="register-field-group">
              <label className="login-field" htmlFor="register-email">
                <span className="sr-only">邮箱地址</span>
                <RegisterIcon name="mail" />
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="邮箱地址"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={status !== 'ready'}
                  required
                />
              </label>
              <small>用于接收验证邮件和重要通知</small>
            </div>

            <div className="register-field-group">
              <label className="login-field" htmlFor="register-password">
                <span className="sr-only">设置密码</span>
                <RegisterIcon name="lock" />
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="设置密码"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={status !== 'ready'}
                  required
                />
                <button
                  className="login-password-toggle"
                  type="button"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={status !== 'ready'}
                >
                  <RegisterIcon name={showPassword ? 'eye' : 'eyeOff'} />
                </button>
              </label>
              <small>至少 8 位，并同时包含字母和数字</small>
            </div>

            <div className="register-field-group">
              <label className="login-field" htmlFor="register-confirmation">
                <span className="sr-only">确认密码</span>
                <RegisterIcon name="lock" />
                <input
                  id="register-confirmation"
                  name="password-confirmation"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="确认密码"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  disabled={status !== 'ready'}
                  required
                />
              </label>
            </div>

            <label className="register-agreement">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                disabled={status !== 'ready'}
              />
              <span aria-hidden="true" />
              <em>
                我已阅读并同意
                <a href="/terms">《用户协议》</a>
                和
                <a href="/privacy">《隐私政策》</a>
              </em>
            </label>

            {message && (
              <p className={status === 'success' ? 'register-success' : 'login-error'} role="status">
                {message}
              </p>
            )}

            <button className="login-submit" type="submit" disabled={status !== 'ready'}>
              {status === 'submitting' ? '正在创建账号...' : status === 'success' ? '注册成功' : '创建账号'}
            </button>
          </form>

          <div className="login-divider register-divider"><span>或使用以下方式注册</span></div>
          <div className="login-providers" aria-label="其它注册方式">
            {authProviders.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.enabled ? `使用${item.label}注册` : `${item.label}注册暂未开放`}
                title={item.enabled ? `使用${item.label}注册` : `${item.label}注册暂未开放`}
                aria-disabled={!item.enabled}
                disabled={!item.enabled}
                onClick={() => item.enabled && startProviderRegistration(item.id)}
              >
                <AuthProviderIcon name={item.id} />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
