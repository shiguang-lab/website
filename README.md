# 拾光主站

React + Vite 门户项目。首页采用构建期 SSG，产品系统通过无界加载为微前端；新增业务页面可以使用 Tailwind CSS v4 与 Semi Design，首页保留独立视觉样式。

## 本地开发

```bash
npm install
cp .env.example .env.local
npm run dev
```

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

## Umami 埋点

Umami tracker 在 `index.html` 中统一加载，自动追踪页面访问。`src/analytics/umami.js` 会自动采集门户内所有按钮和超链接点击：

- 按钮统一上报 `button_click`
- 超链接统一上报 `link_click`
- 使用 `data-analytics-label="事件标签"` 提供稳定标签
- 使用 `data-umami-ignore` 排除不应采集的元素
- 使用 `data-umami-event="自定义事件名"` 时交由 Umami 原生事件机制处理，不重复上报

自动事件只采集标签、当前路径、页面区域及去除查询参数后的链接地址，不采集输入值。无界子应用运行在隔离环境中，子应用内部点击需要由各子应用独立接入 Umami，或通过无界通信总线上报到主应用。

## 目录

```text
src/pages/HomePage.jsx       首页静态内容
src/pages/MicroAppPage.jsx   微前端运行时壳层
src/micro-apps/registry.js   产品注册表
src/styles/home.less         首页原有视觉样式
src/styles/tailwind.less     Tailwind v4（tw: 前缀）
scripts/prerender.mjs        SSG 与 SEO 文件生成
```
