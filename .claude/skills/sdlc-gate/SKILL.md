---
name: sdlc-gate
description: Run the Specify→Generate→Audit→Fix→Approve loop for one SDLC phase of LeaveFlow and update the gate table. Use when a phase artifact is created or changed.
---

# SDLC gate loop (guidance §A4)

1. **Specify:** chọn prompt kit của phase (bảng `docs/README.md` §2), điền §2.2, xác định đường dẫn output `docs/0X-*`.
2. **Generate:** soạn artifact theo output contract của prompt (bảng kiểm soát tài liệu, ID theo §A9).
3. **Audit:** gọi subagent `auditor` với artifact + checklist `.xlsx` tương ứng (tối đa 3 vòng).
4. **Fix:** sửa mọi Fail; Partial phải có owner + hạn; ghi change record `CHG-xx` (SDP §10), cập nhật traceability/RTM.
5. **Verify:** nếu đụng code → subagent `tester`.
6. **Approve:** cập nhật `docs/README.md` §4 Gate status; để ô ký ☐ cho con người — agent không ký.
