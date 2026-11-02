'use strict';

// Web UI (CMP-05) v1.1 — SPA vanilla JS, hash routing, client of the unchanged REST API v1.

const $ = (id) => document.getElementById(id);
const STATUS_LABEL = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy' };
const TYPE_LABEL = { ANNUAL: 'Phép năm', SICK: 'Nghỉ ốm', UNPAID: 'Không lương' };
const ROUTES = {
  EMPLOYEE: [['overview', '🏠', 'Tổng quan'], ['requests', '📄', 'Đơn của tôi'], ['calendar', '📅', 'Lịch nghỉ']],
  MANAGER: [['inbox', '📥', 'Hộp duyệt'], ['team', '👥', 'Đơn của nhóm'], ['calendar', '📅', 'Lịch nhóm']],
};
const state = { user: null, balance: null, requests: [], filter: 'ALL', query: '', month: null };

function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch { /* storage unavailable: keep defaults */ }
  return null;
}
let currentUser = store('leaveflow.user') || 'u1';

async function api(path, options = {}) {
  const res = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', 'X-User-Id': currentUser } });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ? body.error.message : `HTTP ${res.status}`);
  return body;
}

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const badge = (s) => `<span class="badge badge-${s.toLowerCase()}">${STATUS_LABEL[s]}</span>`;
const fmt = (iso) => iso.split('-').reverse().join('/');
const period = (r) => (r.startDate === r.endDate ? fmt(r.startDate) : `${fmt(r.startDate)} → ${fmt(r.endDate)}`);
const initials = (name) => name.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase();
const todayIso = () => new Date().toISOString().slice(0, 10);

