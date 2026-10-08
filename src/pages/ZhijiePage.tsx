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
import { usePlasmicDownloads } from '../hooks/usePlasmicDownloads';
import { PLASMIC_WEB_URL } from '../config/productUrls';
import { useHomeEffects } from '../hooks/useHomeEffects';

function HowItWorks() {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = ['Connect', 'Drag & Drop'];
  return (
    <section id="capabilities" className="zhijie-how container">
      <div className="zhijie-section-heading reveal"><span className="section-kicker">HOW IT WORKS</span><h2>Build experiences<br /><em>blazingly fast</em></h2><p>Start with ready-made components and data integrations. Bring your app to life with custom interactions and dynamic values.</p></div>
      <div className="zhijie-feature-tabs" role="tablist" aria-label="App building capabilities">
        {tabs.map((label, index) => <button type="button" key={label} role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => {
          const next = ['ArrowLeft', 'ArrowRight'].includes(event.key) ? 1 - index : event.key === 'Home' ? 0 : event.key === 'End' ? 1 : null;
          if (next !== null) { event.preventDefault(); setActive(next); document.getElementById(`${id}-tab-${next}`)?.focus(); }
        }}>{label}</button>)}
      </div>
      <div className="zhijie-how-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`} tabIndex={0}>
        <div className="zhijie-feature-copy"><span className="zhijie-feature-icon">{active === 0 ? <IconLink /> : <IconLayers />}</span><h3>{active === 0 ? <>Connect to<br /><em>any data source</em></> : <>Drag & drop<br /><em>components</em></>}</h3><p>{active === 0 ? 'Connect Supabase, Contentful, and Shopify with built-in integrations, or bring data from any HTTP or GraphQL API.' : 'Add components to the canvas, then configure dynamic content, state, and events to build your experience.'}</p>{active === 0 && <a className="btn btn-ghost" href="https://www.plasmic.app/integrations" target="_blank" rel="noopener noreferrer">See all integrations <IconArrowRight /></a>}</div>
        <figure className={active === 0 ? 'zhijie-connect-visual' : 'zhijie-editor-visual'}><img src={active === 0 ? '/assets/zhijie/connect.svg' : '/assets/zhijie/drag-drop.webp'} width={active === 0 ? 498 : 1397} height={active === 0 ? 512 : 1422} alt={active === 0 ? 'Plasmic data integrations: Google Sheets, Zapier, Supabase, Vercel, Contentful, and Shopify' : 'Building a dashboard by dragging and dropping components in Plasmic Studio'} /></figure>
      </div>
    </section>
  );
}

