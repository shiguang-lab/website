import IconActivity from '@douyinfe/semi-icons/lib/es/icons/IconActivity';
import IconArrowRight from '@douyinfe/semi-icons/lib/es/icons/IconArrowRight';
import IconBranch from '@douyinfe/semi-icons/lib/es/icons/IconBranch';
import IconCheckCircleStroked from '@douyinfe/semi-icons/lib/es/icons/IconCheckCircleStroked';
import IconDownload from '@douyinfe/semi-icons/lib/es/icons/IconDownload';
import IconGlobe from '@douyinfe/semi-icons/lib/es/icons/IconGlobe';
import IconLock from '@douyinfe/semi-icons/lib/es/icons/IconLock';
import IconPulse from '@douyinfe/semi-icons/lib/es/icons/IconPulse';
import IconSetting from '@douyinfe/semi-icons/lib/es/icons/IconSetting';
import IconUserGroup from '@douyinfe/semi-icons/lib/es/icons/IconUserGroup';
import { useEffect, useState } from 'react';
import { PageMeta } from '../components/PageMeta';
import { PlatformGlyph } from '../components/PlatformGlyph';
import { SichenMark } from '../components/SichenMark';
import { SiteHeader } from '../components/SiteHeader';
import { SICHEN_WEB_URL } from '../config/productUrls';
import { useHomeEffects } from '../hooks/useHomeEffects';

const windowsDownloadUrl = import.meta.env.VITE_SICHEN_WINDOWS_DOWNLOAD_URL || '/downloads/sichen-windows-x64.exe';
const macDownloadUrl = import.meta.env.VITE_SICHEN_MAC_DOWNLOAD_URL || '/downloads/sichen-macos-universal.dmg';
const linuxDownloadUrl = import.meta.env.VITE_SICHEN_LINUX_DOWNLOAD_URL || '/downloads/sichen-linux-x86_64.AppImage';

/** 构建时注入的安装包真实大小(MB);产物缺失时对应项为 null。 */
const downloadSizes = typeof __SICHEN_DOWNLOAD_SIZES__ === 'undefined' ? {} : __SICHEN_DOWNLOAD_SIZES__;

const desktopBuilds = [
  {
    id: 'windows',
    name: 'Windows',
    requirement: 'Windows 10 及以上',
    packaging: 'x64 安装包',
    url: windowsDownloadUrl,
    sizeMb: downloadSizes.windows,
  },
  {
    id: 'mac',
    name: 'macOS',
    requirement: 'macOS 12 及以上',
    packaging: 'Universal · Apple Silicon 与 Intel',
    url: macDownloadUrl,
    sizeMb: downloadSizes.mac,
  },
  {
    id: 'linux',
    name: 'Linux',
    requirement: '主流 x86_64 发行版',
    packaging: 'AppImage · 免安装依赖',
    url: linuxDownloadUrl,
    sizeMb: downloadSizes.linux,
  },
];

