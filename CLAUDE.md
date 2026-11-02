# CLAUDE.md — Hướng dẫn cho coding agent (LeaveFlow)

Repo = kit SDLC (prompt + checklist) + dự án mẫu **LeaveFlow** (`app/`, tài liệu `docs/0X-*`). Áp dụng `AI_SDLC-SOP.md`.

## Quy tắc bắt buộc
1. Mỗi thay đổi bắt đầu từ một task card `docs/05-development/tasks/TASK-xx.md`; chỉ chạm file trong `FILES_ALLOWED`.
2. Không thêm dependency (ADR-001). Không đổi quyết định kiến trúc khi chưa có ADR mới.
3. Không xóa/làm yếu test để pass. Test mới đặt tên `TC-xx …` để RTM đối chiếu. **Được enforce:** file trong `.claude/approved-tests.txt` bị hook PreToolUse chặn sửa và CI kiểm SHA-256 (`npm run approved-tests`).
4. Trước khi báo xong: `cd app && npm run lint && npm test && npm run scan`; lưu evidence bằng `npm run test:report`; thay đổi bảo trì phải giữ `npm run test:char` pass.
5. Cập nhật `docs/03-analysis/traceability.md`, `docs/07-verification/RTM.md` khi thêm/đổi ID.
6. Agent **không** phê duyệt gate, không merge, không release (SOP §3.1, §5.8). Audit phải do subagent `auditor` chỉ đọc.
7. Không đặt dữ liệu thật/secret vào code, tài liệu, evidence.

## Lệnh
| Việc | Lệnh |
|---|---|
| Chạy app | `cd app && npm start` (127.0.0.1:3000) |
| Lint / test | `npm run lint` · `npm test` · `test:unit` · `test:integration` · `test:char` · `test:report` |
| Chất lượng test / bảo mật | `npm run test:mutation` · `npm run scan` · `npm run approved-tests` |
| Capacity | `node scripts/capacity-check.js <out.json>` |

## Bản đồ
- Prompt/checklist kit: `requirements/ analysis/ design/ development/ verification/`
- Artifact dự án: `docs/01-intake … docs/11-decommissioning`, tổng quan `docs/README.md`
- Subagent: `.claude/agents/` · Skill: `.claude/skills/` · Harness: `docs/00-kit/harness.md`
