import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const authProxyTarget = env.AUTH_PROXY_TARGET || 'https://shiguanglab.com';
  const authProxyOrigin = new URL(authProxyTarget).origin;

  return {
    plugins: [react()],
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
      },
    },
    build: {
      manifest: !isSsrBuild,
      sourcemap: true,
    },
    ssr: {
      noExternal: ['@douyinfe/semi-icons'],
    },
  };
});
