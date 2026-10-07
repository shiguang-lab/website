import IconArrowRight from '@douyinfe/semi-icons/lib/es/icons/IconArrowRight';
import IconBolt from '@douyinfe/semi-icons/lib/es/icons/IconBolt';
import IconCode from '@douyinfe/semi-icons/lib/es/icons/IconCode';
import IconDownload from '@douyinfe/semi-icons/lib/es/icons/IconDownload';
import IconGlobe from '@douyinfe/semi-icons/lib/es/icons/IconGlobe';
import IconLayers from '@douyinfe/semi-icons/lib/es/icons/IconLayers';
import IconLink from '@douyinfe/semi-icons/lib/es/icons/IconLink';
import IconTerminal from '@douyinfe/semi-icons/lib/es/icons/IconTerminal';
import { useEffect, useId, useState } from 'react';
import { PageMeta } from '../components/PageMeta';
import { PlatformGlyph } from '../components/PlatformGlyph';
import { SiteHeader } from '../components/SiteHeader';
import { ZhijieMark } from '../components/ZhijieMark';
import { PLASMIC_DOWNLOADS } from '../config/plasmicDownloads';
import { PLASMIC_WEB_URL } from '../config/productUrls';
import { useHomeEffects } from '../hooks/useHomeEffects';

function HowItWorks() {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = ['连接数据', '拖拽搭建'];
  return (
    <section id="capabilities" className="zhijie-how container">
      <div className="zhijie-section-heading reveal"><span className="section-kicker">HOW IT WORKS</span><h2>飞速构建<br /><em>产品体验。</em></h2><p>现成组件与数据集成，加上动态值和交互，让应用在画布中成形。</p></div>
      <div className="zhijie-feature-tabs" role="tablist" aria-label="应用搭建能力">
        {tabs.map((label, index) => <button type="button" key={label} role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => {
          const next = ['ArrowLeft', 'ArrowRight'].includes(event.key) ? 1 - index : event.key === 'Home' ? 0 : event.key === 'End' ? 1 : null;
          if (next !== null) { event.preventDefault(); setActive(next); document.getElementById(`${id}-tab-${next}`)?.focus(); }
        }}>{label}</button>)}
      </div>
      <div className="zhijie-how-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`} tabIndex={0}>
        <div className="zhijie-feature-copy"><span className="zhijie-feature-icon">{active === 0 ? <IconLink /> : <IconLayers />}</span><h3>{active === 0 ? <>连接<br /><em>任意数据源</em></> : <>拖拽<br /><em>组合组件</em></>}</h3><p>{active === 0 ? '支持 Supabase、Contentful、Shopify，以及 HTTP / GraphQL API。' : '在画布中添加组件，配置动态内容、状态与事件。'}</p>{active === 0 && <a className="btn btn-ghost" href="https://www.plasmic.app/integrations" target="_blank" rel="noopener noreferrer">查看全部集成 <IconArrowRight /></a>}</div>
        <figure className={active === 0 ? 'zhijie-connect-visual' : 'zhijie-editor-visual'}><img src={active === 0 ? '/assets/zhijie/connect.svg' : '/assets/zhijie/drag-drop.webp'} width={active === 0 ? 498 : 1397} height={active === 0 ? 512 : 1422} alt={active === 0 ? 'Plasmic 数据集成示意：Google Sheets、Zapier、Supabase、Vercel、Contentful 和 Shopify' : 'Plasmic Studio 中拖拽组件搭建仪表盘'} /></figure>
      </div>
    </section>
  );
}

