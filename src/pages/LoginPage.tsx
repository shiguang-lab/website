import { useEffect, useState, type FormEvent, type HTMLInputTypeAttribute } from 'react';
import { Link, useNavigate, type NavigateFunction } from 'react-router-dom';
import { AuthProviderIcon } from '../components/AuthProviderIcons';
import { authProviders } from '../config/authProviders';
import { useAuth } from '../auth/useAuth';

const genericError = '登录失败，请检查账号和密码后重试。';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginModeId = 'account' | 'email' | 'sso';
type LoginStatus = 'initializing' | 'ready' | 'submitting' | 'error';
type EmailStep = 'address' | 'code';

interface LoginMode {
  id: LoginModeId;
  label: string;
  inputLabel: string;
  placeholder: string;
  autoComplete: string;
  inputMode: 'text' | 'email';
  inputType: HTMLInputTypeAttribute;
  enabled: boolean;
  disabledHint?: string;
}

interface LoginContext {
  transactionId: string;
  csrfToken: string;
}

interface ErrorPayload {
  error?: string;
}

/**
 * 登录方式。`enabled: false` 的方式保留配置但不渲染:
 * - sso:企业 SSO,等企业 IdP 接入后放开。
 */
const loginModes: LoginMode[] = [
  {
    id: 'account',
    label: '账号登录',
    inputLabel: '用户名',
    placeholder: '请输入用户名',
    autoComplete: 'username',
    inputMode: 'text',
    inputType: 'text',
    enabled: true,
  },
  {
    id: 'email',
    label: '邮箱登录',
    inputLabel: '邮箱地址',
    placeholder: '请输入邮箱地址',
    autoComplete: 'email',
    inputMode: 'email',
    inputType: 'email',
    enabled: true,
  },
  {
    id: 'sso',
    label: '企业 SSO',
    inputLabel: '企业账号',
    placeholder: '请输入企业账号',
    autoComplete: 'username',
    inputMode: 'text',
    inputType: 'text',
    enabled: false,
    disabledHint: '企业 SSO 暂未开放',
  },
];

async function readJSON<T>(response: Response): Promise<T> {
  const value = await response.json().catch(() => ({})) as T & ErrorPayload;
  if (!response.ok) {
    const error = Object.assign(new Error(value.error || 'request_failed'), { status: response.status });
    throw error;
  }
  return value;
}

async function createLoginContext(returnTo: string, signal?: AbortSignal): Promise<LoginContext> {
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
  return readJSON<LoginContext>(response);
}

function emailLinkStatusMessage(status: string | null) {
  if (status === 'browser') return '请在发送验证码的同一浏览器中打开邮件链接，或返回原页面手动输入验证码。';
  if (status === 'expired' || status === 'invalid') return '邮件验证码链接无效或已过期，请重新发送。';
  if (status === 'rate_limited') return '验证尝试次数过多，请稍后重新发送验证码。';
  if (status === 'error') return '邮件验证码验证失败，请重新发送后再试。';
  return '';
}