function AiWorkflow() {
  return (
    <section id="ai" className="zhijie-ai container" aria-labelledby="zhijie-ai-title">
      <div className="zhijie-section-heading reveal"><span className="section-kicker">BUILD WITH AI</span><h2 id="zhijie-ai-title">From design to code<br /><em>with AI</em></h2><p>Equip your agent with the CLI and Skill. Turn a prompt into an editable prototype, then generate React code that follows your project standards.</p></div>
      <div className="zhijie-ai-workbench">
        <div className="zhijie-ai-terminal">
          <div className="zhijie-ai-terminal-heading"><IconTerminal aria-hidden="true" /><span>PLASMICKIT CLI</span><span>Node.js ≥ 22.12</span></div>
          <div className="zhijie-ai-command"><span>01 / Install the CLI and Skill</span><pre><code>npm install -g @plasmickit/cli@latest{'\n'}plasmickit skill install</code></pre></div>
          <div className="zhijie-ai-command"><span>02 / Load the prototype workflow</span><pre><code>plasmickit context resolve --mode <b>prototype</b></code></pre></div>
          <div className="zhijie-ai-command"><span>03 / Load the code generation workflow</span><pre><code>plasmickit context resolve --mode <b>codegen</b></code></pre></div>
          <p>Automatically detect supported AI CLIs and apps on your machine and install the Skill for every detected client.</p>
        </div>
        <div className="zhijie-ai-flow" aria-label="AI workflow: turn a prompt into a Studio prototype and project code">
          <div className="zhijie-ai-prompt"><span>EXAMPLE PROMPT</span><p>“Design a customer management page and integrate it into my existing React app.”</p></div>
          <div className="zhijie-ai-agent"><span className="zhijie-ai-agent-icon"><IconBolt aria-hidden="true" /></span><div><strong>AI Agent + Plasmic Skill</strong><span>Read requirements · Inspect component contracts · Run workflows</span></div><span className="zhijie-ai-flow-label">WORKFLOW</span></div>
          <div className="zhijie-ai-outputs">
            <div><IconLayers aria-hidden="true" /><span>DESIGN</span><h3>Editable Studio prototype</h3><p>Refine pages, components, state, and interactions on the canvas.</p></div>
            <div><IconCode aria-hidden="true" /><span>CODE</span><h3>React / TypeScript code</h3><p>Reuse your components and standards. Integrate and verify in your project.</p></div>
          </div>
        </div>
      </div>
      <div className="zhijie-ai-capabilities">
        <article><IconTerminal aria-hidden="true" /><h3>Connect your agent</h3><p>Detect installed agent CLIs and apps automatically. Share the same Skill, workflows, and standards across your tools without choosing an installation directory.</p></article>
        <article><IconBolt aria-hidden="true" /><h3>Design with Skills</h3><p>Build and revise real pages through desktop MCP. Reuse components, configure state and interactions, and keep every design editable.</p></article>
        <article><IconCode aria-hidden="true" /><h3>Generate project code</h3><p>Let your agent read page models and component contracts to implement native React / TypeScript, then verify the build, behavior, and visuals.</p></article>
      </div>
      <div className="zhijie-ai-access"><p>Connect to Studio through desktop MCP to design with AI and read your pages.</p><a className="zhijie-text-link" href="#download">Download desktop app <IconArrowRight aria-hidden="true" /></a></div>
    </section>
  );
}

const scaleCapabilities = [
  { image: 'security', title: 'SOC 2 Compliance', description: 'Explore security and compliance information for the official Plasmic service.', href: 'https://www.plasmic.app/enterprise' },
  { image: 'sso', title: 'SSO and Domain Capture', description: 'Unify team identities and manage access to your organization.' },
  { image: 'permissions', title: 'Fine-Grained Permissions', description: 'Control access for project collaborators and application users.' },
  { image: 'branching', title: 'Branching & approvals', description: 'Work on independent branches, review changes, and merge when ready.' },
  { image: 'libraries', title: 'Shared Libraries', description: 'Reuse your organization’s components and design assets across projects.' },
  { image: 'on-premise', title: 'On-Premise App Deployment', description: 'Deploy your apps to your own servers or behind your firewall.' },
];

