/**
 * 第三方登录/注册渠道。`enabled: false` 的渠道保留配置但不渲染,
 * 每对接通一个(ZITADEL IdP + auth-service 接线)就把对应项置 true。
 */
export const authProviders = [
  { id: 'wechat', label: '微信', enabled: false },
  { id: 'github', label: 'GitHub', enabled: true },
  { id: 'google', label: 'Google', enabled: true },
  { id: 'feishu', label: '飞书', enabled: true },
  { id: 'linkedin', label: 'LinkedIn', enabled: false },
  { id: 'dingtalk', label: '钉钉', enabled: false },
];
