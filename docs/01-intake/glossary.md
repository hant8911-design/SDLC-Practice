# Glossary — LeaveFlow

| Thuộc tính | Giá trị |
|---|---|
| Mã tài liệu | GLO-LF-001 · v1.0 · 2026-11-02 · Owner: Nguyễn Trần Hà |
| Prompt | `requirements/Intake_Intent_Prompt.md` v2.0 |

| Thuật ngữ | Định nghĩa | Tránh dùng |
|---|---|---|
| Đơn nghỉ (Leave request) | Yêu cầu nghỉ của một nhân viên cho một khoảng ngày liên tục, mã `LR-xxxx` | "phiếu", "ticket" |
| Loại nghỉ | `ANNUAL` (phép năm, trừ số dư), `SICK` (nghỉ ốm), `UNPAID` (không lương) | "phép thường" |
| Ngày công | Ngày thứ Hai → thứ Sáu nằm trong khoảng nghỉ (tính cả hai đầu) | "ngày" chung chung |
| Số dư phép năm | `available = entitlement − used − pending` cho năm dương lịch | "phép còn" không rõ năm |
| Entitlement | Số ngày phép năm được cấp: 12 ngày/người/năm | "quota" |
| Used | Tổng ngày công của đơn ANNUAL đã APPROVED trong năm | — |
| Pending (giữ chỗ) | Tổng ngày công của đơn ANNUAL đang PENDING trong năm | — |
| Trạng thái | `PENDING` → `APPROVED` / `REJECTED` / `CANCELLED`; ba trạng thái sau là trạng thái cuối | "done", "closed" |
| Quản lý trực tiếp | `managerId` của nhân viên — người duy nhất được duyệt đơn của nhân viên đó (approver) | "sếp", "leader" |
| Lịch sử trạng thái | Bản ghi bất biến `{requestId, actorId, from, to, comment, at}` cho mỗi lần chuyển trạng thái | "log" |
| Trùng thời gian | Hai khoảng `[start,end]` giao nhau, với đơn PENDING/APPROVED của cùng nhân viên | — |
| Human owner | Người chịu trách nhiệm cuối cùng cho artifact/thay đổi (SOP §2) | "AI tự làm" |
| Evidence | File mở được (log, junit, screenshot) chứng minh một kết quả | "agent nói pass" |
