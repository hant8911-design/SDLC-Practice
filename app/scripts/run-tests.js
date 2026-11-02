'use strict';

// Runs lint + the whole test suite with coverage and stores the raw evidence of the run in
// docs/07-verification/evidence/<run-id>/ (IEEE 829 test log). The test report quotes these files.

const { spawnSync, execSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const APP = path.join(__dirname, '..');
const REPO = path.join(APP, '..');

function gitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: REPO, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'nogit';
  }
}

const date = new Date().toISOString().slice(0, 10);
const runId = `RUN-${date}-${gitCommit()}-local-node${process.versions.node.split('.')[0]}`;
const outDir = path.join(REPO, 'docs', '07-verification', 'evidence', runId);
fs.mkdirSync(outDir, { recursive: true });

function run(name, args) {
  const started = Date.now();
  const res = spawnSync(process.execPath, args, { cwd: APP, encoding: 'utf8' });
  const output = `$ node ${args.join(' ')}\n\n${res.stdout}${res.stderr}`;
  fs.writeFileSync(path.join(outDir, name), output);
  return { status: res.status, ms: Date.now() - started, output };
}

const TEST_FILES = ['tests/unit/leave.domain.test.js', 'tests/unit/leave.service.test.js', 'tests/unit/jsonStore.test.js', 'tests/unit/mutation-gaps.test.js', 'tests/api/api.test.js', 'tests/api/encoding.test.js', 'tests/characterization/api.char.test.js'];

const lint = run('lint.log', ['scripts/lint.js']);
const spec = run('test-spec.log', ['--test', '--test-reporter=spec', ...TEST_FILES]);
const junit = run('junit-raw.log', ['--test', '--test-reporter=junit', ...TEST_FILES]);
fs.renameSync(path.join(outDir, 'junit-raw.log'), path.join(outDir, 'junit.xml'));
fs.writeFileSync(path.join(outDir, 'junit.xml'), junit.output.replace(/^\$ .*\n\n/, ''));
const coverage = run('coverage.log', ['--test', '--experimental-test-coverage', '--test-reporter=spec', ...TEST_FILES]);

const count = (label) => Number((spec.output.match(new RegExp(`ℹ ${label} (\\d+)`)) || [])[1] || 0);
const allFiles = coverage.output.match(/ℹ all files\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/);
// Per source file (tests excluded), because NFR-05 is measured on production code only.
const srcFiles = [...coverage.output.matchAll(/ℹ (src[\\/][^\s|]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/g)].map(
  (m) => ({ file: m[1].replace(/\\/g, '/'), line: Number(m[2]), branch: Number(m[3]), function: Number(m[4]) }),
);

const summary = {
  runId,
  date: new Date().toISOString(),
  environment: { node: process.version, platform: `${os.platform()} ${os.release()}`, arch: os.arch() },
  lint: lint.status === 0 ? 'PASS' : 'FAIL',
  tests: { total: count('tests'), pass: count('pass'), fail: count('fail'), skipped: count('skipped'), durationMs: spec.ms },
  coverage: {
    allFiles: allFiles ? { line: Number(allFiles[1]), branch: Number(allFiles[2]), function: Number(allFiles[3]) } : null,
    srcMinLine: Math.min(...srcFiles.map((f) => f.line)),
    srcFiles,
  },
  verdict: lint.status === 0 && spec.status === 0 && Math.min(...srcFiles.map((f) => f.line)) >= 80 ? 'PASS' : 'FAIL',
};
fs.writeFileSync(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
console.log(`Evidence: ${path.relative(REPO, outDir)}`);
process.exit(summary.verdict === 'PASS' ? 0 : 1);
