import { statSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/** 构建时读取安装包真实大小(MB),产物缺失时为 null,页面据此隐藏大小徽标。 */
function downloadSizes() {
  const artifacts = {
    windows: 'public/downloads/sichen-windows-x64.exe',
    mac: 'public/downloads/sichen-macos-universal.dmg',
    linux: 'public/downloads/sichen-linux-x86_64.AppImage',
  };
  /** @type {Record<string, number | null>} */
  const sizes = {};
  for (const [key, file] of Object.entries(artifacts)) {
    try {
      sizes[key] = Math.round(statSync(file).size / 1024 / 1024);
    } catch {
      sizes[key] = null;
    }
  }
  return sizes;
}

export default defineConfig(({ isSsrBuild, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const authProxyTarget = env.AUTH_PROXY_TARGET || 'https://shiguanglab.com';
  const authProxyOrigin = new URL(authProxyTarget).origin;

  return {
    plugins: [react()],
    define: {
      __SICHEN_DOWNLOAD_SIZES__: JSON.stringify(downloadSizes()),
    },
    server: {
      proxy: {
        '/api/auth': {
          target: authProxyTarget,
          changeOrigin: true,
          cookieDomainRewrite: '',
          secure: true,
          configure(proxy) {
            proxy.on('proxyReq', (proxyRequest) => {
              proxyRequest.setHeader('Origin', authProxyOrigin);
            });
          },
        },
        '/api/account': {
          target: authProxyTarget,
          changeOrigin: true,
          cookieDomainRewrite: '',
          secure: authProxyOrigin.startsWith('https://'),
        },
        '/api/platform': {
          target: authProxyTarget,
          changeOrigin: true,
          cookieDomainRewrite: '',
          secure: authProxyOrigin.startsWith('https://'),
        },
      },
    },
    build: {
      manifest: !isSsrBuild,
      sourcemap: true,
    },
    ssr: {
      noExternal: ['@douyinfe/semi-icons', '@shiguang/components'],
    },
  };
});
