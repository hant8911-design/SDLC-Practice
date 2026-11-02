'use strict';

// Pure domain rules for leave requests (CMP-03). No I/O here, so every rule is unit-testable.

const LEAVE_TYPES = Object.freeze(['ANNUAL', 'SICK', 'UNPAID']);
const STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
});
const ANNUAL_ENTITLEMENT_DAYS = 12; // BR-03
const REASON_MAX_LENGTH = 200;
const COMMENT_MAX_LENGTH = 200;

// Allowed transitions of the request state machine (SAD §4.3).
const TRANSITIONS = Object.freeze({
  [STATUS.PENDING]: [STATUS.APPROVED, STATUS.REJECTED, STATUS.CANCELLED],
  [STATUS.APPROVED]: [],
  [STATUS.REJECTED]: [],
  [STATUS.CANCELLED]: [],
});

class DomainError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value) {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  // Reject dates such as 2026-02-30 that JS would roll over.
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return null;
  return d;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

/** Number of working days (Mon–Fri) between two ISO dates, both inclusive. */
function countWorkingDays(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end || end < start) return 0;
  let days = 0;
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const weekday = d.getUTCDay();
    if (weekday !== 0 && weekday !== 6) days += 1;
  }
  return days;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}

/**
 * Validates the input of a new leave request (FR-02).
 * @returns {{type,startDate,endDate,reason,days}} the normalized request
 * @throws {DomainError} VALIDATION_ERROR
 */
function validateNewRequest(input, today) {
  const errors = [];
  const body = input || {};
  const type = typeof body.type === 'string' ? body.type.trim().toUpperCase() : '';
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  const start = parseDate(body.startDate);
  const end = parseDate(body.endDate);

  if (!LEAVE_TYPES.includes(type)) errors.push(`type phải là một trong ${LEAVE_TYPES.join(', ')}`);
  if (!start) errors.push('startDate phải có dạng YYYY-MM-DD hợp lệ');
  if (!end) errors.push('endDate phải có dạng YYYY-MM-DD hợp lệ');
  if (!reason) errors.push('reason không được để trống');
  if (reason.length > REASON_MAX_LENGTH) errors.push(`reason tối đa ${REASON_MAX_LENGTH} ký tự`);

  if (start && end) {
    if (end < start) errors.push('endDate phải lớn hơn hoặc bằng startDate');
    if (body.startDate < today) errors.push('Không được tạo đơn cho ngày trong quá khứ');
    if (start.getUTCFullYear() !== end.getUTCFullYear()) errors.push('Đơn không được kéo dài sang năm khác');
  }

  const days = errors.length ? 0 : countWorkingDays(body.startDate, body.endDate);
  if (!errors.length && days === 0) errors.push('Khoảng nghỉ phải có ít nhất 1 ngày làm việc');

  if (errors.length) throw new DomainError('VALIDATION_ERROR', errors.join('; '));
  return { type, startDate: body.startDate, endDate: body.endDate, reason, days };
}

/** Throws INVALID_STATE when the transition is not allowed by the state machine. */
function assertTransition(from, to) {
  if (!(TRANSITIONS[from] || []).includes(to)) {
    throw new DomainError('INVALID_STATE', `Không thể chuyển đơn từ ${from} sang ${to}`);
  }
}

/**
 * Annual leave balance for one user and year (FR-04, BR-03).
 * Pending annual days are reserved so an employee cannot overbook.
 */
function computeBalance(requests, year) {
  let used = 0;
  let pending = 0;
  for (const r of requests) {
    if (r.type !== 'ANNUAL' || !r.startDate.startsWith(String(year))) continue;
    if (r.status === STATUS.APPROVED) used += r.days;
    if (r.status === STATUS.PENDING) pending += r.days;
  }
  return {
    year,
    entitlement: ANNUAL_ENTITLEMENT_DAYS,
    used,
    pending,
    available: ANNUAL_ENTITLEMENT_DAYS - used - pending,
  };
}

module.exports = {
  LEAVE_TYPES,
  STATUS,
  TRANSITIONS,
  ANNUAL_ENTITLEMENT_DAYS,
  REASON_MAX_LENGTH,
  COMMENT_MAX_LENGTH,
  DomainError,
  parseDate,
  toIsoDate,
  countWorkingDays,
  rangesOverlap,
  validateNewRequest,
  assertTransition,
  computeBalance,
};
