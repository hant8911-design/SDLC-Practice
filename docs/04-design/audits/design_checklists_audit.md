# Design Checklists Audit — LeaveFlow design-v1

| Thuộc tính | Giá trị |
|---|---|
| Ngày | 2026-11-02 |
| Auditor | Independent auditor agent (read-only) |
| Căn cứ | `step-by-step-guidance.md` §A8, `design/Design_Audit_Prompt.md` |
| Phạm vi | `docs/04-design/SAD.md`, `ADR-001…003`, `api.md`, `openapi.yaml`, `data/model.md`, `UI_UX_design/README.md`, `docs/03-analysis/USER_STORIES.md`, `app/src/**`, `app/public/*` |
| Phương pháp | Đọc nguyên bản từng dòng checklist `.xlsx` (openpyxl, không sửa file gốc); chấm theo §A8: `Pass` cần evidence mở được, `Partial`/`Fail` cần hành động, `N/A` cần lý do. Sơ đồ là Mermaid (adaptation log dòng 8) — chấm ký hiệu trong khả năng của Mermaid, nhưng vẫn ghi lỗi ngữ nghĩa UML thật. |
| Ràng buộc | Không chỉnh sửa artifact nào; đây là báo cáo riêng. Owner đề xuất cho mọi Partial/Fail: Nguyễn Trần Hà (design owner) — hạn đề xuất: trước khi ký baseline `design-v1`. |

> Ghi chú phạm vi: `design/Checklist_Database Design Review.xlsx` (sheet `Checklist`) không nằm trong danh sách được giao; checklist dữ liệu được chấm là `design/Database_Design_Checklist.xlsx` (25 dòng).

---

## 1. SAD — `SAD_IEEE_1016_Checklist.xlsx` → `SAD.md` (+ ADR-001…003)

| # | Checklist Item | Status | Evidence | Notes / Action |
|---|---|---|---|---|
| 1 | Scope & Boundary | Pass | SAD §1.1, §1.3 (CON-02), §7 subgraph `LeaveFlow` | Ranh giới hệ thống (1 tiến trình Node + UI tĩnh + file JSON) được nêu rõ. |
| 2 | Context View | Partial | SAD §1.1, §6 | Không có context view riêng liệt kê dịch vụ hệ thống cung cấp và dịch vụ cần từ môi trường (trình duyệt, filesystem, Node runtime, GitHub Actions). Hành động: thêm §2.0 "Context" (sơ đồ C4-L1 hoặc bảng provided/required). |
| 3 | Architectural Drivers | Pass | SAD §8 (NFR-01, 03, 04, 05), §1.3 CON-01 (NFR-06) | Ghi chú: NFR-02 (usability/a11y) không có quality scenario trong §8 — nên bổ sung một dòng trỏ sang UX §5. |
| 4 | System Constraints | Pass | SAD §1.3 CON-01…03; ADR-001, ADR-003 | Không có yêu cầu pháp lý (dữ liệu demo, model.md §4). |
| 5 | Composition View | Pass | SAD §2 bảng CMP-01…05; §5 | Khớp 5 file thật trong `app/src`, `app/public`. |
| 6 | Logical View | Pass | SAD §3 classDiagram | Lỗi ký hiệu chi tiết xem mục 2. |
| 7 | Dependency View | Partial | SAD §5 + "Quy tắc phụ thuộc" | Sơ đồ sai so với code: vẽ `REPO --> SEED` nhưng `jsonStore.js` không import seed (chính `server.js` import `./data/seed` và inject vào `JsonStore`); thiếu `HTTP → DOM` (`server.js` import `DomainError`) và `HTTP → REPO` (`server.js` khởi tạo `JsonStore`). Hành động: sửa cạnh trong §5 cho đúng `require()` thực tế. |
| 8 | Interaction View | Pass | SAD §4.1, §4.2 | Chỉ 2 kịch bản (tạo, duyệt/từ chối); hủy/xem chi tiết không có sequence — chấp nhận được vì cùng mẫu. Lỗi ký hiệu xem mục 3. |
| 9 | State Dynamics View | Pass | SAD §4.3; `app/src/domain/leave.js` `TRANSITIONS` | Khớp code. |
| 10 | Information View | Partial | `docs/04-design/data/model.md`; ADR-002 | SAD không có mục/đường dẫn tới data model (grep `model.md` trong SAD.md: 0 kết quả). Hành động: thêm mục "Information view" trong SAD trỏ tới `data/model.md` và ADR-002. |
| 11 | Interface View | Partial | `api.md`, `openapi.yaml`; SAD §7 chỉ nhắc API-03…09 | SAD không liên kết `api.md`/`openapi.yaml`; hợp đồng OpenAPI còn thiếu response mà server thật trả (xem mục 8 dòng 20). Hành động: thêm link Interface view trong SAD §2/§7 và hoàn thiện openapi. |
| 12 | Resource View | Partial | ADR-002 Consequences (< 10 000 đơn); RUNBOOK (db.json > 5 MB) | SAD không phân bổ tài nguyên (RAM cho toàn bộ dữ liệu in-memory, kích thước file, CPU ghi lại toàn file). Hành động: thêm bảng ngân sách tài nguyên nhỏ trong SAD §6. |
| 13 | Physical/Execution Mapping | Pass | SAD §6 sơ đồ + bảng cấu hình | Xem mục 6. |
| 14 | Architectural Decisions | Pass | SAD §9; ADR-001, ADR-002, ADR-003 (Context/Decision/Consequences) | |
| 15 | Rejected Alternatives | Pass | Bảng "Options" trong ADR-001 (A, C), ADR-002 (B, C) | Có lý do kỹ thuật cho phương án bị loại. ADR-003 không có bảng options — nên bổ sung (vd. Basic auth, token tĩnh). |
| 16 | Traceability | Pass | SAD §2 cột FR/NFR; ADR "Liên quan"; traceability.md §2 | Ghi chú: comment trong code dùng số FR khác PRD (vd. `leaveService.js` "FR-02: profile" = PRD FR-04; "FR-03: cancel" = FR-06; "FR-05: approve" = FR-08; "FR-07: detail" = FR-10; `leave.js` "FR-01" validate = FR-02, "SAD §5.2" = SAD §4.3). Hành động (Phase 6): sửa comment cho khớp PRD. |

**Tổng:** Pass 11 · Partial 5 · Fail 0 · N/A 0 · Tổng 16

---

## 2. Class diagram — `Class_Diagram_UML2.0_Checklist.xlsx` → SAD §3

