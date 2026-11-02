# TASK-08 — Release & vận hành docs

| Thuộc tính | Giá trị |
|---|---|
| WBS | 1.5.1 |
| Truy vết | Phase 9–11 |
| Phụ thuộc | TASK-07 |
| Ước lượng | 3.0 giờ |
| Owner | Nguyễn Trần Hà (thực hiện cùng AI agent qua `development/Implementation_Task_Prompt.md`) |
| Trạng thái | Done |

## Mục tiêu
Release notes, release record, runbook, kế hoạch decommission; cập nhật README.

## Đầu vào
[SAD](../../04-design/SAD.md) · [api.md](../../04-design/api.md) · [USER_STORIES](../../03-analysis/USER_STORIES.md) · [TEST_CASES](../../07-verification/TEST_CASES.md)

## File được phép chạm (`FILES_ALLOWED`)
- `docs/09-release/*`
- `docs/10-operations/*`
- `docs/11-decommissioning/*`
- `README.md`
- `app/README.md`

## Tiêu chí chấp nhận
- [x] Release record có commit, môi trường, health check, rollback
- [x] Runbook có start/stop/backup/restore/sự cố

## Cách kiểm chứng
Review tài liệu + chạy thử lệnh trong runbook

## Không làm (out of scope của task)
- Agent không tự authorize release
