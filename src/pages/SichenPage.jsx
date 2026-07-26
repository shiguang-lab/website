import IconActivity from '@douyinfe/semi-icons/lib/es/icons/IconActivity';
import IconArrowRight from '@douyinfe/semi-icons/lib/es/icons/IconArrowRight';
import IconBranch from '@douyinfe/semi-icons/lib/es/icons/IconBranch';
import IconCheckCircleStroked from '@douyinfe/semi-icons/lib/es/icons/IconCheckCircleStroked';
import IconDesktop from '@douyinfe/semi-icons/lib/es/icons/IconDesktop';
import IconDownload from '@douyinfe/semi-icons/lib/es/icons/IconDownload';
import IconGlobe from '@douyinfe/semi-icons/lib/es/icons/IconGlobe';
import IconLock from '@douyinfe/semi-icons/lib/es/icons/IconLock';
import IconPhone from '@douyinfe/semi-icons/lib/es/icons/IconPhone';
import IconPulse from '@douyinfe/semi-icons/lib/es/icons/IconPulse';
import IconSetting from '@douyinfe/semi-icons/lib/es/icons/IconSetting';
import IconUserGroup from '@douyinfe/semi-icons/lib/es/icons/IconUserGroup';
import { PageMeta } from '../components/PageMeta';
import { SichenMark } from '../components/SichenMark';
import { SiteHeader } from '../components/SiteHeader';
import { SICHEN_WEB_URL } from '../config/productUrls';
import { useHomeEffects } from '../hooks/useHomeEffects';

const windowsDownloadUrl = import.meta.env.VITE_SICHEN_WINDOWS_DOWNLOAD_URL || '/downloads/sichen-windows-x64.exe';
const macDownloadUrl = import.meta.env.VITE_SICHEN_MAC_DOWNLOAD_URL || '/downloads/sichen-macos-universal.dmg';
const linuxDownloadUrl = import.meta.env.VITE_SICHEN_LINUX_DOWNLOAD_URL || '/downloads/sichen-linux-x86_64.AppImage';

const capabilities = [
  {
    icon: IconUserGroup,
    title: '一支随时待命的 Agent 团队',
    description: '注册内置或外部 Agent，按角色、技能和当前状态匹配最适合的执行者。',
  },
  {
    icon: IconBranch,
    title: '看得见的分工与编排',
    description: '把复杂任务拆解为工作流，实时查看委派关系、节点进度、重试与结果。',
  },
  {
    icon: IconSetting,
    title: '技能、工具和系统连接',
    description: '通过 Skills、MCP 与连接器接入代码、知识、业务系统和企业消息渠道。',
  },
  {
    icon: IconPulse,
    title: '全过程可观测、可接管',
    description: '追踪运行日志、工具调用与产物，在关键节点确认、暂停或调整执行方向。',
  },
];

const workflow = [
  { number: '01', title: '说清目标', text: '在对话中描述结果，或从业务事件自动触发任务。' },
  { number: '02', title: '司辰调度', text: 'Router 识别意图，选择 Agent、技能与执行路径。' },
  { number: '03', title: '并行协作', text: '多个 Agent 分工推进，实时同步上下文和阶段产物。' },
  { number: '04', title: '确认交付', text: '关键动作由你确认，结果、日志与资产完整留存。' },
];

