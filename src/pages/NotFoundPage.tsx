import Button from '@douyinfe/semi-ui/lib/es/button';
import Empty from '@douyinfe/semi-ui/lib/es/empty';
import { Link } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';

export function NotFoundPage() {
  return (
    <main className="tw:grid tw:min-h-screen tw:place-items-center tw:bg-[#f7f8fa] tw:p-8">
      <PageMeta title="页面未找到 · 拾光" description="页面不存在或已被移动" />
      <div className="tw:flex tw:flex-col tw:items-center tw:gap-5">
        <Empty title="页面未找到" description="你访问的地址不存在或已被移动" />
        <Link to="/"><Button theme="solid">返回首页</Button></Link>
      </div>
    </main>
  );
}
