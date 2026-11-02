# Audit vòng 2 — BRD theo ISO/IEC/IEEE 29148

| Thuộc tính | Giá trị |
|---|---|
| Checklist | `analysis/BRD_IEEE_29148_Checklist.xlsx` (20 dòng) |
| Artifact | `docs/02-requirements/BRD.md` (BRD-LF-001 **v1.1**), `docs/01-intake/*`, `docs/03-analysis/traceability.md` (đối chiếu) |
| Báo cáo vòng 1 | [BRD_IEEE_29148_audit.md](./BRD_IEEE_29148_audit.md) |
| Ngày | 2026-11-02 |
| Auditor | Independent auditor agent (read-only), round 2 |
| Quy tắc chấm | guidance §A8 — Pass cần evidence mở được; Partial cần owner + hạn; Fail chặn gate. Chỉ chấm lại các dòng Fail/Partial của vòng 1; dòng Pass/N/A giữ nguyên (đã spot-check, không thấy hồi quy). |

## 1. Các dòng được chấm lại

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 4 | Vision Statement | Partial | **Pass** | BRD §1 "**Tầm nhìn:** Xin nghỉ và duyệt nghỉ trong vài giây, số dư phép luôn đúng, mọi quyết định đều có dấu vết"; gắn với driver §4 (Hiệu quả, Chính xác, Minh bạch) | — |
| 6 | User Personas & Profile Characteristics | Partial | **Partial** | BRD không thay đổi phần này: không có bảng user class (kỹ năng, tần suất, thiết bị) trong BRD. PRD §2 đã thêm persona HR và "Đặc điểm người dùng", nhưng BRD không tham chiếu tới đó. | Thêm bảng user class vào BRD (vai trò, số lượng, kỹ năng, tần suất, thiết bị, gồm HR) hoặc ít nhất dẫn chiếu PRD §2. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 7 | Business Constraints | Partial | **Pass** | BRD §3.1 BC-01…BC-05 (ngân sách 0, release 2026-11-05, chính sách SRC-003, không dữ liệu cá nhân thật, nguồn lực) | — |
| 10 | Operational Scenario & Use Cases | Partial | **Pass** | BRD §6 bảng OS-01…OS-05 (gửi đơn, đơn trùng, duyệt/từ chối, hủy, tra cứu khi có khiếu nại — HR không có tài khoản ở v1.0) | — |
| 11 | Singularity & Clarity | Partial | **Partial** | BNFR-01 đã định lượng ("dưới 1 giây"). Nhưng BR-02 vẫn gộp 4 điều kiện, BR-03 vẫn gộp 3 quy tắc (định mức 12 ngày, giữ chỗ, chặn vượt) và không có động từ "phải", BR-04 vẫn gộp 2 quy tắc (chỉ quản lý trực tiếp; cấm tự duyệt) — BRD §7 | Tách BR-03 → BR-03a/b/c, BR-04 → BR-04a/b (hoặc đánh số quy tắc con), viết BR-03 theo mẫu "Hệ thống phải…". Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 12 | Completeness & Implementation-Free | Partial | **Pass** | BNFR-05 nay trung lập công nghệ (BRD §8); nhu cầu HR tra cứu được xử lý rõ là ngoài phạm vi tài khoản v1.0 (OS-05; PRD §1.1 "HR ngoài phạm vi v1.0"); số dư đầu kỳ từ `Leave_2026.xlsx` có RISK-08 + DEP-01 (§11.2, §11.2b) | — |
| 13 | Traceability & Rationale | Partial | **Partial** | §8 BNFR-01…07 nay có cột ưu tiên, nguồn/lý do, PRD. Bảng §7 gắn BR-06 → BO-02. **Nhưng** sơ đồ §11.1 vẫn vẽ `STK1 --> BR06` (không có BO), và `traceability.md` §1 cũng không có cạnh BO → BR-06 → mâu thuẫn giữa §7 và §11.1/traceability; tuyên bố "`[ORPHAN]` Không có" của traceability §3 vì thế chưa đúng ở cấp BO→BR. | Thêm cạnh `BO2 --> BR06` vào BRD §11.1 và traceability.md §1. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 15 | Compliance & Regulatory Standards | Partial | **Partial** | BNFR-07 (giữ lịch sử ≥ hết năm phép + 1 năm; chỉ dùng dữ liệu thật sau xác thực thật + đánh giá quyền riêng tư), BC-03, BC-04. Vẫn không nêu văn bản pháp lý áp dụng nào (luật lao động về phép năm, quy định bảo vệ dữ liệu cá nhân) dù BRD tự gọi BNFR-07 là "Tuân thủ". | Thêm dòng "Quy định tham chiếu" (Bộ luật Lao động — phép năm; Nghị định 13/2023/NĐ-CP — dữ liệu cá nhân, áp dụng khi dùng thật) hoặc tuyên bố rõ phạm vi pháp lý do HR xác nhận. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 16 | Business Continuity & Availability | **Fail** | **Pass** | BRD §8 BNFR-06: giờ hành chính, RTO ≤ 1 giờ, RPO = backup cuối ngày, fallback email + nhập bù; khớp PRD NFR-08 và diễn tập restore `evidence/ops-2026-11-02/TC-40-restore-drill.log` | — |
| 18 | Business Assumptions | Partial | **Pass** | BRD §11.2 ASM-01…ASM-05 (1 quản lý trực tiếp, quản lý không xin nghỉ, trình duyệt hiện đại, baseline là giả định) | — |
| 19 | Dependencies & Constraints | **Fail** | **Pass** | BRD §11.2b DEP-01…DEP-04 (số dư `Leave_2026.xlsx`, danh sách nhân sự/quản lý, Node.js ≥ 22, SSO v2.0) có ảnh hưởng và owner | — |
| 20 | Business Risks & Mitigation | Partial | **Partial** | Thêm RISK-07 (adoption) và RISK-08 (số dư đầu kỳ) có mitigation (§11.2). Vẫn thiếu xác suất/tác động trong BRD, chưa có rủi ro "quản lý vắng, không ai duyệt" (ủy quyền ngoài phạm vi), contingency chỉ có cho RISK-07. | Thêm cột P/I và contingency cho từng rủi ro; thêm rủi ro quản lý vắng mặt. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |

## 2. Ghi chú ngoài checklist

- Trạng thái BRD "Sẵn sàng baseline — tag `requirements-v1` sẽ được tạo khi commit; chờ PO ký" là trung thực: `git tag` rỗng, `docs/` vẫn untracked; §11.3 cả hai ô ký còn trống. Chữ ký HR vẫn do PO đại diện (không độc lập).
- Header BRD trỏ kết quả checklist tới `brd-audit.md`; file đó vẫn là bản tự audit trước vòng 1 ("Không còn Fail", BRD v1.0) — đã lỗi thời so với BRD v1.1 và hai vòng audit độc lập. Nên cập nhật hoặc trỏ tới thư mục `audits/`.

## 3. Tổng kết toàn checklist sau vòng 2

| | Pass | Partial | Fail | N/A | Rows |
|---|---|---|---|---|---|
| Vòng 1 | 8 | 10 | 2 | 0 | 20 |
| **Vòng 2** | **15** | **5** | **0** | **0** | **20** |

**Kết luận gate:** 0 Fail. 5 Partial (#6, #11, #13, #15, #20) đều có action, owner và hạn → đạt điều kiện §A8 về nội dung; baseline `requirements-v1` vẫn chờ chữ ký PO và tag khi commit.
