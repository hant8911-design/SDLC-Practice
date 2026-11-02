# Audit — Test Plan theo IEEE 829-2008

| Thuộc tính | Giá trị |
|---|---|
| Checklist | `verification/Test_Plan_IEEE_829_Checklist.xlsx` (18 dòng) |
| Artifact | `docs/07-verification/TEST_PLAN.md` (TP-LF-001 v1.0); tham chiếu `TEST_CASES.md`, `RTM.md`, `TEST_REPORT.md` (TSR-LF-001) |
| Ngày | 2026-11-02 |
| Auditor | Independent auditor agent (read-only) |
| Quy tắc chấm | guidance §A8 — Pass cần evidence mở được; Partial cần owner + hạn; Fail là blocking cho gate |

> Auditor không sửa artifact. Owner đề xuất cho mọi action: Nguyễn Trần Hà; QA reviewer (mentor) cho phần phê duyệt. Hạn đề xuất: 2026-11-04 (trước release 2026-11-05).

| # | Category | Checklist Item | Status | Evidence | Notes / Action |
|---|---|---|---|---|---|
| 1 | 1. Document Metadata | Test Plan Identifier | Pass | TEST_PLAN header "Mã tài liệu TP-LF-001", "Phiên bản 1.0"; §1 | ID duy nhất có version. Lưu ý: file chưa được commit (`git status` untracked) nên "version-controlled" chưa thực sự đạt — xử lý cùng SCM ở DevPlan audit #20. |
| 2 | 1. Document Metadata | Introduction | Partial | TEST_PLAN §2 (1 câu: xác minh 10 FR, 6 NFR, 21 AC) | Không tóm tắt phần mềm được kiểm thử (LeaveFlow là gì, người dùng, kiến trúc), không nêu mục tiêu/phạm vi plan (level nào, release nào, tài liệu tham chiếu). Action: mở rộng §2 thành 1 đoạn: mô tả LeaveFlow, mục tiêu plan, phạm vi level, references (PRD, SAD, IEEE 829). |
| 3 | 2. Scope & Features | Test Items | Pass | TEST_PLAN §3 bảng 5 item CMP-01…05 với version 1.0.0 và đường dẫn file | Gợi ý: ghi thêm commit/build id của item để khớp TEST_REPORT. |
| 4 | 2. Scope & Features | Features to be Tested | Pass | TEST_PLAN §4 (FR-01…10, NFR-01…06); TEST_CASES ánh xạ AC/FR → TC; RTM | Đầy đủ, truy vết được. |
| 5 | 2. Scope & Features | Features Not to be Tested | Pass | TEST_PLAN §5 (SSO, đa trình duyệt/mobile, tải đồng thời, ngày lễ/nửa ngày — có lý do) | Ranh giới rõ, có lý do. |
| 6 | 3. Approach & Methodology | Testing Approach | Pass | TEST_PLAN §6 (3 level Unit/API/UI, sơ đồ; EP, BVA, state transition, decision table, negative/security, exploratory; nguyên tắc chống test tự chứng minh) | Tốt. |
| 7 | 3. Approach & Methodology | Automation vs Manual | Pass | TEST_PLAN §6: L1/L2 tự động `node:test` (TC-01…32), L3 thủ công Browser pane (TC-33…37); §10 CI GitHub Actions; §13 E2E tự động ở v1.1 | Phân chia rõ. Lưu ý: CI chưa chạy (TEST_REPORT V-4). |
| 8 | 4. Pass/Fail & Lifecycle | Item Pass/Fail Criteria | Pass | TEST_PLAN §7 (assertion pass, p95 < 200 ms, coverage ≥ 80 %/file, UI khớp Expected + ảnh); §12 Exit (100 % AC có TC PASS, 0 defect High mở) | Đo được. Gợi ý: nêu ngưỡng riêng cho NFR-03/04/06 trong §7 thay vì chỉ "NFR đo đạt ngưỡng". |
| 9 | 4. Pass/Fail & Lifecycle | Suspension Criteria | Pass | TEST_PLAN §8 "Dừng nếu lint fail hoặc > 20 % test fail (lỗi môi trường)" | Có ngưỡng cụ thể. |
| 10 | 4. Pass/Fail & Lifecycle | Resumption Requirements | Pass | TEST_PLAN §8 "tiếp tục khi build lại xanh"; "Không sửa source/test giữa một run; lỗi → DEF-xxx, sửa ở run sau" | Điều kiện tiếp tục đo được. Gợi ý: nêu rõ chạy lại toàn bộ suite (regression) sau resume — đã làm thực tế (TEST_REPORT V-3). |
| 11 | 5. Environment & Resources | Environmental Needs | Pass | TEST_PLAN §10 (OS, Node v22.0.0, Chromium Browser pane 800×600, seed u1–u3 + u4/u5, CI ubuntu Node 22) | Đầy đủ cho quy mô. |
| 12 | 5. Environment & Resources | Responsibilities | Partial | TEST_PLAN §11 (viết & chạy test tự động: AI agent + owner review; UI thủ công: owner + agent; duyệt: QA reviewer) | Thiếu người thiết kế test case (TEST_CASES), người quản lý dữ liệu test/seed, người triage & đóng defect, người quyết định suspend/resume. Action: thêm bảng trách nhiệm theo hoạt động (design TC, test data, execution, defect triage, report, approval), chỉ định người (không phải AI agent) chịu trách nhiệm cuối. |
| 13 | 5. Environment & Resources | Staffing & Training Needs | Fail | Không có mục staffing/training trong TEST_PLAN | Action: thêm mục "Staffing & training": số người (1 owner + QA reviewer), kiến thức cần (chính sách phép SRC-003, `node:test`, kiểm thử a11y/WCAG, OWASP cơ bản cho XSS/traversal), cách bù (đọc glossary, checklist UI). |
| 14 | 6. Execution & Delivery | Testing Tasks | Partial | TEST_PLAN §11 (3 việc lớn); §12 Entry/Exit; TASK-07 | Chưa phân rã thành các bước có thứ tự và người thực hiện (chuẩn bị môi trường → chạy `npm run test:report` → UI session → ghi DEF → retest → report → ký). Action: thêm bảng testing tasks (bước, phụ thuộc, người, output). |
| 15 | 6. Execution & Delivery | Test Deliverables | Pass | TEST_PLAN §9 (TEST_CASES, RTM, `evidence/<run-id>/`, TEST_REPORT); các file tồn tại trong `docs/07-verification/` và `evidence/RUN-2026-11-02-6996dae-local-node22/` | Có và đã giao. Gợi ý: thêm defect log (hiện nằm trong TEST_REPORT §6) vào danh sách deliverable. |
| 16 | 6. Execution & Delivery | Schedule | Partial | TEST_PLAN §11 cột "Khi" (2026-11-02; "Sau report"); SDP §4 Gantt | Không có mốc test cụ thể (entry, hoàn tất run tự động, UI session, retest, hạn ký duyệt) gắn với milestone release 2026-11-05; "Sau report" không phải ngày. Entry criterion `plan-v1` baseline (§12) không kiểm chứng được — tag không tồn tại. Action: thêm lịch test có ngày cho từng mốc, khớp SDP §4, và hạn ký của QA reviewer. |
| 17 | 7. Risk Management | Risks & Contingencies | Pass | TEST_PLAN §13 (đồng hồ hệ thống → `fixedClock`; coverage experimental → lưu log; UI chỉ thủ công → ảnh + E2E v1.1); §5 rủi ro đa trình duyệt | Có rủi ro + giảm thiểu. Gợi ý: thêm RISK-03 (múi giờ UTC) và rủi ro reviewer chậm (RISK-06). |
| 18 | 7. Risk Management | Approvals | Fail | TEST_PLAN header "Trạng thái: Approved for execution — chờ QA reviewer ký"; không có mục sign-off | Không có mục phê duyệt chỉ định người ký; trạng thái tự mâu thuẫn ("Approved" nhưng chưa ai ký). Test đã chạy trước khi plan được duyệt. Action: thêm mục "Approvals" (QA reviewer – mentor, Tech lead, Owner: tên/quyết định/ngày), sửa trạng thái thành "Draft — chờ duyệt" cho tới khi có chữ ký. |

**Tổng:** Pass 12 · Partial 4 · Fail 2 · N/A 0 (18 dòng).

**Kết luận gate:** 2 Fail (#13 Staffing & Training Needs, #18 Approvals) là blocking theo guidance §A8. Nội dung kỹ thuật của plan (scope, approach, tiêu chí, môi trường) tốt; thiếu sót tập trung ở phần quản lý (con người, lịch, phê duyệt).