function AiWorkflow() {
  return (
    <section id="ai" className="zhijie-ai container" aria-labelledby="zhijie-ai-title">
      <div className="zhijie-section-heading reveal"><span className="section-kicker">BUILD WITH AI</span><h2 id="zhijie-ai-title">让 AI 连接<em>设计与代码。</em></h2><p>通过 CLI 接入 Skill，把需求变成可编辑的原型，再交付符合项目规范的 React 代码。</p></div>
      <div className="zhijie-ai-workbench">
        <div className="zhijie-ai-terminal">
          <div className="zhijie-ai-terminal-heading"><IconTerminal aria-hidden="true" /><span>PLASMICKIT CLI</span><span>Node.js ≥ 22.12</span></div>
          <div className="zhijie-ai-command"><span>01 / 自动安装 CLI 与 Skill</span><pre><code>npm install -g @plasmickit/cli@latest{'\n'}plasmickit skill install</code></pre></div>
          <div className="zhijie-ai-command"><span>02 / 加载原型设计工作流</span><pre><code>plasmickit context resolve --mode <b>prototype</b></code></pre></div>
          <div className="zhijie-ai-command"><span>03 / 加载代码生成工作流</span><pre><code>plasmickit context resolve --mode <b>codegen</b></code></pre></div>
          <p>自动检测本机受支持的 AI CLI 与应用，为所有检测到的客户端安装 Skill。</p>
        </div>
        <div className="zhijie-ai-flow" aria-label="AI 工作流示意：从需求生成 Studio 原型和项目代码">
          <div className="zhijie-ai-prompt"><span>需求示例</span><p>“设计一个客户管理页面，<br />并接入现有的 React 项目。”</p></div>
          <div className="zhijie-ai-agent"><span className="zhijie-ai-agent-icon"><IconBolt aria-hidden="true" /></span><div><strong>AI Agent + Plasmic Skill</strong><span>理解需求 · 读取组件契约 · 执行工作流</span></div><span className="zhijie-ai-flow-label">工作流示意</span></div>
          <div className="zhijie-ai-outputs">
            <div><IconLayers aria-hidden="true" /><span>DESIGN</span><h3>可编辑的 Studio 原型</h3><p>页面、组件、状态与交互<br />在画布中继续调整</p></div>
            <div><IconCode aria-hidden="true" /><span>CODE</span><h3>React / TypeScript 代码</h3><p>沿用现有组件与工程规范<br />接入真实项目并验证</p></div>
          </div>
        </div>
      </div>
      <div className="zhijie-ai-capabilities">
        <article><IconTerminal aria-hidden="true" /><h3>CLI 接入</h3><p>自动识别已安装的 Agent CLI 与应用，无需选择安装目录。为不同工具加载同一套 Skill、工作流与规范。</p></article>
        <article><IconBolt aria-hidden="true" /><h3>Skill 驱动设计</h3><p>通过桌面端 MCP 搭建和修改真实页面，复用组件，配置状态与交互，保留可编辑结构。</p></article>
        <article><IconCode aria-hidden="true" /><h3>生成项目代码</h3><p>读取页面模型与组件契约，由 Agent 实现原生 React / TypeScript，并核对构建、行为与视觉。</p></article>
      </div>
      <div className="zhijie-ai-access"><p>通过桌面端 MCP 连接 Studio，开始 AI 设计与页面读取。</p><a className="zhijie-text-link" href="#download">下载桌面端 <IconArrowRight aria-hidden="true" /></a></div>
    </section>
  );
}

const scaleCapabilities = [
  { image: 'security', title: 'SOC 2 合规', description: '了解 Plasmic 官方服务的安全与合规信息。', href: 'https://www.plasmic.app/enterprise' },
  { image: 'sso', title: 'SSO 与域名管理', description: '统一团队身份与组织访问入口。' },
  { image: 'permissions', title: '精细化权限', description: '管理项目成员与应用用户的访问权限。' },
  { image: 'branching', title: '分支与审批', description: '独立分支中迭代，评审后合并变更。' },
  { image: 'libraries', title: '共享组件库', description: '跨项目复用组织的组件与设计资源。' },
  { image: 'on-premise', title: '私有化应用部署', description: '将应用交付到自有服务器或内网环境。' },
];

