# TASK-01 — Khởi tạo dự án & công cụ

| Thuộc tính | Giá trị |
|---|---|
| WBS | 1.3.1 |
| Truy vết | NFR-05, NFR-06 |
| Phụ thuộc | — |
| Ước lượng | 0.5 giờ |
| Owner | Nguyễn Trần Hà (thực hiện cùng AI agent qua `development/Implementation_Task_Prompt.md`) |
| Trạng thái | Done |

## Mục tiêu
Tạo khung `app/` chạy được với Node 22, không dependency; có lệnh lint/test và CI.

## Đầu vào
[SAD](../../04-design/SAD.md) · [api.md](../../04-design/api.md) · [USER_STORIES](../../03-analysis/USER_STORIES.md) · [TEST_CASES](../../07-verification/TEST_CASES.md)

## File được phép chạm (`FILES_ALLOWED`)
- `app/package.json`
- `app/scripts/lint.js`
- `.github/workflows/ci.yml`
- `.gitignore`

## Tiêu chí chấp nhận
- [x] `npm run lint` in `lint: OK`
- [x] `npm test` chạy (kể cả khi chưa có test)
- [x] `package.json` không có `dependencies`

## Cách kiểm chứng
`npm run lint`; xem CI chạy trên push

## Không làm (out of scope của task)
- Không thêm framework/thư viện (ADR-001)
