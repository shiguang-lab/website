import { useHomeEffects } from '../hooks/useHomeEffects';
import { SiteHeader } from '../components/SiteHeader';
import { Link } from 'react-router-dom';
import { SICHEN_LANDING_PATH } from '../config/productUrls';

export function HomePage() {
  useHomeEffects();

  return <div className="page-shell">
  <SiteHeader />
  <main id="top">
    <section className="hero section-glow">
      <canvas className="star-canvas" data-stars aria-hidden="true" />
      <img className="hero-visual" src="/assets/hero-cosmic-road-design-v3.webp" width={4320} height={1570} alt="" aria-hidden="true" fetchPriority="high" decoding="sync" />
      <div className="container hero-layout">
        <div className="hero-copy reveal">
          <div className="eyebrow"><span /> 为每一个想法加速</div>
          <h1>拾光 · 让 <em>AI</em><br />成为你的<span>生产力</span></h1>
          <p>构建、连接、协作，释放 AI 的无限可能。<br />拾光为个人与团队提供一站式智能化协作平台。</p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/app/chat">免费体验</Link>
            <a className="btn btn-ghost btn-lg" href="#solutions">了解更多</a>
          </div>
          <div className="hero-tags" aria-label="平台特点">
            <span><i className="tag-icon shield" />安全可靠</span>
            <span><i className="tag-icon ring" />开箱即用</span>
            <span><i className="tag-icon clock" />持续进化</span>
          </div>
        </div>
      </div>
      <section className="trust-section reveal" aria-label="客户与合作伙伴">
        <div className="container logo-cloud">
        <div className="partner-logo partner-byte" role="img" aria-label="字节跳动">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 8h5v16H6zM13.5 5h5v19h-5zM21 10h5v14h-5z" /><path d="M8.5 8v16M16 5v19M23.5 10v14" /></svg><span>字节跳动</span>
        </div>
        <div className="partner-logo partner-mi" role="img" aria-label="小米">
          <svg viewBox="0 0 32 32" aria-hidden="true"><rect x={2} y={2} width={28} height={28} rx={8} /><path d="M8 22V11h5.5c3.7 0 5.5 1.9 5.5 5.5V22h-4v-5.4c0-1.2-.5-1.7-1.7-1.7H12v7.1zm13 0V11h4v11z" /></svg><span>小米</span>
        </div>
        <div className="partner-logo partner-ant" role="img" aria-label="蚂蚁集团">
          <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx={16} cy={18} r={8} /><circle cx={11} cy={12} r={4} /><circle cx={21} cy={12} r={4} /><path d="M12 7 9 4M20 7l3-3M6 17H2M26 17h4M10 24l-3 4M22 24l3 4" /></svg><span>蚂蚁集团</span>
        </div>
        <div className="partner-logo partner-tencent" role="img" aria-label="腾讯云">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 23h18a5 5 0 0 0 .6-10A9 9 0 0 0 8 11a6 6 0 0 0-1 12Z" /><path d="M11 17h10" /></svg><span>腾讯云</span>
        </div>
        <div className="partner-logo partner-li" role="img" aria-label="理想">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 7h11l15 18H18z" /><path d="M8 7h6l6 8h-6z" /></svg><span>理想</span>
        </div>
        <div className="partner-logo partner-didi" role="img" aria-label="滴滴">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3c7 0 12 4 12 11 0 8-5 14-12 15C9 28 4 22 4 14 4 7 9 3 16 3Z" /><path d="M11 21V11h4.5c4 0 6 1.8 6 5s-2 5-6 5zm4-3c1.5 0 2.5-.6 2.5-2s-1-2-2.5-2H15v4z" /></svg><span>滴滴</span>
        </div>
        <div className="partner-logo partner-cas" role="img" aria-label="中科院软件所">
          <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx={16} cy={16} r={12} /><circle cx={16} cy={16} r={6} /><path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l3 3M21.5 21.5l3 3M24.5 7.5l-3 3M10.5 21.5l-3 3" /></svg><span>中科院软件所</span>
        </div>
        </div>
      </section>
    </section>
    <section id="products" className="product-section container section-space">
      <div className="section-heading reveal">
        <span className="section-kicker">PRODUCT MATRIX</span>
        <h2>为 AI 而生的全能平台</h2>
        <p>从开发到交付，从个人到团队，拾光为你提供全链路能力</p>
      </div>
      <div className="feature-grid">
        <article className="feature-card reveal delay-0">
          <div className="icon-orb icon-orb-reference"><img className="product-icon-image" src="/assets/product-icon-chat.png" width={72} height={72} alt="" aria-hidden="true" /></div>
          <h3>智能助手</h3><p>多模型对话、知识检索、写作协作、编程辅助，轻松表达。</p><Link to="/app/chat">立即体验 <span>→</span></Link>
        </article>
        <article className="feature-card reveal delay-60">
          <div className="icon-orb icon-orb-reference"><img className="product-icon-image" src="/assets/product-icon-cube.png" width={72} height={72} alt="" aria-hidden="true" /></div>
          <h3>知识库</h3><p>构建你的专属知识库，支持多格式导入、智能检索与问答。</p><Link to="/app/knowledge">立即体验 <span>→</span></Link>
        </article>
        <article className="feature-card reveal delay-120">
          <div className="icon-orb icon-orb-reference"><img className="product-icon-image" src="/assets/product-icon-flow.png" width={72} height={72} alt="" aria-hidden="true" /></div>
          <h3>工作流</h3><p>可视化编排 AI 工作流，连接工具与数据，自动化复杂任务。</p><Link to="/app/workflow">立即体验 <span>→</span></Link>
        </article>
        <article className="feature-card reveal delay-180">
          <div className="icon-orb icon-orb-reference"><img className="product-icon-image" src="/assets/product-icon-apps.png" width={72} height={72} alt="" aria-hidden="true" /></div>
          <h3>应用广场</h3><p>丰富的 AI 应用与插件，一键集成、开箱即用。</p><Link to="/app/market">立即体验 <span>→</span></Link>
        </article>
        <article className="feature-card reveal delay-240">
          <div className="icon-orb icon-orb-reference"><img className="product-icon-image" src="/assets/product-icon-team.png" width={72} height={72} alt="" aria-hidden="true" /></div>
          <h3>团队协作</h3><p>权限管理、成员协作、项目空间，让团队效率倍增。</p><Link to="/app/team">立即体验 <span>→</span></Link>
        </article>
      </div>
    </section>
    <section id="solutions" className="showcase-section container section-space">
      <div className="showcase-copy reveal">
        <span className="section-kicker">ONE PLACE, EVERY IDEA</span>
        <h2>在拾光，想法即现实</h2>
        <p>无论是一个灵感、一个需求，还是一个复杂业务，你都可以通过对话或工作流快速落地。</p>
        <ul>
          <li><span>✓</span> 多模型自由切换</li>
          <li><span>✓</span> 数据安全隔离</li>
          <li><span>✓</span> 企业级可扩展能力</li>
          <li><span>✓</span> 开放的 API &amp; SDK</li>
        </ul>
        <a className="btn btn-ghost" href="#developers">探索更多功能</a>
      </div>
      <div className="app-window reveal" data-tilt>
        <div className="window-topbar"><span className="mini-brand"><i /></span><strong>智能助手</strong><div className="window-tools"><i /><i /><span className="avatar">光</span></div></div>
        <div className="window-body">
          <aside className="app-sidebar">
            <div className="side-brand"><img className="brand-mark-image mini" src="/assets/微信图片_20260722101545_795_4.svg" alt="" aria-hidden="true" /></div>
            <button className="side-item active"><svg className="side-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-6l-4 3 1-3H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z" /><path d="M8 11h.01M12 11h.01M16 11h.01" /></svg><span className="side-label">智能助手</span></button>
            <button className="side-item"><svg className="side-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></svg><span className="side-label">知识库</span></button>
            <button className="side-item"><svg className="side-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx={12} cy={5} r={3} /><circle cx={5} cy={18} r={3} /><circle cx={19} cy={18} r={3} /><path d="m10.5 7.5-4 7.5m7-7.5 4 7.5M8 18h8" /></svg><span className="side-label">工作流</span></button>
            <button className="side-item"><svg className="side-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x={3} y={3} width={7} height={7} rx="1.5" /><rect x={14} y={3} width={7} height={7} rx="1.5" /><rect x={3} y={14} width={7} height={7} rx="1.5" /><rect x={14} y={14} width={7} height={7} rx="1.5" /></svg><span className="side-label">应用广场</span></button>
            <button className="side-item"><svg className="side-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx={9} cy={9} r={4} /><circle cx="16.5" cy={8} r={3} /><path d="M2.5 20c.5-4 2.8-6 6.5-6s6 2 6.5 6M14 14c4.2-.2 6.4 1.8 7 6" /></svg><span className="side-label">团队空间</span></button>
            <button className="side-item bottom"><svg className="side-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx={12} cy={12} r={3} /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2H15V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14H21a1.7 1.7 0 0 0-1.6 1Z" /></svg><span className="side-label">设置</span></button>
          </aside>
          <div className="chat-panel">
            <div className="chat-topline"><span /><span /></div>
            <div className="chat-row user">帮我分析一下最近的销售数据，并生成可视化图表</div>
            <div className="file-card"><div className="file-icon">X</div><div><strong>sales_data_2024.csv</strong><small>16.4 KB</small></div></div>
            <div className="chat-row assistant"><span className="spark">✦</span> 已完成数据分析，生成以下图表：</div>
            <div className="analytics-card">
              <div className="line-chart">
                <span className="chart-title">营业额</span>
                <svg viewBox="0 0 270 128" preserveAspectRatio="none">
                  <defs><linearGradient id="area" x1={0} y1={0} x2={0} y2={1}><stop stopColor="#6e68ff" stopOpacity=".45" /><stop offset={1} stopColor="#6e68ff" stopOpacity={0} /></linearGradient></defs>
                  <path className="grid" d="M0 18H270M0 49H270M0 80H270M0 111H270" />
                  <path className="area" d="M0 104 L34 91 68 99 101 60 135 78 169 42 203 63 236 31 270 18V128H0Z" />
                  <path className="line" d="M0 104 L34 91 68 99 101 60 135 78 169 42 203 63 236 31 270 18" />
                  <circle cx={101} cy={60} r={3} /><circle cx={169} cy={42} r={3} /><circle cx={236} cy={31} r={3} />
                </svg>
                <div className="chart-axis"><span>1月</span><span>2月</span><span>3月</span><span>4月</span><span>5月</span><span>6月</span></div>
              </div>
              <div className="donut-wrap"><span className="chart-title">销售渠道</span><div className="donut" /><div className="legend"><span><i />华东</span><span><i />华南</span><span><i />华北</span><span><i />西部</span></div></div>
            </div>
            <div className="prompt-box"><span>输入问题，或按 / 唤起快捷命令</span><button aria-label="发送">➤</button></div>
          </div>
        </div>
      </div>
    </section>
    <section id="pricing" className="pricing-section container section-space">
      <div className="section-heading reveal">
        <span className="section-kicker">SIMPLE PRICING</span>
        <h2>简单透明的定价</h2>
        <p>选择适合你的方案，随时升级或降级</p>
      </div>
      <div className="pricing-grid">
        <article className="price-card reveal">
          <div><h3>免费版</h3><p>适合个人探索与体验</p></div><div className="price"><b>¥0</b><span>/ 永久</span></div>
          <ul><li>基础模型对话</li><li>知识库 100MB</li><li>工作流 3 个</li><li>应用广场基础应用</li></ul>
          <button className="btn btn-ghost">开始使用</button>
        </article>
        <article className="price-card featured reveal">
          <div className="badge">推荐</div><div><h3>专业版</h3><p>适合个人与小团队高效协作</p></div><div className="price"><b>¥39</b><span>/ 月起</span></div>
          <ul><li>高级模型与更长上下文</li><li>知识库 20GB</li><li>工作流无限</li><li>应用广场全部应用</li><li>优先支持与新功能体验</li></ul>
          <button className="btn btn-primary">立即订阅</button>
        </article>
        <article className="price-card reveal">
          <div><h3>团队版</h3><p>适合团队与企业级需求</p></div><div className="price"><b>¥199</b><span>/ 月起</span></div>
          <ul><li>团队空间与权限管理</li><li>知识库 1TB</li><li>工作流并行执行与调度</li><li>专属部署与安全保障</li><li>专属客户成功服务</li></ul>
          <button className="btn btn-ghost">联系我们</button>
        </article>
      </div>
    </section>
    <section className="cta-section" id="developers">
      <div className="cta-art" aria-hidden="true"><span /><span /><span /></div>
      <div className="container cta-inner reveal">
        <div><span className="section-kicker">START NOW</span><h2>准备好和拾光一起，开启你的 AI 之旅了吗？</h2><p>立即注册，免费体验全部基础功能。</p></div>
        <div className="cta-actions"><Link className="btn btn-primary" to="/app/chat">免费体验</Link><button className="btn btn-ghost">预约演示</button></div>
      </div>
    </section>
  </main>
  <footer id="about" className="site-footer">
    <div className="container footer-grid">
      <div className="footer-brand">
        <a className="brand" href="#top"><img className="brand-mark-image" src="/assets/微信图片_20260722101545_795_4.svg" alt="" aria-hidden="true" /><span className="brand-copy"><strong>拾光</strong><small>SHIGUANG</small></span></a>
        <p>拾光致力于打造领先的 AI 协作平台，<br />让每个人都能用 AI 创造价值。</p>
        <div className="socials"><a href="#" aria-label="GitHub">⌁</a><a href="#" aria-label="X">𝕏</a><a href="#" aria-label="LinkedIn">in</a><a href="#" aria-label="邮件">✉</a></div>
      </div>
      <div className="footer-col"><h4>产品</h4><a href="#products">绘光 · AI 图片</a><a href="#products">跃影 · AI 视频</a><a href="#products">入戏 · AI 短剧</a><Link to={SICHEN_LANDING_PATH}>司辰 · 多智能体</Link></div>
      <div className="footer-col"><h4>解决方案</h4><a href="#solutions">个人用户</a><a href="#solutions">中小团队</a><a href="#solutions">企业客户</a><a href="#solutions">教育行业</a><a href="#developers">开发者</a></div>
      <div className="footer-col" id="resources"><h4>资源</h4><a href="#">文档中心</a><a href="#">帮助中心</a><a href="#">更新日志</a><a href="#">API 文档</a><a href="#">博客</a></div>
      <div className="footer-col"><h4>公司</h4><a href="#">关于我们</a><a href="#">加入我们</a><a href="mailto:support@shiguanglab.com">联系我们</a><Link to="/privacy">隐私政策</Link><Link to="/terms">用户协议</Link></div>
    </div>
    <div className="container footer-bottom"><span>© 2026 拾光 Shiguang. All rights reserved.</span><button type="button">简体中文⌄</button></div>
  </footer>
</div>;
}
