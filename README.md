# 拾光官网与 Portal

React + Vite 门户项目。首页采用构建期 SSG，产品系统通过无界加载为微前端；新增业务页面可以使用 Tailwind CSS v4 与 Semi Design，首页保留独立视觉样式。

公开首页负责品牌介绍和统一登录入口。登录后默认进入 `/portal`，集中展示绘光、
映光、灵光和积分系统的入口与 IAM 授权状态。各子系统仍是独立站点，Portal 不嵌入
它们的业务工作台。授权边界与 API 契约见
[`docs/portal-subsystem-access.md`](docs/portal-subsystem-access.md)。

## 本地开发

```bash
npm install
cp .env.example .env.local
npm run dev
```

无真实 IAM 的 Portal 本地验收：

```bash
npm run dev:portal
# http://127.0.0.1:3010/portal
```

该命令只启动回环地址上的短期身份/授权夹具，不访问 ZITADEL 或线上服务。

产品入口为 `/app/:appId/*`。在 `.env.local` 配置对应的 `VITE_APP_*_URL` 后，无界会在该路由加载子应用。
绘光是独立产品站，官网产品菜单直接打开
`https://huiguang.shiguanglab.com`，不通过无界嵌入。

本地 `/login`、`/register` 和 `/api/auth/*` 默认通过 Vite 代理到
`https://shiguanglab.com` 的 NAS 认证服务。代理只在开发服务器中启用，
会把生产父域 Cookie 改写为 localhost 的 Host-only Cookie；不需要在本机
启动 Auth Service。需要切换认证环境时，在 `.env.local` 设置
`AUTH_PROXY_TARGET`。

## 构建与 SEO

```bash
SITE_URL=https://your-domain.example npm run build
npm run preview
```

构建过程先产出客户端包，再生成 SSR 渲染器，最后把首页预渲染为 `dist/index.html`。同时生成 `robots.txt`、`sitemap.xml`、canonical、Open Graph 与 JSON-LD。`dist/app.html` 是微前端路由的客户端壳层，不参与索引。

静态托管需要把 `/app/*` 重写到 `/app.html`。仓库内的 `public/_redirects` 可直接用于 Netlify/Cloudflare Pages；Nginx 等环境请配置等价 rewrite。

## 镜像发布与 NAS 部署

版本 tag `v*` 会触发 GitHub Actions，执行类型检查和测试后构建
`linux/amd64` 镜像，并发布到 `ghcr.io/shiguang-lab/website`。镜像同时生成
版本号、原始 tag、Commit SHA 和 `latest` 标签。

NAS 使用 [`deploy/docker-compose.nas.yml`](deploy/docker-compose.nas.yml) 拉取
指定版本，不在 NAS 或开发机上构建：

```bash
cp deploy/website.env.example deploy/website.env
# 将 WEBSITE_IMAGE_TAG 改为要发布的 tag，例如 v1.0.0
docker compose --env-file deploy/website.env -f deploy/docker-compose.nas.yml pull
docker compose --env-file deploy/website.env -f deploy/docker-compose.nas.yml up -d
```

司辰桌面安装包不进入网站镜像。NAS 将持久化的 `downloads` 目录只读挂载到
`/usr/share/nginx/html/downloads`，升级网站镜像不会覆盖或删除安装包。

## 织界产品页

`/projects/zhijie` 是基于 Plasmic 的可视化应用搭建产品主页，进入官网产品菜单、
首页产品区和 sitemap。在线使用默认打开 `https://studio.plasmic.shiguanglab.com`，
沿用 Studio 的拾光统一登录，可通过 `VITE_PLASMIC_WEB_URL` 修改入口。

产品内容覆盖 Studio 编辑器、数据连接与拖拽搭建、自由设计与 Figma 导入、团队协作、
React 组件集成和自主部署。产品示例图片来自 Plasmic 官网，来源见
[`docs/zhijie-media.md`](docs/zhijie-media.md)。

下载区在页面打开时读取公网域名配置 `VITE_PLASMIC_UPDATE_URL` 下的
`latest.json`（默认 `https://studio.plasmic.shiguanglab.com/desktop-updates/latest.json`）。
版本、大小和下载地址来自这份 JSON，不写入网站构建或 SSR 快照。
Actions 构建三个平台的安装包并核对 SHA-512，再将安装包、Electron 更新 YAML
和 JSON 一起打进 Plasmic 的静态下载镜像。更新 App 时只部署下载镜像，无需发布网站。
macOS 分别提供 Apple Silicon 和 Intel DMG；浏览器能识别芯片时标出推荐版本，
无法识别时保留两个选择和芯片查看说明。已安装旧版 App 的 Universal 更新通道
由 Plasmic 下载镜像保留，升级后自动使用本机对应的独立更新包。
浏览器直接读取 HTTPS 域名，使用 `no-store`、不发送 Cookie 或 Authorization，
并通过 HEAD 核对安装包大小。下载服务配置 CORS，不依赖网站代理或 IP 地址。
未发布或读取失败的平台显示 “Not available yet”。安装包仍使用 Plasmic 名称。

## Umami 埋点

Umami tracker 在 `index.html` 中统一加载，自动追踪页面访问。`src/analytics/umami.ts` 会自动采集门户内所有按钮和超链接点击：

- 按钮统一上报 `button_click`
- 超链接统一上报 `link_click`
- 使用 `data-analytics-label="事件标签"` 提供稳定标签
- 使用 `data-umami-ignore` 排除不应采集的元素
- 使用 `data-umami-event="自定义事件名"` 时交由 Umami 原生事件机制处理，不重复上报

自动事件只采集标签、当前路径、页面区域及去除查询参数后的链接地址，不采集输入值。无界子应用运行在隔离环境中，子应用内部点击需要由各子应用独立接入 Umami，或通过无界通信总线上报到主应用。

## 目录

```text
src/pages/HomePage.tsx       首页静态内容
src/pages/MicroAppPage.tsx   微前端运行时壳层
src/micro-apps/registry.ts   产品注册表
src/styles/home.less         首页原有视觉样式
src/styles/tailwind.less     Tailwind v4（tw: 前缀）
scripts/prerender.mjs        SSG 与 SEO 文件生成
```
