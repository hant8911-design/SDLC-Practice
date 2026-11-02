# Hồ sơ Capstone — LeaveFlow (LR-28) & lộ trình áp dụng AI (LR-29)

| | |
|---|---|
| Học viên | Nguyễn Trần Hà · repo `hant8911-design/SDLC-Practice` |
| Dự án | LeaveFlow — quản lý đơn nghỉ phép (r1.0 → r1.1) |
| Ngày | 2026-11-02 |
| Quy ước | Mỗi ô là **link tới evidence**. Mọi con số ghi nhãn **(proxy)**: đo trên dự án cá nhân, không phải số của đội thật. Ô chưa có evidence để **trống kèm lý do**. |

---

## 1. Bảng một trang (slide B10 #06–07)

| Pha · artifact chính | Gate, kết quả, commit | AI làm gì (Mức AI) | Con người quyết định | Lỗi AI đã gặp thật | Metric (proxy) |
|---|---|---|---|---|---|
| **Requirements** · [BRD](./02-requirements/BRD.md), [PRD](./03-analysis/PRD.md), [USER_STORIES](./03-analysis/USER_STORIES.md) (26 AC), [traceability](./03-analysis/traceability.md) | Audit 29148: [BRD 2→0 Fail](./02-requirements/brd-audit.md), [PRD 2→0 Fail](./03-analysis/prd-audit.md) · commit: *trống — chưa commit (NR-01)* | Nháp BRD/PRD, phỏng vấn mô phỏng [SRC-001](./02-requirements/interviews/SRC-001.md), audit (2) | PO duyệt BR/AC; ☐ chữ ký | Story để "HR xem lịch sử" dù HR không có vai trò → [audit #20](./03-analysis/audits/PRD_IEEE_29148_audit.md) | Fail tìm bởi auditor: 4 (proxy) |
| **Design** · [SAD 4+1](./04-design/SAD.md), [use-cases](./04-design/use-cases.md), [ADR×3](./04-design/ADR-001-node-no-framework.md), [OpenAPI](./04-design/openapi.yaml), [ERD](./04-design/data/model.md) | [10 checklist: 17→0 Fail](./04-design/design-audit.md) · commit: *trống (NR-01)* | Nháp SAD, sơ đồ, contract; review phiên độc lập (2) | Chọn phương án theo driver (ADR-001/002/003); ☐ Tech lead ký | Tác giả **tự ghi "0 Fail" khi chưa chấm** → bị auditor bác ([design-audit](./04-design/design-audit.md)) | Đề xuất AI bị bác: 1 (proxy) |
| **Implementation** · [task cards](./05-development/tasks/), [`app/`](../app/), [CLAUDE.md](../CLAUDE.md), [hook](../.claude/hooks/protect-approved-tests.js) | Lint + 35 test pass ([run](./07-verification/evidence/RUN-2026-11-02-6996dae-local-node22/summary.json)); test đã duyệt không đổi ([TC-47](./07-verification/evidence/ops-2026-11-02/TC-47-approved-tests.log)) · commit: *trống* | Code theo task card, chẩn đoán lỗi (3) | Review diff, quyết định sửa ([CODE_REVIEW](./08-review/CODE_REVIEW.md)) | Không sửa test để pass — **chặn bằng hook + CI** chứ không chỉ lời dặn | Tests pass lần đầu: 32/32 (proxy) · PR lead time: *trống — chưa có PR* |
| **V&V** · [TEST_PLAN](./07-verification/TEST_PLAN.md), [TEST_CASES](./07-verification/TEST_CASES.md), [RTM](./07-verification/RTM.md), [TEST_REPORT](./07-verification/TEST_REPORT.md) | 51/51 PASS, 26/26 AC, **NotRun tách riêng 7 mục** ([§5](./07-verification/TEST_REPORT.md#5-what-was-not-tested-notrun--đếm-riêng-không-tính-là-pass)) | Sinh TC theo kỹ thuật (boundary, state, decision table), E2E trên browser, mutation (2–3) | Oracle = AC viết trước; verdict GO with conditions; ☐ QA ký | Viết 1 **mutant tương đương** (sai) → loại ([TC-44](./07-verification/evidence/ops-2026-11-02/TC-44-mutation-before.json)) | **Mutation score 93.8 % → 100 %** · 11 defect tìm được (proxy) · judge agreement: *trống — không dùng LLM judge* |
| **Release & Operations** · [RELEASE-1.1.0](./09-release/RELEASE-1.1.0.md) (SBOM, AI-BOM, SLI/SLO), [RUNBOOK](./10-operations/RUNBOOK.md) | Checklist 12 dòng, **restore đã thử** ([TC-40](./07-verification/evidence/ops-2026-11-02/TC-40-restore-drill.log)); tag `r1.1`: *trống — chưa commit* | Tổng hợp evidence, nháp release note (2) | ☐ Go/No-Go; lệnh trên dữ liệu do người chạy | — (chưa gặp đề xuất lệnh phá dữ liệu) | Thời gian restore 3.7 s (proxy) · lead time tới R1: *trống — chưa tag* |
| **Maintenance** · [CR-R11-01](./12-maintenance/CR-R11-01.md), [golden master](../app/tests/characterization/golden-v1.0.0.json) | Change approval trước khi sửa (☐ ký); **characterization pass trước và sau** (TC-43) | Characterization test, viết lại UI, impact analysis (3) | Phân loại hành vi giữ/thay: chỉ DEF-008 được đổi có chủ đích | Search render cả trang làm hỏng bộ gõ TV (DEF-009) — phát hiện bằng E2E, không phải test tự động | Tương tác API giữ nguyên 18/18 (proxy) |

Ô trống cần làm: commit + tag `r1.0`/`r1.1` + CI (NR-01) → điền commit cho cột Gate; PR lead time và lead time tới R1 sau khi dùng PR.

## 2. Truy vết một nhu cầu rủi ro cao qua 7 mắt xích (slide B10 #12)

**Nhu cầu:** *"Chỉ quản lý trực tiếp mới được duyệt/từ chối đơn; không ai tự duyệt đơn của mình"* (BR-04, rủi ro cao vì là phân quyền).

| Mắt xích | Câu hỏi kiểm | Trả lời + link |
|---|---|---|
| 1. Yêu cầu, expected | Expected viết trước khi giao agent? Có nhánh sai quyền? | Có — [AC-08.1](./03-analysis/USER_STORIES.md#us-08--chỉ-đúng-người-được-duyệt--p0) liệt kê 3 nhánh bị chặn (nhân viên khác, chính chủ, quản lý nhóm khác) |
| 2. Prototype & API | Response có lộ gì cho người không có quyền? | 403 không kèm dữ liệu đơn — [api.md §3](./04-design/api.md#3-bảng-mã-lỗi); UI chỉ hiện nút Duyệt cho quản lý ([ảnh 26](./07-verification/evidence/ui-r1.1-2026-11-02/26-manager-inbox.jpg)) |
| 3. Dữ liệu | Người duyệt lưu ở đâu, ai đọc? | `approverId` gán lúc tạo = `managerId` ([DI-02, DI-07](./04-design/data/model.md#3-ràng-buộc-toàn-vẹn-được-enforce-ở-code)) |
| 4. Code & test | Test có trước? Được hook/CI bảo vệ? | [TC-20](./07-verification/TEST_CASES.md) trong `leave.service.test.js` — nằm trong [approved-tests.txt](../.claude/approved-tests.txt); mutant "any manager may approve" bị diệt ([TC-44](./07-verification/evidence/ops-2026-11-02/TC-44-mutation-after.json)) |
| 5. Kiểm chứng | Verdict chạy trên commit nào? Kiểm bằng tài khoản khác? | Có — TC-20 dùng u1, u2, u4 (quản lý khác); commit: *trống — chưa commit* ([junit.xml](./07-verification/evidence/RUN-2026-11-02-6996dae-local-node22/junit.xml)) |
| 6. Bản phát hành R1 | Evidence ở dòng nào của checklist? | [RELEASE-1.1.0 §1](./09-release/RELEASE-1.1.0.md#1-release-checklist-có-ký) dòng 4–6; tag `r1.0`: *trống* |
| 7. Thay đổi ở R1.1 | CR-R11-01 có chạm nhu cầu này? Regression nào chứng minh còn đúng? | Chạm UI (nút Duyệt chỉ hiện ở hộp duyệt) — golden master có 2 tương tác 403 khi `u1`/`u2` duyệt ([TC-43](../app/tests/characterization/golden-v1.0.0.json)), PASS sau R1.1 |

## 3. Tự kiểm theo slide 10 — "Đúng hay sai? (2/2)"

| Hiểu sai (slide 10) | Dự án này làm gì để không mắc |
|---|---|
| "CI pass là phát hành được" | Release checklist 12 dòng có người ký, evidence đúng commit, restore ([RELEASE-1.1.0](./09-release/RELEASE-1.1.0.md)) |
| "Có file backup là khôi phục được" | Đã **restore thử** từ file hỏng → phục hồi 3.7 s ([TC-40](./07-verification/evidence/ops-2026-11-02/TC-40-restore-drill.log)); kiểm quyền = NotRun NR-07 (ghi rõ) |
| "Agent refactor, CI pass là giữ hành vi" | Characterization golden master **trước** lần sửa đầu, pass sau mỗi bước ([CR-R11-01 §4](./12-maintenance/CR-R11-01.md#4-behavior-preservation-gate-của-buổi-9)) |
| "Đổi model/prompt chỉ là đổi cấu hình" | [AI-BOM](./09-release/RELEASE-1.1.0.md#4-ai-bom-ai-bill-of-materials) ghi model, prompt, subagent; quy tắc: đổi → chạy lại audit + release note |
| "Agent báo không thể rollback thì không rollback được" | Rollback tự kiểm: không migration, `git checkout r1.0` dùng chung `db.json` ([§6](./09-release/RELEASE-1.1.0.md#6-rollback)) |
| "Tỷ lệ code AI cao là năng suất cao" | Không đo % code AI; đo outcome: defect tìm được trước release, Fail audit đóng, mutation score ([delivery-log](./ai/delivery-log.csv)) |
| (slide 9) "Coverage cao là test tốt" | Mutation score 100 %, oracle = AC viết trước |
| (slide 9) "NotRun không fail thì tính là đạt" | NotRun đếm riêng 7 mục có owner ([TEST_REPORT §5](./07-verification/TEST_REPORT.md#5-what-was-not-tested-notrun--đếm-riêng-không-tính-là-pass)) |
| (slide 9) "Ghi rule trong AGENTS.md là chặn được" | Rule trong CLAUDE.md **và** enforce bằng [hook](../.claude/settings.json) + [CI guard](../.github/workflows/ci.yml) |
| (slide 9) "Finding của AI review là lỗi thật" | Mỗi finding được tái hiện trước khi sửa (DEF-004 bằng script, DEF-007 bằng netstat); 1 tổng số của auditor bị phát hiện cộng sai và đã sửa |

## 4. Playbook 3 dòng (cho quy trình thật của đội: review PR)

| Việc AI làm | Mức AI | Ai duyệt | Evidence | Công cụ & dữ liệu được phép | Guardrail |
|---|---|---|---|---|---|
| Pre-review PR theo checklist IEEE 1028, chỉ ra finding có `file:line` | 2 | Reviewer người (không phải tác giả) | Comment trên PR + checklist | Claude Code được tổ chức phê duyệt; chỉ mã nguồn repo, **không** secret/dữ liệu khách hàng | Finding phải được tái hiện trước khi sửa; agent không approve/merge |
| Sinh test case từ AC, chạy test, báo kết quả thật | 2–3 | Tác giả + reviewer | junit/log trong PR | Như trên | Test đã duyệt bị hook + CI chặn sửa |
| Nháp release note & tổng hợp evidence | 2 | Release owner | Release record | Như trên | Go/No-Go và lệnh dữ liệu do người chạy |

## 5. Lộ trình 30/60/90 ngày

| | |
|---|---|
| Owner | Nguyễn Trần Hà (một người chịu trách nhiệm cuối) |
| Quy trình | Review PR của **một** đội phát triển |
| RACI | R: tác giả PR · A: Nguyễn Trần Hà · C: tech lead · I: cả đội |
| Baseline (đo 2 tuần đầu, chưa có số) | PR lead time median · phút review/100 dòng · defect lọt sau merge/tháng — nguồn: lịch sử PR + issue tracker |
| KPI | Outcome: defect lọt sau merge ↓ · PR lead time ↓. Chỉ số AI: % finding AI được xác nhận đúng. Guardrail: không tăng defect lọt, không PR nào merge thiếu reviewer người |
| Anti-KPI (không dùng) | % code do AI viết, số PR/ngày |

| Mốc | Việc chính | Quyết định cuối mốc (người quyết) |
|---|---|---|
| 30 ngày | Đo baseline, viết Playbook §4, bật hook + CI guard, pilot Mức 2 trên 1 repo | Pilot đúng Playbook và guardrail trong ngưỡng? (Owner) |
| 60 ngày | So leading indicator với baseline, sửa Playbook theo finding sai | Nâng / giữ / hạ Mức AI (Owner + tech lead) |
| 90 ngày | So outcome + guardrail với baseline | Mở rộng / giữ / dừng (Owner) |

**Điều kiện dừng (viết trước):** defect lọt sau merge tăng > 20 % so với baseline trong 2 tuần liên tiếp, **hoặc** một PR merge không có reviewer người → dừng pilot; người quyết: Owner.
**Rủi ro:** finding AI sai làm tốn thời gian review; lộ mã nguồn vào công cụ chưa duyệt → chỉ dùng công cụ được phê duyệt.

**Checklist lộ trình (slide B10):** owner + RACI ✅ · một quy trình thật, một đội ✅ · baseline + cách thu ✅ · KPI outcome + chỉ số AI, không anti-KPI ✅ · guardrail + ngưỡng ✅ · việc + quyết định mỗi mốc ✅ · điều kiện tiếp tục/dừng viết trước ✅ · rủi ro + công cụ/dữ liệu được phép ✅ → **8/8**.
