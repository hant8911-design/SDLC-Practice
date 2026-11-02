# TASK-02 — Domain rules

| Thuộc tính | Giá trị |
|---|---|
| WBS | 1.3.2 |
| Truy vết | FR-02, FR-04, FR-06, FR-08 · US-01, US-02 |
| Phụ thuộc | TASK-01 |
| Ước lượng | 1.0 giờ |
| Owner | Nguyễn Trần Hà (thực hiện cùng AI agent qua `development/Implementation_Task_Prompt.md`) |
| Trạng thái | Done |

## Mục tiêu
Hiện thực quy tắc thuần: validate đơn, đếm ngày công, số dư, máy trạng thái, `DomainError`.

## Đầu vào
[SAD](../../04-design/SAD.md) · [api.md](../../04-design/api.md) · [USER_STORIES](../../03-analysis/USER_STORIES.md) · [TEST_CASES](../../07-verification/TEST_CASES.md)

## File được phép chạm (`FILES_ALLOWED`)
- `app/src/domain/leave.js`
- `app/tests/unit/leave.domain.test.js`
- `app/tests/helpers.js`

## Tiêu chí chấp nhận
- [x] Hàm thuần, không I/O, không đọc đồng hồ hệ thống (nhận `today`)
- [x] Thông báo lỗi tiếng Việt
- [x] TC-01…TC-11 pass, coverage 100 % file

## Cách kiểm chứng
`node --test tests/unit/leave.domain.test.js`

## Không làm (out of scope của task)
- Không truy cập file/HTTP
- Không xử lý phân quyền (thuộc TASK-04)
