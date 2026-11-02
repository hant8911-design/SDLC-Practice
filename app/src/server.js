'use strict';

// HTTP adapter (CMP-01): REST API + static web UI, built on node:http only (ADR-001).

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { JsonStore } = require('./repo/jsonStore');
const { LeaveService } = require('./service/leaveService');
const { DomainError } = require('./domain/leave');
const seed = require('./data/seed');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MAX_BODY_BYTES = 10 * 1024;

const HTTP_STATUS = {
  VALIDATION_ERROR: 400,
  BAD_JSON: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INVALID_STATE: 409,
  PAYLOAD_TOO_LARGE: 413,
  INSUFFICIENT_BALANCE: 422,
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      // Keep draining but drop the data, so the client still receives the 413 response.
      if (size <= MAX_BODY_BYTES) chunks.push(chunk);
    });
    req.on('end', () => {
      if (size > MAX_BODY_BYTES) return reject(new DomainError('PAYLOAD_TOO_LARGE', 'Body vượt quá 10 KB'));
      let raw;
      try {
        // DEF-008: reject malformed UTF-8 instead of storing U+FFFD replacement characters.
        raw = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
      } catch {
        return reject(new DomainError('BAD_JSON', 'Body phải được mã hóa UTF-8 hợp lệ'));
      }
      if (!raw) return resolve({});
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return reject(new DomainError('BAD_JSON', 'Body không phải JSON hợp lệ'));
      }
      // DEF-004: handlers read fields from the body, so only a JSON object is accepted.
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return reject(new DomainError('BAD_JSON', 'Body phải là một JSON object'));
      }
      resolve(parsed);
    });
    req.on('error', reject);
  });
}

function serveStatic(res, pathname) {
  const file = pathname === '/' ? 'index.html' : pathname.slice(1);
  const fullPath = path.normalize(path.join(PUBLIC_DIR, file));
  if (!fullPath.startsWith(PUBLIC_DIR + path.sep) ||!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    return sendJson(res, 404, { error: { code: 'NOT_FOUND', message: 'Không tìm thấy tài nguyên' } });
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(fullPath)] || 'application/octet-stream' });
  fs.createReadStream(fullPath).pipe(res);
}

// Route table: [method, pattern, handler(ctx)] — API-01..API-09 in docs/04-design/api.md.
function buildRoutes(service) {
  return [
    ['GET', /^\/api\/health$/, () => ({ status: 'ok' })],
    ['GET', /^\/api\/users$/, () => service.listUsers()],
    ['GET', /^\/api\/me$/, ({ user }) => service.getProfile(user)],
    [
      'GET',
      /^\/api\/leave-requests$/,
      ({ user, query }) => service.listRequests(user, query.get('scope') || 'mine', query.get('status') || undefined),
    ],
    ['POST', /^\/api\/leave-requests$/, ({ user, body }) => [201, service.createRequest(user, body)]],
    ['GET', /^\/api\/leave-requests\/([\w-]+)$/, ({ user, params }) => service.getRequest(user, params[0])],
    ['POST', /^\/api\/leave-requests\/([\w-]+)\/cancel$/, ({ user, params }) => service.cancelRequest(user, params[0])],
    [
      'POST',
      /^\/api\/leave-requests\/([\w-]+)\/approve$/,
      ({ user, params, body }) => service.approveRequest(user, params[0], body.comment),
    ],
    [
      'POST',
      /^\/api\/leave-requests\/([\w-]+)\/reject$/,
      ({ user, params, body }) => service.rejectRequest(user, params[0], body.comment),
    ],
  ];
}

const PUBLIC_ROUTES = new Set(['/api/health', '/api/users']);

function createApp({ dataFile = null, now } = {}) {
  const service = new LeaveService(new JsonStore(seed, dataFile), now);
  const routes = buildRoutes(service);

  return http.createServer(async (req, res) => {
    const started = process.hrtime.bigint();
    const url = new URL(req.url, 'http://localhost');
    try {
      if (!url.pathname.startsWith('/api/')) return serveStatic(res, url.pathname);

      const pathMatches = routes.filter(([, pattern]) => pattern.test(url.pathname));
      const route = pathMatches.find(([method]) => method === req.method);
      if (!route) {
        const code = pathMatches.length ? 405 : 404;
        return sendJson(res, code, {
          error: { code: code === 405 ? 'METHOD_NOT_ALLOWED' : 'NOT_FOUND', message: 'Không có endpoint này' },
        });
      }

      const [method, pattern, handler] = route;
      const ctx = {
        params: url.pathname.match(pattern).slice(1),
        query: url.searchParams,
        body: method === 'POST' ? await readJsonBody(req) : {},
        user: PUBLIC_ROUTES.has(url.pathname) ? null : service.authenticate(req.headers['x-user-id']),
      };
      const result = handler(ctx);
      const [status, payload] = Array.isArray(result) && typeof result[0] === 'number' ? result : [200, result];
      sendJson(res, status, payload);
    } catch (err) {
      if (err instanceof DomainError) {
        sendJson(res, HTTP_STATUS[err.code] || 400, { error: { code: err.code, message: err.message } });
      } else {
        console.error(err);
        sendJson(res, 500, { error: { code: 'INTERNAL_ERROR', message: 'Lỗi hệ thống' } });
      }
    } finally {
      if (process.env.LOG_REQUESTS === '1') {
        const ms = Number(process.hrtime.bigint() - started) / 1e6;
        console.log(`${req.method} ${url.pathname} ${res.statusCode} ${ms.toFixed(1)}ms`);
      }
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  // RISK-01 / ADR-003: identity is simulated, so only the local machine may connect by default.
  const host = process.env.HOST || '127.0.0.1';
  const dataFile = process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'db.json');
  createApp({ dataFile }).listen(port, host, () => {
    console.log(`LeaveFlow đang chạy tại http://${host}:${port} (data: ${dataFile})`);
  });
}

module.exports = { createApp };