| # | Checklist Item | Status | Evidence | Notes / Action |
|---|---|---|---|---|
| 1 | Diagram Name | Pass | SAD §3 "Logical view — Class diagram" | Nên thêm `title` trong frontmatter Mermaid. |
| 2 | Abstraction Level | Pass | SAD §3 tiêu đề "Logical view" | Mức logical (design class), trộn entity + service — chấp nhận cho logical view. |
| 3 | Class Notation | Pass | SAD §3 (Mermaid render 3 ngăn) | |
| 4 | Naming Conventions | Pass | `User`, `LeaveRequest`, `HistoryEntry`, `LeaveService`, `JsonStore`, `DomainError` | |
| 5 | Abstract Classes | N/A | — | Thiết kế không có lớp trừu tượng. |
| 6 | Interfaces | Partial | ADR-002 Decision ("cô lập sau interface `JsonStore`") vs SAD §3 (lớp cụ thể) | ADR-002 dựa vào một "interface" repository để thay SQLite, nhưng sơ đồ chỉ có lớp cụ thể `JsonStore`. Hành động: thêm `<<interface>> LeaveStore` và để `LeaveService` phụ thuộc vào interface, `JsonStore` hiện thực nó. |
| 7 | Visibility (attributes) | Pass | SAD §3 (`+`/`-` cho mọi thuộc tính) | Ghi chú: code để `store`, `filePath`, `data` là field public (`this.store`), sơ đồ ghi `-` — chấp nhận như ý đồ thiết kế. |
| 8 | Typing & Format | Partial | SAD §3 `+string id`, `+int days` | Dạng kiểu-trước-tên (Java), không phải UML `visibility name: type`. Mermaid cho phép viết `+id: string`. Hành động: đổi sang `+id: String`… |
| 9 | Multiplicity (Optional) | N/A | — | Không có thuộc tính dạng tập hợp trên entity. |
| 10 | Static Attributes | N/A | — | Không có thuộc tính static. |
| 11 | Visibility (operations) | Pass | SAD §3 `LeaveService`, `JsonStore`, `LeaveDomain` | |
| 12 | Signatures | Partial | SAD §3 `+authenticate(userId) User`, `+validateNewRequest(input, today)` | Tham số không có kiểu; nhiều operation thiếu kiểu trả về (`validateNewRequest`, `assertTransition`, `insertRequest`, `updateRequest`); kiểu `Profile`, `RequestDetail`, `Balance` không được định nghĩa; thiếu `JsonStore.findRequest()`/`listUsers()` và `LeaveService.listUsers()` có trong code và được dùng ở SAD §4.2. Hành động: viết đủ `name(param: Type): Return` và bổ sung operation còn thiếu. |
| 13 | Abstract Operations | N/A | — | Không có operation trừu tượng. |
| 14 | Static Operations | Partial | SAD §3 `LeaveDomain <<module>>` | Các hàm cấp module (không cần instance) không được đánh dấu static; Mermaid hỗ trợ hậu tố `$`. `<<module>>` không phải keyword UML chuẩn — dùng `<<utility>>`. |
| 15 | Association Lines | Pass | SAD §3 `-->`, `*--` | |
| 16 | Navigability | Pass | SAD §3 `User --> LeaveRequest`, `LeaveService --> JsonStore` | |
| 17 | Multiplicity | Partial | SAD §3 dòng quan hệ | `LeaveService --> JsonStore` không có multiplicity; thiếu hẳn quan hệ `LeaveRequest → User` (approverId) và `HistoryEntry → User` (actorId) mà ER (model.md §1) có. Hành động: bổ sung 2 association có multiplicity `* → 1`. |
| 18 | Roles | Partial | SAD §3 nhãn `managerId`, `tạo`, `lịch sử` | Đây là tên association, không phải role name ở đầu mút. Hành động: thêm role (`manager`/`subordinate`, `employee`, `approver`, `actor`). |
| 19 | Aggregation (Shared) | N/A | — | Không có quan hệ has-a yếu trong miền này. |
| 20 | Composition (Strong) | Pass | SAD §3 `LeaveRequest "1" *-- "1..*" HistoryEntry` | Khớp DI-06 (model.md §3). |
| 21 | Generalization (Inheritance) | N/A | `leave.js` `class DomainError extends Error` | Chỉ kế thừa lớp nền của runtime; không có kế thừa trong miền. Có thể vẽ `Error <|-- DomainError` cho đầy đủ. |
| 22 | Realization (Implementation) | N/A | — | Hiện chưa có interface (xem dòng 6); khi thêm `LeaveStore` cần dùng `..|>`. |
| 23 | Dependency | Pass | SAD §3 `..>` (dùng, ném) | |
| 24 | Cohesion & Coupling | Pass | SAD §2, §3; `leaveService.js` constructor DI | Domain thuần, service điều phối, store tách biệt. |
| 25 | Overcrowding | Pass | SAD §3 (11 lớp) | Dễ đọc. |

**Tổng:** Pass 12 · Partial 6 · Fail 0 · N/A 7 · Tổng 25

---

## 3. Sequence diagrams — `Sequence_Diagram_UML2.0_Checklist.xlsx` → SAD §4.1–4.2

| # | Checklist Item | Status | Evidence | Notes / Action |
|---|---|---|---|---|
| 1 | Diagram Name | Pass | SAD §4.1 "Tạo đơn (US-01)", §4.2 "Duyệt / từ chối (US-05, US-06, US-08)" | |
| 2 | Time Axis | Pass | SAD §4.1–4.2 (`autonumber`) | |
| 3 | Lifeline Notation | Pass | Mermaid `participant` | |
| 4 | Naming Convention | Partial | `participant API as HTTP adapter (CMP-01)` | Không theo `objectName : ClassName`. Hành động: `svc : LeaveService`, `store : JsonStore`, `domain : leave.js`. |
| 5 | Actor vs. System | Pass | `actor An`, `actor Chi` | |
| 6 | Synchronous Messages | Pass | `->>` | |
| 7 | Asynchronous Messages | N/A | — | Không có lời gọi fire-and-forget. |
| 8 | Return/Reply Messages | Partial | SAD §4.1 dòng `DOM-->>API`, §4.2 `API-->>UI: 200` | Nhiều lời gọi không có reply (`findUser`, `authenticate`, `listRequests`, `computeBalance`, `insertRequest`, `updateRequest`); `DOM-->>API` trả về cho lifeline không phải bên gọi (bên gọi là SVC); §4.1 nhánh OK và §4.2 không có `SVC-->>API`. Hành động: bổ sung reply đúng bên gọi. |
| 9 | Self Messages | Pass | `SVC->>SVC: kiểm tra trùng`, `assertApprover` | |
| 10 | Creation & Destruction | N/A | — | Đơn là bản ghi lưu trữ, không có lifeline đối tượng được tạo/hủy. |
| 11 | Message Signatures | Partial | `validateNewRequest(body, today)` (tốt) vs `approveRequest / rejectRequest`, `listRequests(của u1)`, `computeBalance(...)` | Một số nhãn là văn xuôi/thiếu tham số; `findRequest` (§4.2) không có trong class diagram §3. Hành động: ghi đủ tham số và đồng bộ với §3. |
| 12 | Activation Boxes | Fail | SAD §4.1–4.2 (không có `activate`/`+`/`-`) | Mermaid hỗ trợ activation nhưng không dùng. Hành động: thêm `->>+` / `-->>-` cho API, SVC, DB. |
| 13 | Overlapping Activations | Fail | `SVC->>SVC` (§4.1, §4.2) | Self-call không có activation lồng. Hành động: dùng activation lồng cho self-call sau khi sửa dòng 12. |
| 14 | Frame Notation | Pass | `alt`, `opt` | |
| 15 | Alternative (alt) | Partial | §4.1 `alt dữ liệu không hợp lệ / else hợp lệ` | Cách dùng alt đúng, nhưng §4.1 thiếu nhánh 401 (authenticate thất bại) và 403 (role ≠ EMPLOYEE — có ở activity §4.4 và `createRequest`); §4.2 không có alt nào cho 403/409/400 dù code ném các lỗi này. Hành động: thêm alt lỗi. |
| 16 | Optional (opt) | Pass | §4.2 `opt reject` | |
| 17 | Loop (loop) | N/A | — | Không có lặp ở mức tương tác. |
| 18 | Parallel (par) | N/A | — | Một tiến trình, xử lý tuần tự. |
| 19 | Reference (ref) | N/A | — | Mermaid không có `ref`. Ghi chú: §4.2 bỏ hẳn bước authenticate — nên dùng `Note`/`rect` "ref: Xác thực X-User-Id" thống nhất cho cả 2 sơ đồ. |
| 20 | No Dangling Messages | Partial | §4.1 `DOM-->>API`; §4.2 `API-->>UI: 200 [đơn của nhóm]` | Reply bị định tuyến sai và response API không có lời gọi SVC tương ứng (GET team trả về mà không qua `listRequests`). Hành động: nối đủ chuỗi API→SVC→DB và reply ngược lại. |
| 21 | Readability & Spacing | Pass | SAD §4.1–4.2 | |
| 22 | State Invariants | N/A | — | Không bắt buộc; có thể thêm `Note over DB: status = PENDING` trước `assertTransition`. |