export function SichenPage() {
  useHomeEffects();

  return (
    <div className="page-shell sichen-page">
      <PageMeta
        title="司辰 · 多智能体协作平台 | 拾光"
        description="司辰帮助个人与团队组织多个 AI Agent 分工协作，用技能、工作流和工具连接推进复杂任务。"
      />
      <SiteHeader productPage />
      <main id="top">
        <section className="sichen-hero">
          <div className="sichen-hero-grid" aria-hidden="true" />
          <div className="container sichen-hero-inner">
            <div className="sichen-hero-copy">
              <div className="sichen-product-lockup">
                <SichenMark />
                <span>拾光旗下多智能体协作产品</span>
              </div>
              <h1><span>司辰</span><small>多智能体协作平台</small></h1>
              <p>不只是调用一个 AI，而是组织一支 AI 团队。<br />让 Agent 理解目标、各司其职，把复杂任务持续推进到交付。</p>
              <div className="sichen-hero-actions">
                <a className="btn btn-primary btn-lg" href={SICHEN_WEB_URL} target="_blank" rel="noopener noreferrer"><IconGlobe aria-hidden="true" />进入 Web 版</a>
                <a className="btn btn-ghost btn-lg" href="#download"><IconDownload aria-hidden="true" />下载客户端</a>
              </div>
              <div className="sichen-availability" aria-label="可用平台">
                <span><IconCheckCircleStroked />Web</span>
                <span><IconDesktop />Windows</span>
                <span><IconDesktop />macOS</span>
                <span><IconDesktop />Linux</span>
                <span className="muted"><IconPhone />移动端规划中</span>
              </div>
            </div>

            <div className="sichen-console">
              <img
                className="sichen-product-shot"
                src="/assets/sichen-command-center-v3.webp"
                width={1919}
                height={1142}
                alt="司辰产品总览界面，包含工作空间、执行、资产、Agents、Skills、监测和全局交付看板"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>
        </section>

        <section className="sichen-proof container reveal" aria-label="司辰能力概览">
          <span>自然语言下达任务</span><i />
          <span>多 Agent 并行协作</span><i />
          <span>Skills + MCP 工具体系</span><i />
          <span>Web 与桌面端一致体验</span>
        </section>

        <section id="solutions" className="sichen-capabilities section-space">
          <div className="container">
            <div className="section-heading reveal">
              <span className="section-kicker">BUILT FOR REAL WORK</span>
              <h2>从“回答问题”到“完成任务”</h2>
              <p>司辰把 Agent、技能、数据与执行流程放在同一个工作空间，让 AI 协作真正进入日常工作。</p>
            </div>
            <div className="sichen-capability-grid">
              {capabilities.map(({ icon: Icon, title, description }, index) => (
                <article className="sichen-capability reveal" key={title} style={{ transitionDelay: `${index * 70}ms` }}>
                  <span className="sichen-capability-icon"><Icon aria-hidden="true" /></span>
                  <span className="capability-number">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sichen-workflow-section">
          <div className="container sichen-workflow-layout">
            <div className="sichen-workflow-copy reveal">
              <span className="section-kicker">HUMAN IN THE LOOP</span>
              <h2>你把握方向，司辰负责推进</h2>
              <p>每一步都有上下文、有状态、有产物。需要决策时回到你手中，其余工作由 Agent 团队持续推进。</p>
              <div className="workflow-points">
                <span><IconLock />关键动作先确认</span>
                <span><IconActivity />执行过程实时可见</span>
                <span><IconCheckCircleStroked />结果与产物可追溯</span>
              </div>
            </div>
            <ol className="sichen-workflow reveal">
              {workflow.map((item) => (
                <li key={item.number}>
                  <span>{item.number}</span>
                  <div><h3>{item.title}</h3><p>{item.text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="download" className="sichen-access section-space">
          <div className="container">
            <div className="section-heading reveal">
              <span className="section-kicker">WORK WHERE YOU WORK</span>
              <h2>随时进入你的 Agent 工作空间</h2>
              <p>无需安装即可使用 Web 版；桌面客户端提供更连续的任务体验与系统级连接能力。</p>
            </div>
            <div className="sichen-access-grid">
              <article className="access-option featured reveal">
                <span className="access-icon"><IconGlobe /></span>
                <div><small>免安装，即开即用</small><h3>Web 版</h3><p>在浏览器中管理 Agent、发起任务、查看运行和交付产物。</p></div>
                <a className="btn btn-primary" href={SICHEN_WEB_URL} target="_blank" rel="noopener noreferrer">进入 Web 版 <IconArrowRight /></a>
              </article>
              <article className="access-option reveal">
                <span className="access-icon"><IconDesktop /></span>
                <div><small>Windows 10 及以上</small><h3>Windows 客户端</h3><p>适合需要长时运行、桌面通知和本地工作空间的任务。</p></div>
                <a className="btn btn-ghost" href={windowsDownloadUrl} download>下载 Windows 版 <IconDownload /></a>
              </article>
              <article className="access-option reveal">
                <span className="access-icon"><IconDesktop /></span>
                <div><small>macOS 12 及以上</small><h3>macOS 客户端</h3><p>支持 Apple Silicon 与 Intel，保持任务状态跨窗口连续。</p></div>
                <a className="btn btn-ghost" href={macDownloadUrl} download>下载 macOS 版 <IconDownload /></a>
              </article>
              <article className="access-option reveal">
                <span className="access-icon"><IconDesktop /></span>
                <div><small>主流 x86_64 发行版</small><h3>Linux 客户端</h3><p>以 AppImage 运行，无需安装系统级依赖。</p></div>
                <a className="btn btn-ghost" href={linuxDownloadUrl} download>下载 Linux 版 <IconDownload /></a>
              </article>
              <article className="access-option disabled reveal" aria-disabled="true">
                <span className="access-icon"><IconPhone /></span>
                <div><small>产品规划中</small><h3>iOS 与 Android</h3><p>移动端入口已预留，当前暂不提供下载安装。</p></div>
                <button className="btn btn-ghost" type="button" disabled>暂不提供下载</button>
              </article>
            </div>
          </div>
        </section>

        <section className="sichen-final-cta" id="developers">
          <div className="container sichen-final-inner reveal">
            <div><span>让复杂工作有序发生</span><h2>把下一项任务，交给司辰</h2></div>
            <div><a className="btn btn-primary btn-lg" href={SICHEN_WEB_URL} target="_blank" rel="noopener noreferrer">进入 Web 版</a><a className="btn btn-ghost btn-lg" href="#download">下载客户端</a></div>
          </div>
        </section>
      </main>

      <footer id="about" className="site-footer sichen-footer">
        <div className="container footer-bottom">
          <span>© 2026 拾光 Shiguang. 司辰，让智能各司其职。</span>
          <span id="resources">Web · Windows · macOS · Linux</span>
        </div>
      </footer>
    </div>
  );
}
