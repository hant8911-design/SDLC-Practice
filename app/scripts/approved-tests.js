'use strict';

// Approved-test guard (slide B10 "điều bắt buộc phải enforce"): the approved test files and their SHA-256
// live in .claude/approved-tests.txt. `node scripts/approved-tests.js check` fails (exit 1) when any approved
// test was changed without re-approval; CI runs it on every push. `... approve` re-records hashes and must
// only be run by a human after reviewing the test diff.

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const REPO = path.join(__dirname, '..', '..');
const LIST = path.join(REPO, '.claude', 'approved-tests.txt');
const FILES = [
  'app/tests/unit/leave.domain.test.js',
  'app/tests/unit/leave.service.test.js',
  'app/tests/unit/jsonStore.test.js',
  'app/tests/unit/mutation-gaps.test.js',
  'app/tests/api/api.test.js',
  'app/tests/api/encoding.test.js',
  'app/tests/characterization/api.char.test.js',
  'app/tests/characterization/golden-v1.0.0.json',
];

const sha = (file) =>
  crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, file), 'utf8').replace(/\r\n/g, '\n')).digest('hex');

if (process.argv[2] === 'approve') {
  const lines = FILES.map((f) => `${sha(f)}  ${f}`);
  fs.writeFileSync(LIST, `# Approved tests — change only after human review (approver, date in git log)\n${lines.join('\n')}\n`);
  console.log(`approved ${FILES.length} files`);
} else {
  const entries = fs.readFileSync(LIST, 'utf8').split('\n').filter((l) => l && !l.startsWith('#'));
  const bad = entries.filter((l) => {
    const [hash, file] = l.split(/\s+/);
    return !fs.existsSync(path.join(REPO, file)) || sha(file) !== hash;
  });
  if (bad.length) {
    console.error(`approved tests modified without approval:\n${bad.join('\n')}`);
    process.exit(1);
  }
  console.log(`approved tests: OK (${entries.length} files unchanged)`);
}
