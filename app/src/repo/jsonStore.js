'use strict';

// Persistence adapter (CMP-04). Keeps the whole data set in memory and, when a file path
// is given, writes it to disk atomically (temp file + rename) after every change (NFR-03).

const fs = require('node:fs');
const path = require('node:path');

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

class JsonStore {
  /**
   * @param {object} seed   initial data { users: [], requests: [], history: [] }
   * @param {string|null} filePath  null = in-memory only (used by tests)
   */
  constructor(seed, filePath = null) {
    this.filePath = filePath;
    this.data = this.#load(seed);
  }

  #load(seed) {
    if (this.filePath && fs.existsSync(this.filePath)) {
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    }
    const data = { users: [], requests: [], history: [], ...clone(seed) };
    if (this.filePath) this.#persist(data);
    return data;
  }

  #persist(data = this.data) {
    if (!this.filePath) return;
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, this.filePath);
  }

  listUsers() {
    return clone(this.data.users);
  }

  findUser(id) {
    return clone(this.data.users.find((u) => u.id === id));
  }

  listRequests(predicate = () => true) {
    return clone(this.data.requests.filter(predicate));
  }

  findRequest(id) {
    return clone(this.data.requests.find((r) => r.id === id));
  }

  nextRequestId() {
    const max = this.data.requests.reduce((m, r) => Math.max(m, Number(r.id.slice(3))), 0);
    return `LR-${String(max + 1).padStart(4, '0')}`;
  }

  insertRequest(request, historyEntry) {
    this.data.requests.push(clone(request));
    this.data.history.push(clone(historyEntry));
    this.#persist();
  }

  updateRequest(request, historyEntry) {
    const index = this.data.requests.findIndex((r) => r.id === request.id);
    this.data.requests[index] = clone(request);
    this.data.history.push(clone(historyEntry));
    this.#persist();
  }

  historyOf(requestId) {
    return clone(this.data.history.filter((h) => h.requestId === requestId));
  }
}

module.exports = { JsonStore };
