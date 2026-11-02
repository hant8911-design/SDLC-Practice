'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { JsonStore } = require('../../src/repo/jsonStore');
const { LeaveService } = require('../../src/service/leaveService');
const seed = require('../../src/data/seed');
const { fixedClock, leave } = require('../helpers');

test('TC-26 dữ liệu được lưu xuống file và còn nguyên sau khi khởi động lại', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'leaveflow-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'nested', 'db.json');

  const first = new LeaveService(new JsonStore(seed, file), fixedClock);
  const created = first.createRequest(first.authenticate('u1'), leave());
  first.approveRequest(first.authenticate('u3'), created.id);
  assert.ok(fs.existsSync(file));
  assert.ok(!fs.existsSync(`${file}.tmp`), 'temp file must be renamed away (atomic write)');

  const restarted = new LeaveService(new JsonStore(seed, file), fixedClock);
  const reloaded = restarted.getRequest(restarted.authenticate('u1'), created.id);
  assert.equal(reloaded.status, 'APPROVED');
  assert.equal(reloaded.history.length, 2);
});

test('TC-27 sinh mã đơn tuần tự LR-0001, LR-0002 và trả bản sao (không lộ tham chiếu nội bộ)', () => {
  const store = new JsonStore(seed);
  assert.equal(store.nextRequestId(), 'LR-0001');
  store.insertRequest({ id: 'LR-0001', status: 'PENDING' }, { requestId: 'LR-0001' });
  assert.equal(store.nextRequestId(), 'LR-0002');
  const copy = store.findRequest('LR-0001');
  copy.status = 'HACKED';
  assert.equal(store.findRequest('LR-0001').status, 'PENDING');
  assert.equal(store.findUser('nope'), undefined);
  assert.equal(seed.requests.length, 0, 'seed must not be mutated');
});