function toast(message, isError = false) {
  const el = document.createElement('div');
  el.className = `toast${isError ? ' err' : ''}`;
  el.textContent = message;
  $('toasts').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// Same rule as the server domain (FR-02): Mon–Fri inclusive, used for the live preview only.
function workingDays(start, end) {
  if (!start || !end || end < start) return 0;
  let n = 0;
  for (let d = new Date(`${start}T00:00:00Z`); d <= new Date(`${end}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() % 6 !== 0) n += 1;
  }
  return n;
}

/* ---------- Modal (replaces prompt/confirm — CR-06) ---------- */
function modal({ title, body, okText = 'Xác nhận', okClass = 'primary', input, showOk = true }) {
  return new Promise((resolve) => {
    const dlg = $('modal');
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = body + (input ? `<label>${input}<textarea id="modalInput" rows="3" maxlength="200" required></textarea></label>` : '');
    $('modalError').textContent = '';
    const ok = $('modalOk');
    ok.textContent = okText;
    ok.className = okClass;
    ok.hidden = !showOk;
    $('modalCancel').textContent = showOk ? 'Hủy' : 'Đóng';
    const onClose = () => {
      dlg.removeEventListener('close', onClose);
      resolve(dlg.returnValue === 'ok' ? (input ? $('modalInput').value.trim() : true) : null);
    };
    ok.onclick = (e) => {
      if (input && !$('modalInput').value.trim()) {
        e.preventDefault();
        $('modalError').textContent = 'Vui lòng nhập lý do.';
      }
    };
    dlg.addEventListener('close', onClose);
    dlg.showModal();
    (input ? $('modalInput') : ok).focus();
  });
}

/* ---------- Data ---------- */
async function load() {
  const me = await api('/api/me');
  state.user = me.user;
  state.balance = me.balance;
  const scope = me.user.role === 'MANAGER' ? 'team' : 'mine';
  state.requests = await api(`/api/leave-requests?scope=${scope}`);
}

/* ---------- Layout ---------- */
function renderChrome(route) {
  const { user } = state;
  const pending = state.requests.filter((r) => r.status === 'PENDING').length;
  $('nav').innerHTML = ROUTES[user.role]
    .map(([id, icon, label]) => {
      const count = id === 'inbox' && pending ? `<span class="count">${pending}</span>` : '';
      return `<a href="#${id}" ${id === route ? 'aria-current="page"' : ''}><span aria-hidden="true">${icon}</span>${label}${count}</a>`;
    })
    .join('');
  $('meAvatar').textContent = initials(user.name);
  const hour = new Date().getHours();
  $('greeting').textContent = `${hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'}, ${user.name}`;
  $('pageTitle').textContent = ROUTES[user.role].find(([id]) => id === route)[2];
  $('today').textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function currentRoute() {
  const wanted = location.hash.slice(1);
  const routes = ROUTES[state.user.role].map(([id]) => id);
  return routes.includes(wanted) ? wanted : routes[0];
}

async function render() {
  try {
    await load();
  } catch (err) {
    toast(err.message, true);
    return;
  }
  const route = currentRoute();
  renderChrome(route);
  ({ overview: viewOverview, requests: () => viewList(false), team: () => viewList(true), inbox: viewInbox, calendar: viewCalendar })[route]();
}

/* ---------- S-01/S-02 Employee overview ---------- */
function ring(b) {
  const C = 2 * Math.PI * 56;
  const used = (b.used / b.entitlement) * C;
  const pend = (b.pending / b.entitlement) * C;
  return `<svg class="ring" viewBox="0 0 140 140" role="img" aria-label="Còn ${b.available} trên ${b.entitlement} ngày phép năm">
    <circle class="track" cx="70" cy="70" r="56"/>
    <circle class="pend" cx="70" cy="70" r="56" stroke-dasharray="${used + pend} ${C}" transform="rotate(-90 70 70)"/>
    <circle class="used" cx="70" cy="70" r="56" stroke-dasharray="${used} ${C}" transform="rotate(-90 70 70)"/>
    <text x="70" y="68" text-anchor="middle" font-size="30">${b.available}</text>
    <text x="70" y="90" text-anchor="middle" font-size="12" font-weight="400">ngày còn lại</text></svg>`;
}

function viewOverview() {
  const b = state.balance;
  const recent = state.requests.slice(0, 4);
  $('view').innerHTML = `
    <div class="grid-4">
      ${[['Được cấp', b.entitlement, ''], ['Đã dùng', b.used, ''], ['Đang chờ duyệt', b.pending, ''], ['Còn lại', b.available, 'accent']]
        .map(([l, v, c]) => `<div class="card stat ${c}"><span class="label">${l}</span><span class="value">${v}</span></div>`).join('')}
    </div>
    <div class="grid-2 section">
      <section class="card" aria-labelledby="newTitle">
        <h2 id="newTitle">Tạo đơn nghỉ phép</h2>
        <form id="createForm" novalidate>
          <div class="form-grid">
            <label>Loại nghỉ<select name="type">${Object.entries(TYPE_LABEL).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
            <label>Từ ngày<input type="date" name="startDate" min="${todayIso()}" required></label>
            <label>Đến ngày<input type="date" name="endDate" min="${todayIso()}" required></label>
          </div>
          <label>Lý do<textarea name="reason" rows="2" maxlength="200" required placeholder="Ví dụ: Du lịch gia đình"></textarea></label>
          <p id="preview" class="preview" aria-live="polite">Chọn ngày để xem trước số ngày công.</p>
          <p id="formError" class="error" role="alert"></p>
          <div class="row-end"><button type="submit" class="primary">Gửi đơn</button></div>
        </form>
      </section>
      <section class="card" aria-labelledby="balTitle">
        <h2 id="balTitle">Phép năm ${b.year}</h2>
        <div class="hero">${ring(b)}
          <div class="legend">
            <span style="--c:var(--primary)">Đã dùng: <b>${b.used}</b> ngày</span>
            <span style="--c:#f59e0b">Đang chờ: <b>${b.pending}</b> ngày</span>
            <span style="--c:var(--primary-soft)">Còn lại: <b>${b.available}</b> ngày</span>
          </div>
        </div>
        <h2 class="section">Đơn gần đây</h2>
        ${recent.length ? `<div class="table-wrap"><table><tbody>${recent.map((r) => `<tr><td>${idLink(r)}</td><td>${TYPE_LABEL[r.type]}</td><td>${period(r)}</td><td>${badge(r.status)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">Chưa có đơn nào.</p>'}
      </section>
    </div>`;
  const form = $('createForm');
  const update = () => {
    const f = Object.fromEntries(new FormData(form));
    const days = workingDays(f.startDate, f.endDate);
    if (!f.startDate || !f.endDate) return;
    const after = f.type === 'ANNUAL' ? b.available - days : b.available;
    $('preview').innerHTML = `<span>Số ngày công: <strong>${days}</strong></span><span>Phép năm còn sau đơn: <strong>${after}</strong></span>${after < 0 ? '<span class="error">Vượt số dư</span>' : ''}`;
  };
  form.addEventListener('input', update);
  form.addEventListener('submit', submitRequest);
}

async function submitRequest(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  $('formError').textContent = '';
  btn.disabled = true;
  btn.textContent = 'Đang gửi…';
  try {
    const created = await api('/api/leave-requests', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    toast(`Đã gửi đơn ${created.id} (${created.days} ngày công)`);
    await render();
  } catch (err) {
    $('formError').textContent = err.message;
    btn.disabled = false;
    btn.textContent = 'Gửi đơn';
  }
}

/* ---------- S-03 / S-04b lists with filter, search, export ---------- */
const idLink = (r) => `<button class="link" data-detail="${r.id}">${r.id}</button>`;

function filteredRows() {
  const q = state.query.toLowerCase();
  return state.requests.filter((r) => (state.filter === 'ALL' || r.status === state.filter)
    && (!q || `${r.id} ${r.employeeName} ${r.reason} ${TYPE_LABEL[r.type]}`.toLowerCase().includes(q)));
}

function viewList(team) {
  const counts = { ALL: state.requests.length };
  for (const r of state.requests) counts[r.status] = (counts[r.status] || 0) + 1;
  $('view').innerHTML = `<section class="card">
    <div class="toolbar" role="group" aria-label="Lọc theo trạng thái">
      ${['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((s) => `<button class="chip" data-filter="${s}" aria-pressed="${state.filter === s}">${s === 'ALL' ? 'Tất cả' : STATUS_LABEL[s]} (${counts[s] || 0})</button>`).join('')}
      <input type="search" id="search" placeholder="Tìm mã, tên, lý do…" aria-label="Tìm kiếm" value="${esc(state.query)}">
      ${team ? '<button id="exportCsv" class="ghost">⬇ Xuất CSV</button>' : ''}
    </div>
    <div id="listBody"></div></section>`;
  renderListBody(team);
  // DEF-009: only the result list re-renders while typing, so the input (and IME composition) is never replaced.
  $('search').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderListBody(team);
  });
  if (team) $('exportCsv').addEventListener('click', () => exportCsv(filteredRows()));
}

function renderListBody(team) {
  const rows = filteredRows();
  $('listBody').innerHTML = rows.length ? `<div class="table-wrap"><table>
      <thead><tr><th>Mã</th>${team ? '<th>Nhân viên</th>' : ''}<th>Loại</th><th>Thời gian</th><th>Ngày công</th><th>Trạng thái</th><th>Nhận xét</th><th></th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td>${idLink(r)}</td>${team ? `<td>${esc(r.employeeName)}</td>` : ''}<td>${TYPE_LABEL[r.type]}</td><td>${period(r)}</td><td>${r.days}</td><td>${badge(r.status)}</td><td>${esc(r.managerComment)}</td>
        <td><div class="actions">${!team && r.status === 'PENDING' ? `<button class="ghost" data-cancel="${r.id}">Hủy</button>` : ''}${team && r.status === 'PENDING' ? decisionButtons(r) : ''}</div></td></tr>`).join('')}</tbody>
    </table></div>` : '<p class="empty">Không có đơn nào khớp bộ lọc.</p>';
}

function exportCsv(rows) {
  const head = ['Mã', 'Nhân viên', 'Loại', 'Từ ngày', 'Đến ngày', 'Ngày công', 'Trạng thái', 'Lý do', 'Nhận xét'];
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [r.id, r.employeeName, TYPE_LABEL[r.type], r.startDate, r.endDate, r.days, STATUS_LABEL[r.status], r.reason, r.managerComment].map(cell).join(','));
  const blob = new Blob([`﻿${[head.map(cell).join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `leaveflow-${todayIso()}.csv` });
  a.click();
  URL.revokeObjectURL(a.href);
  toast(`Đã xuất ${rows.length} đơn ra CSV`);
}

/* ---------- S-04 Manager inbox ---------- */
const decisionButtons = (r) => `<button class="primary" data-approve="${r.id}">Duyệt</button><button class="danger" data-reject="${r.id}">Từ chối</button>`;

function viewInbox() {
  const pending = state.requests.filter((r) => r.status === 'PENDING');
  const done = state.requests.filter((r) => r.status !== 'PENDING');
  const days = pending.reduce((s, r) => s + r.days, 0);
  const approved = done.filter((r) => r.status === 'APPROVED').length;
  $('view').innerHTML = `
    <div class="grid-4">
      ${[['Chờ duyệt', pending.length, 'accent'], ['Ngày công chờ duyệt', days, ''], ['Đã duyệt', approved, ''], ['Tổng đơn của nhóm', state.requests.length, '']]
        .map(([l, v, c]) => `<div class="card stat ${c}"><span class="label">${l}</span><span class="value">${v}</span></div>`).join('')}
    </div>
    <section class="card section"><h2>Đơn chờ duyệt</h2>
      ${pending.length ? `<div class="inbox">${pending.map((r) => `<article class="req-card">
        <span class="avatar" aria-hidden="true">${initials(r.employeeName)}</span>
        <div><div class="who">${esc(r.employeeName)} · ${idLink(r)}</div>
          <div class="meta">${TYPE_LABEL[r.type]} · ${period(r)} · <b>${r.days} ngày công</b></div>
          <div class="meta">“${esc(r.reason)}”</div></div>
        <div class="actions">${decisionButtons(r)}</div></article>`).join('')}</div>` : '<p class="empty">Không có đơn nào đang chờ duyệt.</p>'}
    </section>`;
}

/* ---------- S-06 Calendar (month view) ---------- */
function viewCalendar() {
  const base = state.month || todayIso().slice(0, 7);
  const [y, m] = base.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const start = new Date(first);
  start.setUTCDate(1 - ((first.getUTCDay() + 6) % 7)); // grid starts on Monday
  const events = state.requests.filter((r) => r.status === 'APPROVED' || r.status === 'PENDING');
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay();
    const evs = dow % 6 === 0 ? [] : events.filter((r) => r.startDate <= iso && iso <= r.endDate);
    cells.push(`<div class="day${dow % 6 === 0 ? ' weekend' : ''}${d.getUTCMonth() !== m - 1 ? ' out' : ''}${iso === todayIso() ? ' today' : ''}" aria-label="${fmt(iso)}${evs.length ? `: ${evs.length} người nghỉ` : ''}">
      <span class="num">${d.getUTCDate()}</span>${evs.map((r) => `<span class="ev ${r.status}" title="${esc(r.employeeName || state.user.name)} — ${STATUS_LABEL[r.status]}">${esc((r.employeeName || state.user.name).split(' ').pop())} · ${TYPE_LABEL[r.type]}</span>`).join('')}</div>`);
  }
  $('view').innerHTML = `<section class="card">
    <div class="cal-head"><h2>Tháng ${m}/${y}</h2>
      <button class="ghost" data-month="-1" aria-label="Tháng trước">‹</button>
      <button class="ghost" data-month="0">Hôm nay</button>
      <button class="ghost" data-month="1" aria-label="Tháng sau">›</button></div>
    <p class="muted">Ô xanh: đã duyệt · Ô vàng viền đứt: đang chờ duyệt.</p>
    <div class="cal">${['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => `<div class="dow">${d}</div>`).join('')}${cells.join('')}</div></section>`;
}

/* ---------- S-05 Detail ---------- */
async function showDetail(id) {
  const r = await api(`/api/leave-requests/${id}`);
  await modal({
    title: `Đơn ${r.id}`,
    showOk: false,
    body: `<dl>${[['Loại', TYPE_LABEL[r.type]], ['Thời gian', period(r)], ['Số ngày công', r.days], ['Lý do', r.reason], ['Trạng thái', STATUS_LABEL[r.status]], ['Nhận xét', r.managerComment || '—']]
      .map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      <h3>Lịch sử trạng thái</h3><ol class="timeline">${r.history.map((h) => `<li><time>${h.at.replace('T', ' ').slice(0, 16)}</time>${h.from ? STATUS_LABEL[h.from] : 'Tạo đơn'} → <b>${STATUS_LABEL[h.to]}</b> · ${esc(h.actorName)}${h.comment ? ` — “${esc(h.comment)}”` : ''}</li>`).join('')}</ol>`,
  });
}

async function act(fn, message) {
  try {
    await fn();
    toast(message);
    await render();
  } catch (err) {
    toast(err.message, true);
  }
}

/* ---------- Events ---------- */
document.addEventListener('click', async (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  const { detail, cancel, approve, reject, filter, month } = t.dataset;
  if (detail) showDetail(detail).catch((err) => toast(err.message, true));
  if (filter) {
    state.filter = filter;
    viewList(state.user.role === 'MANAGER');
  }
  if (month !== undefined) {
    const [y, m] = (state.month || todayIso().slice(0, 7)).split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + Number(month), 1));
    state.month = month === '0' ? null : d.toISOString().slice(0, 7);
    viewCalendar();
  }
  if (cancel && await modal({ title: `Hủy đơn ${cancel}?`, body: '<p>Số ngày giữ chỗ sẽ được trả lại số dư.</p>', okText: 'Hủy đơn', okClass: 'danger' })) {
    act(() => api(`/api/leave-requests/${cancel}/cancel`, { method: 'POST' }), `Đã hủy đơn ${cancel}`);
  }
  if (approve && await modal({ title: `Duyệt đơn ${approve}?`, body: '<p>Thao tác này không hoàn tác được.</p>', okText: 'Duyệt' })) {
    act(() => api(`/api/leave-requests/${approve}/approve`, { method: 'POST', body: '{}' }), `Đã duyệt đơn ${approve}`);
  }
  if (reject) {
    const comment = await modal({ title: `Từ chối đơn ${reject}`, body: '', input: 'Lý do từ chối (bắt buộc, tối đa 200 ký tự)', okText: 'Từ chối', okClass: 'danger' });
    if (comment) act(() => api(`/api/leave-requests/${reject}/reject`, { method: 'POST', body: JSON.stringify({ comment }) }), `Đã từ chối đơn ${reject}`);
  }
});

$('userSelect').addEventListener('change', (e) => {
  currentUser = e.target.value;
  store('leaveflow.user', currentUser);
  state.filter = 'ALL';
  state.query = '';
  location.hash = '';
  render();
});

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('themeToggle').textContent = theme === 'dark' ? '☀️ Giao diện sáng' : '🌙 Giao diện tối';
}
$('themeToggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  store('leaveflow.theme', next);
  applyTheme(next);
});
window.addEventListener('hashchange', render);

applyTheme(store('leaveflow.theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
api('/api/users')
  .then((users) => {
    $('userSelect').innerHTML = users.map((u) => `<option value="${u.id}" ${u.id === currentUser ? 'selected' : ''}>${esc(u.name)} · ${u.role === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}</option>`).join('');
    return render();
  })
  .catch((err) => toast(err.message, true));
