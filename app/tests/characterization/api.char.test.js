'use strict';

// Characterization test (Maintenance R1.1, CR-R11-01): locks the observable API behaviour of v1.0.0
// BEFORE the UI upgrade, and must pass unchanged before and after every R1.1 step.
// Regenerate the golden file only with an approved change request: UPDATE_GOLDEN=1 node --test ...

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createApp } = require('../../src/server');
const { fixedClock } = require('../helpers');

const GOLDEN = path.join(__dirname, 'golden-v1.0.0.json');

const SCRIPT = [
  ['GET', '/api/health'],
  ['GET', '/api/me', 'u1'],
  ['GET', '/api/me'],
  ['POST', '/api/leave-requests', 'u1', { type: 'ANNUAL', startDate: '2026-11-09', endDate: '2026-11-13', reason: 'Du lịch' }],
  ['POST', '/api/leave-requests', 'u1', { type: 'ANNUAL', startDate: '2026-11-12', endDate: '2026-11-12', reason: 'Trùng' }],
  ['POST', '/api/leave-requests', 'u1', { type: 'ANNUAL', startDate: '2026-11-16', endDate: '2026-12-01', reason: 'Vượt' }],
  ['POST', '/api/leave-requests', 'u2', { type: 'SICK', startDate: '2026-11-03', endDate: '2026-11-04', reason: 'Ốm' }],
  ['POST', '/api/leave-requests', 'u3', { type: 'SICK', startDate: '2026-11-03', endDate: '2026-11-04', reason: 'x' }],
  ['GET', '/api/leave-requests?scope=team', 'u3'],
  ['GET', '/api/leave-requests?scope=team', 'u1'],
  ['POST', '/api/leave-requests/LR-0001/approve', 'u2', {}],
  ['POST', '/api/leave-requests/LR-0001/approve', 'u3', { comment: 'OK' }],
  ['POST', '/api/leave-requests/LR-0002/reject', 'u3', {}],
  ['POST', '/api/leave-requests/LR-0002/reject', 'u3', { comment: 'Thiếu giấy' }],
  ['POST', '/api/leave-requests/LR-0001/cancel', 'u1'],
  ['GET', '/api/me', 'u1'],
  ['GET', '/api/leave-requests/LR-0001', 'u1'],
  ['GET', '/api/leave-requests/LR-0001', 'u2'],
];

// Timestamps depend on the injected clock only, but are masked to keep the golden file stable.
const mask = (value) => JSON.parse(JSON.stringify(value).replace(/"\d{4}-\d{2}-\d{2}T[\d:.]+Z"/g, '"<ts>"'));

test('TC-43 characterization: hành vi API v1.0.0 không đổi (golden master)', async (t) => {
  const server = createApp({ now: fixedClock });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const transcript = [];
  for (const [method, url, user, body] of SCRIPT) {
    const headers = { 'Content-Type': 'application/json', ...(user ? { 'X-User-Id': user } : {}) };
    const res = await fetch(base + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    transcript.push({ request: `${method} ${url} as ${user || '-'}`, status: res.status, body: mask(await res.json()) });
  }

  if (process.env.UPDATE_GOLDEN === '1' || !fs.existsSync(GOLDEN)) {
    fs.writeFileSync(GOLDEN, `${JSON.stringify(transcript, null, 2)}\n`);
    t.diagnostic(`golden written: ${transcript.length} interactions`);
  }
  assert.deepEqual(transcript, JSON.parse(fs.readFileSync(GOLDEN, 'utf8')));
});
