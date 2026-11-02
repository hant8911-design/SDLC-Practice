# TASK-05 — REST API adapter

| Thuộc tính | Giá trị |
|---|---|
| WBS | 1.3.5 |
| Truy vết | API-01…API-09 · NFR-01, NFR-04 |
| Phụ thuộc | TASK-04 |
| Ước lượng | 1.0 giờ |
| Owner | Nguyễn Trần Hà (thực hiện cùng AI agent qua `development/Implementation_Task_Prompt.md`) |
| Trạng thái | Done |

## Mục tiêu
HTTP server `node:http`: router, đọc body ≤ 10 KB, định danh `X-User-Id`, map lỗi → status, static file an toàn.

## Đầu vào
[SAD](../../04-design/SAD.md) · [api.md](../../04-design/api.md) · [USER_STORIES](../../03-analysis/USER_STORIES.md) · [TEST_CASES](../../07-verification/TEST_CASES.md)

## File được phép chạm (`FILES_ALLOWED`)
- `app/src/server.js`
- `app/tests/api/api.test.js`

## Tiêu chí chấp nhận
- [x] Đúng bảng mã lỗi trong `api.md` §3
- [x] Chặn path traversal
- [x] p95 < 200 ms
- [x] TC-28…TC-32 pass

## Cách kiểm chứng
`node --test tests/api/api.test.js`

## Không làm (out of scope của task)
- Không thêm Express/middleware ngoài
- Không đặt quy tắc nghiệp vụ trong handler
