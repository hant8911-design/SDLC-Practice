# ADR-003 — Giả lập định danh bằng header `X-User-Id`

| Trạng thái | Accepted cho v1.0 (có điều kiện) · 2026-11-02 · Người quyết định: Nguyễn Trần Hà |
|---|---|
| Liên quan | ASM-01, RISK-01, OQ-04, FR-09, NFR-04 |

## Context
SSO/LDAP nằm ngoài phạm vi (intent §6). Nhưng **phân quyền** (ai được duyệt/hủy/xem) là quy tắc nghiệp vụ
cốt lõi (BR-04) và phải test được.

## Decision
- Client gửi `X-User-Id`; CMP-01 tra user trong store, không có → `401 UNAUTHENTICATED`.
- **Toàn bộ kiểm tra quyền nằm ở server** (CMP-02), không tin UI. UI chỉ có ô chọn người dùng demo.
- Endpoint công khai: `/api/health`, `/api/users` (để hiển thị danh sách demo).

## Consequences
- (+) Quy tắc phân quyền được kiểm thử đầy đủ (TC-13, TC-17, TC-20, TC-22, TC-23, TC-24, TC-28).
- (−) **Không an toàn khi public**: ai cũng giả được header. Điều kiện sử dụng: chỉ chạy local/demo (RISK-01).
- Lộ trình v2.0: thay `authenticate()` bằng xác thực OIDC; chữ ký hàm giữ nguyên nên service/domain không đổi.
