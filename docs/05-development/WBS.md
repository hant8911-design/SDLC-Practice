# Work Breakdown Structure — LeaveFlow v1.0

| Thuộc tính | Giá trị |
|---|---|
| Mã tài liệu | WBS-LF-001 · v1.1 (bổ sung dictionary 1.1–1.4) · 2026-11-02 · Owner: Nguyễn Trần Hà |
| Prompt | `development/TaskBreakdown_ISO_21511_Prompt.md` (ISO 21511:2018, hướng deliverable) |
| Giới hạn kích thước task | 1 phiên agent · ≤ 6 file chạm · ≤ 3 vòng sửa |

## 1. Cây WBS

```mermaid
mindmap
  root((1.0 LeaveFlow v1.0))
    1.1 Quản lý dự án
      1.1.1 SDP
      1.1.2 Theo dõi gate & baseline
    1.2 Tài liệu yêu cầu & thiết kế
      1.2.1 Intake + BRD
      1.2.2 PRD + Stories + Traceability
      1.2.3 SAD + ADR + API + Data + UI/UX
    1.3 Phần mềm
      1.3.1 TASK-01 Nền tảng & công cụ
      1.3.2 TASK-02 Domain rules
      1.3.3 TASK-03 JsonStore
      1.3.4 TASK-04 LeaveService
      1.3.5 TASK-05 REST API
      1.3.6 TASK-06 Web UI
    1.4 Kiểm chứng
      1.4.1 TASK-07 Test tự động + evidence
      1.4.2 Test plan, cases, RTM, report
      1.4.3 Code review
    1.5 Phát hành & vận hành
      1.5.1 TASK-08 Release notes, runbook, decommission
```

## 2. WBS dictionary

| WBS | Deliverable | Tiêu chí chấp nhận | Task | US / FR |
|---|---|---|---|---|
| 1.1.1 | `Software_Development_Plan.md` | Audit DevPlan 0 Fail; PO + Tech lead ký | — | — |
| 1.1.2 | Bảng gate trong `docs/README.md`, tag baseline | Mỗi gate có audit + chữ ký + tag | — | — |
| 1.2.1 | `docs/01-intake/*`, `BRD.md`, `brd-audit.md` | Audit BRD 0 Fail; PO ký | — | BR-01…08 |
| 1.2.2 | `PRD.md`, `USER_STORIES.md`, `traceability.md` | Audit PRD 0 Fail; 0 orphan | — | FR, NFR, US |
| 1.2.3 | `SAD.md`, `ADR-*.md`, `api.md`, `openapi.yaml`, `data/model.md`, `UI_UX_design/` | Audit design 0 Fail; Tech lead ký | — | CMP, API |
| 1.4.2 | `TEST_PLAN.md`, `TEST_CASES.md`, `RTM.md`, `TEST_REPORT.md` | 100 % AC có TC PASS; GO/NO-GO | — | AC, NFR |
| 1.4.3 | `CODE_REVIEW.md` / PR | 0 blocking finding; reviewer độc lập approve | — | — |
| 1.3.1 | `package.json`, `scripts/lint.js`, CI | `npm run lint` và `npm test` chạy được, CI xanh | TASK-01 | NFR-05, NFR-06 |
| 1.3.2 | `src/domain/leave.js` | TC-01…TC-11 pass | TASK-02 | FR-02, FR-04, FR-06, FR-08 |
| 1.3.3 | `src/repo/jsonStore.js` | TC-26, TC-27 pass | TASK-03 | NFR-03, FR-10 |
| 1.3.4 | `src/service/leaveService.js` | TC-12…TC-25 pass | TASK-04 | US-01…US-08 |
| 1.3.5 | `src/server.js` | TC-28…TC-32 pass | TASK-05 | API-01…09, NFR-01, NFR-04 |
| 1.3.6 | `public/*` | TC-33…TC-37 pass | TASK-06 | S-01…S-05, NFR-02 |
| 1.4.1 | `tests/**`, `scripts/run-tests.js` | Evidence run lưu ở `docs/07-verification/evidence/` | TASK-07 | NFR-05 |
| 1.5.1 | `docs/09…11` | Release record có rollback + health check | TASK-08 | — |

## 3. Phụ thuộc & critical path

```mermaid
flowchart LR
    T1[TASK-01<br/>Nền tảng] --> T2[TASK-02<br/>Domain]
    T1 --> T3[TASK-03<br/>Store]
    T2 --> T4[TASK-04<br/>Service]
    T3 --> T4
    T4 --> T5[TASK-05<br/>API]
    T5 --> T6[TASK-06<br/>UI]
    T2 & T4 & T5 --> T7[TASK-07<br/>Test & evidence]
    T6 --> T7
    T7 --> T8[TASK-08<br/>Release docs]
    linkStyle 0,2,4,5,9,10 stroke:#dc2626,stroke-width:3px
```

**Critical path (đỏ):** TASK-01 → 02 → 04 → 05 → 06 → 07 → 08. TASK-03 song song với TASK-02.