**Tổng:** Pass 9 · Partial 5 · Fail 2 · N/A 6 · Tổng 22

---

## 4. Activity / State — `Activity_Diagram_UML2.0_Checklist.xlsx` → SAD §4.4 (và §4.3)

| # | Checklist Item | Status | Evidence | Notes / Action |
|---|---|---|---|---|
| 1 | Activity Name | Partial | SAD §4.4 tiêu đề markdown | Không có frame activity đặt tên trong sơ đồ. Hành động: bọc toàn bộ trong `subgraph "act Kiểm tra hợp lệ khi tạo đơn"`. |
| 2 | Activity Parameters | Partial | `S([Nhận request tạo đơn])`, `OK([201 Created])` | Input (body + user) và output (LeaveRequest / DomainError) chỉ ngầm định. Hành động: thêm node tham số `[/input: user, body/]`, `[/output: LeaveRequest/]` trên biên frame. |
| 3 | Pre/Post-conditions | Fail | SAD §4.4 | Không ghi tiền điều kiện (đã qua authenticate X-User-Id, body JSON ≤ 10 KB) và hậu điều kiện (đơn PENDING + 1 HISTORY đã ghi nguyên tử). Hành động: thêm note «precondition»/«postcondition». |
| 4 | Action Nodes | Partial | `D[Đếm ngày công…]`, `SAVE[Lưu PENDING + lịch sử]` | Action vẽ hình chữ nhật góc vuông; Mermaid có `(...)` bo góc. Node lỗi `[[...]]` là subroutine shape. Hành động: đổi sang `(...)`. |
| 5 | Action Naming | Pass | "Đếm ngày công T2–T6", "Lưu PENDING + lịch sử" | |
| 6 | Control Flows | Pass | SAD §4.4 mũi tên `-->` | |
| 7 | Pins | N/A | — | Sơ đồ tập trung luồng điều khiển. |
| 8 | Object Nodes | N/A | — | Như trên. |
| 9 | Object Flows | N/A | — | Như trên. |
| 10 | Data Stores (<<datastore>>) | Partial | `SAVE[Lưu PENDING + lịch sử]` | Việc ghi `db.json` (NFR-03) không được mô hình hóa. Hành động: thêm `[(«datastore» db.json)]` nối từ SAVE. |
| 11 | Central Buffers | N/A | — | Không có hàng đợi. |
| 12 | Decision Nodes | Pass | `R`, `V1`, `V2`, `V3`, `O`, `T`, `B` (`{}`) | Mỗi decision 1 vào, 2 ra. |
| 13 | Guard Conditions | Partial | Nhãn `Có` / `Không` | Exhaustive và loại trừ nhau nhưng không ở dạng `[guard]`. Hành động: `-- "[role = EMPLOYEE]" -->` / `"[else]"`. |
| 14 | Merge Nodes | Fail | `E400` nhận 3 luồng vào (V1, V2, V3); `SAVE` nhận 2 (T, B) | Theo ngữ nghĩa UML, action có nhiều cạnh vào là *implicit join* (chờ tất cả token) → luồng sẽ treo. Hành động: thêm merge diamond trước `E400` và trước `SAVE`. |
| 15 | Fork Nodes | N/A | — | Không có xử lý song song. |
| 16 | Join Nodes | N/A | — | Như trên. |
| 17 | Send Signal Actions | N/A | — | Không gửi tín hiệu bất đồng bộ ra ngoài. |
| 18 | Accept Event Actions | N/A | — | Request HTTP đồng bộ được coi là điểm bắt đầu activity. |
| 19 | Time Events | N/A | — | Không có sự kiện thời gian. |
| 20 | Expansion Regions | N/A | — | Kiểm tra trùng trên tập đơn được trừu tượng thành một decision. |
| 21 | Interruptible Activity Regions | N/A | — | Không có hủy giữa chừng. |
| 22 | Interrupting Edges | N/A | — | Như trên. |
| 23 | Exception Handlers | N/A | — | Lỗi nghiệp vụ được mô hình bằng nhánh decision → node lỗi; chấp nhận được. |
| 24 | Activity Partitions | Fail | SAD §4.4 | Không có swimlane, trong khi các bước thuộc CMP-02 (role, trùng, số dư, lưu) và CMP-03 (validate, đếm ngày). Hành động: dùng `subgraph` làm partition `LeaveService` / `Domain` / `JsonStore`. |
| 25 | Multidimensional Partitions | N/A | — | Không cần. |
| 26 | External Partitions | N/A | — | Không có hệ thống ngoài. |
| 27 | Flow Final Node | N/A | — | Không có nhánh song song. |
| 28 | Activity Final Node | Partial | `OK([201 Created])`, `E400/E403/E409/E422 [[...]]`; §4.3 dùng `[*]` đúng | Activity §4.4 không có node kết thúc dạng bullseye; các node lỗi là điểm cụt. Hành động: nối tất cả kết cục tới một node final `((◉))` (state machine §4.3 đã đúng). Ghi chú §4.3: note "mọi chuyển tiếp khác trả 409" chỉ gắn vào APPROVED, nhưng áp dụng cho cả REJECTED/CANCELLED. |

**Tổng:** Pass 3 · Partial 6 · Fail 3 · N/A 16 · Tổng 28

---

## 5. Component — `Component_Diagram_UML2.0_Checklist.xlsx` → SAD §5

