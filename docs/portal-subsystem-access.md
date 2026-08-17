# 拾光 Portal 与子系统授权边界

## 目标

拾光官网同时承担公开介绍、统一登录入口和登录后的 Portal。Portal 只聚合
身份与产品入口，不嵌入绘光、映光、灵光或积分系统的业务页面。四个子系统保持
独立仓库、独立服务和独立域名。

登录后的用户通过 `/portal` 查看自己可以访问的系统。IAM 管理员可以通过
`/portal/access` 给其他 ACTIVE 用户分配产品级角色。产品内资源授权仍由产品
自己维护：

- 绘光、映光的任务和资产只在对应产品内授权；
- 灵光的租户安装、发布版本和审核资源只在灵光内授权；
- 积分应用的 OWNER/ADMIN 成员关系只在积分系统内授权；
- Portal 不签发机器凭据，不展示产品 secret，不代理产品写操作。

## 产品角色白名单

| 产品 | IAM 可分配角色 | 说明 |
| --- | --- | --- |
| 绘光 | `huiguang:user`、`huiguang:gray-creator`、`huiguang:ops-admin` | 灰度与运营角色属于高权限 |
| 映光 | `yingguang:user`、`yingguang:ops-admin` | 平台审计不作为产品角色分配 |
| 灵光 | `lingguang:consumer`、`lingguang:developer`、`lingguang:reviewer`、`lingguang:platform-admin` | Auth/Gateway 需映射到灵光内部四角色 |
| 积分系统 | `platform:points-auditor`、`platform:points-admin` | 普通账号的个人积分访问来自统一身份；这里仅管理平台角色 |

全局 `platform:admin` 和 IAM 管理角色 `opc:system-admin` 不在普通产品授权接口的
可分配范围内。管理员不能修改自己的高权限角色。

## Portal API 契约

所有接口必须由主站 Gateway 路由到 Auth Service，只接受同源 Cookie。浏览器不得
持有 ZITADEL Token、PAT、客户端密钥或 Gateway 服务凭据。

### 当前用户授权

```http
GET /api/auth/portal/access
```

```json
{
  "revision": "r42",
  "products": [
    {
      "id": "huiguang",
      "status": "active",
      "roles": ["huiguang:user"],
      "source": "iam"
    }
  ]
}
```

产品 URL 由官网本地白名单决定，不能接受 API 返回的任意跳转地址。

### 用户检索

```http
POST /api/auth/iam/product-role-assignments/search
Content-Type: application/json

{"query":"alice","limit":10}
```

仅 `opc:system-admin` 可以调用。响应只返回用户 ID、登录名、显示名、状态和产品角色，
不得返回手机号、第三方身份、Token 或其他资料。

### 角色变更

```http
PUT /api/auth/iam/product-role-assignments/{userId}
Idempotency-Key: <unique key>
Content-Type: application/json

{"roles":["huiguang:user","yingguang:user"]}
```

服务端必须重新确认：调用者 IAM 管理权限、目标用户 ACTIVE 状态、禁止自改、角色
白名单、请求 Origin、速率限制和幂等键。写入采用持久化命令日志；超时或结果不确定
时返回 `503` 并进入人工对账，不得假报成功。

## 当前交付状态

- 官网 Portal、授权编辑器、响应式页面和无密钥本地夹具已实现。
- 官网生产代码只调用上述同源 API，接口不可用时失败关闭。
- Auth Service `codex/portal-product-role-access` 分支已实现 Portal 聚合、通用产品角色
  API、真实 ZITADEL 只读目录和保留旧积分接口的分范围命令；尚未合并部署。
- Auth Service 生产写入仍失败关闭，必须在永久审计存储、ZITADEL 写执行器和对账
  运维能力完成后才能开启；本地 Redis 夹具已覆盖幂等与跨产品角色保留。
- 灵光需要把 namespaced IAM 角色映射到现有内部角色后才能进入真实联调。
- 真实 ZITADEL 写入、Gateway 路由、staging smoke 与审计告警是发布门禁。

本地开发可执行 `npm run dev:portal`，打开
`http://127.0.0.1:3010/portal`。夹具只监听回环地址，不访问真实 IAM。
