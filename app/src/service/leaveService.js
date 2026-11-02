'use strict';

// Application service (CMP-02): orchestrates domain rules, authorization and persistence.

const {
  STATUS,
  COMMENT_MAX_LENGTH,
  DomainError,
  toIsoDate,
  rangesOverlap,
  validateNewRequest,
  assertTransition,
  computeBalance,
} = require('../domain/leave');

class LeaveService {
  /**
   * @param {import('../repo/jsonStore').JsonStore} store
   * @param {() => Date} now  injectable clock so tests are deterministic
   */
  constructor(store, now = () => new Date()) {
    this.store = store;
    this.now = now;
  }

  today() {
    return toIsoDate(this.now());
  }

  authenticate(userId) {
    const user = userId && this.store.findUser(userId);
    if (!user) throw new DomainError('UNAUTHENTICATED', 'Người dùng không hợp lệ (thiếu hoặc sai X-User-Id)');
    return user;
  }

  listUsers() {
    return this.store.listUsers();
  }

  /** FR-04: profile + annual balance of the current year. */
  getProfile(user) {
    const mine = this.store.listRequests((r) => r.employeeId === user.id);
    return { user, balance: computeBalance(mine, this.now().getUTCFullYear()) };
  }

  /** FR-01, FR-03, FR-04: submit a leave request. */
  createRequest(user, input) {
    if (user.role !== 'EMPLOYEE') {
      throw new DomainError('FORBIDDEN', 'Chỉ nhân viên mới tạo được đơn nghỉ phép');
    }
    // DI-02: a request without an existing approver could never be decided.
    if (!user.managerId || !this.store.findUser(user.managerId)) {
      throw new DomainError('CONFLICT', 'Nhân viên chưa được gán quản lý trực tiếp');
    }
    const req = validateNewRequest(input, this.today());

    const mine = this.store.listRequests((r) => r.employeeId === user.id);
    const clash = mine.find(
      (r) =>
        (r.status === STATUS.PENDING || r.status === STATUS.APPROVED) &&
        rangesOverlap(req.startDate, req.endDate, r.startDate, r.endDate),
    );
    if (clash) {
      throw new DomainError('CONFLICT', `Trùng thời gian với đơn ${clash.id} (${clash.status})`);
    }

    if (req.type === 'ANNUAL') {
      const balance = computeBalance(mine, Number(req.startDate.slice(0, 4)));
      if (req.days > balance.available) {
        throw new DomainError(
          'INSUFFICIENT_BALANCE',
          `Không đủ phép năm: cần ${req.days} ngày, còn ${balance.available} ngày`,
        );
      }
    }

    const timestamp = this.now().toISOString();
    const request = {
      id: this.store.nextRequestId(),
      employeeId: user.id,
      approverId: user.managerId,
      ...req,
      status: STATUS.PENDING,
      managerComment: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.store.insertRequest(request, this.#history(request.id, user, null, STATUS.PENDING, null, timestamp));
    return request;
  }

  /** FR-05 (scope=mine) and FR-07 (scope=team). */
  listRequests(user, scope = 'mine', status) {
    let predicate;
    if (scope === 'team') {
      if (user.role !== 'MANAGER') throw new DomainError('FORBIDDEN', 'Chỉ quản lý mới xem được đơn của nhóm');
      predicate = (r) => r.approverId === user.id;
    } else if (scope === 'mine') {
      predicate = (r) => r.employeeId === user.id;
    } else {
      throw new DomainError('VALIDATION_ERROR', 'scope phải là mine hoặc team');
    }
    if (status !== undefined && !Object.values(STATUS).includes(status)) {
      throw new DomainError('VALIDATION_ERROR', `status phải là một trong ${Object.values(STATUS).join(', ')}`);
    }
    const users = new Map(this.store.listUsers().map((u) => [u.id, u.name]));
    return this.store
      .listRequests((r) => predicate(r) && (!status || r.status === status))
      .map((r) => ({ ...r, employeeName: users.get(r.employeeId) }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
  }

  /** FR-10: request detail with its status history. Visible to its owner and its approver. */
  getRequest(user, id) {
    const request = this.#mustFind(id);
    if (request.employeeId !== user.id && request.approverId !== user.id) {
      throw new DomainError('FORBIDDEN', 'Bạn không có quyền xem đơn này');
    }
    // DEF-003: expose the actor's display name, not only its id.
    const names = new Map(this.store.listUsers().map((u) => [u.id, u.name]));
    const history = this.store.historyOf(id).map((h) => ({ ...h, actorName: names.get(h.actorId) }));
    return { ...request, history };
  }

  /** FR-06: the owner cancels a pending request. */
  cancelRequest(user, id) {
    const request = this.#mustFind(id);
    if (request.employeeId !== user.id) throw new DomainError('FORBIDDEN', 'Chỉ người tạo đơn mới được hủy');
    return this.#transition(user, request, STATUS.CANCELLED, null);
  }

  /** FR-08: the direct manager approves. */
  approveRequest(user, id, comment) {
    const request = this.#mustFind(id);
    this.#assertApprover(user, request);
    return this.#transition(user, request, STATUS.APPROVED, this.#normalizeComment(comment, false));
  }

  /** FR-08: the direct manager rejects; a reason is mandatory (BR-05). */
  rejectRequest(user, id, comment) {
    const request = this.#mustFind(id);
    this.#assertApprover(user, request);
    return this.#transition(user, request, STATUS.REJECTED, this.#normalizeComment(comment, true));
  }

  #assertApprover(user, request) {
    // FR-09: only the assigned manager decides; nobody approves their own request.
    if (user.role !== 'MANAGER' || request.approverId !== user.id || request.employeeId === user.id) {
      throw new DomainError('FORBIDDEN', 'Chỉ quản lý trực tiếp mới được duyệt đơn này');
    }
  }

  #normalizeComment(comment, required) {
    const text = typeof comment === 'string' ? comment.trim() : '';
    if (required && !text) throw new DomainError('VALIDATION_ERROR', 'Phải nhập lý do khi từ chối');
    if (text.length > COMMENT_MAX_LENGTH) {
      throw new DomainError('VALIDATION_ERROR', `Nhận xét tối đa ${COMMENT_MAX_LENGTH} ký tự`);
    }
    return text || null;
  }

  #transition(user, request, to, comment) {
    assertTransition(request.status, to);
    const timestamp = this.now().toISOString();
    const updated = { ...request, status: to, managerComment: comment ?? request.managerComment, updatedAt: timestamp };
    this.store.updateRequest(updated, this.#history(request.id, user, request.status, to, comment, timestamp));
    return updated;
  }

  #history(requestId, user, from, to, comment, at) {
    return { requestId, actorId: user.id, from, to, comment, at };
  }

  #mustFind(id) {
    const request = this.store.findRequest(id);
    if (!request) throw new DomainError('NOT_FOUND', `Không tìm thấy đơn ${id}`);
    return request;
  }
}

module.exports = { LeaveService };
