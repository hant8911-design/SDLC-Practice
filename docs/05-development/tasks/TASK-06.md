# TASK-06 — Web UI

| Thuộc tính | Giá trị |
|---|---|
| WBS | 1.3.6 |
| Truy vết | S-01…S-05 · FR-05, FR-07 · NFR-02 |
| Phụ thuộc | TASK-05 |
| Ước lượng | 1.5 giờ |
| Owner | Nguyễn Trần Hà (thực hiện cùng AI agent qua `development/Implementation_Task_Prompt.md`) |
| Trạng thái | Done |

## Mục tiêu
SPA vanilla JS: chọn user demo, số dư, form, đơn của tôi, hộp duyệt, dialog chi tiết.

## Đầu vào
[SAD](../../04-design/SAD.md) · [api.md](../../04-design/api.md) · [USER_STORIES](../../03-analysis/USER_STORIES.md) · [TEST_CASES](../../07-verification/TEST_CASES.md)

## File được phép chạm (`FILES_ALLOWED`)
- `app/public/index.html`
- `app/public/app.js`
- `app/public/styles.css`

## Tiêu chí chấp nhận
- [x] Mọi input có label; toast `aria-live`; lỗi `role=alert`
- [x] Có empty-state cho mọi bảng
- [x] Escape HTML mọi dữ liệu người dùng
- [x] TC-33…TC-37 pass

## Cách kiểm chứng
Kiểm thử UI thủ công theo TEST_CASES §3, chụp màn hình vào `evidence/ui-<date>/`

## Không làm (out of scope của task)
- Không dùng framework frontend
- Không kiểm tra quyền chỉ ở UI