| # | Checklist Item | Status | Evidence | Notes / Action |
|---|---|---|---|---|
| 1 | Diagram Name | Pass | SAD §5 "Development view — Component diagram" | |
| 2 | Abstraction Level | Partial | SAD §5 node `FILE`, `TESTS`, `SEED`, subgraph `Browser`/`NodeProcess` | Trộn component với file dữ liệu, bộ test và container runtime (khái niệm deployment). Hành động: bỏ TESTS (hoặc tách sơ đồ test), chuyển Browser/Node process sang §6. |
| 3 | Component Nodes (<<component>>) | Fail | SAD §5 | Không node nào có keyword `«component»`. Hành động: thêm `«component»` vào nhãn CMP-01…05. |
| 4 | Naming Conventions | Pass | "CMP-01 HTTP adapter", "CMP-02 LeaveService"… | |
| 5 | Internal Structure (Optional) | N/A | — | Không thể hiện cấu trúc trong của component. |
| 6 | Provided Interfaces (Lollipop) | Fail | SAD §5 | Không có interface cung cấp (vd. REST API của CMP-01, API `LeaveService` của CMP-02, repository của CMP-04). Hành động: thêm node tròn `((IRestApi))`, `((ILeaveService))`, `((ILeaveStore))`. |
| 7 | Required Interfaces (Socket) | Fail | SAD §5 | Không có interface yêu cầu. Hành động: như dòng 6, nối phía yêu cầu. |
| 8 | Interface Naming | Partial | Cạnh `"REST/JSON (fetch)"` | Chỉ ghi giao thức trên cạnh, chưa có interface có tên hợp đồng. Hành động: đặt tên theo API-LF-001 (`LeaveFlow REST API v1`). |
| 9 | Port Encapsulation | N/A | — | Mermaid không vẽ port trên biên; cổng `PORT` được ghi ở §6. |
| 10 | Delegation Connectors | N/A | — | Không có cấu trúc trong. |
| 11 | Usage Dependencies | Fail | SAD §5 `HTTP --> SVC`, `REPO --> SEED`; `app/src/server.js` dòng `require` | Dùng mũi tên liền thay vì nét đứt `-.->`; cạnh `REPO → SEED` sai (seed được `server.js` import); thiếu `HTTP ⇢ DOM` (`DomainError`) và `HTTP ⇢ REPO` (khởi tạo `JsonStore`). Hành động: đổi sang `-.->`, sửa/ bổ sung cạnh theo code. |
| 12 | Assembly Connectors | Fail | SAD §5 | Không có ball-and-socket nên không thể hiện lắp ráp. Hành động: sau khi thêm interface (dòng 6–7), nối provided ↔ required. |
| 13 | Realization | N/A | — | Không vẽ interface dạng hình chữ nhật riêng. |
| 14 | Subsystems (<<subsystem>>) | N/A | — | Hệ thống nhỏ, không có subsystem. |
| 15 | Artifacts (<<artifact>>) | Partial | `FILE[("data/db.json")]`, đường dẫn file trong nhãn CMP | File/artefact vật lý không có `«artifact»`. Hành động: gắn `«artifact» db.json` hoặc chuyển sang §6. |
| 16 | Loose Coupling | Partial | SAD §5 "Quy tắc phụ thuộc"; `leaveService.js` constructor | Phân lớp một chiều và DI là tốt, nhưng mọi phụ thuộc là trực tiếp vào lớp cụ thể, không qua interface (mâu thuẫn ADR-002 "interface JsonStore"). Hành động: như dòng 6. |
| 17 | Readability | Pass | SAD §5 | Ít cạnh cắt nhau. |
| 18 | Orphaned Components | Pass | SAD §5 | Mọi node có ít nhất một cạnh. |

**Tổng:** Pass 4 · Partial 4 · Fail 5 · N/A 5 · Tổng 18

---

## 6. Deployment — `Deployment_Diagram_UML2.0_Checklist.xlsx` → SAD §6

| # | Checklist Item | Status | Evidence | Notes / Action |
|---|---|---|---|---|
| 1 | Diagram Name | Pass | SAD §6 "Physical view — Deployment" + subgraph "Máy người dùng / máy dev" | |
| 2 | Scope & Topology | Pass | SAD §6, §1.3 CON-02 | Local một máy + CI GitHub. |
| 3 | Device Nodes (<<device>>) | Partial | subgraph `Workstation` | Không có `«device»`. Hành động: thêm `«device»` vào nhãn subgraph. |
| 4 | Execution Environments (<<executionEnvironment>>) | Partial | subgraph `Node["node ≥ 22 — npm start"]`, node `B` trình duyệt | Có môi trường thực thi nhưng thiếu `«executionEnvironment»`. Hành động: bổ sung keyword cho Node runtime, trình duyệt, GitHub Actions runner. |
| 5 | Node Specifications | Pass | SAD §6 (Windows/macOS/Linux, node ≥ 22, Chrome/Edge/Firefox, Node 22 CI) | RAM/CPU không quan trọng với quy mô này. |
| 6 | Artifacts (<<artifact>>) | Partial | `APP["LeaveFlow PORT=3000"]`, `F[("app/data/db.json")]` | Artefact thật (`src/server.js`…, `public/*`, `package.json`, `db.json`) không được gắn `«artifact»`. Hành động: thay `APP` bằng các artefact có keyword. |
| 7 | Deployment Relationships | N/A | — | Dùng cách lồng (dòng 9) thay vì `«deploy»`. |
| 8 | Manifestations | Partial | SAD §2 cột "File" (CMP ↔ file) | Ánh xạ artefact ↔ component chỉ có ở bảng §2, không có `«manifest»` trong §6. Hành động: thêm cạnh/ghi chú `«manifest»` hoặc trỏ rõ tới bảng §2. |
| 9 | Nesting (Alternative) | Pass | `APP` trong `Node` trong `Workstation` | |
| 10 | Node Connections | Pass | `B -- HTTP --> APP`, `APP -- fs --> F` | |
| 11 | Protocols & Networks | Partial | Nhãn `"HTTP localhost:3000"`, `"fs read/write"`, `"git push"` | Giao thức có ghi nhưng không theo stereotype `«HTTP»`, `«file I/O»`, `«HTTPS/git»`. Hành động: chuẩn hóa nhãn. |
| 12 | Multiplicity | N/A | — | Một instance duy nhất (CON-02, RISK-02). |
| 13 | Disaster Recovery (DR) | N/A | RUNBOOK dòng Backup/Restore | Một máy local; DR = backup/restore thủ công trong RUNBOOK. |
| 14 | Databases & Storage | Pass | `F[("app/data/db.json")]` tách khỏi `Node` | |
| 15 | Scalability & Constraints | Partial | SAD §6 nhãn "HTTP localhost:3000"; SAD §10 RISK-01; `app/src/server.js` `createApp(...).listen(port, …)` | Sơ đồ ngụ ý chỉ truy cập localhost nhưng `listen(port)` không truyền host → bind mọi interface; giới hạn 1 tiến trình (RISK-02) không được chú thích trên sơ đồ. Hành động: ghi chú ràng buộc 1 instance trên sơ đồ và (Phase 6) `listen(port, '127.0.0.1')` hoặc sửa mô tả. |
| 16 | Clarity | Pass | SAD §6 | Không có đường cắt nhau. |

**Tổng:** Pass 7 · Partial 6 · Fail 0 · N/A 3 · Tổng 16

---

## 7. Use case — `UseCase_Document_UML2.0_Checklist.xlsx` → SAD §7 + `USER_STORIES.md`

