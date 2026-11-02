'use strict';

// TC-39 (NFR-07): builds a data file at the v1.0 capacity limit (20 users, 10 000 requests),
// starts the real server on it and measures read latency. Usage: node scripts/capacity-check.js <out.json>

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApp } = require('../src/server');

const USERS = 20;
const REQUESTS = 10000;
const SAMPLES = 200;

function buildData() {
  const users = [{ id: 'm1', name: 'Manager', role: 'MANAGER', managerId: null }];
  for (let i = 1; i < USERS; i += 1) users.push({ id: `e${i}`, name: `Employee ${i}`, role: 'EMPLOYEE', managerId: 'm1' });
  const requests = [];
  const history = [];
  for (let i = 1; i <= REQUESTS; i += 1) {
    const id = `LR-${String(i).padStart(4, '0')}`;
    const at = '2026-01-01T00:00:00.000Z';
    requests.push({
      id, employeeId: `e${(i % (USERS - 1)) + 1}`, approverId: 'm1', type: 'SICK',
      startDate: '2026-12-01', endDate: '2026-12-01', reason: 'capacity', days: 1,
      status: 'REJECTED', managerComment: 'x', createdAt: at, updatedAt: at,
    });
    history.push({ requestId: id, actorId: 'm1', from: null, to: 'PENDING', comment: null, at });
  }
  return { users, requests, history };
}

async function main() {
  const out = process.argv[2];
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'leaveflow-cap-')), 'db.json');
  fs.writeFileSync(file, JSON.stringify(buildData()));
  const sizeMb = fs.statSync(file).size / 1024 / 1024;

  const server = createApp({ dataFile: file, now: () => new Date('2026-11-02T08:00:00Z') });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const measure = async (url, user) => {
    const samples = [];
    for (let i = 0; i < SAMPLES; i += 1) {
      const t0 = performance.now();
      const res = await fetch(base + url, { headers: { 'X-User-Id': user } });
      await res.arrayBuffer();
      if (!res.ok) throw new Error(`${url} -> ${res.status}`);
      samples.push(performance.now() - t0);
    }
    samples.sort((a, b) => a - b);
    return { p95: +samples[Math.floor(SAMPLES * 0.95) - 1].toFixed(2), max: +samples.at(-1).toFixed(2) };
  };

  // Write path: one create on the full data set (rewrites the whole file, ADR-002).
  const t0 = performance.now();
  const created = await fetch(`${base}/api/leave-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-Id': 'e1' },
    body: JSON.stringify({ type: 'ANNUAL', startDate: '2026-11-09', endDate: '2026-11-13', reason: 'cap' }),
  });
  const writeMs = +(performance.now() - t0).toFixed(2);

  const result = {
    tc: 'TC-39',
    node: process.version,
    dataSet: { users: USERS, requests: REQUESTS, fileMb: +sizeMb.toFixed(2) },
    samplesPerEndpoint: SAMPLES,
    me: await measure('/api/me', 'e1'),
    listMine: await measure('/api/leave-requests?scope=mine', 'e1'),
    listTeam: await measure('/api/leave-requests?scope=team', 'm1'),
    createStatus: created.status,
    createMs: writeMs,
    thresholdP95Ms: 200,
  };
  result.verdict = [result.me, result.listMine].every((r) => r.p95 < 200) && created.status === 201 ? 'PASS' : 'FAIL';
  server.close();
  fs.rmSync(path.dirname(file), { recursive: true, force: true });

  const text = `${JSON.stringify(result, null, 2)}\n`;
  if (out) fs.writeFileSync(out, text);
  process.stdout.write(text);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
