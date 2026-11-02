# Design Checklists Audit — vòng 2 — LeaveFlow design-v1

| Thuộc tính | Giá trị |
|---|---|
| Ngày | 2026-11-02 |
| Auditor | Independent auditor agent (read-only), round 2 |
| Báo cáo vòng 1 | [design_checklists_audit.md](./design_checklists_audit.md) |
| Căn cứ | `step-by-step-guidance.md` §A4, §A8; câu hỏi gốc của từng checklist `.xlsx` (đọc lại bằng openpyxl, không sửa file) |
| Phạm vi | `docs/04-design/SAD.md` **v1.1**, `use-cases.md` (mới), `api.md` **v1.1**, `openapi.yaml`, `data/model.md` **v1.1**, `UI_UX_design/README.md` **v1.1**, ADR-001…003, `docs/03-analysis/USER_STORIES.md`, `app/src/**`, `app/public/*`, evidence `docs/07-verification/evidence/{ops,ui}-2026-11-02/` |
| Quy tắc | Chỉ chấm lại dòng Fail/Partial vòng 1; dòng Pass/N/A giữ nguyên (đã spot-check — không thấy hồi quy). Sơ đồ Mermaid: chấp nhận ký hiệu xấp xỉ khi Mermaid không vẽ được ký hiệu UML gốc **và** có chú giải; không chấp nhận khi Mermaid làm được mà không làm. Owner mọi action: Nguyễn Trần Hà. |

> **Kiểm chứng code (thay vì tin tuyên bố):** `app/src/server.js` dòng 155 `const host = process.env.HOST || '127.0.0.1'` và `listen(port, host)`; `leaveService.js` dòng 103–105 validate `status` ∈ STATUS (test TC-23 dòng 145 `'DONE'` → VALIDATION_ERROR); dòng 52–54 chặn nhân viên không có quản lý tồn tại (TC-13 dòng 25–26); `styles.css` `min-height: 44px`, `:hover/:active/:disabled`, token badge mới; `app.js` dòng 129–130 khóa nút gửi, dòng 150 `confirm()` trước khi Duyệt. Evidence `TC-42-bind-check.txt` (127.0.0.1:3000 LISTENING), `11-contrast-check.txt`, `13-mobile-check.json`, `TC-39-capacity.json`, `TC-40-restore-drill.log` tồn tại và khớp.

---