| # | Checklist Item | Status | Evidence | Notes / Action |
|---|---|---|---|---|
| 1 | Use Case ID | Pass | SAD §7 UC-01…UC-07 | Node `INC` không có ID — nên đặt `UC-08`. |
| 2 | Use Case Name | Pass | "Gửi đơn nghỉ", "Hủy đơn chờ duyệt", "Duyệt đơn"… | |
| 3 | Description | Pass | USER_STORIES US-01…US-08 (câu "Là…, tôi muốn…, để…"); SAD §7 bảng UC↔US | |
| 4 | Version & Date | Pass | SAD header (1.0, 2026-11-02); USER_STORIES header (v1.0, 2026-11-02) | |
| 5 | Author & Stakeholders | Partial | Owner Nguyễn Trần Hà ở cả hai file | USER_STORIES không nêu người phê duyệt. Hành động: thêm dòng "Phê duyệt: <PO/Tech lead>". |
| 6 | Status | Partial | SAD "Baseline — chờ Tech lead ký" | USER_STORIES không có trường trạng thái. Hành động: thêm Draft/Under Review/Approved. |
| 7 | Primary Actor | Partial | SAD §7 `EMP`, `MGR`; US-07 "Là HR/nhân viên", US-08 "Là HR" | HR xuất hiện làm vai trò trong story nhưng không có trong sơ đồ use case và không có trong `Role` (EMPLOYEE/MANAGER). Hành động: hoặc đổi vai trò US-07/US-08, hoặc thêm HR làm stakeholder (không phải actor) và ghi rõ. |
| 8 | Secondary Actors | N/A | ADR-003 | Không có hệ thống ngoài (định danh giả lập). |
| 9 | System Boundary | Pass | SAD §7 `subgraph LF["LeaveFlow"]` | |
| 10 | Trigger | Partial | AC dạng "When…" (vd. AC-01.1) | Không có trường Trigger riêng cho từng UC. Hành động: thêm bảng UC với cột Trigger. |
| 11 | Pre-conditions | Partial | AC "Given…" | Thiếu tiền điều kiện chung (đã chọn người dùng hợp lệ / X-User-Id). Hành động: thêm Pre-conditions cho từng UC. |
| 12 | Post-conditions (Success) | Pass | AC-01.1, AC-03.1, AC-05.1, AC-06.2 | |
| 13 | Post-conditions (Failure) | Partial | AC-01.2 "đơn không được tạo"; các AC khác chỉ "bị từ chối (403/409)" | Không nói rõ trạng thái hệ thống không đổi khi thất bại. Hành động: thêm "dữ liệu và lịch sử không thay đổi". |
| 14 | Main Success Scenario | Fail | USER_STORIES (chỉ có story + AC); SAD §7 | Không có luồng chính đánh số cho UC nào. Hành động: viết MSS đánh số cho UC-01…UC-07 (có thể ngắn 4–6 bước). |
| 15 | Action/Response Format | Fail | Như trên | Không có bước "Actor làm / Hệ thống phản hồi". Hành động: viết MSS theo dạng actor–system. |
| 16 | Alternate Flows | Partial | AC-01.3 (đơn đã hủy không tính trùng), AC-02.3 (SICK/UNPAID) | Có một số nhánh thay thế qua AC nhưng không có mục Alternate Flows (vd. duyệt có/không có nhận xét). Hành động: thêm mục A1, A2… |
| 17 | Exception Flows | Pass | AC-01.2–01.4, AC-02.2, AC-03.2–03.3, AC-04.2, AC-05.2, AC-06.1, AC-07.2, AC-08.1–08.2 | |
| 18 | Flow References | Fail | — | Không có số bước nên không tham chiếu được. Hành động: sau khi có MSS, ghi "E1 rẽ nhánh từ bước 3". |
| 19 | Association | Pass | SAD §7 `EMP --- UC1…`, `MGR --- UC4…` | |
| 20 | Include (<<include>>) | Partial | SAD §7 `UC5 -. «include» .-> INC`; `leaveService.js` `approveRequest` | UC-01 «include» đúng. UC-05 «include» "Kiểm tra hợp lệ & số dư" sai với code: `approveRequest` chỉ kiểm tra approver và chuyển trạng thái, không validate lại hay kiểm tra số dư. Hành động: bỏ include của UC-05 hoặc tách use case "Kiểm tra quyền & trạng thái" dùng chung cho UC-03/05/06. |
| 21 | Extend (<<extend>>) | N/A | — | Không có hành vi tùy chọn được mô hình hóa (có thể cân nhắc UC-07 «extend» UC-02/UC-04). |
| 22 | Generalization | N/A | — | Hai actor không có actor cha chung trong thiết kế. |
| 23 | Business Rules | Pass | AC-01.2 (≤ 200 ký tự, cùng năm…), AC-02.1 (12 ngày), AC-06.1 | |
| 24 | Non-Functional Requirements | Partial | AC-08.2 (401) | Không UC nào gắn NFR-01…06. Hành động: thêm cột NFR liên quan vào bảng UC SAD §7. |
| 25 | Data Requirements | Pass | AC-01.1 (type, startDate, endDate, reason); AC-04.1; `openapi.yaml` `NewLeaveRequest` | |
| 26 | No UI specifics | Partial | AC-01.2 "hiển thị dưới form", AC-03.1 "bấm *Hủy*", AC-05.1 "bấm *Duyệt*" | Hành động: diễn đạt hành vi, để chi tiết UI cho UX doc. |
| 27 | No Technical Jargon | Partial | AC-03.2 "409 INVALID_STATE", AC-04.2 "`scope=team`", AC-08.2 "`X-User-Id`, 401" | Hành động: đổi thành ngôn ngữ nghiệp vụ, chuyển mã lỗi sang RTM/test. |
| 28 | Assumptions Listed | Partial | ASM-xx có trong BRD/intent; ADR-003 nhắc ASM-01 | Không liệt kê/không liên kết trong USER_STORIES hay SAD §7. Hành động: thêm mục "Giả định" trỏ tới ASM liên quan. |
| 29 | Open Issues | Partial | OQ-xx có trong BRD | USER_STORIES/SAD §7 không có mục câu hỏi mở (kể cả ghi "không có"). Hành động: thêm mục Open Issues. |

**Tổng:** Pass 10 · Partial 13 · Fail 3 · N/A 3 · Tổng 29

---

## 8. API — `API_Design_IEEE-1016-2009Checklist.xlsx` → `api.md`, `openapi.yaml`, `app/src/server.js`

