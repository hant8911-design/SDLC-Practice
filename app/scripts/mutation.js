'use strict';

// Minimal mutation testing (no dependency): applies one hand-written mutant at a time to the business code,
// runs the unit + integration suites, and counts killed mutants. Score = killed / total; threshold 80%.
// Usage: node scripts/mutation.js [out.json]

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const APP = path.join(__dirname, '..');
const DOMAIN = 'src/domain/leave.js';
const SERVICE = 'src/service/leaveService.js';
const MUTANTS = [
  [DOMAIN, 'const ANNUAL_ENTITLEMENT_DAYS = 12;', 'const ANNUAL_ENTITLEMENT_DAYS = 13;', 'entitlement 12 → 13'],
  [DOMAIN, 'if (weekday !== 0 && weekday !== 6) days += 1;', 'if (weekday !== 0) days += 1;', 'Saturday counted as working day'],
  [DOMAIN, 'd <= end; d.setUTCDate', 'd < end; d.setUTCDate', 'end date excluded (off-by-one)'],
  [DOMAIN, 'return aStart <= bEnd && bStart <= aEnd;', 'return aStart < bEnd && bStart < aEnd;', 'overlap boundary < instead of <='],
  [DOMAIN, "if (body.startDate < today) errors.push", "if (body.startDate <= today) errors.push", 'today rejected as past'],
  [DOMAIN, 'if (reason.length > REASON_MAX_LENGTH)', 'if (reason.length >= REASON_MAX_LENGTH)', 'reason limit 200 → 199'],
  [DOMAIN, 'if (end < start) errors.push', 'if (end > start) errors.push', 'date order check inverted'],
  [DOMAIN, '[STATUS.APPROVED]: [],', '[STATUS.APPROVED]: [STATUS.CANCELLED],', 'approved request becomes cancellable'],
  [DOMAIN, 'if (r.status === STATUS.PENDING) pending += r.days;', '', 'pending days not reserved'],
  [SERVICE, "if (user.role !== 'EMPLOYEE') {", "if (user.role === 'NOBODY') {", 'manager may create requests'],
  [SERVICE, '(r.status === STATUS.PENDING || r.status === STATUS.APPROVED) &&', '(r.status === STATUS.PENDING) &&', 'overlap ignores approved requests'],
  [SERVICE, 'if (req.days > balance.available) {', 'if (req.days > balance.available + 1) {', 'balance check off by one'],
  [SERVICE, "if (user.role !== 'MANAGER' || request.approverId !== user.id || request.employeeId === user.id) {", "if (user.role !== 'MANAGER') {", 'any manager may approve'],
  [SERVICE, "if (request.employeeId !== user.id) throw new DomainError('FORBIDDEN', 'Chỉ người tạo đơn mới được hủy');", '', 'anyone may cancel'],
  [SERVICE, "if (required && !text) throw new DomainError", "if (false && !text) throw new DomainError", 'reject without reason allowed'],
  [SERVICE, "if (request.employeeId !== user.id && request.approverId !== user.id) {", "if (false) {", 'anyone may read request detail'],
];
const TESTS = fs
  .readdirSync(path.join(APP, 'tests', 'unit'))
  .filter((f) => f.endsWith('.test.js'))
  .map((f) => `tests/unit/${f}`)
  .concat('tests/api/api.test.js');

const results = [];
for (const [file, from, to, label] of MUTANTS) {
  const full = path.join(APP, file);
  const original = fs.readFileSync(full, 'utf8');
  if (!original.includes(from)) {
    results.push({ label, file, status: 'INVALID (pattern not found)' });
    continue;
  }
  try {
    fs.writeFileSync(full, original.replace(from, to));
    const run = spawnSync(process.execPath, ['--test', ...TESTS], { cwd: APP, encoding: 'utf8' });
    results.push({ label, file, status: run.status === 0 ? 'SURVIVED' : 'KILLED' });
  } finally {
    fs.writeFileSync(full, original);
  }
  console.log(`${results.at(-1).status.padEnd(9)} ${label}`);
}

const valid = results.filter((r) => !r.status.startsWith('INVALID'));
const killed = valid.filter((r) => r.status === 'KILLED').length;
const score = +((killed / valid.length) * 100).toFixed(1);
const summary = { tc: 'TC-44', mutants: results.length, valid: valid.length, killed, score, threshold: 80, verdict: score >= 80 ? 'PASS' : 'FAIL', results };
console.log(`mutation score: ${killed}/${valid.length} = ${score}%`);
if (process.argv[2]) fs.writeFileSync(process.argv[2], `${JSON.stringify(summary, null, 2)}\n`);
process.exit(summary.verdict === 'PASS' && valid.length === results.length ? 0 : 1);
