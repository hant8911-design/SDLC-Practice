# Checklist review bằng tay — LeaveFlow

Dùng cho người chấm/reviewer kiểm tra nhanh từng chặng. Đánh ☑ khi đã mở file và xác nhận. Các ô agent đã tự kiểm chứng được ghi "✔ (agent)"; reviewer cần tự xác nhận lại.

## A. Harness & quy trình
| # | Hạng mục | Nơi kiểm tra | Agent | Reviewer |
|---|---|---|---|---|
| A1 | CLAUDE.md có quy tắc, lệnh, bản đồ | [CLAUDE.md](../../CLAUDE.md) | ✔ | ☐ |
| A2 | Subagent (auditor, tester) | [.claude/agents/](../../.claude/agents/) | ✔ | ☐ |
| A3 | Skill quy trình gate | [.claude/skills/sdlc-gate](../../.claude/skills/sdlc-gate/SKILL.md) | ✔ | ☐ |
| A4 | Prompt kit dùng cho từng phase | [docs/README §2](../README.md#2-mục-lục-tài-liệu) | ✔ | ☐ |
| A5 | Adaptation log ghi khác biệt so với kit | [adaptation-log](./adaptation-log.md) | ✔ | ☐ |

## B. Tám chặng phát triển (+ 3 chặng vận hành)
| # | Chặng | Artifact bắt buộc | Audit checklist | Agent | Reviewer |
|---|---|---|---|---|---|
| B1 | Intake | intent, glossary, stakeholders, sources | SOP §5.1 | ✔ | ☐ |
| B2 | Requirements | BRD, phỏng vấn SRC-001 | BRD 29148: 0 Fail (vòng 2) | ✔ | ☐ |
| B3 | Analysis | PRD, USER_STORIES (21 AC), traceability | PRD 29148: 0 Fail | ✔ | ☐ |
| B4 | Design | SAD 4+1, use-cases, 3 ADR, API + OpenAPI, data model, UI/UX | 10 checklist: 0 Fail | ✔ | ☐ |
| B5 | Planning | SDP, WBS, 8 task card | DevPlan 24748-5: 0 Fail | ✔ | ☐ |
| B6 | Implementation | `app/` + test, CLAUDE.md | Lint OK | ✔ | ☐ |
| B7 | Verification | TEST_PLAN, TEST_CASES, RTM, TEST_REPORT, evidence | Test Plan 829: 0 Fail | ✔ | ☐ |
| B8 | Review | CODE_REVIEW (IEEE 1028, 16 finding, có §5 R1.1) | 19/19 Pass (pre-review) | ✔ | ☐ |
| B9–11 | Release · Operations · Decommission | RELEASE-1.0.0, RELEASE-1.1.0, RUNBOOK, DECOMMISSION_PLAN, CR-R11-01 | SOP §5.9–5.11 | ✔ | ☐ |

## C. Kiểm thử
| # | Hạng mục | Bằng chứng | Agent | Reviewer |
|---|---|---|---|---|
| C1 | Unit test (28) | `evidence/RUN-*/test-spec.log`, `junit.xml` | ✔ | ☐ |
| C2 | **Integration test** HTTP thật trên cổng ngẫu nhiên (TC-28…32, TC-46) — `npm run test:integration` | `app/tests/api/*.test.js` | ✔ | ☐ |
| C2b | **Characterization** golden master (TC-43) — `npm run test:char` | `app/tests/characterization/` | ✔ | ☐ |
| C3 | System test: capacity 10 000 đơn, diễn tập restore, bind loopback | `evidence/ops-2026-11-02/` | ✔ | ☐ |
| C4 | **Ảnh chụp UI thật**: R1.0 13 ảnh + R1.1 16 ảnh (trước/sau sửa, dark mode, mobile) | `evidence/ui-2026-11-02/`, `evidence/ui-r1.1-2026-11-02/` | ✔ | ☐ |
| C5 | RTM 2 chiều: 26/26 AC, 9/9 NFR, 0 GAP | [RTM](../07-verification/RTM.md) | ✔ | ☐ |
| C6 | Defect có vòng đời phát hiện → sửa → retest (11/11 đóng); mutation 93.8 % → 100 % | [TEST_REPORT §6](../07-verification/TEST_REPORT.md#6-defects-and-risks) | ✔ | ☐ |
| C7 | Tự chạy lại: `cd app && npm run test:report` | terminal | — | ☐ |

## D. Còn mở (con người thực hiện)
| # | Việc | Owner |
|---|---|---|
| D1 | Commit, tạo tag baseline, push để CI chạy | Nguyễn Trần Hà |
| D2 | Ký các gate ☐ (PO, Tech lead, QA, Release owner) | Người duyệt |
| D3 | Commit + tag `r1.0`/`r1.1`, chạy lại `npm run test:report` trên đúng commit | Nguyễn Trần Hà |

## E. Đối chiếu slide buổi 10 (Capstone)

| # | Yêu cầu slide B10 | Nơi kiểm tra | Agent | Reviewer |
|---|---|---|---|---|
| E1 | Bảng một trang 6 pha, mỗi ô là link, metric ghi proxy, ô trống có lý do (#06, #07, #11) | [CAPSTONE §1](../CAPSTONE.md#1-bảng-một-trang-slide-b10-0607) | ✔ | ☐ |
| E2 | Truy vết 1 nhu cầu qua 7 mắt xích (#12) | [CAPSTONE §2](../CAPSTONE.md) | ✔ | ☐ |
| E3 | **Slide 10** — 6 hiểu sai về phát hành/bảo trì/đo lường đều có bằng chứng tránh | [CAPSTONE §3](../CAPSTONE.md#3-tự-kiểm-theo-slide-10--đúng-hay-sai-22) | ✔ | ☐ |
| E4 | V&V: test report có NotRun, E2E, mutation, scan | [TEST_REPORT](../07-verification/TEST_REPORT.md) §4.5, §5 | ✔ | ☐ |
| E5 | Release: checklist có ký, tag, SBOM, AI-BOM, restore, SLI/SLO | [RELEASE-1.1.0](../09-release/RELEASE-1.1.0.md) | ✔ (tag chờ commit) | ☐ |
| E6 | Maintenance: change request, impact analysis, R1.1, characterization test | [CR-R11-01](../12-maintenance/CR-R11-01.md), TC-43 | ✔ | ☐ |
| E7 | Test đã duyệt được hook + CI bảo vệ (`.claude/approved-tests.txt`) | [settings.json](../../.claude/settings.json), [ci.yml](../../.github/workflows/ci.yml), TC-47 | ✔ | ☐ |
| E8 | `docs/ai/delivery-log.csv` có số đo thật | [delivery-log.csv](../ai/delivery-log.csv) | ✔ | ☐ |
| E9 | Playbook 3 dòng + lộ trình 30/60/90, checklist 8/8 | [CAPSTONE §4–5](../CAPSTONE.md#5-lộ-trình-306090-ngày) | ✔ | ☐ |
| E10 | Tag `r1.0`, `r1.1`; evidence đúng commit | — | ✘ chưa commit | ☐ |