| # | Checklist Item | Status | Evidence | Notes / Action |
|---|---|---|---|---|
| 1 | Protocol Selection | Pass | api.md §1; ADR-001 | REST/JSON trên HTTP phù hợp CRUD nhỏ. |
| 2 | Idempotency | Pass | api.md §1 "Idempotency"; `leave.js` `assertTransition` | GET không đổi dữ liệu; approve/reject/cancel lần 2 → 409 không ghi. Không có PUT/DELETE. |
| 3 | Statelessness | Pass | ADR-003; `server.js` `service.authenticate(req.headers['x-user-id'])` mỗi request | Không có session phía server. |
| 4 | Resource Naming | Partial | api.md §2 API-07…09 `/cancel`, `/approve`, `/reject` | Danh từ cho collection, nhưng 3 endpoint là động từ (controller resource). Hành động: ghi lý do chọn mẫu action trong api.md §1, hoặc mô hình hóa `POST /leave-requests/{id}/decisions`. |
| 5 | Pluralization & Case | Pass | `/leave-requests`, `/users` (kebab-case, số nhiều); `/me` là ngoại lệ chuẩn | |
| 6 | Nesting Depth | Pass | Sâu nhất `/leave-requests/{id}/approve` | |
| 7 | JSON Standards | Pass | api.md §4; openapi `components.schemas` (camelCase) | |
| 8 | Pagination | Partial | API-04 `server.js` trả toàn bộ danh sách | Không phân trang và không ghi quyết định. Hành động: ghi trong api.md rằng tập dữ liệu bị chặn (< 10 000 đơn, ADR-002) hoặc thêm `limit/offset`. |
| 9 | Filtering & Sorting | Pass | API-04 `scope`, `status`; openapi "Requests (newest first)"; `leaveService.listRequests` sort | Sắp xếp cố định, có tài liệu. |
| 10 | Partial Updates | N/A | PRD FR-01…FR-10 | Không có chức năng sửa đơn; chỉ chuyển trạng thái. |
| 11 | HTTP Status Codes | Pass | api.md §3; `server.js` `HTTP_STATUS`, 405, 500 | 200/201/400/401/403/404/405/409/413/422/500 dùng đúng nghĩa. |
| 12 | Standard Error Envelope | Pass | api.md §1; `server.js` `sendJson(..., { error: { code, message } })` (cả 404/405/500 và file tĩnh) | Không có `details[]` — lỗi validate ghép chuỗi; chấp nhận. |
| 13 | Correlation IDs | N/A | — | Một tiến trình, không phải hệ phân tán. Khuyến nghị: thêm request id vào log 500 để đối chiếu. |
| 14 | API Versioning | Fail | api.md §1 Base URL `http://localhost:3000/api`; openapi `servers` | Không có version trên URI/header, và api.md không ghi chiến lược versioning (chỉ design-audit P-2 nhắc). Hành động: thêm `/api/v1` hoặc ít nhất ghi chính sách versioning trong api.md §1. |
| 15 | Deprecation Strategy | N/A | — | Bản phát hành đầu, client duy nhất là UI cùng repo. |
| 16 | Authentication | Partial | ADR-003; `server.js` `PUBLIC_ROUTES` + `authenticate` | Được kiểm tra ở mọi route bảo vệ, nhưng `X-User-Id` không phải cơ chế chuẩn (giả được) — giới hạn đã chấp nhận ở ADR-003 cho v1.0. Hành động: giữ điều kiện "chỉ local" và thực thi nó (xem mục 6 dòng 15). |
| 17 | Authorization (RBAC/ABAC) | Pass | `leaveService.js` `getRequest`, `cancelRequest`, `#assertApprover`, `listRequests(scope=team)` | Kiểm tra ở mức tài nguyên. |
| 18 | Rate Limiting | Fail | `server.js`; ADR-001 Consequences | Không có giới hạn tốc độ và không có quyết định/ rủi ro được ghi lại; server bind mọi interface. Hành động: ghi quyết định "không rate limit vì chỉ localhost" trong ADR-001 kèm bind `127.0.0.1`, hoặc thêm giới hạn đơn giản trả 429. |
| 19 | Input Validation | Partial | `leave.js` `validateNewRequest`; `server.js` `readJsonBody` (≤ 10 KB, chỉ object); `#normalizeComment` | Query `status` không được validate (giá trị lạ trả `[]` thay vì 400, trong khi openapi khai báo enum). Hành động: validate `status` ∈ Status, trả 400. |
| 20 | Documentation | Partial | `openapi.yaml` (OpenAPI 3.0.3, 9 operationId) | Hợp đồng thiếu response mà server thật trả: 401 cho `/leave-requests/{id}`, `/cancel`, `/approve`, `/reject`; 400 `BAD_JSON` và 413 cho các POST action; 400 cho `/approve` (comment > 200); 405/500 không khai báo ở operation nào. Hành động: bổ sung các response này. |
| 21 | HATEOAS (Optional) | N/A | — | Tùy chọn; không cần cho UI nội bộ. |

**Tổng:** Pass 10 · Partial 5 · Fail 2 · N/A 4 · Tổng 21

---

## 9. Data — `Database_Design_Checklist.xlsx` → `data/model.md`, `app/src/repo/jsonStore.js`

| # | Checklist Item | Status | Evidence | Notes / Action |
|---|---|---|---|---|
| 1 | Workload Classification | Partial | ADR-002 Context | OLTP nhỏ chỉ được ngụ ý. Hành động: thêm một dòng phân loại workload trong model.md §4. |
| 2 | Data Volume & Growth | Pass | ADR-002 Context (≈ 15 người × vài chục đơn/năm), Consequences (< 10 000 đơn); RUNBOOK ngưỡng 5 MB | |
| 3 | Read/Write Ratio | Partial | SAD §8 NFR-01 (đọc), ADR-002 (ghi lại cả file) | Tỷ lệ đọc/ghi không được nêu dù quyết định "ghi lại toàn file" phụ thuộc vào nó. Hành động: ghi "read-heavy, ghi < N lần/ngày" trong model.md. |
| 4 | Consistency Requirements | Pass | model.md §4 "Ghi nguyên tử"; `jsonStore.js` `#persist` (tmp + rename); `insertRequest(request, historyEntry)` một lần ghi | Một writer, nhất quán mạnh. Ghi chú: không `fsync` trước `rename` → mất điện có thể mất lần ghi cuối; nên nêu trong ADR-002. |
| 5 | Latency SLAs | Partial | PRD NFR-01 (đọc p95 < 200 ms) | Không có SLA cho ghi. Hành động: thêm mục tiêu thời gian ghi (vd. p95 < 50 ms với < 10 000 đơn). |
| 6 | ER Modeling | Pass | model.md §1 erDiagram (USER, LEAVE_REQUEST, HISTORY, cardinality) | |
| 7 | Normalization | Partial | model.md §1 `LEAVE_REQUEST.days` | Gần 3NF, nhưng `days` là giá trị dẫn xuất từ `startDate/endDate` được lưu trữ. Hành động: ghi rõ là denormalization có chủ đích (xem dòng 8). |
| 8 | Denormalization Strategy | Partial | model.md §3 DI-02 (snapshot `approverId`) | `approverId` snapshot có tài liệu; `days` lưu sẵn và `employeeName`/`actorName` tính lúc đọc thì không được ghi. Hành động: thêm bảng "Denormalization" với chiến lược cập nhật. |
| 9 | Primary & Surrogate Keys | Partial | model.md §1 `USER.id PK`, `LEAVE_REQUEST.id PK` | `HISTORY` không có khóa chính. Hành động: thêm `HISTORY.id` hoặc khai báo khóa ghép (`requestId`, `at`, `to`). |
| 10 | Foreign Keys & Constraints | Partial | model.md §3 DI-01…DI-06 (enforce ở code) | Ràng buộc chỉ ở tầng ứng dụng; không kiểm tra `managerId`/`approverId` trỏ tới user tồn tại (vd. EMPLOYEE có `managerId: null` sẽ tạo đơn `approverId = null`). Hành động: thêm DI cho tham chiếu FK và kiểm tra trong `createRequest`. |
| 11 | Optimal Data Types | Pass | model.md §1 (string ISO date, int days) | Giới hạn bởi kiểu JSON; định dạng được tài liệu hóa. |
| 12 | Semi-Structured Data | Pass | model.md §2 (3 collection riêng `users`, `requests`, `history`) | Không nhồi dữ liệu lồng tùy tiện. |
| 13 | High-Dimensional Data | N/A | — | Không có vector. |
| 14 | Time-Series Data | N/A | — | Không có workload time-series; timestamp ISO-8601 UTC là đủ. |
| 15 | Primary/Unique Indexes | N/A | ADR-002 | Không có DBMS; quét tuyến tính in-memory với < 10 000 bản ghi. |
| 16 | Foreign Key Indexing | N/A | ADR-002 | Như trên. |
| 17 | Specialized Indexes | N/A | ADR-002 | Như trên. |
| 18 | Covering Indexes | N/A | ADR-002 | Như trên. |
| 19 | Partitioning Strategy | N/A | ADR-002 | Dữ liệu rất nhỏ. |
| 20 | Sharding (Horizontal Scaling) | N/A | CON-02, RISK-02 | Một tiến trình. |
| 21 | Replication | N/A | CON-02 | Một instance; thay bằng backup file (RUNBOOK). |
| 22 | Role-Based Access (RBAC) | N/A | model.md §4 | Không có DBMS/role DB; truy cập dữ liệu chỉ qua tiến trình Node. Khuyến nghị ghi quyền file OS cho `db.json` trong RUNBOOK. |
| 23 | Encryption | N/A | model.md §4 "Phân loại: Nội bộ, dữ liệu demo" | Không có dữ liệu cá nhân thật, chạy local HTTP. |
| 24 | Disaster Recovery (DR) | Partial | model.md §4; RUNBOOK Backup/Restore | Backup thủ công, không có lịch tự động và không có bằng chứng đã diễn tập restore. Hành động: ghi tần suất backup và một lần restore thử có evidence. |
| 25 | Audit Logging | Pass | model.md §3 DI-05; `jsonStore.js` (không có API sửa/xóa history); FR-10 | DML trên đơn được ghi lịch sử append-only (theo quy ước — file vẫn sửa tay được). |

