# TASK-07 — Test tự động & evidence

| Thuộc tính | Giá trị |
|---|---|
| WBS | 1.4.1 |
| Truy vết | NFR-05 · toàn bộ AC |
| Phụ thuộc | TASK-02, TASK-04, TASK-05, TASK-06 |
| Ước lượng | 1.5 giờ |
| Owner | Nguyễn Trần Hà (thực hiện cùng AI agent qua `development/Implementation_Task_Prompt.md`) |
| Trạng thái | Done |

## Mục tiêu
Hoàn thiện bộ test dẫn xuất từ AC, script chạy lint+test+coverage và lưu evidence theo run-id.

## Đầu vào
[SAD](../../04-design/SAD.md) · [api.md](../../04-design/api.md) · [USER_STORIES](../../03-analysis/USER_STORIES.md) · [TEST_CASES](../../07-verification/TEST_CASES.md)

## File được phép chạm (`FILES_ALLOWED`)
- `app/tests/**`
- `app/scripts/run-tests.js`

## Tiêu chí chấp nhận
- [x] Tên test bắt đầu bằng `TC-xx` khớp TEST_CASES
- [x] Evidence: `test-spec.log`, `junit.xml`, `coverage.log`, `lint.log`, `summary.json`
- [x] Coverage ≥ 80 % mỗi file `src/`

## Cách kiểm chứng
`npm run test:report`

## Không làm (out of scope của task)
- Không xóa/làm yếu assertion để test pass
- Không sửa source giữa một run