function LoginIcon({ name }: { name: 'user' | 'mail' | 'lock' | 'eye' | 'eyeOff' }) {
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
 */
async function settleRedirect(
  target: string | undefined,
  navigate: NavigateFunction,
  refresh: (signal?: AbortSignal) => Promise<unknown>,
) {
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
  const query = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  const returnTo = query.get('return_to') || query.get('redirect') || '/';
  const initialMode = query.get('mode') === 'email' ? 'email' : 'account';
  const registerHref = `/register?${new URLSearchParams({ return_to: returnTo }).toString()}`;
  const loginHelpHref = `/login-help?${new URLSearchParams({ return_to: returnTo }).toString()}`;
  const [context, setContext] = useState<LoginContext | null>(null);
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailStep, setEmailStep] = useState<EmailStep>('address');
  const [resendSeconds, setResendSeconds] = useState(0);
  const [mode, setMode] = useState<LoginModeId>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<LoginStatus>('initializing');
  const [pendingAction, setPendingAction] = useState('');
  const [message, setMessage] = useState(() => emailLinkStatusMessage(query.get('email_status')));
  const activeMode = loginModes.find((item) => item.id === mode) || loginModes[0];
  const emailSendConfirmed =
    mode === 'email' && emailStep === 'code' && pendingAction !== 'send' && !message;
  const feedbackMessage =
    message || (emailSendConfirmed ? '验证码已发送至当前邮箱，请注意查收。' : '');

  useEffect(() => {
    const controller = new AbortController();
    createLoginContext(returnTo, controller.signal)
      .then((value) => {
        setContext(value);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (!(error instanceof Error) || error.name !== 'AbortError') {
          setMessage('安全登录初始化失败，请稍后重试。');
          setStatus('error');
        }
      });
    return () => controller.abort();
  }, [returnTo]);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = window.setTimeout(() => setResendSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const startFederatedLogin = (provider: string) => {
    const search = new URLSearchParams({ provider, return_to: returnTo });
    window.location.assign(`/api/auth/federated/start?${search.toString()}`);
  };

  const renewContext = async () => {
    setContext(null);
    setStatus('initializing');
    const nextContext = await createLoginContext(returnTo);
    setContext(nextContext);
    setStatus('ready');
    return nextContext;
  };

  const requestEmailCode = async () => {
    const email = loginName.trim().toLowerCase();
    if (!emailPattern.test(email)) {
      setMessage('请输入有效的邮箱地址。');
      return;
    }
    let activeContext = context;
    if (!activeContext) {
      try {
        activeContext = await renewContext();
      } catch {
        setMessage('安全登录初始化失败，请稍后重试。');
        setStatus('error');
        return;
      }
    }
    if (!activeContext) return;
    setPendingAction('send');
    setStatus('submitting');
    setMessage('');
    try {
      const response = await fetch('/api/auth/login/email/code', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: activeContext.transactionId,
          email,
          csrfToken: activeContext.csrfToken,
        }),
      });
      const value = await readJSON<{ resendAfter?: number }>(response);
      setLoginName(email);
      setEmailStep('code');
      setEmailCode('');
      setResendSeconds(typeof value.resendAfter === 'number' && Number.isFinite(value.resendAfter) ? value.resendAfter : 60);
      setPendingAction('');
      setStatus('ready');
      setMessage('');
    } catch (error) {
      setPendingAction('');
      if (error instanceof Error && 'status' in error && error.status === 429) {
        setMessage('验证码发送过于频繁，请稍后再试。');
        setStatus('ready');
        return;
      }
      setEmailStep('address');
      try {
        await renewContext();
        setMessage('验证码发送失败，请稍后重试。');
      } catch {
        setMessage('安全登录初始化失败，请稍后重试。');
        setStatus('error');
      }
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'submitting' || status === 'initializing') return;
    const normalizedLoginName = loginName.trim();
    if (mode === 'email' && !emailPattern.test(normalizedLoginName)) {
      setMessage('请输入有效的邮箱地址。');
      return;
    }
    if (mode === 'email' && emailStep !== 'code') {
      setMessage('请先发送邮箱验证码。');
      return;
    }
    if (mode === 'email' && !/^\d{8}$/.test(emailCode)) {
      setMessage('请输入 8 位邮箱验证码。');
      return;
    }
    if (!context) {
      setMessage('');
      try {
        await renewContext();
      } catch {
        setMessage('安全登录初始化失败，请稍后重试。');
        setStatus('error');
      }
      return;
    }
    setPendingAction(mode === 'email' ? 'verify' : 'password');
    setStatus('submitting');
    setMessage('');
    try {
      const response = await fetch(mode === 'email' ? '/api/auth/login/email/verify' : '/api/auth/login/password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: context.transactionId,
          ...(mode === 'email'
            ? { code: emailCode }
            : { loginName: normalizedLoginName, password }),
          csrfToken: context.csrfToken,
        }),
      });
      const value = await readJSON<{ redirect?: string }>(response);
      await settleRedirect(value.redirect, navigate, refresh);
    } catch (error) {
      setPendingAction('');
      if (mode === 'email') setEmailCode('');
      else setPassword('');
      setMessage(
        error instanceof Error && 'status' in error && error.status === 429
          ? '尝试次数过多，请稍后再试。'
          : mode === 'email'
            ? '验证码错误或已过期，请重新输入或发送新验证码。'
            : genericError,
      );
      if (mode === 'email' && error instanceof Error && 'status' in error && error.status === 401) {
        setStatus('ready');
      } else {
        if (mode === 'email') setEmailStep('address');
        try {
          await renewContext();
        } catch {
          setStatus('error');
        }
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
            {loginModes.filter((item) => item.enabled).map((item) => (
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
                  setLoginName('');
                  setPassword('');
                  setEmailCode('');
                  setEmailStep('address');
                  setResendSeconds(0);
                  setPendingAction('');
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
              <LoginIcon name={mode === 'email' ? 'mail' : 'user'} />
              <input
                id="login-name"
                name={mode === 'email' ? 'email' : 'username'}
                type={activeMode.inputType === 'email' ? 'email' : 'text'}
                inputMode={activeMode.inputMode === 'email' ? 'email' : 'text'}
                autoComplete={activeMode.autoComplete}
                autoCapitalize="none"
                spellCheck="false"
                placeholder={activeMode.placeholder}
                value={loginName}
                onChange={(event) => {
                  setLoginName(event.target.value);
                  if (mode === 'email' && emailStep === 'code') {
                    setEmailStep('address');
                    setEmailCode('');
                    setResendSeconds(0);
                    setMessage('');
                  }
                }}
                disabled={status === 'submitting'}
                required
                autoFocus
              />
            </label>
            {mode === 'account' && (
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
            )}

            {mode === 'email' && (
              <label className="login-field" htmlFor="login-email-code">
                <span className="sr-only">邮箱验证码</span>
                <LoginIcon name="lock" />
                <input
                  id="login-email-code"
                  name="one-time-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="请输入 8 位验证码"
                  value={emailCode}
                  onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, '').slice(0, 8))}
                  maxLength={8}
                  disabled={status === 'submitting'}
                  required
                />
                <button
                  className="login-code-send"
                  type="button"
                  disabled={status === 'initializing' || status === 'submitting' || resendSeconds > 0}
                  onClick={requestEmailCode}
                >
                  {pendingAction === 'send'
                    ? '发送中...'
                    : resendSeconds > 0
                      ? `${resendSeconds}s`
                      : emailStep === 'code'
                        ? '重新发送'
                        : '发送验证码'}
                </button>
              </label>
            )}

            <div className="login-form-options">
              <span>
                {status === 'initializing'
                  ? '正在建立安全登录连接…'
                  : mode === 'email'
                    ? emailStep === 'code'
                      ? '邮箱验证码 · 安全登录'
                      : '无密码邮箱登录'
                    : '统一账号 · 安全登录'}
              </span>
              <Link to={loginHelpHref}>无法登录？</Link>
            </div>

            <p
              className={`login-error login-message-slot${emailSendConfirmed ? ' login-message-success' : ''}`}
              role={emailSendConfirmed ? 'status' : 'alert'}
              aria-live="polite"
            >
              {feedbackMessage}
            </p>
            <button
              className="login-submit"
              type="submit"
              disabled={status === 'initializing' || status === 'submitting'}
            >
              {status === 'submitting'
                ? pendingAction === 'send'
                  ? '验证并登录'
                  : mode === 'email'
                    ? '正在验证...'
                    : '正在登录...'
                : status === 'initializing'
                  ? '正在准备...'
                  : status === 'error'
                    ? '重新准备登录'
                    : mode === 'email'
                        ? '验证并登录'
                        : '登录'}
            </button>
          </form>

          <p className="login-legal">
            登录即表示你同意拾光的
            <Link to="/terms">《用户协议》</Link>
            和
            <Link to="/privacy">《隐私政策》</Link>
          </p>
          <div className="login-divider"><span>或通过以下方式登录</span></div>
          <div className="login-providers" aria-label="其它登录方式">
            {authProviders.filter((item) => item.enabled).map((item) => (
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
            {mode === 'email' ? '一次性验证码 · 会话安全保护' : '密码加密传输 · 会话安全保护'}
          </div>
        </div>
      </section>
    </main>
  );
}
