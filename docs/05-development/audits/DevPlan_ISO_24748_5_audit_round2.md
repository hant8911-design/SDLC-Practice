# Audit vòng 2 — Software Development Plan theo ISO/IEC/IEEE 24748-5

| Thuộc tính | Giá trị |
|---|---|
| Checklist | `development/DevPlan_ISO_24748_5_Checklist.xlsx` (22 dòng) |
| Artifact | `docs/05-development/Software_Development_Plan.md` (SDP-LF-001 **v1.1**), `WBS.md` (WBS-LF-001), `tasks/TASK-01…08.md`, `docs/00-kit/adaptation-log.md`, `docs/README.md` |
| Báo cáo vòng 1 | [DevPlan_ISO_24748_5_audit.md](./DevPlan_ISO_24748_5_audit.md) |
| Ngày | 2026-11-02 |
| Auditor | Independent auditor agent (read-only), round 2 |
| Quy tắc chấm | guidance §A8. Chỉ chấm lại dòng Fail/Partial vòng 1; Pass giữ nguyên (spot-check #1, #5, #6, #21, #22: không hồi quy). |

> **Kiểm chứng độc lập lại:** `git tag` → rỗng; `git status` → `.github/`, `.gitignore`, `app/`, `docs/` vẫn untracked; HEAD = `6996dae`. SDP §6.1 nay ghi trung thực "**Chưa commit** … các tag ở trên **chưa tồn tại**". `docs/README.md` §4 "Gate status" chỉ chứa chuỗi `GATE_STATUS_PLACEHOLDER`.

## 1. Các dòng được chấm lại

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 2 | Business Drivers & Objectives | Partial | **Pass** | SDP §1 dòng "Business drivers": BO-01…BO-03 (link BRD §4), đo bằng SM-01…SM-04 | — |
| 3 | System & Software Context | Partial | **Pass** | SDP §1 dòng "Kiến trúc tóm tắt" (1 tiến trình Node, HTTP adapter → service → domain ← JSON store, UI tĩnh) + link SAD §2 (SAD §2.1 có context view) | — |
| 4 | Applicable Standards & Compliance | Partial | **Pass** | SDP §1.1 bảng chuẩn → artifact (29148, 1016/42010, UML, 24748-5, 21511, 829, 1028, 25010, WCAG 2.1 AA); tailoring dẫn tới adaptation-log (§1) | Gợi ý: thêm cột "mức áp dụng" và lý do không áp dụng ISO 27001/12207. |
| 7 | Process Tailoring & Adaptation | Partial | **Partial** | SDP §1 dòng "Tailoring" link adaptation-log "cần Tech lead duyệt cùng plan". adaptation-log.md không có cột/chữ ký phê duyệt của Tech lead — phê duyệt còn treo (được nêu trung thực). | Tech lead ký duyệt adaptation-log cùng `plan-v1` (thêm cột "Duyệt"). Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 8 | Deliverables & Work Products | Partial | **Pass** | WBS §2 dictionary nay đủ 15/15 nút lá (thêm 1.1.1, 1.1.2, 1.2.1–1.2.3, 1.4.2, 1.4.3) mỗi nút có deliverable + tiêu chí chấp nhận | Gợi ý: WBS đã đổi nội dung nhưng header vẫn "v1.0" — tăng version. |
| 9 | Roles & Responsibilities | Partial | **Partial** | SDP §3.1 RACI theo hoạt động đã có. Lỗi RACI: dòng "Thiết kế, ADR" và "Kế hoạch" có **hai A** (Owner "A/R" và Mentor "A") — vi phạm nguyên tắc một người Accountable/hoạt động, mơ hồ về ai chịu trách nhiệm cuối cùng. | Mỗi dòng chỉ một A (vd. Mentor = A, Owner = R) và thêm dòng Test/Verification. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 10 | Governance & Oversight Structure | Partial | **Partial** | RACI §3.1 chỉ rõ người duyệt gate design/plan; §7 tiêu chí audit "0 Fail"; §7.1 báo cáo gate. Nhưng bảng gate được dẫn chiếu (`docs/README.md` §4) chỉ là `GATE_STATUS_PLACEHOLDER`; chưa gate nào được ký; tag baseline chưa tồn tại (nêu trung thực ở SDP §6.1). | Điền bảng Gate status (gate · người duyệt · tiêu chí · evidence · trạng thái) trong docs/README §4; lấy chữ ký và tạo tag sau commit. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 11 | Stakeholder Management | **Fail** | **Pass** | SDP §3.3 Stakeholder engagement: stakeholder → kênh → tần suất → nội dung → owner (mentor, HR/quản lý persona, lớp học) | — |
| 12 | Estimation Methods & Metrics | Partial | **Partial** | SDP §5.1: phương pháp "expert judgement + kích thước task card". Không có số liệu actual (ghi nhận "không được ghi riêng từng task") → chưa có metric/dữ liệu lịch sử. | Ghi actual hồi tố (ước tính) cho TASK-01…08 vào SDP §5 để có baseline cho vòng sau. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 13 | Human Resources & Competencies | Partial | **Pass** | SDP §3.2 bảng năng lực cần / có sẵn / cách bù (Node.js, IEEE 29148/UML, kiểm thử, bảo mật web) | — |
| 14 | Infrastructure & Tooling | Partial | **Partial** | SDP §6 công cụ đủ; `.github/workflows/ci.yml` tồn tại nhưng chưa từng chạy (TEST_REPORT V-4) và repo chưa commit (`git status`). | Commit + push, chạy CI xanh một lần, ghi link run vào SDP §6. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 15 | Budget & Financial Plan | Partial | **Pass** | SDP §5.1 "Ngân sách: 0 đồng tiền mặt (BC-01) … thời gian owner ~10.5 giờ … lượt dùng AI agent theo gói học viên" | — |
| 16 | Schedule & Milestone Baseline | Partial | **Partial** | SDP §4 Gantt có mốc release 2026-11-05; trạng thái "Sẵn sàng baseline — tag `plan-v1` sẽ được tạo khi commit; chờ PO + Tech lead ký" — trung thực, nhưng baseline chưa phê duyệt và chưa tag. | PO + Tech lead ký; tạo tag `plan-v1` trên commit chứa SDP v1.1. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 17 | Progress Tracking & Reporting | **Fail** | **Partial** | SDP §7.1 KPI (task Done/tổng, gate ký/tổng, pass rate/coverage, defect theo severity, audit Fail mở) + nguồn + tần suất + ngưỡng + kênh báo cáo. Tuy nhiên nguồn KPI "Gate đã ký / tổng" là `docs/README.md` §4 — hiện chỉ là `GATE_STATUS_PLACEHOLDER`, tức cơ chế báo cáo chưa vận hành. | Điền bảng gate status thực tế (cùng action #10) và cập nhật sau mỗi vòng. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 18 | Risk & Issue Management | Partial | **Partial** | SDP §8: RISK-03 đã hợp nhất, thêm RISK-07, P/I đủ, "rà soát ở mỗi gate và khi có defect/finding mới". Chưa có quy trình issue log cho vấn đề không phải defect (vd. chờ chữ ký, OQ-xx); RISK-08 (BRD §11.2) chưa có trong register của SDP. | Thêm mục "Issue log" (ID, mô tả, owner, hạn, trạng thái — gồm OQ-04…06 và chữ ký chờ), hợp nhất RISK-08. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 19 | Change Control Management | **Fail** | **Partial** | SDP §10: quy trình change record (ID ảnh hưởng → cập nhật traceability/RTM → audit lại → người duyệt gate), CCB = PO + Tech lead, CHG-01…CHG-03. Nhưng quy trình chưa áp dụng đủ: thay đổi thiết kế sau audit (SAD v1.1, api.md v1.1, openapi.yaml, data/model.md v1.1, UX v1.1, use-cases.md mới) và sửa code DEF-005…007 (`server.js` HOST, validate `status`, kiểm tra quản lý) không có CHG record; CHG-03 vẫn "☐ PO + Tech lead". | Thêm CHG-04 cho design v1.1 + DEF-005…007 (ID bị ảnh hưởng, người duyệt) và lấy duyệt CCB. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 20 | Software Configuration Management (SCM) | **Fail** | **Partial** | SDP §6.1 nay có kế hoạch SCM (nhánh `main` bảo vệ + `feature/<task-id>`, PR + review, conventional commits, tag theo gate, SemVer) và tuyên bố trung thực "Chưa commit … tag chưa tồn tại". Kiểm chứng: `git tag` rỗng, `app/`, `docs/` untracked → kế hoạch đúng nhưng chưa thực thi; build đã test chưa tái lập được từ VCS. | Commit toàn bộ, tạo tag `requirements-v1`, `analysis-v1`, `design-v1`, `plan-v1` sau khi ký và `v1.0.0` khi release. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |

## 2. Tổng kết toàn checklist sau vòng 2

| | Pass | Partial | Fail | N/A | Rows |
|---|---|---|---|---|---|
| Vòng 1 | 5 | 13 | 4 | 0 | 22 |
| **Vòng 2** | **12** | **10** | **0** | **0** | **22** |

**Kết luận gate:** 0 Fail. 10 Partial đều có action, owner, hạn; 4 trong số đó (#7, #14, #16, #20) chỉ đóng được khi owner commit/push và người duyệt ký — đã được SDP nêu trung thực, không trình bày sai. Ưu tiên: điền bảng gate status (#10, #17) và CHG-04 (#19) vì đây là thiếu sót tài liệu có thể sửa ngay.
