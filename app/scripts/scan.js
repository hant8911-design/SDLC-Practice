'use strict';

// Lightweight security scan (no dependency): (1) dependency inventory — app must declare zero runtime
// dependencies (ADR-001, SBOM); (2) secret patterns in tracked source/docs; (3) dangerous JS sinks in UI code.

const fs = require('node:fs');
const path = require('node:path');

const REPO = path.join(__dirname, '..', '..');
const pkg = JSON.parse(fs.readFileSync(path.join(REPO, 'app', 'package.json'), 'utf8'));
const findings = [];

const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
if (deps.length) findings.push(`dependencies declared: ${deps.join(', ')} (ADR-001 requires none)`);

const SECRET = [
  [/AKIA[0-9A-Z]{16}/, 'AWS access key'],
  [/-----BEGIN (RSA |EC )?PRIVATE KEY-----/, 'private key'],
  [/sk-[A-Za-z0-9]{20,}/, 'API secret key'],
  [/(password|passwd|secret)\s*[:=]\s*['"][^'"]{6,}['"]/i, 'hard-coded credential'],
];
const SINKS = [[/\beval\(/, 'eval()'], [/new Function\(/, 'new Function()'], [/document\.write\(/, 'document.write()']];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (['node_modules', '.git', 'evidence', 'data'].includes(e.name)) return [];
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

const files = [...walk(path.join(REPO, 'app')), ...walk(path.join(REPO, 'docs')), ...walk(path.join(REPO, '.claude'))]
  .filter((f) => /\.(js|json|md|ya?ml|html|css)$/.test(f) && !f.endsWith('scan.js'));
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(REPO, file);
  for (const [re, label] of SECRET) if (re.test(text)) findings.push(`${rel}: ${label}`);
  if (rel.includes(`public${path.sep}`)) for (const [re, label] of SINKS) if (re.test(text)) findings.push(`${rel}: ${label}`);
}

if (findings.length) {
  console.error(`scan: ${findings.length} finding(s)\n${findings.join('\n')}`);
  process.exit(1);
}
console.log(`scan: OK — 0 runtime dependencies, 0 secrets, 0 dangerous sinks (${files.length} files)`);
