# Intent — LeaveFlow (Quản lý đơn nghỉ phép)

| Thuộc tính | Giá trị |
|---|---|
| Mã tài liệu | INT-LF-001 |
| Phiên bản | 1.0 |
| Trạng thái | Sẵn sàng baseline — tag `intake-v1` sẽ được tạo khi commit; chờ requester ký xác nhận |
| Owner | Nguyễn Trần Hà (human owner) |
| Ngày | 2026-11-02 |
| Prompt | `requirements/Intake_Intent_Prompt.md` v2.0 |
| Nguồn | [sources.md](./sources.md) SRC-001…SRC-003 |

> **Bối cảnh bài tập:** LeaveFlow là ứng dụng nhỏ được dựng để chứng minh toàn bộ quy trình Agentic SDLC của khóa học.
> Công ty, nhân vật và số liệu baseline là **giả định** (đánh dấu `[GIẢ ĐỊNH]`), nhưng mọi artifact, test và evidence là thật.

## 1. Problem

Một nhóm phát triển 15 người đang xin nghỉ phép qua **email + file Excel** do HR tổng hợp thủ công:

- Quản lý mất trung bình **~2 ngày làm việc** mới phản hồi vì email bị trôi `[GIẢ ĐỊNH, SRC-001]`.
- HR ghi nhầm số dư phép **~5 lần/quý** do cộng tay `[GIẢ ĐỊNH, SRC-002]`.
- Không có lịch sử ai duyệt, khi nào, vì sao từ chối → khó giải trình khi có khiếu nại.

## 2. Proposed outcome

Một web app nội bộ nơi nhân viên gửi đơn, hệ thống **tự kiểm tra hợp lệ và số dư**, quản lý trực tiếp
duyệt/từ chối trên một màn hình, và mọi thay đổi trạng thái đều được **lưu vết**.

## 3. Affected users

| Nhóm | Số lượng | Tác động |
|---|---|---|
| Nhân viên (EMPLOYEE) | ~13 | Gửi, theo dõi, hủy đơn; xem số dư |
| Quản lý trực tiếp (MANAGER) | 2 | Duyệt / từ chối đơn của nhân viên mình |
| HR | 1 | Không còn phải cộng tay số dư; tra cứu lịch sử |

## 4. Constraints

- Thời gian: hoàn thành trong 1 vòng bài tập; ứng dụng **nhỏ, chạy local**.
- Công nghệ: Node.js ≥ 22, **không dependency ngoài** (dễ chạy trên máy học viên, không cần mạng/npm install).
- Không xử lý dữ liệu cá nhân thật; chỉ dùng người dùng demo.
- Chính sách phép: 12 ngày phép năm / người / năm dương lịch; chỉ tính ngày làm việc (T2–T6) [SRC-003].

## 5. Success measures

| ID | Thước đo | Baseline | Target | Cách đo |
|---|---|---|---|---|
| SM-01 | Thời gian từ lúc gửi đến lúc quản lý quyết định (median) | ~2 ngày `[GIẢ ĐỊNH]` | ≤ 4 giờ làm việc | `updatedAt − createdAt` của đơn APPROVED/REJECTED trong `db.json` sau 1 tháng dùng |
| SM-02 | Số lỗi số dư phép mỗi quý | ~5 `[GIẢ ĐỊNH]` | 0 | Đối soát số dư hệ thống với HR cuối quý; test TC-11/15/16/18 bảo vệ quy tắc |
| SM-03 | Tỷ lệ đơn có lịch sử trạng thái đầy đủ | 0 % | 100 % | Mỗi đơn có ≥ 1 bản ghi `history`; test TC-12/22 |
| SM-04 | Chất lượng bản phát hành | — | 100 % AC có test PASS, coverage dòng ≥ 80 % mỗi file `src/` | `TEST_REPORT.md`, `evidence/<run-id>/summary.json` |

## 6. Out of scope

- Đăng nhập thật (SSO/LDAP/mật khẩu) — giả lập bằng chọn người dùng demo (ADR-003).
- Ngày lễ, nghỉ nửa ngày, chuyển phép sang năm sau, phép theo thâm niên.
- Email/Slack notification, mobile app, báo cáo cho HR, tích hợp payroll.
- Nhiều cấp duyệt; ủy quyền duyệt khi quản lý vắng.

## 7. Open questions

| ID | Câu hỏi | Người trả lời | Hạn | Trạng thái |
|---|---|---|---|---|
| OQ-01 | Có tính ngày lễ quốc gia khi đếm ngày nghỉ không? | HR (STK-03) | 2026-11-02 | **Đóng** — Không trong v1.0, ghi vào Out of scope |
| OQ-02 | Đơn đang chờ có "giữ chỗ" số dư không? | HR (STK-03) | 2026-11-02 | **Đóng** — Có, để tránh xin vượt (BR-03) |
| OQ-03 | Quản lý có được tự tạo đơn nghỉ trong app không? | PO | 2026-11-02 | **Đóng** — Không trong v1.0 (quản lý không có cấp trên trong hệ thống) |
| OQ-04 | Có cần SSO trước khi dùng thật không? | Tech lead | Trước v2.0 | **Mở** — ghi nhận RISK-01, không chặn v1.0 demo |

## Risk tier & approvals

| Mục | Giá trị |
|---|---|
| Risk tier đề xuất | **Medium** — có business logic, API và phân quyền (SOP §5.1), nhưng không có dữ liệu nhạy cảm thật, không production |
| Controls bắt buộc | Human owner; AC được ghi; test tập trung; review có chú ý bảo mật; CI checks |
| Approvals cần có | PO (intent, BRD, PRD) · Tech lead (design, plan) · Reviewer độc lập (code) · Release owner (release) |
| Ràng buộc agent | AI agent chỉ soạn nháp, sinh code/test, chạy kiểm thử; **không** tự phê duyệt, merge hay release |
