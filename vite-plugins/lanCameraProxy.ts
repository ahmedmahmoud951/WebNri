import type { Plugin } from 'vite';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import type { IncomingMessage, ServerResponse } from 'node:http';
import http from 'node:http';
import https from 'node:https';

const proxyLog = process.env.VITE_PROXY_LOG === '1';
const SNAPSHOT_MAX_BYTES = 512 * 1024;
const BOUNDARY = 'nriframe';

/** Deep Guard / WPF-style low-latency RTSP ingest flags. */
const FFMPEG_RTSP_INPUT =
  '-rtsp_transport tcp -fflags nobuffer+genpts+discardcorrupt+igndts -avioflags direct -flags +low_delay -probesize 180000 -analyzeduration 500000';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1') return true;
  const parts = h.split('.').map((x) => Number(x));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function buildRtspUrl(raw: string, user: string, pw: string): string {
  const u = new URL(raw);
  if (!u.username && user) {
    u.username = user;
    u.password = pw ?? '';
  }
  return u.toString();
}

function extractFirstJpeg(body: Buffer): Buffer | null {
  const start = body.indexOf(Buffer.from([0xff, 0xd8]));
  if (start < 0) return null;
  const end = body.indexOf(Buffer.from([0xff, 0xd9]), start + 2);
  if (end < 0) return null;
  return body.subarray(start, end + 2);
}

/** Parse consecutive JPEG frames from FFmpeg image2pipe (same as WPF CameraStreamPlayer). */
class JpegPipeParser {
  private pending = Buffer.alloc(0);

  push(chunk: Buffer): Buffer[] {
    if (chunk.length === 0) return [];
    this.pending = Buffer.concat([this.pending, chunk]);
    const out: Buffer[] = [];
    for (;;) {
      let start = this.pending.indexOf(0xff);
      while (start >= 0 && start < this.pending.length - 1 && this.pending[start + 1] !== 0xd8) {
        start = this.pending.indexOf(0xff, start + 1);
      }
      if (start < 0 || start >= this.pending.length - 1 || this.pending[start + 1] !== 0xd8) break;
      const end = this.pending.indexOf(Buffer.from([0xff, 0xd9]), start + 2);
      if (end < 0) break;
      out.push(this.pending.subarray(start, end + 2));
      this.pending = this.pending.subarray(end + 2);
    }
    if (this.pending.length > 512 * 1024) {
      this.pending = this.pending.subarray(this.pending.length - 256 * 1024);
    }
    return out;
  }
}

function writeMultipartFrame(res: ServerResponse, jpeg: Buffer) {
  res.write(`--${BOUNDARY}\r\n`);
  res.write(`Content-Type: image/jpeg\r\n`);
  res.write(`Content-Length: ${jpeg.length}\r\n\r\n`);
  res.write(jpeg);
  res.write('\r\n');
}

function parseAuthFromQuery(incoming: URL, targetUrl: URL) {
  const user = incoming.searchParams.get('user') || decodeURIComponent(targetUrl.username);
  const pw = incoming.searchParams.get('pw') ?? decodeURIComponent(targetUrl.password);
  targetUrl.username = '';
  targetUrl.password = '';
  const headers: Record<string, string> = {
    Accept: 'image/jpeg,image/*,multipart/x-mixed-replace,*/*',
  };
  if (user) {
    headers.Authorization = `Basic ${Buffer.from(`${user}:${pw ?? ''}`, 'utf8').toString('base64')}`;
  }
  return { user, pw, headers };
}

function fetchCameraHttp(
  url: string,
  headers: Record<string, string>,
  timeoutMs: number,
): Promise<{ body: Buffer; contentType: string }> {
  const target = new URL(url);
  const lib = target.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = lib.get(
      target.toString(),
      { headers, timeout: timeoutMs },
      (resp) => {
        const code = resp.statusCode ?? 0;
        if (code >= 400) {
          resp.resume();
          reject(new Error(`HTTP ${code}`));
          return;
        }
        const chunks: Buffer[] = [];
        let total = 0;
        resp.on('data', (chunk: Buffer) => {
          total += chunk.length;
          if (total > SNAPSHOT_MAX_BYTES) {
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });
        resp.on('end', () => {
          resolve({
            body: Buffer.concat(chunks),
            contentType: resp.headers['content-type'] ?? 'image/jpeg',
          });
        });
        resp.on('error', reject);
      },
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });
  });
}

/**
 * Deep Guard-style: FFmpeg pulls RTSP continuously → MJPEG pipe → multipart for browser <img>.
 * Same idea as WPF CameraStreamPlayer / Gateway FFmpeg ingest (not snapshot polling).
 */
