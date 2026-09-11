import IconArchive from '@douyinfe/semi-icons/lib/es/icons/IconArchive';
import IconArrowRight from '@douyinfe/semi-icons/lib/es/icons/IconArrowRight';
import IconBookOpenStroked from '@douyinfe/semi-icons/lib/es/icons/IconBookOpenStroked';
import IconCheckCircleStroked from '@douyinfe/semi-icons/lib/es/icons/IconCheckCircleStroked';
import IconFile from '@douyinfe/semi-icons/lib/es/icons/IconFile';
import IconGlobe from '@douyinfe/semi-icons/lib/es/icons/IconGlobe';
import IconLayers from '@douyinfe/semi-icons/lib/es/icons/IconLayers';
import IconSearchStroked from '@douyinfe/semi-icons/lib/es/icons/IconSearchStroked';
import { PageMeta } from '../components/PageMeta';
import { SiteHeader } from '../components/SiteHeader';
import { ZhixuMark } from '../components/ZhixuMark';
import { ZHIXU_WEB_URL } from '../config/productUrls';
import { useHomeEffects } from '../hooks/useHomeEffects';

const capabilities = [
  {
    icon: IconFile,
    title: '文档与成果统一管理',
    description: '文档、文件、数据集和在线演示保持版本关系，产出不再散落在多个工具里。',
  },
  {
    icon: IconBookOpenStroked,
    title: '知识沉淀即可复用',
    description: '把资料、网页和已有成果组织成知识库，让搜索、问答和后续任务共享可信上下文。',
  },
  {
    icon: IconSearchStroked,
    title: '研究过程有据可查',
    description: '从目标、证据到报告完整留痕，关键结论可回到引用来源，而不是只得到一段生成文本。',
  },
  {
    icon: IconLayers,
    title: '复杂任务持续推进',
    description: '拆解步骤、跟踪进度、沉淀多个交付物，让 AI 从一次回答走向完整工作成果。',
  },
];

const lifecycle = [
  { number: '01', title: '收集资料', text: '上传文件、导入网页，或直接使用已有资产。' },
  { number: '02', title: '组织知识', text: '按个人与团队空间整理目录、关系和访问权限。' },
  { number: '03', title: '让 AI 推进', text: '发起调研、写作、分析与演示任务，并随时检查过程。' },
  { number: '04', title: '发布与复用', text: '把一个或多个成果安全分享，并继续作为下一项工作的上下文。' },
];

export function ZhixuPage() {
  useHomeEffects();

  return (
    <div className="page-shell zhixu-page">
      <PageMeta
        title="知序 · AI 知识与创作空间 | 拾光"
        description="知序把文档、知识库、深度调研、任务与在线演示放进同一个 AI 工作空间，让每次探索都沉淀为可复用成果。"
      />
      <SiteHeader productPage />
      <main id="top">
        <section className="zhixu-hero">
          <div className="container zhixu-hero-inner">
            <div className="zhixu-hero-copy reveal">
              <div className="zhixu-product-lockup">
                <ZhixuMark />
                <span>拾光旗下 AI 知识与创作产品</span>
              </div>
              <h1><span>知序</span><small>AI 知识与创作空间</small></h1>
              <p>让信息有序，让成果生长。<br />从一份资料到一组可发布、可追溯、可持续复用的知识资产。</p>
              <div className="zhixu-hero-actions">
                <a className="btn btn-primary btn-lg" href={ZHIXU_WEB_URL} target="_blank" rel="noopener noreferrer">
                  <IconGlobe aria-hidden="true" />进入知序
                </a>
                <a className="btn btn-ghost btn-lg" href="#solutions">了解能力</a>
              </div>
              <div className="zhixu-assurances" aria-label="产品特点">
                <span><IconCheckCircleStroked />个人与团队空间</span>
                <span><IconCheckCircleStroked />成果版本可追溯</span>
                <span><IconCheckCircleStroked />统一账号即开即用</span>
              </div>
            </div>
            <div className="zhixu-product-visual reveal">
              <img
                src="/assets/zhixu-workspace.webp"
                width={1593}
                height={987}
                alt="知序工作台，展示文档、知识库、调研、任务和在线演示的统一工作空间"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>
        </section>

        <section className="zhixu-proof container" aria-label="知序能力概览">
          <span>文档与多格式文件</span><i />
          <span>知识库与可信引用</span><i />
          <span>深度调研与任务</span><i />
          <span>在线演示与安全发布</span>
        </section>

        <section id="solutions" className="zhixu-capabilities section-space">
          <div className="container">
            <div className="section-heading reveal">
              <span className="section-kicker">KNOWLEDGE INTO OUTCOMES</span>
              <h2>不是多一个文件夹，而是让知识持续产生价值</h2>
              <p>知序把内容、上下文、任务和交付物连在一起，让个人与团队围绕同一份事实协作。</p>
            </div>
            <div className="zhixu-capability-grid">
              {capabilities.map(({ icon: Icon, title, description }, index) => (
                <article className="zhixu-capability reveal" key={title} style={{ transitionDelay: `${index * 70}ms` }}>
                  <span className="zhixu-capability-icon"><Icon aria-hidden="true" /></span>
                  <span className="zhixu-capability-number">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="zhixu-lifecycle">
          <div className="container zhixu-lifecycle-layout">
            <div className="zhixu-lifecycle-copy reveal">
              <span className="section-kicker">ONE CONTINUOUS WORKSPACE</span>
              <h2>从资料进入，到成果再次被使用</h2>
              <p>每一步都留在同一个空间。你可以继续编辑、建立关系、发起任务，也可以把结果分享给需要的人。</p>
              <div className="zhixu-lifecycle-note">
                <IconArchive aria-hidden="true" />
                <span><strong>沉淀的不只是文件</strong><small>来源、版本、权限和生成过程都会随成果保留下来。</small></span>
              </div>
            </div>
            <ol className="zhixu-steps reveal">
              {lifecycle.map((item) => (
                <li key={item.number}>
                  <span>{item.number}</span>
                  <div><h3>{item.title}</h3><p>{item.text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="zhixu-final-cta" id="developers">
          <div className="container zhixu-final-inner reveal">
            <div><span>让每次探索都有下文</span><h2>从下一份资料开始，用知序工作</h2></div>
            <a className="btn btn-primary btn-lg" href={ZHIXU_WEB_URL} target="_blank" rel="noopener noreferrer">
              进入知序 <IconArrowRight aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <footer id="about" className="site-footer zhixu-footer">
        <div className="container footer-bottom">
          <span>© 2026 拾光 Shiguang. 知序，让知识有序生长。</span>
          <span id="resources">Web · 文档 · 知识 · 研究 · 发布</span>
        </div>
      </footer>
    </div>
  );
}