export function ZhijiePage() {
  useHomeEffects();
  const downloads = usePlasmicDownloads();
  const [platform, setPlatform] = useState<string | null>(null);
  useEffect(() => {
    const ua = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    const detected = mobile ? null : /Windows/i.test(ua) ? 'windows' : /Macintosh|Mac OS X/i.test(ua) ? 'mac' : /Linux/i.test(ua) && !/Android/i.test(ua) ? 'linux' : null;
    Promise.resolve().then(() => setPlatform(detected));
  }, []);

  return (
    <div className="page-shell zhijie-page">
      <PageMeta language="en" title="Zhijie · Visual App Builder | Shiguang" description="Zhijie brings open-source Plasmic to your tech stack. Build websites and apps visually, connect data, reuse React components, and integrate with your existing code and infrastructure." />
      <SiteHeader productPage english />
      <main id="top">
        <section className="zhijie-hero">
          <div className="container">
            <div className="zhijie-hero-copy">
              <div className="zhijie-eyebrow"><ZhijieMark /><strong>Zhijie</strong><span>Built on open-source Plasmic</span></div>
              <h1>The <em>visual builder</em> for your tech stack</h1>
              <p>An open-source visual editing and content platform for websites and apps. Integrate with your existing codebase. Ship faster.</p>
              <div className="zhijie-actions"><a className="btn btn-primary btn-lg" href={PLASMIC_WEB_URL} target="_blank" rel="noopener noreferrer">Get started <IconArrowRight aria-hidden="true" /></a><a className="btn btn-ghost btn-lg" href="#download"><IconDownload aria-hidden="true" />Download desktop app</a></div>
            </div>
            <div className="zhijie-preview-wrap">
              <div className="zhijie-preview-frame"><img className="zhijie-studio-image" src="/assets/zhijie/studio.webp" width="1600" height="900" fetchPriority="high" alt="Editing desktop and mobile storefronts side by side in Plasmic Studio, with controls for text, layout, and styles" /></div>
              <div className="zhijie-preview-fade"><div className="zhijie-use-types" aria-label="What you can build">{['Internal tools', 'Customer portals', 'SaaS apps', 'Storefronts', 'Websites', 'Content management'].map(type => <span key={type}>{type}</span>)}</div></div>
            </div>
          </div>
        </section>
        <HowItWorks />
        <AiWorkflow />
        <section id="design" className="zhijie-design">
          <div className="container">
            <div className="zhijie-section-heading reveal"><span className="section-kicker">DESIGN</span><h2>Design experiences your users will <em>love</em></h2><p>Express your product’s personality with custom UIs, responsive layouts, and styling your users will love.</p></div>
            <div className="zhijie-feature-row">
              <div className="zhijie-feature-copy reveal"><IconLayers className="zhijie-feature-icon" aria-hidden="true" /><h3>Create completely<br /><em>custom UIs</em></h3><p>Define your own layouts, typography, and styles. Create unique interfaces tailored to your product’s needs.</p></div>
              <figure className="zhijie-editor-visual reveal"><img src="/assets/zhijie/design.webp" width="1400" height="995" loading="lazy" alt="A custom video app interface built in Plasmic" /></figure>
            </div>
            <div className="zhijie-feature-row is-reversed">
              <div className="zhijie-feature-copy reveal"><IconLink className="zhijie-feature-icon" aria-hidden="true" /><h3>Import with <em>Figma</em></h3><p>Import your Figma designs into editable pages in Plasmic Studio, then turn them into production React code.</p><a className="zhijie-text-link" href="https://www.figma.com/community/plugin/845367649027913572/Plasmic-Exporter/Figma-to-Code-by-Plasmic" target="_blank" rel="noopener noreferrer">Figma import plugin <IconArrowRight /></a></div>
              <figure className="zhijie-editor-visual"><video src="/assets/zhijie/figma.mp4" poster="/assets/zhijie/figma-poster.jpg" width="1432" height="1080" muted autoPlay loop playsInline controls preload="metadata" aria-label="Official Plasmic demo: importing a Figma dashboard into Studio" /></figure>
            </div>
          </div>
        </section>
        <section id="collaboration" className="zhijie-collaboration container">
          <div className="zhijie-section-heading is-left reveal"><span className="section-kicker">COLLABORATION</span><h2><em>Bridge the gap</em><br />between teams</h2><p>Bring development, design, content, and business teams together to build better product experiences.</p></div>
          <div className="zhijie-collaboration-details reveal"><article><h3>Empower<br /><em>non-developers</em></h3><p>Developers register components as building blocks. Marketing, content, design, and product teams can build and publish pages on the canvas.</p></article><article><h3>Collaborate<br /><em>effortlessly</em></h3><p>Keep teams moving together with multiplayer editing and branching. Work in parallel and focus on what each team does best.</p></article></div>
          <figure className="zhijie-collaboration-visual zhijie-illustration reveal"><img src="/assets/zhijie/collaboration.webp" width="1600" height="1140" loading="lazy" alt="Team members collaborating on a shared Plasmic canvas" /></figure>
        </section>
        <section id="integration" className="zhijie-integration container">
          <div className="zhijie-section-heading reveal"><span className="section-kicker">POWER</span><h2>Integrate with any<br /><em>codebase</em></h2><p>Bring visual building into your existing codebase and keep working with your own tech stack.</p></div>
          <div className="zhijie-feature-row">
            <div className="zhijie-feature-copy reveal"><IconLayers className="zhijie-feature-icon" aria-hidden="true" /><h3>Build with your<br /><em>components</em></h3><p>Create apps around your requirements with your React components, data sources, design system, and deployment environment.</p></div>
            <figure className="zhijie-illustration reveal"><img src="/assets/zhijie/components.webp" width="1400" height="1475" loading="lazy" alt="Reusing React components and a design system in Plasmic" /></figure>
          </div>
          <div className="zhijie-feature-row is-reversed">
            <div className="zhijie-feature-copy reveal"><IconLayers className="zhijie-feature-icon" aria-hidden="true" /><h3>Build within<br /><em>existing apps</em></h3><p>Build pages directly inside your existing applications. Reuse your code and components for a cohesive experience, with no iframes.</p></div>
            <figure className="zhijie-illustration reveal"><img src="/assets/zhijie/existing-app.webp" width="1832" height="1951" loading="lazy" alt="Plasmic pages integrated into an existing application" /></figure>
          </div>
        </section>
        <section id="deployment" className="zhijie-deployment container">
          <div className="zhijie-deployment-intro"><div className="zhijie-section-heading is-left reveal"><span className="section-kicker">DEPLOYMENT</span><h2>Deploy<br /><em>anywhere</em></h2><p>Choose your own hosting infrastructure and keep your existing build and release workflow.</p></div><figure className="zhijie-illustration reveal"><img src="/assets/zhijie/deploy-connections.webp" width="1151" height="539" loading="lazy" alt="Connecting GitHub to deployment services" /></figure></div>
          <figure className="zhijie-deployment-visual zhijie-illustration reveal"><img src="/assets/zhijie/deploy.webp" width="1361" height="881" loading="lazy" alt="Publishing with Plasmic: create a repository, push to GitHub, and save page versions" /></figure>
        </section>
        <section id="scale" className="zhijie-scale">
          <div className="container">
            <div className="zhijie-section-heading reveal"><span className="section-kicker">SCALE UP</span><h2>Scale without limits</h2><p>Keep control of your organization’s assets, collaboration workflows, and deployments as your team and applications grow.</p><a className="btn btn-primary" href={PLASMIC_WEB_URL} target="_blank" rel="noopener noreferrer">Get started <IconArrowRight /></a></div>
            <div className="zhijie-scale-grid">{scaleCapabilities.map(capability => <article key={capability.image} className="reveal"><img src={`/assets/zhijie/scale-${capability.image}.svg`} width="394" height="300" loading="lazy" alt="" /><div><h3>{capability.title}</h3><p>{capability.description}</p>{capability.href && <a className="zhijie-text-link" href={capability.href} target="_blank" rel="noopener noreferrer">Plasmic security details <IconArrowRight /></a>}</div></article>)}</div>
          </div>
        </section>
        <section id="download" className="zhijie-download container">
          <div className="zhijie-section-heading reveal"><span className="section-kicker">YOUR SPACE TO CREATE</span><h2>Build wherever you work</h2><p>Open your workspace in the browser, or download the desktop app to stay focused on creating.</p></div>
          <div className="zhijie-access-grid">
            <article className="zhijie-web-access reveal"><span className="zhijie-web-icon"><IconGlobe aria-hidden="true" /></span><small>NO INSTALLATION REQUIRED</small><h3>Web app</h3><p>Sign in with your Shiguang account to access your projects and the visual editor.</p><a className="btn btn-primary" href={PLASMIC_WEB_URL} target="_blank" rel="noopener noreferrer">Get started <IconArrowRight /></a><span>No installation needed · Shiguang account</span></article>
            <article className="zhijie-desktop-access reveal">
              <div className="zhijie-download-heading"><div><small>DESKTOP APP</small><h3>Desktop app</h3></div>{platform ? <span className="zhijie-system-detected">System detected</span> : <span>Official releases</span>}</div>
              <ul>
                {downloads.map(build => {
                  const current = platform === build.platform;
                  return (
                    <li key={build.id} className={current ? 'is-current' : ''}>
                      <span className="zhijie-build-glyph"><PlatformGlyph name={build.platform} /></span>
                      <div className="zhijie-build-meta"><strong>{build.name}{current && <em>Your system</em>}</strong><small>{build.packaging}{build.version ? ` · v${build.version}` : ''}</small></div>
                      {build.url ? <><span className="zhijie-build-size">{build.sizeMb} MB</span><a className={`btn btn-sm ${current ? 'btn-primary' : 'btn-ghost'}`} href={build.url} aria-label={`Download ${build.name} ${build.packaging}`}><IconDownload aria-hidden="true" />Download</a></> : <span className="zhijie-download-unavailable">Coming soon</span>}
                    </li>
                  );
                })}
              </ul>
              <p>The desktop and web apps share the same workspace. Installers use the Plasmic name.</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
