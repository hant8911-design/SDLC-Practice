'use strict';

// Minimal static check without external dependencies: syntax check (node --check) of every JS file,
// plus a few hygiene rules from the code review checklist (no debugger, no .only tests, no TODO without ID).

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const DIRS = ['src', 'public', 'tests', 'scripts'];
const RULES = [
  [/\bdebugger\b/, 'debugger statement'],
  [/\b(test|it|describe)\.only\(/, 'focused test (.only)'],
  [/TODO(?!\(TASK-\d+\))/, 'TODO without TASK-xxx reference'],
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith('.js') ? [full] : [];
  });
}

const files = DIRS.flatMap((d) => walk(path.join(ROOT, d)));
const problems = [];
for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    problems.push(`${path.relative(ROOT, file)}: syntax error\n${err.stderr}`);
  }
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const [pattern, label] of RULES) {
      if (path.basename(file) !== 'lint.js' && pattern.test(line)) {
        problems.push(`${path.relative(ROOT, file)}:${i + 1}: ${label}`);
      }
    }
  });
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\nlint: ${problems.length} problem(s) in ${files.length} files`);
  process.exit(1);
}
console.log(`lint: OK (${files.length} files checked)`);
