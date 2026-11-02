# TASK-03 — JsonStore

| Thuộc tính | Giá trị |
|---|---|
| WBS | 1.3.3 |
| Truy vết | NFR-03, FR-10 |
| Phụ thuộc | TASK-01 |
| Ước lượng | 0.5 giờ |
| Owner | Nguyễn Trần Hà (thực hiện cùng AI agent qua `development/Implementation_Task_Prompt.md`) |
| Trạng thái | Done |

## Mục tiêu
Repository in-memory + ghi file nguyên tử; trả bản sao để service không sửa trực tiếp dữ liệu.

## Đầu vào
[SAD](../../04-design/SAD.md) · [api.md](../../04-design/api.md) · [USER_STORIES](../../03-analysis/USER_STORIES.md) · [TEST_CASES](../../07-verification/TEST_CASES.md)

## File được phép chạm (`FILES_ALLOWED`)
- `app/src/repo/jsonStore.js`
- `app/src/data/seed.js`
- `app/tests/unit/jsonStore.test.js`

## Tiêu chí chấp nhận
- [x] Ghi `tmp` rồi `rename`
- [x] Khởi động lại đọc đúng dữ liệu cũ
- [x] Sinh mã `LR-0001` tăng dần
- [x] TC-26, TC-27 pass

## Cách kiểm chứng
`node --test tests/unit/jsonStore.test.js`

## Không làm (out of scope của task)
- Không thêm DB engine (ADR-002)
- Không đặt quy tắc nghiệp vụ trong store
