# Release Record — LeaveFlow r1.1 (v1.1.0)

| Thuộc tính | Giá trị |
|---|---|
| Release ID | REL-LF-1.1.0 · tag dự kiến `r1.1` (trước đó `r1.0` = [RELEASE-1.0.0](./RELEASE-1.0.0.md)) |
| Change request | [CR-R11-01](../12-maintenance/CR-R11-01.md) |
| Commit | ☐ điền SHA khi commit — evidence phải chạy lại trên **đúng** commit này |
| Môi trường | Local workstation, Node.js ≥ 22, bind `127.0.0.1` |
| Trạng thái | **Ready — chờ go/no-go của Release owner** |

> Slide B10: *"CI pass là phát hành được" — Sai.* Release gate cần evidence đúng commit, restore đã thử, và người ký.

## 1. Release checklist (có ký)

| # | Mục | Trạng thái | Evidence |
|---|---|---|---|
| 1 | Evidence đúng commit release | ☐ Chạy lại `npm run test:report` sau khi commit | `evidence/RUN-<date>-<sha>-…` |
| 2 | Tag `r1.1` | ☐ Chờ commit | `git tag -a r1.1` |
| 3 | CI xanh trên commit | ☐ Chờ push | `.github/workflows/ci.yml` (guard, lint, scan, test, mutation) |
| 4 | Test report GO | ✅ GO with conditions | [TEST_REPORT §7](../07-verification/TEST_REPORT.md#7-evaluation-and-sign-off) |
| 5 | 0 defect High/Critical mở | ✅ 11/11 đóng | TEST_REPORT §6 |
| 6 | Characterization giữ hành vi | ✅ 18/18 | TC-43 |
| 7 | **Restore đã thử** (không chỉ có file backup) | ✅ 3.7 s | [TC-40](../07-verification/evidence/ops-2026-11-02/TC-40-restore-drill.log) |
| 8 | SBOM | ✅ §3 | — |
| 9 | AI-BOM | ✅ §4 | — |
| 10 | SLI / SLO + runbook | ✅ §5, [RUNBOOK](../10-operations/RUNBOOK.md) | — |
| 11 | Rollback về `r1.0` | ✅ §6 | — |
| 12 | Code review R1.1 độc lập | ☐ | [CODE_REVIEW §5](../08-review/CODE_REVIEW.md#5-r11-review) |
| **Go / No-Go** | | ☐ **Release owner ký** | |

## 2. Release notes r1.1

**Mới:** giao diện mới với sidebar, thẻ số liệu và vòng tiến độ phép năm · xem trước số ngày công khi chọn ngày · lọc theo trạng thái và tìm kiếm · lịch tháng cá nhân/nhóm · xuất CSV · giao diện tối · hộp thoại xác nhận riêng · tối ưu cho điện thoại.
**Sửa lỗi:** DEF-008 (dữ liệu không phải UTF-8 bị lưu sai), DEF-009 (gõ tiếng Việt trong ô tìm kiếm bị nhân đôi), DEF-010 (tương phản nút ở dark mode), DEF-011 (tràn layout trên mobile).
**Không đổi:** API, dữ liệu, cách chạy (`cd app && npm start`).

## 3. SBOM (Software Bill of Materials)

| Thành phần | Phiên bản | Loại | Nguồn / license |
|---|---|---|---|
| LeaveFlow `app/` | 1.1.0 | Ứng dụng | Repo này, MIT (`app/package.json`) |
| Node.js runtime | ≥ 22 (kiểm thử v22.0.0) | Runtime | nodejs.org, MIT |
| Module tích hợp của Node: `node:http`, `node:fs`, `node:path`, `node:crypto`, `node:test`, `node:child_process` | theo runtime | Thư viện chuẩn | Node.js |
| npm dependencies | **0** | — | Kiểm bằng `npm run scan` (TC-48) |
| GitHub Actions: `actions/checkout@v4`, `actions/setup-node@v4` | v4 | CI | GitHub, MIT |

## 4. AI-BOM (AI Bill of Materials)

| Thành phần AI | Phiên bản | Vai trò | Mức AI | Kiểm soát |
|---|---|---|---|---|
| Claude Code (agent tác giả) | model Claude Opus 5.5 (`claude-opus-5-5`) | Soạn nháp tài liệu, code, test, chạy kiểm thử | 2–3 (trong quyền giới hạn) | CLAUDE.md, hook bảo vệ test, review người |
| Subagent `auditor` | cùng model, phiên riêng, chỉ đọc | Chấm checklist 2 vòng | 2 | Không sửa artifact; finding là giả thuyết, người xác minh |
| Subagent `tester` | cùng model | Chạy test, lưu evidence | 2 | Không sửa code giữa run |
| Prompt của kit | các file `*/…_Prompt*.md` trong repo (v2.0) | Khuôn đầu ra từng phase | — | Ghi trong adaptation log |
| AI trong sản phẩm | **Không có** | LeaveFlow không gọi mô hình AI nào | — | — |

> Đổi model hoặc prompt **không** chỉ là đổi cấu hình (slide B10): phải chạy lại audit/eval, cập nhật bảng này và ghi vào release note.

## 5. SLI / SLO

| SLI | Cách đo | SLO | Hiện tại |
|---|---|---|---|
| Availability giờ hành chính | `GET /api/health` mỗi 5 phút (thủ công/cron) | ≥ 99 % | Chưa đo dài hạn (proxy: health OK mọi lần kiểm thử) |
| Latency p95 API đọc | `LOG_REQUESTS=1`, TC-32 | < 200 ms | 6.02 ms (proxy: máy dev) |
| Tỷ lệ lỗi 5xx | đếm dòng log status 5xx | 0 / ngày | 0 trong mọi run |
| Thời gian khôi phục | diễn tập restore | ≤ 1 giờ | 3.7 s (TC-40) |

## 6. Rollback

Dừng tiến trình → `git checkout r1.0` → `npm start`. Không có migration dữ liệu nên `db.json` dùng chung được cho cả hai bản. Mục tiêu < 5 phút.

## 7. Authorization

| Vai trò | Tên | Quyết định | Ngày |
|---|---|---|---|
| Release owner | Nguyễn Trần Hà | ☐ Go · ☐ No-Go | |
| Chuẩn bị | AI agent | Không có quyền ký go/no-go hay chạy lệnh trên dữ liệu thật | 2026-11-02 |