function streamRtspLiveMjpeg(
  req: IncomingMessage,
  res: ServerResponse,
  rtspUrl: string,
  fps: number,
) {
  const rate = Math.min(15, Math.max(5, fps));
  const args = [
    '-hide_banner',
    '-loglevel',
    'error',
    ...FFMPEG_RTSP_INPUT.split(' '),
    '-i',
    rtspUrl,
    '-an',
    '-f',
    'image2pipe',
    '-vcodec',
    'mjpeg',
    '-q:v',
    '5',
    '-r',
    String(rate),
    '-',
  ];

  if (proxyLog) {
    const safe = rtspUrl.replace(/\/\/[^@]+@/, '//***@');
    console.log(`[lan-camera] RTSP-LIVE ${safe} @ ${rate}fps`);
  }

  let proc: ChildProcessWithoutNullStreams | null = null;
  let closed = false;
  let headersSent = false;
  let ffmpegFailed = false;
  const parser = new JpegPipeParser();

  const fail = (msg: string, code = 502) => {
    if (closed) return;
    closed = true;
    if (proc) {
      try {
        proc.kill();
      } catch {
        /* ignore */
      }
      proc = null;
    }
    if (!res.writableEnded) {
      if (!headersSent) {
        res.statusCode = code;
        res.end(msg);
      } else {
        res.end();
      }
    }
  };

  const cleanup = () => {
    closed = true;
    if (proc) {
      try {
        proc.kill();
      } catch {
        /* ignore */
      }
      proc = null;
    }
  };

  const writeFrame = (jpeg: Buffer) => {
    if (closed || res.writableEnded) return;
    if (!headersSent) {
      res.writeHead(200, {
        'Content-Type': `multipart/x-mixed-replace; boundary=${BOUNDARY}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Connection: 'close',
        'X-Accel-Buffering': 'no',
      });
      headersSent = true;
    }
    try {
      writeMultipartFrame(res, jpeg);
    } catch {
      cleanup();
    }
  };

  req.on('close', cleanup);

  const startupTimer = setTimeout(() => {
    if (!headersSent && !closed) {
      if (proxyLog) console.error('[lan-camera] RTSP-LIVE timeout (no frame)');
      fail('RTSP stream timeout — no frames received');
    }
  }, 8000);

  try {
    proc = spawn('ffmpeg', args, { windowsHide: true });
  } catch (err) {
    clearTimeout(startupTimer);
    const msg = err instanceof Error ? err.message : 'spawn failed';
    if (proxyLog) console.error(`[lan-camera] RTSP-LIVE spawn FAIL: ${msg}`);
    fail(`FFmpeg error: ${msg}`);
    return;
  }

  proc.on('error', (err) => {
    clearTimeout(startupTimer);
    if (proxyLog) console.error(`[lan-camera] RTSP-LIVE FAIL: ${err.message}`);
    fail(`FFmpeg error: ${err.message}`);
  });

  proc.stderr.on('data', (c: Buffer) => {
    if (proxyLog && closed) return;
    const line = c.toString().trim();
    if (line) {
      if (proxyLog) console.error(`[lan-camera] ffmpeg: ${line}`);
      if (!headersSent && /error|failed|404|401|403|refused|timeout/i.test(line)) {
        ffmpegFailed = true;
      }
    }
  });

  proc.stdout.on('data', (chunk: Buffer) => {
    if (closed || res.writableEnded) return;
    for (const jpeg of parser.push(chunk)) {
      if (jpeg.length < 128) continue;
      clearTimeout(startupTimer);
      writeFrame(jpeg);
    }
  });

  proc.on('close', (code) => {
    clearTimeout(startupTimer);
    if (!headersSent && !closed) {
      if (proxyLog) console.error(`[lan-camera] RTSP-LIVE ended code=${code}`);
      fail(ffmpegFailed ? 'RTSP stream failed' : 'RTSP stream ended before first frame');
      return;
    }
    if (!closed && !res.writableEnded) {
      if (proxyLog) console.error(`[lan-camera] RTSP-LIVE ended code=${code}`);
      res.end();
    }
    cleanup();
  });
}

async function streamLiveMjpegFromSnapshot(
  req: IncomingMessage,
  res: ServerResponse,
  snapshotUrl: string,
  headers: Record<string, string>,
  fps: number,
) {
  const delayMs = Math.max(66, Math.floor(1000 / fps));
  let closed = false;
  let headersSent = false;
  req.on('close', () => {
    closed = true;
  });

  if (proxyLog) {
    console.log(`[lan-camera] HTTP-LIVE ${snapshotUrl} @ ${fps}fps`);
  }

  let emptyStreak = 0;
  while (!closed) {
    try {
      const { body } = await fetchCameraHttp(snapshotUrl, headers, 8000);
      const jpeg = body[0] === 0xff && body[1] === 0xd8 ? body : extractFirstJpeg(body);
      if (jpeg && jpeg.length >= 128) {
        if (!headersSent) {
          res.writeHead(200, {
            'Content-Type': `multipart/x-mixed-replace; boundary=${BOUNDARY}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Connection: 'close',
          });
          headersSent = true;
        }
        writeMultipartFrame(res, jpeg);
        emptyStreak = 0;
      } else {
        emptyStreak++;
      }
    } catch (err) {
      emptyStreak++;
      if (proxyLog && emptyStreak === 1) {
        const msg = err instanceof Error ? err.message : 'error';
        console.error(`[lan-camera] HTTP-LIVE FAIL: ${msg}`);
      }
      if (emptyStreak >= 12) break;
    }
    await sleep(delayMs);
  }

  if (!closed) {
    if (!headersSent) {
      res.statusCode = 502;
      res.end('Camera snapshot unreachable');
    } else {
      res.end();
    }
  }
}

