export interface PasswordPolicy {
  minLength: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export function passwordRequirements(policy: PasswordPolicy): string {
  const required = [
    policy.hasUppercase && '大写字母',
    policy.hasLowercase && '小写字母',
    policy.hasNumber && '数字',
    policy.hasSymbol && '符号（如 !、@、#）',
  ].filter(Boolean);
  return `至少 ${policy.minLength} 位${required.length ? `，并同时包含${required.join('、')}` : ''}。`;
}

export function passwordValidationMessage(password: string, policy: PasswordPolicy): string {
  // ZITADEL checks UTF-8 byte length and ASCII character classes.
  const length = new TextEncoder().encode(password).length;
  if (length > 200) return '密码过长，请使用不超过 200 字节的密码。';
  if (length < policy.minLength) return `密码至少需要 ${policy.minLength} 位。`;
  if (policy.hasLowercase && !/[a-z]/.test(password)) return '密码必须包含小写字母。';
  if (policy.hasUppercase && !/[A-Z]/.test(password)) return '密码必须包含大写字母。';
  if (policy.hasNumber && !/[0-9]/.test(password)) return '密码必须包含数字。';
  if (policy.hasSymbol && !/[^A-Za-z0-9]/.test(password)) return '密码必须包含符号（如 !、@、#）。';
  return '';
}

class RegistrationError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function readRegistrationJSON<T>(response: Response): Promise<T> {
  const value = response.ok ? await response.json() : await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new RegistrationError(
      response.status,
      typeof value?.error === 'string' ? value.error : 'request_failed',
      typeof value?.message === 'string' ? value.message : undefined,
    );
  }
  return value as T;
}

export function registrationErrorMessage(error: unknown): string {
  if (error instanceof RegistrationError) {
    const messages: Record<string, string> = {
      expired_registration: '注册会话已过期，请重新登录第三方账号或返回注册页重试。',
      invalid_csrf: '注册安全校验失败，请刷新页面后重试。',
      invalid_origin: '当前页面地址未获准注册，请从拾光官网重新进入。',
      invalid_request: '注册请求格式不正确，请刷新页面后重试。',
      invalid_registration: '注册信息不符合要求，请检查用户名、邮箱和密码。',
      account_exists: '用户名或邮箱已被使用，请更换后重试。',
      registration_rejected: error.message || '注册信息被认证服务拒绝，请检查用户名、邮箱和密码。',
      try_again_later: '注册请求过于频繁，请稍后再试。',
      temporarily_unavailable: '认证服务暂时不可用，请稍后重试。',
    };
    if (messages[error.code]) return messages[error.code];
    if (error.status === 409) return messages.account_exists;
    if (error.status === 429) return messages.try_again_later;
    if (error.status === 404) return '自助注册服务尚未启用，请联系管理员开通账号。';
    return `注册请求失败（HTTP ${error.status}），请稍后重试。`;
  }
  if (error instanceof TypeError) return '网络连接失败，请检查网络后重试。';
  return '注册请求未能完成，请刷新页面后重试。';
}
