import { useState } from 'react';
import WujieReact from 'wujie-react';

const WujieApp = /** @type {any} */ (WujieReact);

/** @param {{ app: { name: string, title: string, url?: string } }} props */
export default function WujieHost({ app }) {
  const [loadError, setLoadError] = useState('');
  /** @param {string} _url @param {unknown} error */
  const onLoadError = (_url, error) => {
    void _url;
    setLoadError(error instanceof Error ? error.message : '子应用加载失败');
  };

  return (
    <div className="tw:relative tw:h-full tw:w-full">
      <WujieApp
        width="100%"
        height="100%"
        name={app.name}
        url={app.url}
        sync
        alive
        props={{ portal: 'shiguang' }}
        loadError={onLoadError}
      />
      {loadError && (
        <div className="tw:absolute tw:inset-0 tw:grid tw:place-items-center tw:bg-white tw:p-8">
          <div className="tw:text-center">
            <h2 className="tw:m-0 tw:text-lg tw:font-semibold tw:text-[#1d2129]">{app.title}加载失败</h2>
            <p className="tw:mt-2 tw:text-sm tw:text-[#86909c]">请检查子应用地址、跨域响应头与网络连接</p>
            <button type="button" className="tw:mt-5 tw:cursor-pointer tw:rounded tw:border-0 tw:bg-[#165dff] tw:px-4 tw:py-2 tw:text-sm tw:text-white" onClick={() => location.reload()}>
              重新加载
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