function pipeCameraMjpeg(
  req: IncomingMessage,
  res: ServerResponse,
  targetUrl: string,
  headers: Record<string, string>,
) {
  const target = new URL(targetUrl);
  const lib = target.protocol === 'https:' ? https : http;

  if (proxyLog) console.log(`[lan-camera] MJPEG pipe ${targetUrl}`);

  const cameraReq = lib.get(target.toString(), { headers, timeout: 0 }, (cameraRes) => {
    const code = cameraRes.statusCode ?? 0;
    if (code >= 400) {
      cameraRes.resume();
      res.statusCode = 502;
      res.end(`Camera HTTP ${code}`);
      return;
    }

    const ct = cameraRes.headers['content-type'] ?? 'multipart/x-mixed-replace';
    res.writeHead(200, {
      'Content-Type': ct,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Connection: 'close',
    });
    cameraRes.pipe(res);
    req.on('close', () => cameraReq.destroy());
    cameraRes.on('error', () => {
      if (!res.writableEnded) res.end();
    });
  });

  cameraReq.on('error', (err) => {
    if (proxyLog) console.error(`[lan-camera] MJPEG FAIL: ${err.message}`);
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end(`Camera unreachable: ${err.message}`);
    }
  });
}

function parseHttpTarget(incoming: URL): { targetUrl: URL; user: string; headers: Record<string, string> } | null {
  const rawTarget = incoming.searchParams.get('url');
  if (!rawTarget) return null;
  let targetUrl: URL;
  try {
    targetUrl = new URL(rawTarget);
  } catch {
    return null;
  }
  if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') return null;
  if (!isPrivateHost(targetUrl.hostname)) return null;
  const { user, headers } = parseAuthFromQuery(incoming, targetUrl);
  return { targetUrl, user, headers };
}

function parseRtspTarget(incoming: URL): { rtspUrl: string } | null {
  const rawTarget = incoming.searchParams.get('url');
  if (!rawTarget) return null;
  let targetUrl: URL;
  try {
    targetUrl = new URL(rawTarget);
  } catch {
    return null;
  }
  if (targetUrl.protocol !== 'rtsp:') return null;
  if (!isPrivateHost(targetUrl.hostname)) return null;
  const { user, pw } = parseAuthFromQuery(incoming, targetUrl);
  return { rtspUrl: buildRtspUrl(targetUrl.toString(), user, pw) };
}

/** Dev-only LAN gateway (Deep Guard Gateway pattern, MJPEG for browser). */
export function lanCameraProxyPlugin(): Plugin {
  return {
    name: 'lan-camera-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/lan-camera/')) {
          next();
          return;
        }

        const incoming = new URL(req.url, 'http://127.0.0.1');

        if (incoming.pathname === '/lan-camera/rtsp-live.mjpeg') {
          const parsed = parseRtspTarget(incoming);
          if (!parsed) {
            res.statusCode = 400;
            res.end('Bad RTSP request');
            return;
          }
          const fps = Math.min(15, Math.max(5, Number(incoming.searchParams.get('fps') || 10)));
          streamRtspLiveMjpeg(req, res, parsed.rtspUrl, fps);
          return;
        }

        if (incoming.pathname === '/lan-camera/live.mjpeg') {
          const parsed = parseHttpTarget(incoming);
          if (!parsed) {
            res.statusCode = 400;
            res.end('Bad request');
            return;
          }
          const fps = Math.min(15, Math.max(5, Number(incoming.searchParams.get('fps') || 10)));
          await streamLiveMjpegFromSnapshot(req, res, parsed.targetUrl.toString(), parsed.headers, fps);
          return;
        }

        if (incoming.pathname === '/lan-camera/mjpeg') {
          const parsed = parseHttpTarget(incoming);
          if (!parsed) {
            res.statusCode = 400;
            res.end('Bad request');
            return;
          }
          pipeCameraMjpeg(req, res, parsed.targetUrl.toString(), parsed.headers);
          return;
        }

        if (incoming.pathname === '/lan-camera/snapshot') {
          const parsed = parseHttpTarget(incoming);
          if (!parsed) {
            res.statusCode = 400;
            res.end('Bad request');
            return;
          }
          try {
            const { body, contentType } = await fetchCameraHttp(parsed.targetUrl.toString(), parsed.headers, 8000);
            const jpeg = body[0] === 0xff && body[1] === 0xd8 ? body : extractFirstJpeg(body);
            if (!jpeg || jpeg.length < 128) {
              res.statusCode = 502;
              res.end(`Not a JPEG (${contentType}, ${body.length} bytes)`);
              return;
            }
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'no-store');
            res.statusCode = 200;
            res.end(jpeg);
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'error';
            res.statusCode = 502;
            res.end(`Camera unreachable: ${msg}`);
          }
          return;
        }

        res.statusCode = 404;
        res.end('Not found');
      });
    },
  };
}
