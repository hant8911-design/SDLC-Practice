# Audit vòng 2 — Test Plan theo IEEE 829-2008

| Thuộc tính | Giá trị |
|---|---|
| Checklist | `verification/Test_Plan_IEEE_829_Checklist.xlsx` (18 dòng) |
| Artifact | `docs/07-verification/TEST_PLAN.md` (TP-LF-001 **v1.1**); đối chiếu `TEST_REPORT.md`, `evidence/` |
| Báo cáo vòng 1 | [Test_Plan_IEEE_829_audit.md](./Test_Plan_IEEE_829_audit.md) |
| Ngày | 2026-11-02 |
| Auditor | Independent auditor agent (read-only), round 2 |
| Quy tắc chấm | guidance §A8. Chỉ chấm lại dòng Fail/Partial vòng 1; Pass giữ nguyên. Spot-check Pass: không hồi quy. Ghi nhận: run `RUN-2026-11-02-6996dae-local-node22` (14:01:57Z) chạy **sau** lần sửa code cuối (`server.js`, `leaveService.js` 13:55Z) — evidence khớp mã hiện tại. |

## 1. Các dòng được chấm lại

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 2 | Introduction | Partial | **Pass** | TEST_PLAN §2: mô tả LeaveFlow (web app một tiến trình Node.js), mục tiêu (10 FR, 8 NFR, 21 AC trước review/release), tài liệu tham chiếu (PRD v1.1, US, SAD, API, SDP, IEEE 829); level ở §6 | — |
| 12 | Responsibilities | Partial | **Pass** | TEST_PLAN §11 bảng 7 việc: thiết kế TC, dữ liệu test, chạy tự động, UI thủ công, phân loại defect + suspend/resume, viết report/RTM, duyệt — mỗi việc có người thực hiện và người chịu trách nhiệm là người (Owner/Mentor), không phải AI agent | — |
| 13 | Staffing & Training Needs | **Fail** | **Pass** | TEST_PLAN §11 đoạn "Nhân sự & đào tạo": 1 owner + AI agent, không cần tester chuyên trách; kiến thức cần (`node:test`, boundary/state-transition) và cách bù (prompt `TestCase_RTM_IEEE_829_Prompt.md`); yêu cầu với QA reviewer | Gợi ý: thêm a11y/WCAG và OWASP cơ bản vào kiến thức cần (đã được kiểm thử ở TC-38, TC-41). |
| 14 | Testing Tasks | Partial | **Partial** | TEST_PLAN §11 liệt kê việc theo thứ tự có người thực hiện/chịu trách nhiệm/ngày. Thiếu bước **retest + chạy lại hồi quy sau sửa defect** (thực tế đã làm: TEST_REPORT V-3, V-8, DEF-001…007 retest) và không có cột output/phụ thuộc. | Thêm bước "Retest DEF + chạy lại toàn bộ suite" và cột Output (vd. `evidence/<run-id>/`, TEST_REPORT). Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 16 | Schedule | Partial | **Pass** | TEST_PLAN §11 cột "Ngày" có ngày cho từng việc (2026-11-02) và hạn duyệt "Trước 2026-11-05 (mốc release, SDP §4)"; §12 entry ghi trung thực "`plan-v1` khi commit"; sai lệch chạy trước khi ký ghi ở TEST_REPORT V-6 | — |
| 18 | Approvals | **Fail** | **Partial** | TEST_PLAN §14 Approvals (Tác giả; QA reviewer – Mentor ☐; PO ☐); trạng thái header sửa thành "Draft v1.1 — **chưa có chữ ký phê duyệt**; các run đã thực hiện trước khi plan được ký (V-6)" — trình bày trung thực, không còn mâu thuẫn "Approved". Chữ ký còn treo theo thiết kế (agent không phê duyệt). | QA reviewer (mentor) và PO ký §14, xác nhận hồi tố V-6. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |

## 2. Ghi chú ngoài checklist (không đổi điểm)

- §6 sơ đồ level chỉ liệt kê tới TC-37; TC-38…TC-42 (XSS UI, capacity, restore drill, mobile, bind check) được thêm ngoài plan và ghi ở TEST_REPORT V-1, V-7, V-8 — nên cập nhật §6 cho khớp.
- TEST_REPORT dòng 27 ghi "Khuyến nghị: GO" trong khi §7 (dòng 191) ghi "GO WITH CONDITIONS" — nên thống nhất.

## 3. Tổng kết toàn checklist sau vòng 2

| | Pass | Partial | Fail | N/A | Rows |
|---|---|---|---|---|---|
| Vòng 1 | 12 | 4 | 2 | 0 | 18 |
| **Vòng 2** | **16** | **2** | **0** | **0** | **18** |

**Kết luận gate:** 0 Fail. 2 Partial (#14, #18) có action, owner, hạn; #18 chỉ đóng khi người duyệt ký.
