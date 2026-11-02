'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../../src/server');
const { fixedClock, leave } = require('../helpers');

async function startServer(t) {
  const server = createApp({ now: fixedClock });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  return async function call(method, path, { user, body, rawBody } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (user) headers['X-User-Id'] = user;
    const res = await fetch(base + path, {
      method,
      headers,
      body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* static file */ }
    return { status: res.status, json, text, type: res.headers.get('content-type') };
  };
}

test('TC-28 endpoint công khai và yêu cầu định danh', async (t) => {
  const call = await startServer(t);
  assert.deepEqual((await call('GET', '/api/health')).json, { status: 'ok' });
  assert.equal((await call('GET', '/api/users')).json.length, 3);
  const me = await call('GET', '/api/me');
  assert.equal(me.status, 401);
  assert.equal(me.json.error.code, 'UNAUTHENTICATED');
  assert.equal((await call('GET', '/api/me', { user: 'u1' })).json.balance.available, 12);
});

test('TC-29 luồng end-to-end: tạo → quản lý duyệt → số dư cập nhật', async (t) => {
  const call = await startServer(t);
  const created = await call('POST', '/api/leave-requests', { user: 'u1', body: leave() });
  assert.equal(created.status, 201);
  assert.equal(created.json.id, 'LR-0001');

  const inbox = await call('GET', '/api/leave-requests?scope=team&status=PENDING', { user: 'u3' });
  assert.deepEqual(inbox.json.map((r) => r.id), ['LR-0001']);

  const approved = await call('POST', '/api/leave-requests/LR-0001/approve', { user: 'u3', body: {} });
  assert.equal(approved.status, 200);
  assert.equal(approved.json.status, 'APPROVED');

  const me = await call('GET', '/api/me', { user: 'u1' });
  assert.equal(me.json.balance.used, 5);
  assert.equal(me.json.balance.available, 7);

  const detail = await call('GET', '/api/leave-requests/LR-0001', { user: 'u1' });
  assert.equal(detail.json.history.length, 2);

  const second = await call('POST', '/api/leave-requests', { user: 'u2', body: leave({ type: 'SICK' }) });
  const rejected = await call('POST', `/api/leave-requests/${second.json.id}/reject`, {
    user: 'u3',
    body: { comment: 'Cần giấy khám' },
  });
  assert.equal(rejected.json.status, 'REJECTED');
  const cancelReq = await call('POST', '/api/leave-requests', { user: 'u2', body: leave({ type: 'UNPAID' }) });
  const cancelled = await call('POST', `/api/leave-requests/${cancelReq.json.id}/cancel`, { user: 'u2' });
  assert.equal(cancelled.json.status, 'CANCELLED');
});

test('TC-30 ánh xạ lỗi nghiệp vụ sang HTTP status theo hợp đồng API', async (t) => {
  const call = await startServer(t);
  const expectError = async (res, status, code) => {
    const r = await res;
    assert.equal(r.status, status, `${code}: ${r.text}`);
    assert.equal(r.json.error.code, code);
  };
  await expectError(call('POST', '/api/leave-requests', { user: 'u1', body: leave({ type: 'X' }) }), 400, 'VALIDATION_ERROR');
  await expectError(call('POST', '/api/leave-requests', { user: 'u1', rawBody: '{oops' }), 400, 'BAD_JSON');
  // DEF-004 regression: non-object JSON bodies must be a 400, not a 500.
  for (const rawBody of ['null', '[]', '42', '"text"']) {
    await expectError(call('POST', '/api/leave-requests/LR-0001/approve', { user: 'u3', rawBody }), 400, 'BAD_JSON');
  }
  await expectError(call('POST', '/api/leave-requests', { user: 'u3', body: leave() }), 403, 'FORBIDDEN');
  await expectError(call('GET', '/api/leave-requests/LR-0404', { user: 'u1' }), 404, 'NOT_FOUND');
  await expectError(call('GET', '/api/unknown', { user: 'u1' }), 404, 'NOT_FOUND');
  await expectError(call('DELETE', '/api/leave-requests', { user: 'u1' }), 405, 'METHOD_NOT_ALLOWED');
  await call('POST', '/api/leave-requests', { user: 'u1', body: leave() });
  await expectError(call('POST', '/api/leave-requests', { user: 'u1', body: leave() }), 409, 'CONFLICT');
  await expectError(
    call('POST', '/api/leave-requests', { user: 'u1', body: leave({ startDate: '2026-11-16', endDate: '2026-11-30' }) }),
    422,
    'INSUFFICIENT_BALANCE',
  );
  await call('POST', '/api/leave-requests/LR-0001/cancel', { user: 'u1' });
  await expectError(call('POST', '/api/leave-requests/LR-0001/cancel', { user: 'u1' }), 409, 'INVALID_STATE');
  await expectError(
    call('POST', '/api/leave-requests', { user: 'u1', rawBody: JSON.stringify({ reason: 'x'.repeat(11 * 1024) }) }),
    413,
    'PAYLOAD_TOO_LARGE',
  );
});

test('TC-31 phục vụ giao diện web và chặn path traversal', async (t) => {
  const call = await startServer(t);
  const home = await call('GET', '/');
  assert.equal(home.status, 200);
  assert.match(home.type, /text\/html/);
  assert.match(home.text, /LeaveFlow/);
  assert.match((await call('GET', '/app.js')).type, /javascript/);
  assert.match((await call('GET', '/styles.css')).type, /text\/css/);
  assert.equal((await call('GET', '/../src/server.js')).status, 404);
  assert.equal((await call('GET', '/%2e%2e/src/server.js')).status, 404);
  assert.equal((await call('GET', '/missing.html')).status, 404);
});

test('TC-32 hiệu năng: p95 thời gian phản hồi API < 200 ms (200 request)', async (t) => {
  const call = await startServer(t);
  await call('POST', '/api/leave-requests', { user: 'u1', body: leave() });
  const samples = [];
  for (let i = 0; i < 200; i += 1) {
    const started = performance.now();
    const res = await call('GET', i % 2 ? '/api/me' : '/api/leave-requests?scope=mine', { user: 'u1' });
    samples.push(performance.now() - started);
    assert.equal(res.status, 200);
  }
  samples.sort((a, b) => a - b);
  const p95 = samples[Math.floor(samples.length * 0.95) - 1];
  t.diagnostic(`p95=${p95.toFixed(2)}ms max=${samples.at(-1).toFixed(2)}ms n=${samples.length}`);
  assert.ok(p95 < 200, `p95 ${p95}ms vượt ngưỡng 200ms`);
});
