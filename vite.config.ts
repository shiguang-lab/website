import { statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { defineConfig, loadEnv, type Plugin, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadPlasmicDownloads } from './scripts/plasmic-downloads.ts';

/** 构建时读取安装包真实大小(MB),产物缺失时为 null,页面据此隐藏大小徽标。 */
function downloadSizes() {
  const artifacts = {
    windows: 'public/downloads/sichen-windows-x64.exe',
    mac: 'public/downloads/sichen-macos-universal.dmg',
    linux: 'public/downloads/sichen-linux-x86_64.AppImage',
  };
  const sizes: Record<string, number | null> = {};
  for (const [key, file] of Object.entries(artifacts)) {
    try {
      sizes[key] = Math.round(statSync(file).size / 1024 / 1024);
    } catch {
      sizes[key] = null;
    }
  }
  return sizes;
}

export default defineConfig(async ({ isSsrBuild, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const authProxyTarget = env.AUTH_PROXY_TARGET || 'https://shiguanglab.com';
  const authProxyOrigin = new URL(authProxyTarget).origin;
  // Both renderers must use the same release snapshot for hydration.
  const plasmicDownloads = isSsrBuild
    ? JSON.parse(await readFile('dist/plasmic-downloads.json', 'utf8'))
    : await loadPlasmicDownloads(env.VITE_PLASMIC_UPDATE_URL || 'https://studio.plasmic.shiguanglab.com/desktop-updates');

  return {
    plugins: [react(), ...(!isSsrBuild ? [{
      name: 'plasmic-download-snapshot',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'plasmic-downloads.json', source: JSON.stringify(plasmicDownloads) });
      },
    } satisfies Plugin] : [])],
    define: {
      __SICHEN_DOWNLOAD_SIZES__: JSON.stringify(downloadSizes()),
      __PLASMIC_DOWNLOADS__: JSON.stringify(plasmicDownloads),
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
      },
    },
    build: {
      manifest: !isSsrBuild,
      sourcemap: true,
    },
    ssr: {
      noExternal: ['@douyinfe/semi-icons', '@shiguang2/components'],
    },
  } satisfies UserConfig;
});
