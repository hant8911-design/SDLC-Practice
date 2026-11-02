'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { makeService, leave } = require('../helpers');

const hasCode = (code) => (err) => err.code === code;

test('TC-12 nhân viên tạo đơn → PENDING, gán quản lý trực tiếp, ghi lịch sử', () => {
  const { service, store, user } = makeService();
  const created = service.createRequest(user('u1'), leave());
  assert.equal(created.id, 'LR-0001');
  assert.equal(created.status, 'PENDING');
  assert.equal(created.days, 5);
  assert.equal(created.approverId, 'u3');
  assert.deepEqual(
    store.historyOf('LR-0001').map((h) => [h.from, h.to, h.actorId]),
    [[null, 'PENDING', 'u1']],
  );
});

test('TC-13 quản lý không được tạo đơn nghỉ; nhân viên chưa có quản lý không tạo được đơn', () => {
  const { service, store, user } = makeService();
  assert.throws(() => service.createRequest(user('u3'), leave()), hasCode('FORBIDDEN'));
  store.data.users.push({ id: 'u9', name: 'Mới vào', role: 'EMPLOYEE', managerId: null });
  assert.throws(() => service.createRequest(user('u9'), leave()), hasCode('CONFLICT'));
});

test('TC-14 chặn đơn trùng thời gian với đơn PENDING/APPROVED, cho phép nếu đơn cũ đã hủy', () => {
  const { service, user } = makeService();
  const first = service.createRequest(user('u1'), leave());
  assert.throws(
    () => service.createRequest(user('u1'), leave({ startDate: '2026-11-13', endDate: '2026-11-16', type: 'SICK' })),
    (err) => err.code === 'CONFLICT' && err.message.includes(first.id),
  );
  service.cancelRequest(user('u1'), first.id);
  assert.equal(service.createRequest(user('u1'), leave()).status, 'PENDING');
  // Another employee may take the same dates.
  assert.equal(service.createRequest(user('u2'), leave()).status, 'PENDING');
});

test('TC-15 không cho vượt số dư phép năm (biên 12/13 ngày, tính cả ngày đang chờ)', () => {
  const { service, user } = makeService();
  assert.throws(
    () => service.createRequest(user('u1'), leave({ startDate: '2026-11-16', endDate: '2026-12-02' })), // 13 days
    (err) => err.code === 'INSUFFICIENT_BALANCE' && /cần 13 ngày, còn 12/.test(err.message),
  );
  const twelve = service.createRequest(user('u1'), leave({ startDate: '2026-11-16', endDate: '2026-12-01' }));
  assert.equal(twelve.days, 12);
  assert.equal(service.getProfile(user('u1')).balance.available, 0);
  assert.throws(
    () => service.createRequest(user('u1'), leave({ startDate: '2026-12-07', endDate: '2026-12-07' })),
    hasCode('INSUFFICIENT_BALANCE'),
  );
});

test('TC-16 nghỉ ốm và không lương không trừ phép năm', () => {
  const { service, user } = makeService();
  service.createRequest(user('u1'), leave({ type: 'SICK', startDate: '2026-11-16', endDate: '2026-12-02' }));
  service.createRequest(user('u1'), leave({ type: 'UNPAID', startDate: '2026-12-07', endDate: '2026-12-11' }));
  assert.deepEqual(service.getProfile(user('u1')).balance, { year: 2026, entitlement: 12, used: 0, pending: 0, available: 12 });
});

test('TC-17 hủy đơn: chỉ chủ đơn, chỉ khi PENDING', () => {
  const { service, user } = makeService();
  const r = service.createRequest(user('u1'), leave());
  assert.throws(() => service.cancelRequest(user('u2'), r.id), hasCode('FORBIDDEN'));
  assert.equal(service.cancelRequest(user('u1'), r.id).status, 'CANCELLED');
  assert.throws(() => service.cancelRequest(user('u1'), r.id), hasCode('INVALID_STATE'));

  const r2 = service.createRequest(user('u1'), leave());
  service.approveRequest(user('u3'), r2.id);
  assert.throws(() => service.cancelRequest(user('u1'), r2.id), hasCode('INVALID_STATE'));
});

test('TC-18 quản lý duyệt đơn → APPROVED và phép năm được trừ', () => {
  const { service, user } = makeService();
  const r = service.createRequest(user('u1'), leave());
  assert.equal(service.getProfile(user('u1')).balance.pending, 5);
  const approved = service.approveRequest(user('u3'), r.id, ' Ok, chúc vui ');
  assert.equal(approved.status, 'APPROVED');
  assert.equal(approved.managerComment, 'Ok, chúc vui');
  assert.deepEqual(service.getProfile(user('u1')).balance, { year: 2026, entitlement: 12, used: 5, pending: 0, available: 7 });
});

