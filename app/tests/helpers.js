'use strict';

const { JsonStore } = require('../src/repo/jsonStore');
const { LeaveService } = require('../src/service/leaveService');
const seed = require('../src/data/seed');

// Fixed clock: Monday 2026-11-02, so working-day maths in tests is deterministic.
const FIXED_NOW = new Date('2026-11-02T08:00:00Z');
const fixedClock = () => new Date(FIXED_NOW);

const EXTRA_USERS = [
  { id: 'u4', name: 'Phạm Quốc Dũng', role: 'MANAGER', managerId: null },
  { id: 'u5', name: 'Võ Thu Em', role: 'EMPLOYEE', managerId: 'u4' },
];

function makeService({ withExtraUsers = false } = {}) {
  const data = structuredClone(seed);
  if (withExtraUsers) data.users.push(...EXTRA_USERS);
  const store = new JsonStore(data);
  const service = new LeaveService(store, fixedClock);
  const user = (id) => service.authenticate(id);
  return { store, service, user };
}

function leave(overrides = {}) {
  return { type: 'ANNUAL', startDate: '2026-11-09', endDate: '2026-11-13', reason: 'Du lịch gia đình', ...overrides };
}

module.exports = { FIXED_NOW, fixedClock, makeService, leave };
