'use strict';

// Demo users (ASM-01: authentication is simulated, see ADR-003).
module.exports = {
  users: [
    { id: 'u1', name: 'Nguyễn Văn An', role: 'EMPLOYEE', managerId: 'u3' },
    { id: 'u2', name: 'Trần Thị Bình', role: 'EMPLOYEE', managerId: 'u3' },
    { id: 'u3', name: 'Lê Minh Chi', role: 'MANAGER', managerId: null },
  ],
  requests: [],
  history: [],
};
