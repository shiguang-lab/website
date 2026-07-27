import IconArrowLeft from '@douyinfe/semi-icons/lib/es/icons/IconArrowLeft';
import IconMail from '@douyinfe/semi-icons/lib/es/icons/IconMail';
import IconRefresh from '@douyinfe/semi-icons/lib/es/icons/IconRefresh';
import IconShield from '@douyinfe/semi-icons/lib/es/icons/IconShield';
import { Link, useLocation } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';

const supportEmail = 'support@shiguanglab.com';
const supportHref = `mailto:${supportEmail}?subject=${encodeURIComponent('拾光账号登录协助')}&body=${encodeURIComponent('请描述登录账号、错误提示、发生时间及已尝试的操作。为保障安全，请勿发送密码或验证码。')}`;

export function LoginHelpPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const returnTo = query.get('return_to') || query.get('redirect') || '/';
  const loginHref = `/login?${new URLSearchParams({ return_to: returnTo }).toString()}`;

  return (
    <main className="help-page">
      <PageMeta title="无法登录 · 拾光" description="拾光账号登录、密码、第三方登录与企业 SSO 问题处理指引" />
      <header className="help-header">
        <div className="help-shell help-nav">
          <Link className="legal-brand" to="/" aria-label="返回拾光首页">
            <img src="/assets/微信图片_20260722101545_795_4.svg" alt="" />
            <span><strong>拾光</strong><small>SHIGUANG</small></span>
          </Link>
          <Link className="legal-back" to={loginHref}><IconArrowLeft aria-hidden="true" />返回登录</Link>
        </div>
        <div className="help-shell help-intro">
          <span>ACCOUNT SUPPORT</span>
          <h1>无法登录？</h1>
          <p>先根据当前情况完成快速检查。涉及账号归属或安全风险时，我们会在核验身份后协助处理。</p>
        </div>
      </header>

      <div className="help-shell help-content">
        <section className="help-quick" aria-labelledby="quick-check-title">
          <div className="help-section-heading">
            <span>01</span>
            <div><h2 id="quick-check-title">先完成这 3 项检查</h2><p>多数登录问题可在几分钟内恢复。</p></div>
          </div>
          <ol className="help-steps">
            <li><i><IconRefresh aria-hidden="true" /></i><div><strong>确认登录方式</strong><p>账号密码、第三方账号和企业 SSO 是不同入口。请使用注册时的方式，并确认用户名或邮箱拼写无误。</p></div></li>
            <li><i><IconShield aria-hidden="true" /></i><div><strong>排除浏览器与网络问题</strong><p>刷新页面，允许本站必要 Cookie，关闭可能拦截登录请求的扩展；仍失败时可更换稳定网络或使用最新版浏览器重试。</p></div></li>
            <li><i><IconMail aria-hidden="true" /></i><div><strong>记录错误信息</strong><p>保留错误提示、发生时间、登录方式和浏览器版本。请勿在截图或邮件中包含密码、验证码、访问令牌或完整身份证件。</p></div></li>
          </ol>
        </section>

        <section className="help-faq" aria-labelledby="faq-title">
          <div className="help-section-heading">
            <span>02</span>
            <div><h2 id="faq-title">按问题类型处理</h2><p>展开最符合现状的一项。</p></div>
          </div>
          <div className="help-disclosures">
            <details open>
              <summary>忘记密码或密码始终错误</summary>
              <div>
                <p>请先确认大小写、输入法和账号名称。连续失败可能触发临时安全限制，请停止重复尝试并稍后再试。</p>
                <p>当前页面尚未开放自助密码重置时，请使用注册邮箱联系支持。我们会核验账号归属，但不会向您索要原密码或验证码。</p>
              </div>
            </details>
            <details>
              <summary>第三方账号登录失败</summary>
              <div>
                <p>确认第三方账号可正常使用，且未撤回对拾光的授权。首次使用第三方登录时，可能需要补充用户名和邮箱以完成拾光账号创建。</p>
                <p>如果曾用密码注册拾光，请勿仅因邮箱相同就假定账号会自动合并；为避免账号串联，第三方身份需在账号中心明确绑定。</p>
              </div>
            </details>
            <details>
              <summary>企业 SSO 无法登录</summary>
              <div>
                <p>确认组织已开通企业 SSO、您的企业账号仍在职有效且已被分配拾光访问权限。企业身份提供方的多因素认证、条件访问或网络策略也可能阻止登录。</p>
                <p>请先联系本组织管理员；如管理员确认配置正常，再将组织名称、错误时间和提示信息发送给拾光支持。</p>
              </div>
            </details>
            <details>
              <summary>提示请求频繁、账号受限或存在风险</summary>
              <div>
                <p>停止重复提交并等待安全限制自动解除。切勿使用代理批量尝试、共享账号或向他人提供验证码。</p>
                <p>如果发现陌生登录、账号资料被改动或密钥泄露，请立即联系我们，并说明最近一次正常登录时间和可能受影响的功能。</p>
              </div>
            </details>
            <details>
              <summary>收不到验证邮件</summary>
              <div>
                <p>检查垃圾邮件、邮箱拦截规则和容量，确认注册邮箱拼写正确，并将拾光邮件地址加入白名单。邮件可能存在短暂延迟，请避免短时间内反复请求。</p>
                <p>如邮箱已停用或无法访问，需要由支持团队核验账号归属后处理，无法仅凭用户名直接更换绑定邮箱。</p>
              </div>
            </details>
          </div>
        </section>

        <section className="help-contact" aria-labelledby="contact-title">
          <div>
            <span>03</span>
            <h2 id="contact-title">仍然无法登录</h2>
            <p>请从注册邮箱发信，并附上账号用户名、登录方式、错误提示、发生时间和已尝试的操作。我们通常会在 2 个工作日内回复。</p>
          </div>
          <a className="help-contact-button" href={supportHref}><IconMail aria-hidden="true" />联系支持</a>
          <small>{supportEmail}</small>
        </section>

        <aside className="help-security">
          <IconShield aria-hidden="true" />
          <p><strong>安全提醒</strong>拾光工作人员不会索要您的密码、短信或邮箱验证码、完整访问令牌，也不会要求您通过远程控制软件配合“解封”。</p>
        </aside>
      </div>
    </main>
  );
}
