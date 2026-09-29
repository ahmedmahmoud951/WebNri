import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { lanCameraProxyPlugin } from './vite-plugins/lanCameraProxy';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const keepAliveAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30_000,
  maxSockets: 30,
  maxFreeSockets: 10,
  timeout: 60_000,
});

function proxyWithLog(target: string) {
  return {
    target,
    changeOrigin: true,
    secure: false,
    agent: keepAliveAgent,
    timeout: 60_000,
    proxyTimeout: 60_000,
    configure: (proxy: { on: (event: string, handler: (...args: unknown[]) => void) => void }) => {
      proxy.on('proxyReq', (_proxyReq, req) => {
        const request = req as { method?: string; url?: string };
        console.log(`\x1b[36m[API Request]\x1b[0m ${request.method} ${request.url} → ${target}`);
      });
      proxy.on('proxyRes', (proxyRes, req) => {
        const request = req as { method?: string; url?: string };
        const response = proxyRes as { statusCode?: number };
        const statusColor = (response.statusCode ?? 200) < 400 ? '\x1b[32m' : '\x1b[31m';
        let body = '';
        (proxyRes as unknown as NodeJS.ReadableStream).on('data', (chunk: Buffer) => {
          body += chunk.toString('utf8');
        });
        (proxyRes as unknown as NodeJS.ReadableStream).on('end', () => {
          console.log(`\x1b[36m[API Response]\x1b[0m ${request.method} ${request.url} ← ${statusColor}${response.statusCode}\x1b[0m`);
          if ((response.statusCode ?? 200) >= 400 && body) {
            try {
              const parsed = JSON.parse(body);
              console.log(`\x1b[33m[API Error Detail]\x1b[0m`, JSON.stringify(parsed, null, 2));
            } catch {
              console.log(`\x1b[33m[API Error Detail]\x1b[0m`, body);
            }
          }
        });
      });
      proxy.on('error', (err, req) => {
        const request = req as { url?: string };
        console.error(`\x1b[31m[API Proxy Error]\x1b[0m ${request.url}`, err);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_ORIGIN || process.env.VITE_API_ORIGIN || 'http://nri.runasp.net';
  console.log(`\x1b[35m[Vite Proxy Target]\x1b[0m Forwarding /api to: \x1b[33m${apiTarget}\x1b[0m`);

  return {
    plugins: [react(), lanCameraProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, 'src'),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      open: true,
      proxy: {
        '/api': proxyWithLog(apiTarget),
        '/hubs': {
          ...proxyWithLog(apiTarget),
          ws: true,
          rewriteWsOrigin: true,
        },
      },
    },
  };
});
