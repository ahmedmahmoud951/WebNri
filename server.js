import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const BACKEND_TARGET = process.env.VITE_API_ORIGIN || 'https://nri.runasp.net';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

// Reverse proxy helper for /api and /hubs
function proxyRequest(req, res, targetUrl) {
  const parsedTarget = new URL(targetUrl);
  const isHttps = parsedTarget.protocol === 'https:';
  const clientLib = isHttps ? https : http;

  const options = {
    hostname: parsedTarget.hostname,
    port: parsedTarget.port || (isHttps ? 443 : 80),
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: parsedTarget.host,
      'x-forwarded-host': req.headers.host,
      'x-forwarded-proto': req.headers['x-forwarded-proto'] || 'https',
    },
    timeout: 30000,
    rejectUnauthorized: false,
  };

  const proxyReq = clientLib.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy Error] ${req.method} ${req.url} → ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Bad Gateway', message: 'Backend service unreachable', detail: err.message }));
    }
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (!res.headersSent) {
      res.writeHead(504, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Gateway Timeout', message: 'Backend service took too long to respond' }));
    }
  });

  req.pipe(proxyReq, { end: true });
}

// Static file sender with gzip support
function sendFile(req, res, filePath, contentType) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendNotFound(res);
      return;
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const shouldGzip =
      Boolean(acceptEncoding.includes('gzip')) &&
      Boolean(contentType.startsWith('text/') || contentType.startsWith('application/javascript') || contentType.startsWith('application/json'));

    const headers = {
      'Content-Type': contentType,
      'Cache-Control': filePath.includes('assets') ? 'public, max-age=31536000, immutable' : 'no-cache',
    };

    if (shouldGzip) {
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(200, headers);
      const raw = fs.createReadStream(filePath);
      const gz = zlib.createGzip();
      raw.pipe(gz).pipe(res);
    } else {
      headers['Content-Length'] = stats.size;
      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    }
  });
}

function sendNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];

  // 1. Proxy API and Hubs requests to backend
  if (urlPath.startsWith('/api') || urlPath.startsWith('/hubs')) {
    proxyRequest(req, res, BACKEND_TARGET);
    return;
  }

  // 2. Health check endpoint
  if (urlPath === '/healthz' || urlPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    return;
  }

  // 3. Resolve static file inside dist
  let safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const requestedFile = path.join(DIST_DIR, safePath);
  const ext = path.extname(requestedFile).toLowerCase();

  fs.stat(requestedFile, (err, stats) => {
    if (!err && stats.isFile()) {
      // Serve existing static file
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      sendFile(req, res, requestedFile, contentType);
    } else {
      // SPA Fallback: for all client-side routes (e.g. /find-car, /live-monitor, /floor-maps), serve index.html
      const indexPath = path.join(DIST_DIR, 'index.html');
      sendFile(req, res, indexPath, 'text/html; charset=utf-8');
    }
  });
});

// Windows iisnode passes a named pipe string or numeric port in process.env.PORT
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`[NRI Web Server] Running on ${port}`);
  console.log(`[NRI Web Server] Serving static files from: ${DIST_DIR}`);
  console.log(`[NRI Web Server] Forwarding API requests to: ${BACKEND_TARGET}`);
});
