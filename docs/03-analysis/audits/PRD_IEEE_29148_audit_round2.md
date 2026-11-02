# Audit vòng 2 — PRD theo ISO/IEC/IEEE 29148

| Thuộc tính | Giá trị |
|---|---|
| Checklist | `analysis/PRD_IEEE_29148_Checklist.xlsx` (20 dòng) |
| Artifact | `docs/03-analysis/PRD.md` (PRD-LF-001 **v1.1**), `USER_STORIES.md` (US-LF-001), `traceability.md` (TRC-LF-001 v1.2) |
| Báo cáo vòng 1 | [PRD_IEEE_29148_audit.md](./PRD_IEEE_29148_audit.md) |
| Ngày | 2026-11-02 |
| Auditor | Independent auditor agent (read-only), round 2 |
| Quy tắc chấm | guidance §A8. Chỉ chấm lại dòng Fail/Partial vòng 1; Pass/N/A giữ nguyên (spot-check #7, #12, #19: không hồi quy — NFR-07/08 đã có TC-39/TC-40 trong traceability §2). |

## 1. Các dòng được chấm lại

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 1 | Purpose & Scope | Partial | **Pass** | PRD §1.1 System boundary (Mermaid: Employee, Manager, file dữ liệu cục bộ, HR và SSO ngoài phạm vi) + "Không có hệ thống ngoài nào được tích hợp trong v1.0" | — |
| 3 | User Characteristics | Partial | **Pass** | PRD §2 thêm persona "HR — chủ quy trình (không phải người dùng hệ thống ở v1.0)" và đoạn "Đặc điểm người dùng" (kỹ năng web/email, laptop/máy bàn, tần suất); US-07 đổi thành "nhân viên hoặc quản lý", US-08 ghi rõ HR không đăng nhập | — |
| 4 | Operating Environment | Partial | **Pass** | PRD §4.2: Windows/macOS/Linux, Chrome/Edge/Firefox hiện hành, một instance trên localhost; §4.1 Node.js ≥ 22, file JSON cục bộ | — |
| 5 | Singular & Complete | Partial | **Partial** | PRD §3 không đổi: FR-02 vẫn gộp ~8 điều kiện, FR-04 gộp công thức + chặn vượt + SICK/UNPAID, FR-08 gộp duyệt và từ chối, FR-09 gộp 4 quy tắc quyền | Tách FR con (FR-02.1…, FR-09.1…) hoặc đánh số quy tắc trong từng FR để truy vết tới TC. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 6 | Implementation-Free | Partial | **Partial** | Vẫn còn chi tiết hiện thực: FR-01 tên trường JSON (`type`, `startDate`…), NFR-03 "tmp + rename", NFR-04 "escape HTML", NFR-06 `npm start`, §5 `role="alert"`, `aria-live` | Chuyển cơ chế sang SAD/api.md/UX; PRD giữ tiêu chí "what". Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 8 | Performance & Capacity | Partial | **Partial** | Đã có NFR-07 capacity (≤ 20 người, ≤ 10 000 đơn, 1 tiến trình), đo ở `evidence/ops-2026-11-02/TC-39-capacity.json`. Còn thiếu: số người dùng/request đồng thời và cấu hình "máy dev" của NFR-01 vẫn không xác định trong PRD | Bổ sung số request đồng thời được hỗ trợ (hoặc tuyên bố "tuần tự, 1 người dùng/lần" có lý do) và dẫn chiếu cấu hình máy đo (TEST_PLAN §10). Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 9 | Security & Privacy | Partial | **Pass** | PRD §4.2 "Bảo mật: chỉ bind localhost vì `X-User-Id` giả mạo được (ADR-003); không mã hóa dữ liệu lưu trữ vì không có dữ liệu thật"; §4.1 không HTTPS ở v1.0; BNFR-07 (dữ liệu thật chỉ sau xác thực thật v2.0). Đối chiếu code: `app/src/server.js` `host = process.env.HOST \|\| '127.0.0.1'`; evidence `TC-42-bind-check.txt` | Gợi ý (không chặn): thêm yêu cầu log sự kiện bảo mật (401/403). |
| 10 | Reliability & Availability | Partial | **Pass** | NFR-08: giờ hành chính, RTO ≤ 1 giờ, RPO = backup cuối ngày, `db.json` hỏng → restore; diễn tập `TC-40-restore-drill.log` (3.7 s) | — |
| 11 | Scalability | **Fail** | **Pass** | NFR-07 nêu giới hạn v1.0 (1 nhóm ≤ 20 người, ≤ 10 000 đơn, 1 tiến trình) và ngưỡng hành động "Vượt ngưỡng → đổi store (ADR-002)"; theo dõi qua RUNBOOK §3 (`db.json` > 5 MB) | — |
| 14 | Software Interfaces | Partial | **Pass** | PRD §4.1 "Software interface": OS + Node.js ≥ 22, file JSON cục bộ, "không tích hợp hệ thống ngoài" | — |
| 15 | Communication Interfaces | **Fail** | **Pass** | PRD §4.1 "Communication interface": HTTP/1.1 trên localhost, không HTTPS ở v1.0, REST + JSON UTF-8, header `X-User-Id`, body ≤ 10 KB, link api.md | — |
| 16 | Design Constraints | Partial | **Pass** | PRD §4.2 gom ràng buộc: BC-01…BC-05 (BRD §3.1), không dữ liệu cá nhân thật (BNFR-07), localhost/ADR-003; §4.1 Node ≥ 22 + file JSON; NFR-06 0 dependency; §7 `<dialog>` | Gợi ý: dẫn chiếu trực tiếp ADR-002 trong §4.2. |
| 17 | Dependencies | Partial | **Pass** | PRD §4.2 "Phụ thuộc: DEP-01…DEP-04 (BRD §11.2b)" — dữ liệu số dư, danh sách nhân sự, Node.js, SSO v2.0 | Gợi ý: GitHub Actions (CI) chưa có trong danh sách phụ thuộc. |
| 20 | Consistent | Partial | **Pass** | US-07 nay "Là nhân viên hoặc quản lý" (khớp FR-09: chỉ người tạo + approver xem chi tiết); US-08 ghi HR là chủ quy tắc, không đăng nhập; traceability.md §1 đã có cạnh `BO3 --> BR04` khớp BRD §11.1 | Lưu ý: cạnh BO → BR-06 vẫn thiếu ở cả BRD §11.1 và traceability §1 (chấm ở BRD audit vòng 2 #13). |

## 2. Ghi chú ngoài checklist

- Trạng thái PRD "Sẵn sàng baseline — tag `analysis-v1` sẽ được tạo khi commit; chờ PO + Tech lead ký" là trung thực (`git tag` rỗng, `docs/` untracked).
- `USER_STORIES.md` đã sửa nội dung US-07/US-08 nhưng header vẫn "v1.0" — nên tăng version (v1.1) và ghi vào change record SDP §10.
- `prd-audit.md` (tự audit trước vòng 1) chưa được cập nhật theo PRD v1.1.

## 3. Tổng kết toàn checklist sau vòng 2

| | Pass | Partial | Fail | N/A | Rows |
|---|---|---|---|---|---|
| Vòng 1 | 5 | 12 | 2 | 1 | 20 |
| **Vòng 2** | **16** | **3** | **0** | **1** | **20** |

**Kết luận gate:** 0 Fail. 3 Partial (#5, #6, #8) có action, owner, hạn. N/A #13 Hardware Interfaces giữ nguyên (PRD §4.1 "N/A — không có thiết bị chuyên dụng"). Baseline `analysis-v1` chờ chữ ký PO + Tech lead và tag khi commit.
