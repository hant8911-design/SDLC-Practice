'use strict';

// Tests added from mutation testing (TC-44): each kills a mutant that survived the approved suite.

const test = require('node:test');
const assert = require('node:assert/strict');
const { makeService, leave } = require('../helpers');

test('TC-45 đơn mới trùng với đơn ĐÃ DUYỆT cũng bị chặn (AC-01.3)', () => {
  const { service, user } = makeService();
  const approved = service.createRequest(user('u1'), leave());
  service.approveRequest(user('u3'), approved.id);
  assert.throws(
    () => service.createRequest(user('u1'), leave({ type: 'SICK', startDate: '2026-11-13', endDate: '2026-11-13' })),
    (err) => err.code === 'CONFLICT' && err.message.includes(`${approved.id} (APPROVED)`),
  );
});