**Tổng:** Pass 6 · Partial 8 · Fail 0 · N/A 11 · Tổng 25

---

## 10. UI/UX — `UI_UX_Design_IEEE-1016-2009_Checklist.xlsx` → `UI_UX_design/README.md`, `app/public/*`

| # | Checklist Item | Status | Evidence | Notes / Action |
|---|---|---|---|---|
| 1 | User Personas & Scenarios | Pass | PRD §2 Personas (An, Chi); UX §1 cột Vai trò | UX README nên link PRD §2. |
| 2 | Information Architecture (IA) | Pass | UX §2; `index.html` (1 trang, chọn vai trò) | Mọi chức năng ≤ 2 thao tác. |
| 3 | Task Flows | Pass | UX §2 navigation flowchart | |
| 4 | Grid System | Partial | `styles.css` (padding/gap 2, 4, 6, 8, 10, 12, 16, 20, 24 px) | Không có grid cơ sở được tài liệu hóa; có giá trị lệch 4pt (6, 10 px). Hành động: chốt thang 4pt và ghi trong UX §4. |
| 5 | Breakpoints | Partial | `styles.css` `auto-fit` (không có `@media`); UX §5 "chưa kiểm thử trên điện thoại" | Hành động: định nghĩa breakpoint mobile/tablet và kiểm thử ở 375 px. |
| 6 | Visual Hierarchy | Pass | `index.html` thẻ số dư, `.card.accent`, `button.primary` | |
| 7 | Design System / Components | Partial | `styles.css` `:root` + `.panel/.card/.badge/button.*`; UX §4 | Có token và class tái sử dụng nhưng không có danh mục component. Hành động: thêm bảng component (button primary/danger/link, badge, panel, card, toast, dialog). |
| 8 | Color Palette | Partial | UX §4 (4 màu ngữ nghĩa); `styles.css` | Màu trung tính (`--bg`, `--surface`, `--text`, `--muted`, `--border`) không có trong UX §4; nền badge (`#fef3c7`, `#dcfce7`, `#fee2e2`) và màu focus `#93c5fd` hard-code. Hành động: token hóa và tài liệu hóa. |
| 9 | Typography | Partial | UX §4 "Font system-ui"; `styles.css` (.8, .85, .9, 1.1, 1.2, 1.8 rem) | Thang chữ không được tài liệu hóa. Hành động: định nghĩa type scale trong UX §4. |
| 10 | Iconography | N/A | `index.html` (chỉ logo chữ "LF" `aria-hidden`) | Không dùng icon. |
| 11 | Contrast Ratios | Partial | UX §5 1.4.3; `styles.css` `.badge-rejected` (#dc2626 trên #fee2e2 = 3.95:1), `.badge-cancelled` (#6b7280 trên #e5e7eb = 3.90:1) | Nút trắng trên primary/danger/ok đạt (≥ 4.83:1) nhưng 2 badge chữ nhỏ (.8rem) dưới 4.5:1; UX §5 ghi "Pass" là không chính xác. Hành động: đậm màu chữ badge (vd. `#991b1b`, `#374151`). |
| 12 | Touch Targets | Fail | `styles.css` `button { padding: 8px 10px }` (~35 px), `button.link { padding: 0 }` | Không phần tử nào đạt 44×44 px dù trang khai báo viewport mobile. Hành động: `@media (pointer: coarse) { button { min-height: 44px } }` và tăng vùng bấm của mã đơn. |
| 13 | Keyboard Navigation | Pass | `index.html` (button/select/dialog native); `styles.css` `:focus-visible` | |
| 14 | Error Prevention & Recovery | Partial | `app.js` `confirm('Hủy đơn…')`, `prompt('Lý do từ chối…')` | Hủy có xác nhận, nhưng **Duyệt** (chuyển sang trạng thái cuối, không hoàn tác) không có xác nhận; dùng dialog native (design-audit P-4). Hành động: thêm xác nhận cho Duyệt bằng `<dialog>`. |
| 15 | System Status Visibility | Partial | `app.js` submit handler | Không có trạng thái loading/disable nút khi gửi → bấm 2 lần có thể tạo lỗi CONFLICT gây khó hiểu. Hành động: disable nút trong lúc chờ. |
| 16 | Empty States | Pass | `index.html` `#myEmpty` ("Hãy tạo đơn đầu tiên…"), `#pendingEmpty`, `#teamEmpty`; evidence `09-retest-DEF-002-empty-state.jpg` | |
| 17 | Micro-interactions | Fail | `styles.css` (không có `:hover`, `:active`, `:disabled`) | Chỉ có `cursor: pointer` và `:focus-visible`. Hành động: thêm style hover/active/disabled cho button. |
| 18 | Chart Clarity | N/A | — | Không có biểu đồ. |
| 19 | Data Density | Pass | `styles.css` `.panel`, `th, td { padding: 8px }` | |
| 20 | Asset Export | N/A | — | Không có asset đồ họa. |
| 21 | Redlining & Specs | Partial | UX §4 token; UX §3 wireframe ASCII | Không có spec khoảng cách/kích thước. Hành động: bổ sung spacing/size vào UX §4. |
| 22 | State Documentation | Partial | UX §1 cột "Trạng thái được thiết kế" | Có trạng thái màn hình (rỗng/lỗi/thành công) nhưng không có trạng thái component (hover/disabled/focus/error). Hành động: thêm bảng trạng thái component. |

**Tổng:** Pass 7 · Partial 10 · Fail 2 · N/A 3 · Tổng 22

---

## 11. Kiểm chứng "## 2. Mười phép đối chiếu cặp" trong `design-audit.md`

| # | Cặp | Khẳng định | Kết luận | Evidence / ghi chú |
|---|---|---|---|---|
| 1 | SAD CMP ↔ code | 5/5 component khớp 5 file | **Đúng** | SAD §2: `server.js`, `service/leaveService.js`, `domain/leave.js`, `repo/jsonStore.js`, `public/*` đều tồn tại. Ghi chú: `src/data/seed.js` có trong §5 nhưng không là CMP; comment code dùng sai số FR (xem mục 1 dòng 16). |
| 2 | SAD ↔ PRD | Mọi FR/NFR có component | **Đúng (có lệch nhỏ)** | traceability.md §2: FR-01…10 và NFR-01…06 đều có nơi hiện thực. Lệch: SAD §2 gán FR-06 cho CMP-03 (traceability chỉ CMP-02); traceability gán FR-01 cho CMP-03/04 (SAD không); bảng SAD §2 không có NFR-05/NFR-06 (chỉ ở §1.3/§8). |
| 3 | Class ↔ data model | Thuộc tính trùng ER | **Đúng** | 12 thuộc tính `LeaveRequest`, 6 thuộc tính `HistoryEntry`, 4 thuộc tính `User` khớp model.md §1. Ghi chú: class diagram thiếu quan hệ approverId→User và actorId→User mà ER có. |
| 4 | Sequence ↔ API | Mọi message HTTP có trong API-01…09 | **Đúng** | `POST /api/leave-requests` = API-05, `GET …?scope=team` = API-04, `POST …/approve|reject` = API-08/09. |
| 5 | State machine ↔ code | `TRANSITIONS` = stateDiagram | **Đúng** | `leave.js`: PENDING→{APPROVED, REJECTED, CANCELLED}; 3 trạng thái cuối rỗng = SAD §4.3. (Comment code trỏ "SAD §5.2" — sai số mục.) |
| 6 | Activity ↔ API errors | 400/403/409/422 = bảng lỗi API | **Đúng** | Cả 4 mã có trong api.md §3 với đúng `code`. Ghi chú: activity không thể hiện 401/413/400 BAD_JSON (xảy ra trước, ở CMP-01) — cần ghi làm tiền điều kiện. |
| 7 | API ↔ openapi.yaml | 9 operationId khớp 9 route | **Đúng** | `openapi.yaml` API-01…09 ↔ `server.js` `buildRoutes()` 9 route. Ghi chú: response khai báo chưa đủ (mục 8 dòng 20). |
| 8 | UI ↔ stories | 5 màn hình, mỗi màn có US/FR | **Đúng** | UX §1 S-01…S-05 có US/FR; USER_STORIES bảng Tổng hợp khớp. Ghi chú: FR-07 "lọc được theo trạng thái" không có điều khiển lọc trên S-04 (chỉ API hỗ trợ). |
| 9 | Deployment ↔ cấu hình | `PORT`, `DATA_FILE`, `LOG_REQUESTS` có trong code | **Đúng** | `server.js`: `process.env.PORT`, `process.env.DATA_FILE` (mặc định `app/data/db.json`), `process.env.LOG_REQUESTS === '1'`; `.gitignore` có `app/data/`. |
| 10 | ADR ↔ rủi ro | ADR-002↔RISK-02, ADR-003↔RISK-01 | **Đúng (về ánh xạ)** | ADR-002 "Liên quan: RISK-02", ADR-003 "Điều kiện…(RISK-01)". Nhưng biện pháp của RISK-01 "chỉ bind localhost" **không được hiện thực**: `server.js` gọi `listen(port)` không có host → nghe trên mọi interface. |

**Kết luận phần 2:** 10/10 khẳng định đúng về nội dung được nêu (2 dòng có lệch nhỏ). Tuy nhiên **mục 1 (bảng điểm) của `design-audit.md` không khớp với checklist gốc**:
- Số dòng chấm không khớp file `.xlsx`: SAD ghi 17 dòng (file có 16), Class 10 (25), Sequence 10 (22), Activity 9 (28), Component 7 (18), Deployment 8 (16), Use case 7 (29), API 15 (21), Data 15 (25), UI/UX 13 (22). Tổng thật là **222** dòng, không phải 133.
- Tổng N/A theo bảng là 12 nhưng pie chart ghi 13; 94 + 4 + 13 = 111 ≠ 133 trong tiêu đề.
- Câu "22 dòng còn lại … bị loại khi rút gọn theo A2, ghi ở adaptation log" không có cơ sở: `adaptation-log.md` không ghi việc loại dòng checklist nào (chỉ ghi "Không sửa file gốc").
- Kết luận "0 Fail" mâu thuẫn với báo cáo này (17 Fail).

Hành động: chạy lại vòng chấm của `design-audit.md` trên đủ 222 dòng hoặc ghi rõ việc rút gọn trong adaptation log.

---

## 12. Tổng hợp

| Checklist | Artifact | Pass | Partial | Fail | N/A | Tổng dòng |
|---|---|---|---|---|---|---|
| `SAD_IEEE_1016_Checklist.xlsx` | SAD.md + ADR | 11 | 5 | 0 | 0 | 16 |
| `Class_Diagram_UML2.0_Checklist.xlsx` | SAD §3 | 12 | 6 | 0 | 7 | 25 |
| `Sequence_Diagram_UML2.0_Checklist.xlsx` | SAD §4.1–4.2 | 9 | 5 | 2 | 6 | 22 |
| `Activity_Diagram_UML2.0_Checklist.xlsx` | SAD §4.4 (+§4.3) | 3 | 6 | 3 | 16 | 28 |
| `Component_Diagram_UML2.0_Checklist.xlsx` | SAD §5 | 4 | 4 | 5 | 5 | 18 |
| `Deployment_Diagram_UML2.0_Checklist.xlsx` | SAD §6 | 7 | 6 | 0 | 3 | 16 |
| `UseCase_Document_UML2.0_Checklist.xlsx` | SAD §7 + USER_STORIES | 10 | 13 | 3 | 3 | 29 |
| `API_Design_IEEE-1016-2009Checklist.xlsx` | api.md, openapi.yaml, server.js | 10 | 5 | 2 | 4 | 21 |
| `Database_Design_Checklist.xlsx` | data/model.md, jsonStore.js | 6 | 8 | 0 | 11 | 25 |
| `UI_UX_Design_IEEE-1016-2009_Checklist.xlsx` | UX README, app/public | 7 | 10 | 2 | 3 | 22 |
| **Tổng** | | **79** | **68** | **17** | **58** | **222** |

**Kết luận gate (theo §A8: một Fail là chặn):** design-v1 **chưa đủ điều kiện baseline** — 17 Fail (Sequence 2, Activity 3, Component 5, Use case 3, API 2, UI/UX 2). Phần lớn Fail là lỗi ký hiệu/nội dung sơ đồ sửa được trong Mermaid và vài dòng tài liệu; không có mâu thuẫn chặn giữa thiết kế và code ngoài: (a) RISK-01 "bind localhost" chưa hiện thực, (b) cạnh phụ thuộc sai ở SAD §5, (c) «include» của UC-05 sai so với code.
