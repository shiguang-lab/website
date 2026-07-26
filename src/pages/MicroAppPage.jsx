import { lazy, Suspense } from 'react';
import Button from '@douyinfe/semi-ui/lib/es/button';
import Empty from '@douyinfe/semi-ui/lib/es/empty';
import Spin from '@douyinfe/semi-ui/lib/es/spin';
import Typography from '@douyinfe/semi-ui/lib/es/typography';
import IconArrowLeft from '@douyinfe/semi-icons/lib/es/icons/IconArrowLeft';
import { Link, useParams } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { getMicroApp } from '../micro-apps/registry';

const WujieHost = lazy(() => import('../components/WujieHost'));

export function MicroAppPage() {
  const { appId = '' } = useParams();
  const app = getMicroApp(appId);

  return (
    <div className="micro-app-page tw:flex tw:h-dvh tw:flex-col tw:bg-[#f7f8fa]">
      <PageMeta
        title={`${app?.title ?? '产品'} · 拾光`}
        description="拾光 AI 产品工作台"
      />
      <header className="tw:flex tw:h-14 tw:shrink-0 tw:items-center tw:gap-4 tw:border-b tw:border-[#e5e6eb] tw:bg-white tw:px-5">
        <Link to="/" aria-label="返回拾光首页">
          <Button theme="borderless" icon={<IconArrowLeft />} />
        </Link>
        <img src="/assets/微信图片_20260722101545_795_4.svg" alt="" className="tw:h-7 tw:w-8" />
        <Typography.Title heading={6} style={{ margin: 0 }}>
          {app?.title ?? '未知产品'}
        </Typography.Title>
      </header>
      <main className="tw:min-h-0 tw:flex-1">
        {!app?.url ? (
          <div className="tw:grid tw:h-full tw:min-h-[520px] tw:place-items-center tw:p-8">
            <Empty
              title={app ? `${app.title}尚未配置接入地址` : '未找到该产品'}
              description={app ? `请配置对应的 VITE_APP_${appId.toUpperCase()}_URL 环境变量` : '请从拾光首页选择产品'}
            />
          </div>
        ) : (
          <Suspense fallback={<div className="tw:grid tw:h-full tw:min-h-[520px] tw:place-items-center"><Spin size="large" /></div>}>
            <WujieHost app={app} />
          </Suspense>
        )}
      </main>
    </div>
  );
}
