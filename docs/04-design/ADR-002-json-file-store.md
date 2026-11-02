# ADR-002 — Lưu trữ bằng file JSON thay vì DBMS

| Trạng thái | Accepted · 2026-11-02 · Người quyết định: Nguyễn Trần Hà (Tech lead review: chờ ký) |
|---|---|
| Liên quan | NFR-03, NFR-06, RISK-02 |

## Context
Dữ liệu rất nhỏ (≈ 15 người × vài chục đơn/năm). Cần bền vững qua restart nhưng không muốn cài DB server.
Node 22.0 chưa có `node:sqlite` ổn định; `better-sqlite3` cần build native.

## Options
| Phương án | Ưu | Nhược |
|---|---|---|
| **A. File JSON + in-memory, ghi nguyên tử** | 0 dependency, đọc cực nhanh, dễ backup (copy 1 file) | Không hỗ trợ nhiều tiến trình ghi; ghi lại cả file mỗi thay đổi |
| B. SQLite (`better-sqlite3`) | Transaction, truy vấn | Cần build native, vi phạm CON-01 |
| C. PostgreSQL | Chuẩn production | Quá nặng cho bài tập |

## Decision
Chọn **A**, cô lập sau interface `IStore`, hiện thực bởi `JsonStore` (CMP-04, SAD §3) để có thể thay bằng SQLite mà không đụng service/domain.
Ghi bằng `writeFileSync(tmp)` + `renameSync(tmp, file)` để file không bao giờ ở trạng thái ghi dở.

## Consequences
- (+) NFR-03 đạt (TC-26, TC-37); backup = copy `db.json` (runbook).
- (−) Chỉ chạy **một** tiến trình; ghi lại cả file — ổn với < 10 000 đơn. Ngưỡng chuyển đổi: > 1 nhóm hoặc > 1 instance.
