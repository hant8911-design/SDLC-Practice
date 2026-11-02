# Use Case Specifications — LeaveFlow v1.0

| Thuộc tính | Giá trị |
|---|---|
| Mã tài liệu | UC-LF-001 · v1.0 · 2026-11-02 |
| Tác giả | Nguyễn Trần Hà (soạn cùng AI agent) |
| Người duyệt | Mentor khóa SDLC (Tech lead) — ☐ chờ ký |
| Trạng thái | Draft — sẵn sàng review cùng `design-v1` |
| Prompt / checklist | `design/useCase_prompt.md` · `design/UseCase_Document_UML2.0_Checklist.xlsx` |
| Sơ đồ | [SAD §7](./SAD.md#7-scenarios-view--use-case) |

**Tác nhân:** *Nhân viên* (role EMPLOYEE), *Quản lý trực tiếp* (role MANAGER). HR là stakeholder (STK-03), không phải tác nhân ở v1.0.
**Tiền điều kiện chung (mọi UC):** người dùng đã chọn tài khoản demo hợp lệ (định danh — ADR-003); ứng dụng đang chạy.
**Giả định liên quan:** ASM-01…ASM-05 ([BRD §11.2](../02-requirements/BRD.md#112-assumptions--risks)).

---

## UC-01 Gửi đơn nghỉ

| Trường | Nội dung |
|---|---|
| Primary actor | Nhân viên |
| Stakeholders | Quản lý (cần đơn đúng, đủ thông tin); HR (số dư đúng chính sách) |
| Trigger | Nhân viên muốn xin nghỉ một khoảng ngày |
| Pre-conditions | Nhân viên có quản lý trực tiếp (ASM-03) |
| Post-conditions (thành công) | Đơn mới ở trạng thái *Chờ duyệt*, được giữ chỗ số dư nếu là phép năm, có một dòng lịch sử |
| Post-conditions (thất bại) | Không có đơn nào được tạo; nhân viên thấy lý do |
| Include | "Kiểm tra hợp lệ & số dư" |
| NFR | NFR-01, NFR-02, NFR-03 |
| Story / FR | US-01, US-02 · FR-01…FR-04 |

**Main success scenario**

| # | Nhân viên | Hệ thống |
|---|---|---|
| 1 | Chọn loại nghỉ, ngày bắt đầu, ngày kết thúc, nhập lý do và gửi | |
| 2 | | Kiểm tra dữ liệu hợp lệ (include) |
| 3 | | Đếm số ngày công trong khoảng nghỉ |
| 4 | | Kiểm tra không trùng với đơn đang chờ hoặc đã duyệt |
| 5 | | Với phép năm: kiểm tra số ngày công không vượt số dư còn lại |
| 6 | | Lưu đơn ở trạng thái *Chờ duyệt*, gán quản lý trực tiếp làm người duyệt, ghi lịch sử |
| 7 | | Thông báo đã gửi kèm mã đơn và số ngày công; cập nhật số dư và danh sách |

**Alternate / exception flows**

| Tại bước | Điều kiện | Hệ thống phản hồi | Kết thúc |
|---|---|---|---|
| 2a | Dữ liệu sai (loại, định dạng ngày, ngày quá khứ, khác năm, lý do trống hoặc quá dài) | Hiển thị lỗi cụ thể dưới form | Quay lại bước 1 |
| 3a | Khoảng nghỉ không có ngày làm việc | Báo "phải có ít nhất 1 ngày làm việc" | Quay lại bước 1 |
| 4a | Trùng đơn đang chờ/đã duyệt | Báo trùng, nêu mã đơn trùng | Quay lại bước 1 |
| 5a | Không đủ phép năm | Báo số ngày cần và số ngày còn | Quay lại bước 1 |
| 1a | Người dùng là quản lý | Từ chối thao tác | Kết thúc thất bại |

## UC-02 Xem số dư & đơn của tôi

| Trường | Nội dung |
|---|---|
| Primary actor | Nhân viên · Trigger: mở ứng dụng · Pre: — · Post: không thay đổi dữ liệu · NFR-01, NFR-02 · US-02 · FR-04, FR-05 |

| # | Nhân viên | Hệ thống |
|---|---|---|
| 1 | Mở ứng dụng | |
| 2 | | Tính số dư năm hiện tại: được cấp, đã dùng, đang chờ, còn lại |
| 3 | | Hiển thị danh sách đơn của nhân viên, mới nhất trước |

Alternate: 3a — chưa có đơn → hiển thị thông báo trống.

## UC-03 Hủy đơn chờ duyệt

| Trường | Nội dung |
|---|---|
| Primary actor | Nhân viên · Trigger: đổi kế hoạch · Pre: đơn của chính nhân viên đang *Chờ duyệt* · Post (thành công): đơn *Đã hủy*, số giữ chỗ được trả · Post (thất bại): đơn không đổi · Include: "Kiểm tra quyền & trạng thái" · US-03 · FR-06 |

| # | Nhân viên | Hệ thống |
|---|---|---|
| 1 | Chọn hủy một đơn | |
| 2 | | Hỏi xác nhận |
| 3 | Xác nhận | |
| 4 | | Kiểm tra quyền và trạng thái (include) |
| 5 | | Chuyển đơn sang *Đã hủy*, ghi lịch sử, cập nhật số dư |

Alternate: 3a — không xác nhận → kết thúc, không thay đổi. 4a — đơn không phải của mình → từ chối. 4b — đơn đã được xử lý → báo không thể hủy.

## UC-04 Xem hộp duyệt nhóm

| Trường | Nội dung |
|---|---|
| Primary actor | Quản lý · Trigger: kiểm tra đơn chờ · Post: không đổi dữ liệu · US-04 · FR-07 |

| # | Quản lý | Hệ thống |
|---|---|---|
| 1 | Mở ứng dụng | |
| 2 | | Hiển thị các đơn đang chờ của nhân viên mình phụ trách (tên, loại, thời gian, số ngày, lý do) |
| 3 | | Hiển thị các đơn đã xử lý của nhóm |

Alternate: 2a — không có đơn chờ → thông báo trống. 1a — người dùng là nhân viên → không có quyền xem đơn của nhóm.

## UC-05 Duyệt đơn

| Trường | Nội dung |
|---|---|
| Primary actor | Quản lý trực tiếp · Trigger: có đơn chờ · Pre: đơn *Chờ duyệt*, người dùng là người duyệt của đơn · Post (thành công): đơn *Đã duyệt*, số dư được trừ, lịch sử ghi người duyệt · Post (thất bại): không đổi · Include: "Kiểm tra quyền & trạng thái" · NFR-04 · US-05, US-08 · FR-08, FR-09 |

| # | Quản lý | Hệ thống |
|---|---|---|
| 1 | Chọn duyệt một đơn | |
| 2 | | Hỏi xác nhận (thao tác không hoàn tác) |
| 3 | Xác nhận, có thể kèm nhận xét | |
| 4 | | Kiểm tra quyền và trạng thái (include) |
| 5 | | Chuyển đơn sang *Đã duyệt*, ghi lịch sử, thông báo thành công |

Alternate: 3a — không xác nhận → kết thúc. 4a — không phải người duyệt của đơn → từ chối. 4b — đơn đã được xử lý → báo không thể duyệt lại.

## UC-06 Từ chối đơn có lý do

| Trường | Nội dung |
|---|---|
| Primary actor | Quản lý trực tiếp · Trigger: đơn không phù hợp kế hoạch nhóm · Pre/Post như UC-05 (trạng thái cuối *Từ chối*, số dư được hoàn) · Include: "Kiểm tra quyền & trạng thái" · US-06, US-08 · FR-08 |

| # | Quản lý | Hệ thống |
|---|---|---|
| 1 | Chọn từ chối một đơn | |
| 2 | | Yêu cầu nhập lý do |
| 3 | Nhập lý do | |
| 4 | | Kiểm tra lý do không trống và tối đa 200 ký tự; kiểm tra quyền và trạng thái (include) |
| 5 | | Chuyển đơn sang *Từ chối*, lưu lý do, ghi lịch sử |

Alternate: 3a — hủy nhập → kết thúc. 4a — lý do trống/quá dài → báo lỗi, quay lại bước 2. 4b/4c — như UC-05 4a/4b.

## UC-07 Xem chi tiết & lịch sử

| Trường | Nội dung |
|---|---|
| Primary actor | Nhân viên hoặc Quản lý · Trigger: cần kiểm tra/giải trình một quyết định · Pre: người dùng là người tạo hoặc người duyệt của đơn · Post: không đổi dữ liệu · US-07 · FR-10 |

| # | Người dùng | Hệ thống |
|---|---|---|
| 1 | Chọn mã đơn | |
| 2 | | Hiển thị thông tin đơn và lịch sử: thời điểm, trạng thái trước → sau, tên người thực hiện, ghi chú |

Alternate: 1a — đơn không tồn tại → báo không tìm thấy. 1b — không phải người tạo/người duyệt → từ chối.

---

## Open issues

| ID | Vấn đề | Owner | Hạn |
|---|---|---|---|
| OQ-04 | Xác thực thật (SSO) trước khi dùng ngoài localhost | Tech lead | v2.0 |
| OQ-05 | HR có cần tài khoản chỉ đọc để tra cứu lịch sử? | PO | v1.1 |
| OQ-06 | Thay `prompt()`/`confirm()` bằng hộp thoại riêng của ứng dụng (CR-06) | Owner | v1.1 |
