# ADR-001 — Dùng Node.js thuần, không framework

| Trạng thái | Accepted · 2026-11-02 · Người quyết định: Nguyễn Trần Hà (Tech lead review: chờ ký) |
|---|---|
| Liên quan | NFR-01, NFR-06, CON-01 |

## Context
Ứng dụng nhỏ (9 endpoint, 1 trang). Máy học viên có thể không cài được package (proxy/SSL công ty —
chính lúc clone repo này đã gặp lỗi chứng chỉ SSL). Cần chạy được ngay với `node` và test không cần cài thêm.

## Options
| Phương án | Ưu | Nhược |
|---|---|---|
| A. Express + Jest + React | Quen thuộc, hệ sinh thái lớn | ~300 package, cần `npm install`, build frontend |
| **B. `node:http` + `node:test` + vanilla JS** | 0 dependency, khởi động < 100 ms, không supply-chain risk | Tự viết router nhỏ, ít tiện ích |
| C. Python Flask | Gọn | Thêm runtime, vẫn cần `pip install` |

## Decision
Chọn **B**. Router là bảng `[method, regex, handler]` trong `server.js`; test dùng `node --test` và
`--experimental-test-coverage`.

## Consequences
- (+) `npm start` / `npm test` chạy ngay sau clone; CI đơn giản; bề mặt tấn công phụ thuộc = 0.
- (−) Không có middleware sẵn (CORS, helmet) — chấp nhận vì chỉ chạy local; xem lại ở v2.0.
- (−) Coverage là tính năng experimental của Node 22 — chấp nhận, kết quả được lưu làm evidence mỗi run.
