'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../../src/server');
const { fixedClock } = require('../helpers');

test('TC-46 body không phải UTF-8 hợp lệ bị từ chối 400; UTF-8 tiếng Việt được lưu nguyên vẹn (DEF-008)', async (t) => {
  const server = createApp({ now: fixedClock });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/leave-requests`;
  const headers = { 'Content-Type': 'application/json', 'X-User-Id': 'u1' };
  const json = '{"type":"SICK","startDate":"2026-11-09","endDate":"2026-11-09","reason":"Chúc mừng"}';

  const latin1 = await fetch(url, { method: 'POST', headers, body: Buffer.from(json, 'latin1') });
  assert.equal(latin1.status, 400);
  assert.equal((await latin1.json()).error.code, 'BAD_JSON');

  const ok = await fetch(url, { method: 'POST', headers, body: Buffer.from(json, 'utf8') });
  assert.equal(ok.status, 201);
  assert.equal((await ok.json()).reason, 'Chúc mừng');
});
