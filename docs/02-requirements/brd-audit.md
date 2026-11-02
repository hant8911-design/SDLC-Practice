# BRD Audit — BRD-LF-001

| Thuộc tính | Giá trị |
|---|---|
| Artifact | [BRD.md](./BRD.md) v1.1 |
| Checklist | `analysis/BRD_IEEE_29148_Checklist.xlsx` |
| Auditor | Agent độc lập, **chỉ đọc**, phiên riêng (guidance §A8) — không phải tác giả |
| Báo cáo chi tiết | Vòng 1: [BRD_IEEE_29148_audit.md](./audits/BRD_IEEE_29148_audit.md) · Vòng 2: [BRD_IEEE_29148_audit_round2.md](./audits/BRD_IEEE_29148_audit_round2.md) |
| Ngày | 2026-11-02 |

> Bản tóm tắt trước đây của file này do tác giả tự viết và ghi "0 Fail" mà **chưa chấm từng dòng checklist** —
> đã bị auditor độc lập bác bỏ ở vòng 1. File này thay thế nó bằng kết quả audit thật.

## Kết quả

| Vòng | Pass | Partial | Fail | N/A | Dòng |
|---|---|---|---|---|---|
| 1 (v1.0) | 8 | 10 | **2** | 0 | 20 |
| 2 (v1.1) | 15 | 5 | **0** | 0 | 20 |

## Các Fail vòng 1 và cách đã sửa

| Dòng | Lỗi | Sửa (BRD v1.1) |
|---|---|---|
| #16 Business Continuity & Availability | Không có mục tiêu sẵn sàng, RTO/RPO, fallback | BNFR-06 (RTO ≤ 1 giờ, RPO 1 ngày, fallback email) → NFR-08, đo ở TC-40 |
| #19 Dependencies & Constraints | Không có mục phụ thuộc | §3.1 BC-01…05, §11.2b DEP-01…04 |

**Gate:** 0 Fail ở vòng 2; mọi Partial có hành động, owner Nguyễn Trần Hà và hạn (xem báo cáo vòng 2) → đủ điều kiện ký, chờ người duyệt.
