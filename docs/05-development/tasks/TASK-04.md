# TASK-04 — LeaveService (use cases + phân quyền)

| Thuộc tính | Giá trị |
|---|---|
| WBS | 1.3.4 |
| Truy vết | FR-01, FR-03, FR-05…FR-10 · US-01…US-08 |
| Phụ thuộc | TASK-02, TASK-03 |
| Ước lượng | 1.5 giờ |
| Owner | Nguyễn Trần Hà (thực hiện cùng AI agent qua `development/Implementation_Task_Prompt.md`) |
| Trạng thái | Done |

## Mục tiêu
Use case tạo/list/xem/hủy/duyệt/từ chối; kiểm tra trùng, số dư, quyền; ghi lịch sử mỗi lần chuyển trạng thái.

## Đầu vào
[SAD](../../04-design/SAD.md) · [api.md](../../04-design/api.md) · [USER_STORIES](../../03-analysis/USER_STORIES.md) · [TEST_CASES](../../07-verification/TEST_CASES.md)

## File được phép chạm (`FILES_ALLOWED`)
- `app/src/service/leaveService.js`
- `app/tests/unit/leave.service.test.js`

## Tiêu chí chấp nhận
- [x] Đồng hồ inject qua constructor
- [x] Mọi kiểm tra quyền ở server
- [x] TC-12…TC-25 pass

## Cách kiểm chứng
`node --test tests/unit/leave.service.test.js`

## Không làm (out of scope của task)
- Không phụ thuộc HTTP (req/res)
- Không sửa domain rules khi không có ADR
