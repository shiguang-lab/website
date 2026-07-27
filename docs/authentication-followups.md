# 统一认证后续事项

> 更新时间：2026-07-26  
> 适用域名：`shiguanglab.com`、`sso.shiguanglab.com`、`opc.shiguanglab.com`

## 当前状态

- NAS 已部署 Website、Access Gateway、Auth Service、Redis 和 ZITADEL。
- Website 账号密码登录、注册页面及 NAS Session API 已完成本地联调。
- Website 已实现全局登录态、账号菜单、退出登录、账号设置和登录回跳参数；GitHub/Google 首次登录会进入 Website 自定义注册页，不再进入 ZITADEL 内置注册页。
- Website 内部页面使用相对 `return_to`；跨域回到 OPC 时必须使用完整 URL，例如：

  ```text
  https://shiguanglab.com/login?return_to=https%3A%2F%2Fopc.shiguanglab.com%2Fworkspaces
  ```

- Auth Service 会对白名单中的 `return_to` 进行校验，并将其保存在一次性登录事务中；登录请求不能覆盖该地址。
- ZITADEL 注册服务账号使用独立 PAT，并仅授予组织用户管理权限；第三方首次注册由 Auth Service 服务端创建带 IDP Link 的用户。

## GitHub/Google 自定义注册流程

入口统一使用 ZITADEL `IDP Intent`：

1. 已关联的外部身份直接创建 Website session，并回到原始 `return_to`。
2. 未关联的外部身份只保存在 Auth Service 加密 Redis 一次性事务中，重定向到 Website `/register?mode=federated`。
3. Website 提交用户名、邮箱和密码后，Auth Service 调用 `POST /v2/users/new`，在同一请求写入 `human.idpLinks`，然后建立 Website session。

GitHub/Google 的 Provider 回调仍保持 `https://shiguanglab.com/api/auth/oidc/callback`；`/auth/callback` 是 Website 结果页，不填写到 Provider 控制台。

## 待办清单

| 优先级 | 事项 | 完成标准 |
|---|---|---|
| P0 | 发布最新版 Website 到 NAS | 线上导航显示登录态；登录、注册和退出请求格式与 NAS Auth Service 一致 |
| P0 | 配置事务邮件 SMTP | ZITADEL 能稳定发送验证邮件和密码重置邮件；SPF、DKIM、DMARC 验证通过 |
| P0 | 完成邮箱验证闭环 | 支持验证、过期提示、重新发送；验证链接只能使用一次 |
| P0 | 限制未验证账号 | 明确未验证用户是禁止登录，还是仅能访问验证引导页；Auth Service 服务端强制执行 |
| P0 | 忘记密码与密码重置 | 支持申请、邮件通知、一次性重置链接、过期和限流 |
| P1 | 配置第三方身份 Provider | 微信、GitHub、LinkedIn、钉钉分别完成 ZITADEL 配置、账号绑定、重复身份合并和端到端测试 |
| P1 | 持久化产品授权 | 移除全员静态 `superagents:access`，按用户保存和撤销 Entitlement |
| P1 | OPC JIT Provisioning | OPC 验证 `X-SG-Identity`，以 ZITADEL `sub` 自动创建或更新本地用户 |
| P1 | 完成跨产品登出 | 实现 RP-Initiated Logout 与 ZITADEL Back-Channel Logout，统一撤销平台 Session |
| P1 | 签名密钥轮换 | 支持新旧密钥重叠、JWKS 缓存刷新、旧密钥退出和恢复演练 |
| P2 | 审计与监控 | 注册、登录、验证、拒绝、限流、授权和撤销事件可按 Request ID 追踪，且日志不包含敏感信息 |
| P2 | 备份与容灾 | Redis、ZITADEL PostgreSQL、签名密钥和私有配置具备备份、恢复演练及告警 |

## SMTP 需要提供的资料

### 服务端连接信息

| 配置 | 说明 |
|---|---|
| SMTP 服务商 | 推荐使用事务邮件服务，不使用个人邮箱 SMTP |
| SMTP Host | 服务商提供的 SMTP 域名 |
| SMTP Port | 推荐 `587` + STARTTLS；也可使用 `465` + TLS |
| 加密模式 | STARTTLS 或 Implicit TLS，不能使用明文连接 |
| SMTP Username | 专用发信账号 |
| SMTP Password | 专用密码或 API Credential，只存入 NAS Secret |
| 发件地址 | 建议 `notice@shiguanglab.com` 或 `no-reply@shiguanglab.com` |
| 发件人名称 | 建议“拾光” |
| Reply-To | 可选，建议配置真实支持邮箱 |

禁止把 SMTP Password、API Credential、DKIM 私钥写入仓库、日志或前端环境变量。

### 域名与 DNS

需要具备 `shiguanglab.com` 的 DNS 修改权限，并按照邮件服务商要求配置：

- SPF TXT：声明允许代发邮件的服务商。
- DKIM TXT/CNAME：对发件内容签名。
- DMARC TXT：建议先使用监控策略，再逐步提高到隔离或拒绝。
- 自定义 MAIL FROM/Return-Path：服务商支持时启用，用于退信和域名对齐。
- MX：仅在需要该域名接收邮件、退信或回复时配置。

### 邮件链接方案

需要从以下方案中确定一种：

1. ZITADEL 默认验证页面
   - 接入最快。
   - ZITADEL 直接生成并处理验证链接。
   - 适合先完成可用闭环。

2. Website 自定义验证页面
   - 建议地址：`https://shiguanglab.com/verify-email`。
   - 验证邮件携带受控的 `userId`、`orgId` 和一次性 `code`。
   - Website 只负责交互，Auth Service 调用 ZITADEL API 完成验证。
   - 需要额外实现验证、重新发送、过期和失败页面。

建议先上线 ZITADEL 默认验证页面，邮件投递稳定后再切换 Website 自定义页面。

### 网络和测试条件

- NAS 必须能够访问服务商 SMTP Host 的 `587` 或 `465` 出站端口。
- 提供至少两个测试收件箱，建议覆盖 Gmail 和国内主流邮箱。
- 明确服务商的日发送额度、每秒速率和单用户重发限制。
- 配置退信、投诉和封禁处理方式；硬退信地址不得持续重试。
- 验证邮件和密码重置邮件应使用不同模板和明确的有效期。

## SMTP 验收标准

- 验证邮件能够在合理时间内进入收件箱，而不是垃圾邮件。
- SPF、DKIM、DMARC 检查通过且 From 域对齐。
- 验证链接过期后不能使用，成功使用后不能重复使用。
- 重发邮件有服务端限流，不能用于邮件轰炸。
- 未验证用户的访问限制由 Auth Service 强制执行，不能仅依靠前端。
- 密码、SMTP Credential、验证码和完整验证链接不进入日志。
- SMTP 或邮件服务故障不会导致已创建账号处于无法恢复的永久状态。