## 1. SAD — `SAD_IEEE_1016_Checklist.xlsx`

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 2 | Context View | Partial | **Pass** | SAD §2.1 Context view (Mermaid) + "LeaveFlow **cung cấp** REST API `/api/*` + UI tĩnh; **cần** file system cục bộ và Node.js ≥ 22. Không gọi hệ thống ngoài." | — |
| 7 | Dependency View | Partial | **Pass** | SAD §5: bỏ cạnh sai `REPO → SEED`; có `HTTP -.«use» DomainError.-> IRULES` và `HTTP -.«create» (seed, dataFile).-> REPO` — khớp `require()` trong `server.js` dòng 8–11 | — |
| 10 | Information View | Partial | **Pass** | SAD §2.1 "Information view → [data/model.md]" | — |
| 11 | Interface View | Partial | **Pass** | SAD §2.1 "Interface view → api.md, openapi.yaml"; openapi.yaml nay khai báo 400/401/405/413/500 cho các operation (xem mục 8 #20) | — |
| 12 | Resource View | Partial | **Pass** | SAD §2.2 Resource budget (RAM < 100 MB, file ≈ 3.6 MB, ghi < 100 ms, 1 core) căn cứ TC-39 | — |

**Tổng sau vòng 2:** Pass 16 · Partial 0 · Fail 0 · N/A 0 · Rows 16

---

## 2. Class diagram — `Class_Diagram_UML2.0_Checklist.xlsx` → SAD §3

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 6 | Interfaces | Partial | **Pass** | SAD §3 `class IStore <<interface>>`, `LeaveService "1" --> "1" IStore`, `JsonStore ..|> IStore` | Ghi chú: ADR-002 dòng 19 vẫn gọi là "interface `JsonStore`" — nên đổi thành `IStore` cho thống nhất. |
| 8 | Typing & Format | Partial | **Pass** | SAD §3 `+id: string`, `+days: int`, `+managerId: string [0..1]` | — |
| 12 | Signatures | Partial | **Partial** | Tham số đã có kiểu và hầu hết có kiểu trả về; đã thêm `findRequest`, `listUsers`, `Balance`. Nhưng các kiểu `Profile`, `RequestDetail`, `NewLeaveRequest`, `Clock` dùng trong chữ ký không được định nghĩa trong sơ đồ. | Thêm class/`<<dataType>>` `Profile`, `RequestDetail`, `NewLeaveRequest`, `Clock` (hoặc ghi chú trỏ tới schema openapi). Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 14 | Static Operations | Partial | **Pass** | `LeaveDomain <<utility>>` với hậu tố `$` trên mọi operation | — |
| 17 | Multiplicity | Partial | **Pass** | Mọi association có multiplicity (`"0..*" --> "0..1"`, `"1" --> "0..*"`, `"1" *-- "1..*"`, `"0..*" --> "1"`); đã thêm approver và actor | — |
| 18 | Roles | Partial | **Partial** | Nhãn đổi thành danh từ vai trò (`manager`, `employee`, `approver`, `actor`) nhưng vẫn là nhãn giữa association, không đặt ở đầu mút như checklist yêu cầu; Mermaid cho phép chữ tự do ở đầu mút (vd. `User "1 employee" --> "0..* requests" LeaveRequest`) nên đây không phải giới hạn công cụ. | Đặt role name vào chuỗi đầu mút. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |

Ghi chú: dòng #22 Realization (N/A ở vòng 1 vì chưa có interface) nay đã áp dụng được và đạt (`JsonStore ..|> IStore`). Theo quy tắc vòng 2 vẫn giữ N/A trong tổng; đề nghị chuyển thành Pass ở lần chấm sau.

**Tổng sau vòng 2:** Pass 16 · Partial 2 · Fail 0 · N/A 7 · Rows 25

---

## 3. Sequence diagrams — `Sequence_Diagram_UML2.0_Checklist.xlsx` → SAD §4.1–4.2

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 4 | Naming Convention | Partial | **Pass** | `ui: WebUI`, `http: HttpAdapter`, `svc: LeaveService`, `store: JsonStore`; `LeaveDomain «utility»` (không có instance — hợp lý) | — |
| 8 | Return/Reply Messages | Partial | **Pass** | §4.1 có reply cho `findUser`, `authenticate`, `validateNewRequest`, `listRequests`, `computeBalance`, `insertRequest`; §4.2 cho `listRequests`, `findRequest`, `assertTransition`, `updateRequest`; reply trả đúng bên gọi | — |
| 11 | Message Signatures | Partial | **Partial** | Phần lớn có tham số. Còn: `checkOverlap(requests)` và `assertApprover(user, request)` không có trong class diagram §3 (§3 chỉ có `rangesOverlap`; `assertApprover` là private không được vẽ); `rejectRequest(...)` bỏ tham số; `listRequests(byEmployee)` / `writeFile(tmp) + rename` là mô tả, không phải chữ ký. | Đồng bộ với §3: đổi `checkOverlap` → `rangesOverlap(...)`, thêm `-assertApprover(user: User, r: LeaveRequest)` vào `LeaveService`, ghi đủ `rejectRequest(user, id, comment)`. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 12 | Activation Boxes | **Fail** | **Pass** | `activate`/`deactivate` cho UI, API, SVC, DOM, DB ở cả §4.1 và §4.2 | — |
| 13 | Overlapping Activations | **Fail** | **Pass** | Self-call `SVC->>SVC: checkOverlap` / `assertApprover` có `activate SVC` lồng trong activation đang mở | Gợi ý: `DB->>DB: writeFile` chưa có activation lồng. |
| 15 | Alternative (alt) | Partial | **Pass** | §4.1 `alt không có user` → 401 / `else đã định danh`, `alt vi phạm quy tắc (role, dữ liệu, trùng, số dư)` → 403/400/409/422; §4.2 `alt không tìm thấy / không phải approver / sai trạng thái / thiếu lý do` → 404/403/409/400 | Ghi chú: §4.2 vẫn không vẽ bước authenticate/401 (liên quan dòng #19 N/A — nên thêm `Note` "ref: xác thực như §4.1"). |
| 20 | No Dangling Messages | Partial | **Pass** | GET `scope=team` nay đi API → SVC → DB và reply ngược; `DomainError` trả về API (bên gọi) | — |

**Tổng sau vòng 2:** Pass 15 · Partial 1 · Fail 0 · N/A 6 · Rows 22

---

## 4. Activity / State — `Activity_Diagram_UML2.0_Checklist.xlsx` → SAD §4.4

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 1 | Activity Name | Partial | **Partial** | Tên activity `CreateLeaveRequest(userId, body) : LeaveRequest` chỉ có trong bảng markdown phía trên; sơ đồ không có frame bao toàn bộ + nhãn tên (checklist: "rounded rectangle encompassing the whole diagram… label top-left"). Mermaid làm được bằng `subgraph ACT["act CreateLeaveRequest"]` bao các partition. | Bọc toàn bộ sơ đồ trong một subgraph "act CreateLeaveRequest". Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 2 | Activity Parameters | Partial | **Partial** | Input/output đã được nêu trong bảng (`userId, body` → `LeaveRequest`) nhưng không có Activity Parameter Node trên biên frame (cùng nguyên nhân #1). | Sau khi có frame, thêm node `[/userId, body/]` ở đầu và `[/LeaveRequest/]` ở cuối, đặt sát biên. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 3 | Pre/Post-conditions | **Fail** | **Pass** | SAD §4.4 bảng: Pre-conditions; Post-conditions (thành công: PENDING + HistoryEntry ghi nguyên tử); Post-conditions (thất bại: không đổi dữ liệu, lỗi 400/401/403/409/413/422) | — |
| 4 | Action Nodes | Partial | **Pass** | Action dùng `( … )` bo góc: `A1(…)`, `D(Đếm ngày công T2–T6)`, `SAVE(…)`, `RESP(…)`, `OK(…)` | — |
| 10 | Data Stores | Partial | **Pass** | `SAVE --> DS[("db.json «datastore»")]` | — |
| 13 | Guard Conditions | Partial | **Pass** | Mọi cạnh ra từ decision có guard trong ngoặc vuông `[có]` / `[không]`, loại trừ và đầy đủ | — |
| 14 | Merge Nodes | **Fail** | **Pass** | Merge `MERR{ }` gom mọi nhánh lỗi trước `RESP`; merge `M2{ }` gom nhánh non-ANNUAL và ANNUAL hợp lệ trước `SAVE` | — |
| 24 | Activity Partitions | **Fail** | **Pass** | 4 partition `subgraph`: HTTP adapter (CMP-01), LeaveService (CMP-02), Domain rules (CMP-03), JsonStore (CMP-04) | — |
| 28 | Activity Final Node | Partial | **Pass** | Mọi luồng kết thúc ở node final `FERR((◉))` / `FEND((◉))`; không còn node lỗi cụt | Ghi chú: note "mọi chuyển tiếp khác trả 409" ở §4.3 vẫn chỉ gắn vào APPROVED. |

**Tổng sau vòng 2:** Pass 10 · Partial 2 · Fail 0 · N/A 16 · Rows 28

---

## 5. Component — `Component_Diagram_UML2.0_Checklist.xlsx` → SAD §5

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 2 | Abstraction Level | Partial | **Partial** | Đã bỏ TESTS và SEED; nhưng sơ đồ vẫn bọc component trong `«execEnv» Browser` / `«execEnv» Node.js process` — khái niệm deployment (đã có ở §6) trộn vào development view, đúng như action vòng 1 chưa thực hiện. | Bỏ hai subgraph `«execEnv»` khỏi §5 (giữ ở §6). Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 3 | Component Nodes | **Fail** | **Pass** | Mọi node CMP-01…05 có `«component»` | — |
| 6 | Provided Interfaces (Lollipop) | **Fail** | **Pass** | Interface tròn `(("REST API /api/*"))`, `ILeaveService`, `ILeaveRules`, `IStore` nối nét liền với component cung cấp; chú giải "vòng tròn = interface được cung cấp (lollipop)" | — |
| 7 | Required Interfaces (Socket) | **Fail** | **Pass** | Phía yêu cầu vẽ bằng dependency `-. «use» .->` tới interface (ký hiệu UML tương đương cho required interface — Mermaid không vẽ socket), có chú giải | — |
| 8 | Interface Naming | Partial | **Pass** | `REST API /api/*`, `ILeaveService`, `ILeaveRules`, `IStore` | — |
| 11 | Usage Dependencies | **Fail** | **Pass** | Toàn bộ là nét đứt `-.->` có stereotype (`«use»`, `«create»`, `«read/write»`); cạnh khớp `require()` trong code (bỏ `REPO → SEED`, thêm HTTP → DomainError, HTTP → JsonStore) | — |
| 12 | Assembly Connectors | **Fail** | **Pass** | Mỗi interface nối provider (liền) và consumer («use»): UI↔IREST↔HTTP, HTTP↔ILEAVE↔SVC, SVC↔IRULES↔DOM, SVC↔ISTORE↔REPO; chú giải nêu đây là assembly connector | — |
| 15 | Artifacts | Partial | **Pass** | `FILE[("«artifact»<br/>db.json")]` | — |
| 16 | Loose Coupling | Partial | **Pass** | Mọi phụ thuộc giữa CMP đi qua interface có tên; chỉ `«create»` ở composition root (HttpAdapter tạo JsonStore) — chấp nhận được | — |

**Tổng sau vòng 2:** Pass 12 · Partial 1 · Fail 0 · N/A 5 · Rows 18

---

## 6. Deployment — `Deployment_Diagram_UML2.0_Checklist.xlsx` → SAD §6

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 3 | Device Nodes | Partial | **Pass** | `«device» Workstation`, `«device» GitHub cloud` | — |
| 4 | Execution Environments | Partial | **Pass** | `«execEnv» Browser`, `«execEnv» Node.js 22`, `«execEnv» Actions runner` + chú giải `«execEnv» = «executionEnvironment»` | — |
| 6 | Artifacts | Partial | **Pass** | `«artifact» index.html · app.js · styles.css`, `«artifact» app/src/*.js`, `«artifact» db.json` | — |
| 8 | Manifestations | Partial | **Partial** | Không có `«manifest»` nào trong §6 và không có câu trỏ tới bảng CMP ↔ file ở §2 (action vòng 1 chưa làm). | Thêm ghi chú/cạnh `«manifest»` (vd. `server.js` manifests CMP-01 …) hoặc dòng "Ánh xạ artifact ↔ component: xem §2". Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 11 | Protocols & Networks | Partial | **Pass** | `«protocol» HTTP/1.1 · loopback only`, `«protocol» file I/O`, `«protocol» HTTPS git push` | — |
| 15 | Scalability & Constraints | Partial | **Pass** | Nhãn `1 instance · HOST=127.0.0.1 · PORT=3000`; bảng cấu hình `HOST 127.0.0.1`; code `server.js` dòng 155–157; evidence `TC-42-bind-check.txt` | — |

**Tổng sau vòng 2:** Pass 12 · Partial 1 · Fail 0 · N/A 3 · Rows 16

---

## 7. Use case — `UseCase_Document_UML2.0_Checklist.xlsx` → `use-cases.md` (mới) + SAD §7 + USER_STORIES

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 5 | Author & Stakeholders | Partial | **Pass** | use-cases.md header: Tác giả Nguyễn Trần Hà; Người duyệt Mentor (Tech lead) ☐ chờ ký; UC-01 có Stakeholders | — |
| 6 | Status | Partial | **Pass** | use-cases.md "Trạng thái: Draft — sẵn sàng review cùng `design-v1`" | — |
| 7 | Primary Actor | Partial | **Pass** | use-cases.md: tác nhân Nhân viên/Quản lý; "HR là stakeholder (STK-03), không phải tác nhân ở v1.0"; mỗi UC có Primary actor; US-07/US-08 đã sửa | — |
| 10 | Trigger | Partial | **Partial** | UC-01…UC-05 có Trigger; **UC-06 và UC-07 không có trường Trigger** (UC-06 chỉ "Pre/Post như UC-05"). | Thêm Trigger cho UC-06 ("quản lý quyết định không chấp thuận đơn chờ") và UC-07 ("người dùng cần xem diễn biến đơn"). Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 11 | Pre-conditions | Partial | **Pass** | "Tiền điều kiện chung (mọi UC)" + Pre riêng cho UC-01, UC-03, UC-05, UC-07 | — |
| 13 | Post-conditions (Failure) | Partial | **Pass** | UC-01 "Không có đơn nào được tạo"; UC-03/UC-05 "đơn không đổi"; UC-06 kế thừa UC-05; UC-02/04/07 "không đổi dữ liệu" | — |
| 14 | Main Success Scenario | **Fail** | **Pass** | MSS đánh số cho UC-01…UC-07 | — |
| 15 | Action/Response Format | **Fail** | **Pass** | Bảng hai cột tác nhân / Hệ thống cho mọi UC | — |
| 16 | Alternate Flows | Partial | **Pass** | Mục alternate cho mọi UC (vd. UC-03 3a không xác nhận; UC-05 3a; UC-06 3a/4a) | — |
| 18 | Flow References | **Fail** | **Pass** | Nhánh tham chiếu số bước: UC-01 "2a, 3a, 4a, 5a, 1a" + "Quay lại bước 1"; UC-06 "4a… quay lại bước 2" | — |
| 20 | Include | Partial | **Pass** | SAD §7: UC-05/UC-06/UC-03 «include» "Kiểm tra quyền & trạng thái" — khớp `#assertApprover` + `assertTransition` (approve/reject) và kiểm tra chủ đơn + `assertTransition` (cancel) trong `leaveService.js`; UC-01 «include» "Kiểm tra hợp lệ & số dư" khớp `createRequest` | — |
| 24 | Non-Functional Requirements | Partial | **Partial** | NFR gắn cho UC-01 (NFR-01/02/03), UC-02 (NFR-01/02), UC-05 (NFR-04); UC-03, UC-04, UC-06, UC-07 không có NFR dù phân quyền NFR-04 áp dụng trực tiếp. | Thêm NFR cho UC-03, UC-04, UC-06, UC-07 (tối thiểu NFR-04, NFR-02). Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 26 | No UI specifics | Partial | **Partial** | use-cases.md phần lớn mô tả hành vi, nhưng UC-01 2a "Hiển thị lỗi cụ thể **dưới form**"; USER_STORIES (không đổi) vẫn có AC-01.2 "hiển thị dưới form", AC-03.1 "bấm *Hủy*", AC-05.1 "bấm *Duyệt*". | Diễn đạt "báo lỗi cụ thể cho nhân viên"; chuyển chi tiết bố cục sang UX doc. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 27 | No Technical Jargon | Partial | **Pass** | use-cases.md (tài liệu use case chính thức) không dùng mã HTTP, tên header hay tham số API; chỉ giữ ID truy vết | Ghi chú: AC trong USER_STORIES vẫn còn `409 INVALID_STATE`, `X-User-Id` — chấp nhận ở mức AC kiểm thử. |
| 28 | Assumptions Listed | Partial | **Pass** | use-cases.md "Giả định liên quan: ASM-01…ASM-05 (BRD §11.2)"; UC-01 Pre trỏ ASM-03 | — |
| 29 | Open Issues | Partial | **Pass** | use-cases.md mục "Open issues" OQ-04…OQ-06 có owner và hạn | — |

**Tổng sau vòng 2:** Pass 23 · Partial 3 · Fail 0 · N/A 3 · Rows 29

---

## 8. API — `API_Design_IEEE-1016-2009Checklist.xlsx` → `api.md` v1.1, `openapi.yaml`, `server.js`

Nguyên tắc chấm: khi checklist hỏi về một **cơ chế** (versioning, rate limit, pagination, auth chuẩn) mà artifact ghi **quyết định có chủ đích, có lý do và điều kiện/phiên bản kích hoạt** nhưng cơ chế chưa có → **Partial với target version** (không Pass vì cơ chế vắng mặt; không Fail vì khoảng trống được kiểm soát).

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 4 | Resource Naming | Partial | **Pass** | api.md §1 "Đặt tên tài nguyên": collection danh từ số nhiều; 3 action sub-resource (`/cancel`, `/approve`, `/reject`) có lý do (quy tắc quyền và dữ liệu riêng) — mẫu "custom method" trên resource danh từ, không phải endpoint RPC kiểu `/getX` | — |
| 8 | Pagination | Partial | **Partial** | api.md §1 "Pagination: Không áp dụng ở v1.0" + lý do (TC-39: list 10 000 đơn < 100 ms) + ngưỡng xem lại (> 500 đơn/lần list → `?limit&cursor`). Cơ chế chưa có. | Deferral có chủ đích. Owner: Nguyễn Trần Hà · Due: v2.0 (hoặc khi chạm ngưỡng 500 đơn/lần list) |
| 14 | API Versioning | **Fail** | **Partial** | api.md §1 "Versioning": hợp đồng hiện tại là v1 ngầm định, quy tắc tương thích ngược, thay đổi phá vỡ → `/api/v2/*` song song ≥ 1 release; openapi `info.version: 1.0.0`. Checklist hỏi "versioning implemented (URI/header)" — chưa có tiền tố/headers. | Deferral có chủ đích (chính sách đã ghi). Owner: Nguyễn Trần Hà · Due: v2.0 (khi có thay đổi phá vỡ đầu tiên) |
| 16 | Authentication | Partial | **Partial** | Định danh vẫn là `X-User-Id` (không phải cơ chế chuẩn), nhưng điều kiện bù trừ đã được **thực thi**: bind `127.0.0.1` (`server.js` dòng 155; TC-42), kiểm tra ở mọi route bảo vệ (`PUBLIC_ROUTES` + `authenticate`). Giới hạn ghi ở ADR-003, RISK-01, OQ-04. | Deferral có chủ đích: SSO/token chuẩn. Owner: Nguyễn Trần Hà · Due: v2.0 (OQ-04) |
| 18 | Rate Limiting | **Fail** | **Partial** | api.md §1 "Rate limiting: Không áp dụng ở v1.0 — quyết định có chủ đích" (loopback only, một người dùng/máy) + điều kiện bật (bind ra mạng → 60 req/phút/user, `429`); bind loopback đã kiểm chứng. Cơ chế chưa có. | Deferral có chủ đích. Owner: Nguyễn Trần Hà · Due: v2.0 |
| 19 | Input Validation | Partial | **Pass** | `leaveService.js` dòng 103–105 trả `VALIDATION_ERROR` khi `status` ∉ STATUS; test TC-23 (`'DONE'`); api.md §3 400 "`scope` hoặc `status` sai"; openapi `status` mô tả "Giá trị khác enum → 400" | — |
| 20 | Documentation | Partial | **Pass** | openapi.yaml (OpenAPI 3.0.3) nay khai báo 401 cho API-03…09, 400/413 cho các POST action, 400 cho approve, 405/500 cho hầu hết operation | Gợi ý: `/health` thiếu `405` (POST `/api/health` trả 405 trong code). |

**Tổng sau vòng 2:** Pass 13 · Partial 4 · Fail 0 · N/A 4 · Rows 21

---

## 9. Data — `Database_Design_Checklist.xlsx` → `data/model.md` v1.1, `jsonStore.js`

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 1 | Workload Classification | Partial | **Pass** | model.md §0 "OLTP nhỏ, document store một file, toàn bộ dữ liệu nạp vào bộ nhớ" | — |
| 3 | Read/Write Ratio | Partial | **Pass** | model.md §0 "≈ 10 : 1" có giải thích | — |
| 5 | Latency SLAs | Partial | **Pass** | model.md §0 SLA đọc p95 < 200 ms (đo 5.69 ms / ≤ 97 ms), SLA ghi < 200 ms (đo 89.89 ms) — khớp `TC-39-capacity.json` | — |
| 7 | Normalization | Partial | **Pass** | model.md §3.1: `days` là trường dẫn xuất lưu có chủ đích (bất biến lịch sử); phần còn lại 3NF | — |
| 8 | Denormalization Strategy | Partial | **Pass** | model.md §3.1 bảng trường dẫn xuất với chiến lược (lưu lúc tạo, không cập nhật; `employeeName`/`actorName` tính khi đọc) | — |
| 9 | Primary & Surrogate Keys | Partial | **Pass** | DI-08 khóa ghép `HISTORY` = (`requestId`, `at`, `to`) + lý do duy nhất; ER ghi chú "khóa ghép" | Gợi ý: ER mới đánh dấu `PK` cho `requestId`; nên đánh dấu cả `at`, `to`. |
| 10 | Foreign Keys & Constraints | Partial | **Pass** | DI-07 FK tầng ứng dụng (JSON không có FK) + kiểm tra `managerId` tồn tại trong `createRequest` (code dòng 52–54, TC-13); NOT NULL/CHECK qua `validateNewRequest` | — |
| 24 | Disaster Recovery (DR) | Partial | **Partial** | Restore đã diễn tập có evidence (`TC-40-restore-drill.log`, 3.7 s). Checklist hỏi "automated backup schedules configured" — backup vẫn thủ công (RUNBOOK §2 "Dừng server → copy"; model.md §4 "cuối mỗi ngày") và RUNBOOK không ghi tần suất. | Cấu hình lịch backup tự động (Task Scheduler/cron) hoặc ghi rõ backup thủ công cuối ngày là quyết định có chủ đích trong RUNBOOK §2. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |

**Tổng sau vòng 2:** Pass 13 · Partial 1 · Fail 0 · N/A 11 · Rows 25

---

## 10. UI/UX — `UI_UX_Design_IEEE-1016-2009_Checklist.xlsx` → `UI_UX_design/README.md` v1.1, `app/public/*`

| # | Checklist Item | Round 1 | Round 2 | Evidence | Action / Owner / Due |
|---|---|---|---|---|---|
| 4 | Grid System | Partial | **Partial** | UX §4 khai báo lưới 4 px (`--space: 4px`); phần lớn giá trị đã theo bội 4. Còn lệch lưới trong `styles.css`: `.actions { gap: 6px }`, `dl { gap: 6px 12px }`, `.badge { padding: 2px 8px }`. | Đổi 6 px → 8 px (hoặc 4 px), 2 px → 4 px. Owner: Nguyễn Trần Hà · Due: 2026-11-05 |
| 5 | Breakpoints | Partial | **Pass** | UX §4.2 breakpoint ≤ 600 px / ≥ 601 px; `styles.css` `@media (max-width: 600px)`; kiểm 375 px `13-mobile-375px.jpg`, `13-mobile-check.json` (không cuộn ngang) | Gợi ý: tablet (768 px) chưa được kiểm thử riêng. |
| 7 | Design System / Components | Partial | **Pass** | UX §4.3 Component catalog (Button, Input, Badge, Card, Table, Toast, Dialog) | — |
| 8 | Color Palette | Partial | **Pass** | UX §4 token ngữ nghĩa + trung tính + cặp nền/chữ badge; `styles.css` `:root` dùng token | Gợi ý: màu focus `#93c5fd` và `#fff` vẫn hard-code. |
| 9 | Typography | Partial | **Pass** | UX §4.1 Type scale (5 vai trò, cỡ + độ đậm) khớp `styles.css` | — |
| 11 | Contrast Ratios | Partial | **Pass** | `11-contrast-check.txt`: mọi cặp ≥ 4.5:1 (badge rejected 6.8:1, cancelled 8.33:1; thấp nhất 4.51:1); UX §5 1.4.3 ghi DEF-005 đã sửa | — |
| 12 | Touch Targets | **Fail** | **Pass** | `styles.css` dòng 35 `min-height: 44px` cho input/select/textarea/button; `button.link` `min-height/min-width: 44px`; `13-mobile-check.json` "minVisibleButtonHeightPx": 44 | — |
| 14 | Error Prevention & Recovery | Partial | **Pass** | `app.js` dòng 150 `confirm('Duyệt đơn … không hoàn tác được.')`; Hủy có confirm; Từ chối bắt buộc lý do | Ghi chú: vẫn dùng dialog native (OQ-06, v1.1); UX §2 navigation flow chưa vẽ bước xác nhận khi Duyệt. |
| 15 | System Status Visibility | Partial | **Pass** | `app.js` dòng 129–130 khóa nút + "Đang gửi…"; UX §4.4 | — |
| 17 | Micro-interactions | **Fail** | **Pass** | `styles.css` dòng 37–39 `:hover`, `:active`, `:disabled` | — |
| 21 | Redlining & Specs | Partial | **Pass** | UX §4.2 kích thước (control ≥ 44 px, padding 8×12, panel 16×20, gap 16, max 1080 px) + token | — |
| 22 | State Documentation | Partial | **Pass** | UX §4.3 cột trạng thái (default · hover · active · focus-visible · disabled/loading; lỗi cho input) | — |

**Tổng sau vòng 2:** Pass 18 · Partial 1 · Fail 0 · N/A 3 · Rows 22

---

## 11. Ghi chú ngoài checklist

1. `docs/04-design/design-audit.md` (bản tự audit "vòng 2/3", 133 dòng, "0 Fail") vẫn là bản trước audit độc lập vòng 1 và **không phản ánh** SAD v1.1 cũng như 222 dòng checklist thật; SAD header vẫn trỏ "Checklist → design-audit.md". Nên cập nhật hoặc trỏ tới `audits/`.
2. Thay đổi thiết kế v1.1 và sửa code DEF-005…007 chưa có change record trong SDP §10 (xem DevPlan audit vòng 2 #19).
3. ADR-002 vẫn gọi interface là `JsonStore` (SAD §3/§5 dùng `IStore`).
4. RUNBOOK (OPS-LF-001 v1.0) chưa nhắc biến `HOST` mới (mặc định `127.0.0.1`).
5. Trạng thái SAD "Sẵn sàng baseline — tag `design-v1` sẽ được tạo khi commit; chờ Tech lead ký" là trung thực (`git tag` rỗng).

## 12. Tổng hợp

| Checklist | Vòng 1 P / Pa / F / N/A | **Vòng 2 Pass** | **Partial** | **Fail** | **N/A** | Rows |
|---|---|---|---|---|---|---|
| `SAD_IEEE_1016_Checklist.xlsx` | 11 / 5 / 0 / 0 | 16 | 0 | 0 | 0 | 16 |
| `Class_Diagram_UML2.0_Checklist.xlsx` | 12 / 6 / 0 / 7 | 16 | 2 | 0 | 7 | 25 |
| `Sequence_Diagram_UML2.0_Checklist.xlsx` | 9 / 5 / 2 / 6 | 15 | 1 | 0 | 6 | 22 |
| `Activity_Diagram_UML2.0_Checklist.xlsx` | 3 / 6 / 3 / 16 | 10 | 2 | 0 | 16 | 28 |
| `Component_Diagram_UML2.0_Checklist.xlsx` | 4 / 4 / 5 / 5 | 12 | 1 | 0 | 5 | 18 |
| `Deployment_Diagram_UML2.0_Checklist.xlsx` | 7 / 6 / 0 / 3 | 12 | 1 | 0 | 3 | 16 |
| `UseCase_Document_UML2.0_Checklist.xlsx` | 10 / 13 / 3 / 3 | 23 | 3 | 0 | 3 | 29 |
| `API_Design_IEEE-1016-2009Checklist.xlsx` | 10 / 5 / 2 / 4 | 13 | 4 | 0 | 4 | 21 |
| `Database_Design_Checklist.xlsx` | 6 / 8 / 0 / 11 | 13 | 1 | 0 | 11 | 25 |
| `UI_UX_Design_IEEE-1016-2009_Checklist.xlsx` | 7 / 10 / 2 / 3 | 18 | 1 | 0 | 3 | 22 |
| **Tổng** | **79 / 68 / 17 / 58** | **148** | **16** | **0** | **58** | **222** |

**Kết luận gate:** 0 Fail (vòng 1: 17). 16 Partial còn lại đều có action, owner (Nguyễn Trần Hà) và hạn — 12 dòng hạn 2026-11-05, 4 dòng API (#8, #14, #16, #18) là deferral có chủ đích được ghi trong api.md/ADR-003 với target v2.0. design-v1 đạt điều kiện nội dung theo §A8; baseline vẫn chờ chữ ký Tech lead và tag khi commit.