test('TC-19 từ chối bắt buộc có lý do; nhận xét tối đa 200 ký tự', () => {
  const { service, user } = makeService();
  const r = service.createRequest(user('u1'), leave());
  assert.throws(() => service.rejectRequest(user('u3'), r.id, '  '), hasCode('VALIDATION_ERROR'));
  assert.throws(() => service.rejectRequest(user('u3'), r.id), hasCode('VALIDATION_ERROR'));
  assert.throws(() => service.rejectRequest(user('u3'), r.id, 'x'.repeat(201)), hasCode('VALIDATION_ERROR'));
  const rejected = service.rejectRequest(user('u3'), r.id, 'Trùng lịch release');
  assert.equal(rejected.status, 'REJECTED');
  assert.equal(service.getProfile(user('u1')).balance.available, 12);
});

test('TC-20 chỉ quản lý trực tiếp mới được duyệt/từ chối', () => {
  const { service, user } = makeService({ withExtraUsers: true });
  const r = service.createRequest(user('u1'), leave());
  assert.throws(() => service.approveRequest(user('u2'), r.id), hasCode('FORBIDDEN')); // employee
  assert.throws(() => service.approveRequest(user('u1'), r.id), hasCode('FORBIDDEN')); // owner
  assert.throws(() => service.approveRequest(user('u4'), r.id), hasCode('FORBIDDEN')); // other manager
  assert.throws(() => service.rejectRequest(user('u4'), r.id, 'no'), hasCode('FORBIDDEN'));
  assert.equal(service.approveRequest(user('u3'), r.id).status, 'APPROVED');
});

test('TC-21 không duyệt/từ chối lại đơn đã xử lý', () => {
  const { service, user } = makeService();
  const r = service.createRequest(user('u1'), leave());
  service.approveRequest(user('u3'), r.id);
  assert.throws(() => service.approveRequest(user('u3'), r.id), hasCode('INVALID_STATE'));
  assert.throws(() => service.rejectRequest(user('u3'), r.id, 'đổi ý'), hasCode('INVALID_STATE'));
});

test('TC-22 chi tiết đơn kèm lịch sử, chỉ chủ đơn và người duyệt được xem', () => {
  const { service, user } = makeService({ withExtraUsers: true });
  const r = service.createRequest(user('u1'), leave());
  service.rejectRequest(user('u3'), r.id, 'Thiếu người trực');
  const detail = service.getRequest(user('u1'), r.id);
  assert.deepEqual(
    detail.history.map((h) => `${h.from}->${h.to}`),
    ['null->PENDING', 'PENDING->REJECTED'],
  );
  assert.equal(detail.history[1].comment, 'Thiếu người trực');
  assert.equal(detail.history[1].actorName, 'Lê Minh Chi'); // DEF-003 regression
  assert.equal(service.getRequest(user('u3'), r.id).id, r.id);
  assert.throws(() => service.getRequest(user('u2'), r.id), hasCode('FORBIDDEN'));
  assert.throws(() => service.getRequest(user('u4'), r.id), hasCode('FORBIDDEN'));
});

test('TC-23 danh sách đơn: mine / team / lọc trạng thái / phân quyền', () => {
  const { service, user } = makeService({ withExtraUsers: true });
  const a = service.createRequest(user('u1'), leave());
  const b = service.createRequest(user('u2'), leave({ type: 'SICK' }));
  service.createRequest(user('u5'), leave());
  service.approveRequest(user('u3'), a.id);

  assert.deepEqual(service.listRequests(user('u1')).map((r) => r.id), [a.id]);
  const team = service.listRequests(user('u3'), 'team');
  assert.deepEqual(team.map((r) => r.id).sort(), [a.id, b.id]);
  assert.equal(team.find((r) => r.id === b.id).employeeName, 'Trần Thị Bình');
  assert.deepEqual(service.listRequests(user('u3'), 'team', 'PENDING').map((r) => r.id), [b.id]);
  assert.throws(() => service.listRequests(user('u1'), 'team'), hasCode('FORBIDDEN'));
  assert.throws(() => service.listRequests(user('u1'), 'all'), hasCode('VALIDATION_ERROR'));
  assert.throws(() => service.listRequests(user('u3'), 'team', 'DONE'), hasCode('VALIDATION_ERROR'));
});

test('TC-24 người dùng thiếu/sai định danh bị từ chối', () => {
  const { service } = makeService();
  assert.throws(() => service.authenticate(undefined), hasCode('UNAUTHENTICATED'));
  assert.throws(() => service.authenticate('u999'), hasCode('UNAUTHENTICATED'));
});

test('TC-25 thao tác trên đơn không tồn tại trả NOT_FOUND', () => {
  const { service, user } = makeService();
  assert.throws(() => service.getRequest(user('u1'), 'LR-9999'), hasCode('NOT_FOUND'));
  assert.throws(() => service.approveRequest(user('u3'), 'LR-9999'), hasCode('NOT_FOUND'));
  assert.throws(() => service.cancelRequest(user('u1'), 'LR-9999'), hasCode('NOT_FOUND'));
});
