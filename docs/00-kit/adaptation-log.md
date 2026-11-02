# Adaptation Log — áp dụng kit cho LeaveFlow

Theo [step-by-step-guidance §A2](../../step-by-step-guidance.md): mọi điều chỉnh so với kit được ghi lại để reviewer thấy chỗ nào khác chuẩn.

| Tài liệu kit | Thay đổi | Lý do | Owner | Ngày | Version |
|---|---|---|---|---|---|
| Tất cả prompt | Ngôn ngữ đầu ra: **tiếng Việt**, giữ ID/thuật ngữ chuẩn bằng tiếng Anh | Đối tượng đọc là học viên khóa học | Nguyễn Trần Hà | 2026-11-02 | 1.0 |
| `design/*Diagram_prompt.md` | Sơ đồ viết bằng **Mermaid** trong Markdown thay cho `.drawio` | Yêu cầu bài tập; render trực tiếp trên GitHub; vẫn là nguồn sửa được dạng text (đáp ứng tinh thần "editable source" của §A5) | Nguyễn Trần Hà | 2026-11-02 | 1.0 |
| `design/bluePrint_design_prompt.md` | Không tạo `blueprint.md` riêng; nội dung gộp vào SAD (4+1 view, quality scenarios, stakeholder concerns) | Ứng dụng nhỏ — một tài liệu kiến trúc là đủ; ghi Partial P-1 trong design-audit | Nguyễn Trần Hà | 2026-11-02 | 1.0 |
| `design/databaseDesign_*_prompt.md` | Dùng biến thể NoSQL/document cho file JSON | ADR-002 | Nguyễn Trần Hà | 2026-11-02 | 1.0 |
| Các checklist `.xlsx` | Không sửa file gốc; kết quả chấm ghi trong các file `*-audit.md` / `audits/` của dự án | Giữ kit nguyên bản (§A2 bước 1) | Nguyễn Trần Hà | 2026-11-02 | 1.0 |
| Phase 8 Review | Thêm `docs/08-review/CODE_REVIEW.md` | Bài tập chưa có PR để chứa bản ghi review | Nguyễn Trần Hà | 2026-11-02 | 1.0 |
| Vai trò (SOP §4) | Một người giữ PO, owner, release owner; mentor là reviewer độc lập | Quy mô bài tập; tác giả ≠ người duyệt vẫn được giữ | Nguyễn Trần Hà | 2026-11-02 | 1.0 |
| Thông tin nghiệp vụ | Công ty, persona, số baseline là giả định, gắn nhãn `[GIẢ ĐỊNH]` | Bài tập không có khách hàng thật | Nguyễn Trần Hà | 2026-11-02 | 1.0 |
| Thư mục `docs/12-maintenance/` | Thêm pha Maintenance (SOP chỉ có 11 pha) | Slide B10: hàng Maintenance (CR, impact analysis, characterization) | Nguyễn Trần Hà | 2026-11-02 | 1.1 |
| Enforcement | Thêm hook PreToolUse + `.claude/approved-tests.txt` + bước CI guard | Slide B10 mẫu 3: lời dặn trong CLAUDE.md chỉ là advisory | Nguyễn Trần Hà | 2026-11-02 | 1.1 |
| E2E | E2E làm thủ công trên Browser pane có ảnh chụp, không dùng Playwright | ADR-001 (0 dependency); NotRun NR-06 | Nguyễn Trần Hà | 2026-11-02 | 1.1 |