/** 扫码占位:伪二维码点阵,应用上架后替换为真实下载码。 */
function QrPlaceholder() {
  const modules = [
    [8,1],[10,1],[12,1],[9,2],[13,2],[8,3],[11,3],[12,4],[9,5],[13,5],[8,6],[10,6],
    [1,8],[3,8],[6,8],[9,8],[12,8],[14,9],[2,9],[5,10],[8,10],[11,10],[13,11],[1,11],
    [4,12],[7,12],[10,13],[13,13],[2,13],[5,14],[9,14],[12,14],
  ];
  return (
    <span className="qr-placeholder" aria-hidden="true">
      <svg viewBox="0 0 16 16">
        {[[0.5,0.5],[10.5,0.5],[0.5,10.5]].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width="5" height="5" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x={x + 1.5} y={y + 1.5} width="2" height="2" fill="currentColor" />
          </g>
        ))}
        {modules.map(([x, y]) => (
          <rect key={`${x}:${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
        ))}
      </svg>
      <em>上线后开放扫码</em>
    </span>
  );
}

/** 按 UA 识别访问者桌面平台,用于默认高亮对应下载项。 */
function detectPlatform() {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'mac';
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'linux';
  return null;
}

const capabilities = [
  {
    icon: IconUserGroup,
    title: '一支随时待命的 Agent 团队',
    description: '内置需求分析、研发、质量检测、运维等专业 Agent，也可注册外部 Agent，按角色与技能匹配执行者。',
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
  { number: '02', title: '司辰调度', text: '司辰理解意图，匹配专业 Agent、技能与执行流程。' },
  { number: '03', title: '并行协作', text: '多个 Agent 分工推进，实时同步上下文和阶段产物。' },
  { number: '04', title: '确认交付', text: '关键动作由你确认，结果、日志与资产完整留存。' },
];

export function SichenPage() {
  useHomeEffects();
  const [platform, setPlatform] = useState(null);
  useEffect(() => {
    // 挂载后异步识别平台:预渲染 HTML 无高亮,水合一致,识别结果在微任务中落地。
    Promise.resolve().then(() => setPlatform(detectPlatform()));
  }, []);

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
                <span><IconGlobe />Web</span>
                <span><PlatformGlyph name="windows" className="availability-glyph" />Windows</span>
                <span><PlatformGlyph name="mac" className="availability-glyph" />macOS</span>
                <span><PlatformGlyph name="linux" className="availability-glyph" />Linux</span>
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
            <div className="sichen-access-layout">
              <article className="access-web reveal">
                <span className="access-icon"><IconGlobe /></span>
                <small>免安装 · 即开即用</small>
                <h3>Web 版</h3>
                <p>在浏览器中管理 Agent、发起任务、查看运行与交付产物，与桌面端保持一致体验。</p>
                <a className="btn btn-primary" href={SICHEN_WEB_URL} target="_blank" rel="noopener noreferrer">
                  进入 Web 版 <IconArrowRight />
                </a>
              </article>

              <div className="access-desktop reveal">
                <div className="access-desktop-head">
                  <div>
                    <small>DESKTOP</small>
                    <h3>桌面客户端</h3>
                  </div>
                  {platform && <span className="access-detected">已识别你的系统</span>}
                </div>
                <ul className="access-build-list">
                  {desktopBuilds.map((build) => {
                    const current = platform === build.id;
                    return (
                      <li className={current ? 'is-current' : ''} key={build.id}>
                        <span className="build-glyph"><PlatformGlyph name={build.id} /></span>
                        <div className="build-meta">
                          <strong>
                            {build.name}
                            {current && <em>当前系统</em>}
                          </strong>
                          <span>{build.requirement} · {build.packaging}</span>
                        </div>
                        {typeof build.sizeMb === 'number' && <span className="build-size">{build.sizeMb} MB</span>}
                        <a
                          className={`btn btn-sm ${current ? 'btn-primary' : 'btn-ghost'}`}
                          href={build.url}
                          download
                          aria-label={`下载 ${build.name} 版`}
                        >
                          <IconDownload />下载
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="access-mobile reveal">
                <div className="access-mobile-head">
                  <div>
                    <small>MOBILE</small>
                    <h3>移动端</h3>
                  </div>
                  <span className="planned-tag">规划中</span>
                </div>
                <div className="access-mobile-grid">
                  <div className="mobile-card">
                    <div className="mobile-card-info">
                      <span className="build-glyph"><PlatformGlyph name="ios" /></span>
                      <div>
                        <strong>iOS</strong>
                        <span>App Store 上架后扫码直达</span>
                      </div>
                    </div>
                    <QrPlaceholder />
                  </div>
                  <div className="mobile-card">
                    <div className="mobile-card-info">
                      <span className="build-glyph"><PlatformGlyph name="android" /></span>
                      <div>
                        <strong>Android</strong>
                        <span>应用市场与安装包扫码下载</span>
                      </div>
                    </div>
                    <QrPlaceholder />
                  </div>
                </div>
              </div>
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