export function ZhijiePage() {
  useHomeEffects();
  const [platform, setPlatform] = useState<string | null>(null);
  useEffect(() => {
    const ua = navigator.userAgent;
    const detected = /Windows/i.test(ua) ? 'windows' : /Macintosh|Mac OS X/i.test(ua) ? 'mac' : /Linux/i.test(ua) && !/Android/i.test(ua) ? 'linux' : null;
    Promise.resolve().then(() => setPlatform(detected));
  }, []);

  return (
    <div className="page-shell zhijie-page">
      <PageMeta title="织界 · 可视化应用搭建平台 | 拾光" description="织界基于开源 Plasmic，为你的技术栈提供可视化搭建能力。连接数据、复用 React 组件、设计网站与应用，接入现有代码和部署环境。" />
      <SiteHeader productPage />
      <main id="top">
        <section className="zhijie-hero">
          <div className="container">
            <div className="zhijie-hero-copy">
              <div className="zhijie-eyebrow"><ZhijieMark /><strong>织界</strong><span>基于开源 Plasmic</span></div>
              <h1>适配你的技术栈的<br /><em>可视化搭建器</em></h1>
              <p>用可视化方式构建网站和应用，管理内容，复用已有的 React 组件。<br />从画布到现有代码项目，让设计与开发在同一条工作流里完成。</p>
              <div className="zhijie-actions"><a className="btn btn-primary btn-lg" href={PLASMIC_WEB_URL} target="_blank" rel="noopener noreferrer">在线使用 <IconArrowRight aria-hidden="true" /></a><a className="btn btn-ghost btn-lg" href="#download"><IconDownload aria-hidden="true" />下载桌面端</a></div>
            </div>
            <div className="zhijie-preview-wrap">
              <div className="zhijie-preview-frame"><img className="zhijie-studio-image" src="/assets/zhijie/studio.webp" width="1600" height="900" fetchPriority="high" alt="Plasmic Studio 中同时编辑桌面和移动端商城页面，右侧属性面板设置文字、布局与样式" /></div>
              <div className="zhijie-preview-fade"><div className="zhijie-use-types" aria-label="可搭建的产品类型">{['内部工具', '客户门户', 'SaaS 应用', '电商店铺', '网站', '内容管理'].map(type => <span key={type}>{type}</span>)}</div></div>
            </div>
          </div>
        </section>
        <HowItWorks />
        <AiWorkflow />
        <section id="design" className="zhijie-design">
          <div className="container">
            <div className="zhijie-section-heading reveal"><span className="section-kicker">DESIGN</span><h2>设计用户<br /><em>喜爱的体验。</em></h2><p>用自定义界面、响应式布局与样式，表达你的产品设计。</p></div>
            <div className="zhijie-feature-row">
              <div className="zhijie-feature-copy reveal"><IconLayers className="zhijie-feature-icon" aria-hidden="true" /><h3>打造完全<br /><em>自定义的界面</em></h3><p>布局、排版与样式由你定义，让界面适配业务需求。</p></div>
              <figure className="zhijie-editor-visual reveal"><img src="/assets/zhijie/design.webp" width="1400" height="995" loading="lazy" alt="Plasmic 自定义视频应用界面示例" /></figure>
            </div>
            <div className="zhijie-feature-row is-reversed">
              <div className="zhijie-feature-copy reveal"><IconLink className="zhijie-feature-icon" aria-hidden="true" /><h3>导入<br /><em>Figma 设计</em></h3><p>把设计转为 Studio 中可编辑的页面，继续交付 React 应用。</p><a className="zhijie-text-link" href="https://www.figma.com/community/plugin/845367649027913572/Plasmic-Exporter/Figma-to-Code-by-Plasmic" target="_blank" rel="noopener noreferrer">Figma 导入工具 <IconArrowRight /></a></div>
              <figure className="zhijie-editor-visual"><video src="/assets/zhijie/figma.mp4" poster="/assets/zhijie/figma-poster.jpg" width="1432" height="1080" muted autoPlay loop playsInline controls preload="metadata" aria-label="Plasmic 官方演示：将 Figma 仪表盘导入 Studio" /></figure>
            </div>
          </div>
        </section>
        <section id="collaboration" className="zhijie-collaboration container">
          <div className="zhijie-section-heading is-left reveal"><span className="section-kicker">COLLABORATION</span><h2><em>打破壁垒，</em><br />连接团队。</h2><p>让开发、设计、内容与业务团队参与同一条产品工作流。</p></div>
          <div className="zhijie-collaboration-details reveal"><article><h3>让更多人<br /><em>参与构建</em></h3><p>开发者提供组件，其他团队成员在画布中搭建和发布页面。</p></article><article><h3>让协作<br /><em>顺畅推进</em></h3><p>多人编辑与分支协作，让不同角色并行完成各自的工作。</p></article></div>
          <figure className="zhijie-collaboration-visual zhijie-illustration reveal"><img src="/assets/zhijie/collaboration.webp" width="1600" height="1140" loading="lazy" alt="Plasmic 多人协作画布与团队成员示意" /></figure>
        </section>
        <section id="integration" className="zhijie-integration container">
          <div className="zhijie-section-heading reveal"><span className="section-kicker">POWER</span><h2>集成任何<br /><em>代码库。</em></h2><p>让可视化搭建融入现有代码项目，持续使用自己的技术栈。</p></div>
          <div className="zhijie-feature-row">
            <div className="zhijie-feature-copy reveal"><IconLayers className="zhijie-feature-icon" aria-hidden="true" /><h3>使用你自己的<br /><em>组件构建</em></h3><p>接入 React 组件、数据源、设计系统与部署环境。</p></div>
            <figure className="zhijie-illustration reveal"><img src="/assets/zhijie/components.webp" width="1400" height="1475" loading="lazy" alt="Plasmic 复用 React 组件与设计系统示意" /></figure>
          </div>
          <div className="zhijie-feature-row is-reversed">
            <div className="zhijie-feature-copy reveal"><IconLayers className="zhijie-feature-icon" aria-hidden="true" /><h3>在现有<br /><em>应用中搭建</em></h3><p>页面直接融入应用，复用已有代码与组件，无需 iframe。</p></div>
            <figure className="zhijie-illustration reveal"><img src="/assets/zhijie/existing-app.webp" width="1832" height="1951" loading="lazy" alt="Plasmic 页面集成到已有业务应用的示意" /></figure>
          </div>
        </section>
        <section id="deployment" className="zhijie-deployment container">
          <div className="zhijie-deployment-intro"><div className="zhijie-section-heading is-left reveal"><span className="section-kicker">DEPLOYMENT</span><h2>部署到<br /><em>任何环境。</em></h2><p>选择自己的托管基础设施，沿用现有构建与发布流程。</p></div><figure className="zhijie-illustration reveal"><img src="/assets/zhijie/deploy-connections.webp" width="1151" height="539" loading="lazy" alt="GitHub 与部署服务的连接示意" /></figure></div>
          <figure className="zhijie-deployment-visual zhijie-illustration reveal"><img src="/assets/zhijie/deploy.webp" width="1361" height="881" loading="lazy" alt="Plasmic 发布示意：创建仓库、推送 GitHub 与保存页面版本" /></figure>
        </section>
        <section id="scale" className="zhijie-scale">
          <div className="container">
            <div className="zhijie-section-heading reveal"><span className="section-kicker">SCALE UP</span><h2>持续增长，<br /><em>无限扩展。</em></h2><p>随着团队与应用成长，组织资源、协作流程与部署继续掌握在你手中。</p><a className="btn btn-primary" href={PLASMIC_WEB_URL} target="_blank" rel="noopener noreferrer">开始使用 <IconArrowRight /></a></div>
            <div className="zhijie-scale-grid">{scaleCapabilities.map(capability => <article key={capability.image} className="reveal"><img src={`/assets/zhijie/scale-${capability.image}.svg`} width="394" height="300" loading="lazy" alt="" /><div><h3>{capability.title}</h3><p>{capability.description}</p>{capability.href && <a className="zhijie-text-link" href={capability.href} target="_blank" rel="noopener noreferrer">Plasmic 官方信息 <IconArrowRight /></a>}</div></article>)}</div>
          </div>
        </section>
        <section id="download" className="zhijie-download container">
          <div className="zhijie-section-heading reveal"><span className="section-kicker">YOUR SPACE TO CREATE</span><h2>在你习惯的地方，开始搭建。</h2><p>浏览器直接进入工作空间，或下载桌面端，让创作保持专注。</p></div>
          <div className="zhijie-access-grid">
            <article className="zhijie-web-access reveal"><IconGlobe className="zhijie-web-icon" aria-hidden="true" /><small>WEB APP</small><h3>打开浏览器，即刻开始</h3><p>使用拾光统一账号登录，进入你的项目与可视化编辑器。</p><a className="btn btn-primary" href={PLASMIC_WEB_URL} target="_blank" rel="noopener noreferrer">在线使用 <IconArrowRight /></a><span>无需安装 · 使用拾光账号</span></article>
            <article className="zhijie-desktop-access reveal">
              <div className="zhijie-download-heading"><div><small>DESKTOP APP</small><h3>你的桌面创作空间</h3></div><span>官方发布渠道</span></div>
              <ul>
                {PLASMIC_DOWNLOADS.map(build => (
                  <li key={build.id} className={platform === build.platform ? 'is-current' : ''}>
                    <PlatformGlyph name={build.platform} />
                    <div><strong>{build.name}</strong><small>{build.packaging}{build.version ? ` · v${build.version}` : ''}</small></div>
                    {build.url ? <><span className="zhijie-build-size">{build.sizeMb} MB</span><a className="btn btn-ghost btn-sm" href={build.url} aria-label={`下载 ${build.name} ${build.packaging}`}><IconDownload aria-hidden="true" />下载</a></> : <span className="zhijie-download-unavailable">暂未发布</span>}
                  </li>
                ))}
              </ul>
              <p>桌面端与在线版连接同一工作空间。安装包沿用 Plasmic 名称。</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
