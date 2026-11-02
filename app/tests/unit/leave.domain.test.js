'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  countWorkingDays,
  validateNewRequest,
  assertTransition,
  computeBalance,
  parseDate,
  rangesOverlap,
  STATUS,
} = require('../../src/domain/leave');
const { leave } = require('../helpers');

const TODAY = '2026-11-02';

const expectValidation = (input, pattern) =>
  assert.throws(() => validateNewRequest(input, TODAY), (err) => err.code === 'VALIDATION_ERROR' && pattern.test(err.message));

test('TC-01 đếm ngày công loại trừ thứ 7, chủ nhật', () => {
  assert.equal(countWorkingDays('2026-11-09', '2026-11-13'), 5); // Mon–Fri
  assert.equal(countWorkingDays('2026-11-09', '2026-11-15'), 5); // Mon–Sun
  assert.equal(countWorkingDays('2026-11-09', '2026-11-09'), 1); // single day
  assert.equal(countWorkingDays('2026-11-14', '2026-11-15'), 0); // weekend only
  assert.equal(countWorkingDays('2026-11-13', '2026-11-16'), 2); // Fri → Mon
  assert.equal(countWorkingDays('2026-11-13', '2026-11-09'), 0); // reversed range
  assert.equal(countWorkingDays('bad', '2026-11-09'), 0);
});

test('TC-02 đơn hợp lệ được chuẩn hóa và tính số ngày', () => {
  const result = validateNewRequest(leave({ type: ' annual ', reason: '  Về quê  ' }), TODAY);
  assert.deepEqual(result, {
    type: 'ANNUAL',
    startDate: '2026-11-09',
    endDate: '2026-11-13',
    reason: 'Về quê',
    days: 5,
  });
});

test('TC-03 từ chối loại nghỉ không hợp lệ', () => {
  expectValidation(leave({ type: 'HOLIDAY' }), /type phải là một trong/);
  expectValidation(leave({ type: undefined }), /type phải là một trong/);
  assert.throws(() => validateNewRequest(null, TODAY), /VALIDATION_ERROR|type/);
});

test('TC-04 từ chối ngày sai định dạng hoặc không tồn tại', () => {
  expectValidation(leave({ startDate: '09/11/2026' }), /startDate/);
  expectValidation(leave({ endDate: '2026-02-30' }), /endDate/);
  assert.equal(parseDate('2026-13-01'), null);
  assert.equal(parseDate(20261101), null);
});

test('TC-05 từ chối ngày kết thúc trước ngày bắt đầu', () => {
  expectValidation(leave({ startDate: '2026-11-13', endDate: '2026-11-09' }), /endDate phải lớn hơn/);
});

test('TC-06 từ chối đơn cho ngày trong quá khứ (biên: hôm nay hợp lệ)', () => {
  expectValidation(leave({ startDate: '2026-11-01', endDate: '2026-11-03' }), /quá khứ/);
  assert.equal(validateNewRequest(leave({ startDate: TODAY, endDate: TODAY }), TODAY).days, 1);
});

test('TC-07 từ chối đơn kéo dài sang năm khác', () => {
  expectValidation(leave({ startDate: '2026-12-30', endDate: '2027-01-02' }), /năm khác/);
});

test('TC-08 từ chối khoảng nghỉ chỉ gồm ngày cuối tuần', () => {
  expectValidation(leave({ startDate: '2026-11-14', endDate: '2026-11-15' }), /ít nhất 1 ngày làm việc/);
});

test('TC-09 lý do bắt buộc và tối đa 200 ký tự (biên 200/201)', () => {
  expectValidation(leave({ reason: '   ' }), /reason không được để trống/);
  expectValidation(leave({ reason: 'x'.repeat(201) }), /tối đa 200/);
  assert.equal(validateNewRequest(leave({ reason: 'x'.repeat(200) }), TODAY).reason.length, 200);
});

test('TC-10 máy trạng thái chỉ cho phép chuyển từ PENDING', () => {
  for (const to of [STATUS.APPROVED, STATUS.REJECTED, STATUS.CANCELLED]) {
    assert.doesNotThrow(() => assertTransition(STATUS.PENDING, to));
  }
  for (const from of [STATUS.APPROVED, STATUS.REJECTED, STATUS.CANCELLED]) {
    assert.throws(() => assertTransition(from, STATUS.CANCELLED), (err) => err.code === 'INVALID_STATE');
  }
  assert.throws(() => assertTransition('UNKNOWN', STATUS.APPROVED), (err) => err.code === 'INVALID_STATE');
});

test('TC-11 tính số dư phép năm theo năm, chỉ tính ANNUAL', () => {
  const requests = [
    { type: 'ANNUAL', status: STATUS.APPROVED, startDate: '2026-03-02', days: 3 },
    { type: 'ANNUAL', status: STATUS.PENDING, startDate: '2026-11-09', days: 2 },
    { type: 'ANNUAL', status: STATUS.REJECTED, startDate: '2026-05-04', days: 4 },
    { type: 'SICK', status: STATUS.APPROVED, startDate: '2026-06-01', days: 2 },
    { type: 'ANNUAL', status: STATUS.APPROVED, startDate: '2025-06-02', days: 5 },
  ];
  assert.deepEqual(computeBalance(requests, 2026), { year: 2026, entitlement: 12, used: 3, pending: 2, available: 7 });
  assert.ok(rangesOverlap('2026-11-09', '2026-11-13', '2026-11-13', '2026-11-20'));
  assert.ok(!rangesOverlap('2026-11-09', '2026-11-13', '2026-11-14', '2026-11-20'));
});
