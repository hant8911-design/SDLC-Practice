# PRD Audit — PRD-LF-001 + USER_STORIES

| Thuộc tính | Giá trị |
|---|---|
| Artifact | [PRD.md](./PRD.md) v1.1, [USER_STORIES.md](./USER_STORIES.md) v1.1, [traceability.md](./traceability.md) |
| Checklist | `analysis/PRD_IEEE_29148_Checklist.xlsx` |
| Auditor | Agent độc lập, **chỉ đọc**, phiên riêng (guidance §A8) — không phải tác giả |
| Báo cáo chi tiết | Vòng 1: [PRD_IEEE_29148_audit.md](./audits/PRD_IEEE_29148_audit.md) · Vòng 2: [PRD_IEEE_29148_audit_round2.md](./audits/PRD_IEEE_29148_audit_round2.md) |
| Ngày | 2026-11-02 |

> Bản tóm tắt trước đây của file này do tác giả tự viết và ghi "0 Fail" mà **chưa chấm từng dòng checklist** —
> đã bị auditor độc lập bác bỏ ở vòng 1. File này thay thế nó bằng kết quả audit thật.

## Kết quả

| Vòng | Pass | Partial | Fail | N/A | Dòng |
|---|---|---|---|---|---|
| 1 (v1.0) | 5 | 12 | **2** | 1 | 20 |
| 2 (v1.1) | 16 | 3 | **0** | 1 | 20 |

## Các Fail vòng 1 và cách đã sửa

| Dòng | Lỗi | Sửa (PRD v1.1) |
|---|---|---|
| #11 Scalability | Không có NFR về khả năng mở rộng | NFR-07 (≤ 20 user, ≤ 10 000 đơn, 1 tiến trình) — đo thật ở TC-39 |
| #15 Communication Interfaces | Không nêu giao thức | §4.1: HTTP/1.1 localhost, REST + JSON, `X-User-Id`, body ≤ 10 KB |
| (#20 Consistent, Partial) | US-07/08 cho "HR" xem trong khi HR không có vai trò | US-07 đổi thành nhân viên/quản lý; US-08 ghi rõ HR là stakeholder |

**Gate:** 0 Fail ở vòng 2; mọi Partial có hành động, owner Nguyễn Trần Hà và hạn (xem báo cáo vòng 2) → đủ điều kiện ký, chờ người duyệt.
