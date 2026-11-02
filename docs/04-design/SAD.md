# Software Architecture Document — LeaveFlow v1.0

| Thuộc tính | Giá trị |
|---|---|
| Mã tài liệu | SAD-LF-001 |
| Phiên bản | 1.2 (R1.1 — CMP-05 mở rộng; API không đổi trừ kiểm tra UTF-8) |
| Trạng thái | Baseline tag `design-v1` tại commit `31ac9c5` (tag ghi rõ **chưa ký**); chờ Tech lead ký |
| Owner | Nguyễn Trần Hà |
| Ngày | 2026-11-02 |
| Prompt | `design/SAD_Prompt_IEEE_standard.md` (IEEE 1016-2009, view 4+1) |
| Checklist | `design/SAD_IEEE_1016_Checklist.xlsx` + checklist UML 2.0 từng sơ đồ → [design-audit.md](./design-audit.md) |
| Đầu vào | [PRD](../03-analysis/PRD.md), [USER_STORIES](../03-analysis/USER_STORIES.md), [traceability](../03-analysis/traceability.md) |

## 1. Giới thiệu

### 1.1 Mục đích & phạm vi
Mô tả kiến trúc của LeaveFlow v1.0 — web app một tiến trình Node.js phục vụ REST API và giao diện tĩnh,
lưu dữ liệu vào một file JSON. Tài liệu dùng mô hình **4+1 view** (Kruchten); mọi sơ đồ viết bằng
**Mermaid** để render trực tiếp trên GitHub và sửa được như mã nguồn (xem [adaptation log](../00-kit/adaptation-log.md)).

### 1.2 Stakeholder concerns

| Stakeholder | Concern | View trả lời |
|---|---|---|
| Nhân viên, Quản lý | Chức năng nào, ai làm gì? | Scenarios (§7) |
| Developer | Module, phụ thuộc, nơi đặt quy tắc | Logical (§3), Development (§5) |
| Tester | Luồng, trạng thái, điểm kiểm soát lỗi | Process (§4) |
| Release owner | Chạy ở đâu, cấu hình gì, rollback thế nào | Physical (§6) |
| Security | Định danh, phân quyền, dữ liệu vào | §8 Quality scenarios, ADR-003 |

### 1.3 Ràng buộc kiến trúc

| ID | Ràng buộc | Nguồn |
|---|---|---|
| CON-01 | Node.js ≥ 22, **không dependency ngoài** | NFR-06, intent §4 |
| CON-02 | Chạy local một máy, một tiến trình | intent §4 |
| CON-03 | Không có hệ thống định danh thật | Out of scope, ADR-003 |

## 2. Tổng quan kiến trúc

Kiến trúc **phân lớp (layered / hexagonal-lite)**: HTTP adapter → Application service → Domain (thuần, không I/O) ← Repository adapter.
Quy tắc nghiệp vụ nằm hoàn toàn trong lớp Domain/Service để test được mà không cần server.

| ID | Building block | File | Trách nhiệm | FR/NFR |
|---|---|---|---|---|
| CMP-01 | HTTP adapter | `app/src/server.js` | Routing, đọc JSON body (≤ 10 KB), định danh `X-User-Id`, map `DomainError` → HTTP status, phục vụ file tĩnh an toàn, bind `127.0.0.1` | FR-09, NFR-01, NFR-04, NFR-06 |
| CMP-02 | LeaveService | `app/src/service/leaveService.js` | Use case: tạo, liệt kê, xem, hủy, duyệt, từ chối; phân quyền; ghi lịch sử | FR-01, FR-03, FR-05…FR-10, NFR-05 |
| CMP-03 | Domain rules | `app/src/domain/leave.js` | Validation, đếm ngày công, máy trạng thái, số dư | FR-02, FR-04, FR-06, FR-08 |
| CMP-04 | JsonStore | `app/src/repo/jsonStore.js` | Lưu trữ in-memory + ghi file nguyên tử, trả bản sao (hiện thực `IStore`) | FR-01, FR-10, NFR-03, NFR-07 |
| CMP-05 | Web UI | `app/public/*` | SPA vanilla JS, hash routing: tổng quan + xem trước ngày công, danh sách lọc/tìm/CSV, hộp duyệt, lịch tháng, modal, dark mode | FR-05, FR-07, FR-11…FR-14, NFR-02 |

### 2.1 Context view

```mermaid
flowchart LR
    EMP([Nhân viên]) -- "Web UI: gửi/hủy đơn, xem số dư" --> LF[[LeaveFlow]]
    MGR([Quản lý]) -- "Web UI: duyệt/từ chối" --> LF
    LF -- "đọc/ghi" --> FS[(File system cục bộ)]
```

LeaveFlow **cung cấp** REST API `/api/*` + UI tĩnh; **cần** file system cục bộ và Node.js ≥ 22. Không gọi hệ thống ngoài.
Thông tin chi tiết: Information view → [data/model.md](./data/model.md); Interface view → [api.md](./api.md), [openapi.yaml](./openapi.yaml); use case đầy đủ → [use-cases.md](./use-cases.md).

### 2.2 Resource budget

| Tài nguyên | Ngân sách v1.0 | Căn cứ |
|---|---|---|
| Bộ nhớ tiến trình | < 100 MB ở mức 10 000 đơn | Toàn bộ dữ liệu in-memory (ADR-002) |
| File dữ liệu | ≈ 3.6 MB ở 10 000 đơn | Đo trong TC-39 |
| Thời gian ghi | < 100 ms/lần ghi ở 10 000 đơn | TC-39: POST 89.89 ms |
| CPU | 1 core, đơn luồng | Node event loop |

## 3. Logical view — Class diagram

```mermaid
classDiagram
    direction LR
    class User {
        +id: string
        +name: string
        +role: Role
        +managerId: string [0..1]
    }
    class LeaveRequest {
        +id: string
        +employeeId: string
        +approverId: string
        +type: LeaveType
        +startDate: Date
        +endDate: Date
        +days: int
        +reason: string
        +status: Status
        +managerComment: string [0..1]
        +createdAt: DateTime
        +updatedAt: DateTime
    }
    class HistoryEntry {
        +requestId: string
        +actorId: string
        +from: Status [0..1]
        +to: Status
        +comment: string [0..1]
        +at: DateTime
    }
    class Balance {
        +year: int
        +entitlement: int
        +used: int
        +pending: int
        +available: int
    }
    class LeaveService {
        -store: IStore
        -now: Clock
        +authenticate(userId: string) User
        +listUsers() User[]
        +getProfile(user: User) Profile
        +createRequest(user: User, input: NewLeaveRequest) LeaveRequest
        +listRequests(user: User, scope: string, status: Status) LeaveRequest[]
        +getRequest(user: User, id: string) RequestDetail
        +cancelRequest(user: User, id: string) LeaveRequest
        +approveRequest(user: User, id: string, comment: string) LeaveRequest
        +rejectRequest(user: User, id: string, comment: string) LeaveRequest
    }
    class LeaveDomain {
        <<utility>>
        +validateNewRequest(input: NewLeaveRequest, today: Date)$ NewLeaveRequest
        +countWorkingDays(start: Date, end: Date)$ int
        +computeBalance(requests: LeaveRequest[], year: int)$ Balance
        +assertTransition(from: Status, to: Status)$ void
        +rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date)$ bool
    }
    class IStore {
        <<interface>>
        +findUser(id: string) User
        +listUsers() User[]
        +findRequest(id: string) LeaveRequest
        +listRequests(predicate: Function) LeaveRequest[]
        +insertRequest(r: LeaveRequest, h: HistoryEntry) void
        +updateRequest(r: LeaveRequest, h: HistoryEntry) void
        +historyOf(requestId: string) HistoryEntry[]
        +nextRequestId() string
    }
    class JsonStore {
        -filePath: string [0..1]
        -data: object
    }
    class DomainError {
        +code: string
        +message: string
    }
    class Role {
        <<enumeration>>
        EMPLOYEE
        MANAGER
    }
    class LeaveType {
        <<enumeration>>
        ANNUAL
        SICK
        UNPAID
    }
    class Status {
        <<enumeration>>
        PENDING
        APPROVED
        REJECTED
        CANCELLED
    }

    User "0..*" --> "0..1" User : manager
    User "1" --> "0..*" LeaveRequest : employee
    User "1" --> "0..*" LeaveRequest : approver
    LeaveRequest "1" *-- "1..*" HistoryEntry : history
    HistoryEntry "0..*" --> "1" User : actor
    LeaveService "1" --> "1" IStore : store
    JsonStore ..|> IStore
    LeaveService ..> LeaveDomain : «use»
    LeaveService ..> DomainError : «create»
    LeaveDomain ..> DomainError : «create»
    LeaveDomain ..> Balance : «create»
```

## 4. Process view

### 4.1 Sequence — Tạo đơn (US-01)

```mermaid
sequenceDiagram
    autonumber
    actor An as Nhân viên An
    participant UI as ui: WebUI
    participant API as http: HttpAdapter
    participant SVC as svc: LeaveService
    participant DOM as LeaveDomain «utility»
    participant DB as store: JsonStore

    An->>UI: submit(form)
    activate UI
    UI->>API: POST /api/leave-requests (X-User-Id)
    activate API
    API->>SVC: authenticate(userId)
    activate SVC
    SVC->>DB: findUser(userId)
    activate DB
    DB-->>SVC: User [0..1]
    deactivate DB
    SVC-->>API: User
    deactivate SVC
    alt không có user
        API-->>UI: 401 UNAUTHENTICATED
    else đã định danh
        API->>SVC: createRequest(user, body)
        activate SVC
        SVC->>DOM: validateNewRequest(body, today)
        activate DOM
        DOM-->>SVC: NewLeaveRequest
        deactivate DOM
        SVC->>DB: listRequests(byEmployee)
        activate DB
        DB-->>SVC: LeaveRequest[]
        deactivate DB
        SVC->>SVC: checkOverlap(requests)
        activate SVC
        deactivate SVC
        opt type = ANNUAL
            SVC->>DOM: computeBalance(requests, year)
            activate DOM
            DOM-->>SVC: Balance
            deactivate DOM
        end
        alt vi phạm quy tắc (role, dữ liệu, trùng, số dư)
            SVC-->>API: DomainError
            API-->>UI: 403 / 400 / 409 / 422 {error}
        else hợp lệ
            SVC->>DB: insertRequest(request, history)
            activate DB
            DB->>DB: writeFile(tmp) + rename
            DB-->>SVC: void
            deactivate DB
            SVC-->>API: LeaveRequest(PENDING)
            API-->>UI: 201 LeaveRequest
        end
        deactivate SVC
    end
    deactivate API
    UI-->>An: toast thành công hoặc lỗi inline
    deactivate UI
```

### 4.2 Sequence — Duyệt / từ chối (US-05, US-06, US-08)

```mermaid
sequenceDiagram
    autonumber
    actor Chi as Quản lý Chi
    participant UI as ui: WebUI
    participant API as http: HttpAdapter
    participant SVC as svc: LeaveService
    participant DOM as LeaveDomain «utility»
    participant DB as store: JsonStore

    Chi->>UI: openInbox()
    activate UI
    UI->>API: GET /api/leave-requests?scope=team
    activate API
    API->>SVC: listRequests(user, "team")
    activate SVC
    SVC->>DB: listRequests(byApprover)
    activate DB
    DB-->>SVC: LeaveRequest[]
    deactivate DB
    SVC-->>API: LeaveRequest[]
    deactivate SVC
    API-->>UI: 200 LeaveRequest[]
    deactivate API
    Chi->>UI: approve(id) / reject(id, reason)
    UI->>API: POST /api/leave-requests/{id}/approve | reject
    activate API
    API->>SVC: approveRequest(user, id, comment) | rejectRequest(...)
    activate SVC
    SVC->>DB: findRequest(id)
    activate DB
    DB-->>SVC: LeaveRequest [0..1]
    deactivate DB
    SVC->>SVC: assertApprover(user, request)
    activate SVC
    deactivate SVC
    SVC->>DOM: assertTransition(PENDING, APPROVED | REJECTED)
    activate DOM
    DOM-->>SVC: void
    deactivate DOM
    alt không tìm thấy / không phải approver / sai trạng thái / thiếu lý do
        SVC-->>API: DomainError
        API-->>UI: 404 / 403 / 409 / 400 {error}
    else hợp lệ
        SVC->>DB: updateRequest(request, history)
        activate DB
        DB-->>SVC: void
        deactivate DB
        SVC-->>API: LeaveRequest
        API-->>UI: 200 LeaveRequest
    end
    deactivate SVC
    deactivate API
    UI-->>Chi: toast + làm mới danh sách
    deactivate UI
```

### 4.3 State machine — Vòng đời đơn nghỉ (FR-06, FR-08)

```mermaid
stateDiagram-v2
    [*] --> PENDING : Nhân viên tạo đơn hợp lệ
    PENDING --> APPROVED : Quản lý trực tiếp duyệt
    PENDING --> REJECTED : Quản lý trực tiếp từ chối (có lý do)
    PENDING --> CANCELLED : Người tạo hủy
    APPROVED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
    note right of PENDING
        Đơn ANNUAL đang PENDING
        giữ chỗ số dư phép năm
    end note
    note right of APPROVED
        Trạng thái cuối: mọi chuyển tiếp
        khác trả 409 INVALID_STATE
    end note
```

### 4.4 Activity — Tạo đơn nghỉ (FR-01…FR-04)

| | |
|---|---|
| **Activity** | `CreateLeaveRequest(userId, body) : LeaveRequest` |
| **Pre-conditions** | Server đang chạy; người dùng có trong store |
| **Post-conditions (thành công)** | Một `LeaveRequest` PENDING + một `HistoryEntry` (null → PENDING) được ghi nguyên tử vào `db.json` |
| **Post-conditions (thất bại)** | Không thay đổi dữ liệu; client nhận lỗi 400/401/403/409/413/422 |

```mermaid
flowchart TD
    START((●)) --> A1
    subgraph HTTP["Partition: HTTP adapter (CMP-01)"]
        A1(Nhận POST /api/leave-requests) --> G0{body JSON object ≤ 10 KB<br/>và X-User-Id hợp lệ?}
        RESP(Trả lỗi HTTP theo mã DomainError) --> FERR((◉))
        OK(Trả 201 Created) --> FEND((◉))
    end
    subgraph SVC["Partition: LeaveService (CMP-02)"]
        R{role = EMPLOYEE?}
        O{trùng đơn PENDING/APPROVED?}
        T{type = ANNUAL?}
        M2{ }
        B{days ≤ available?}
    end
    subgraph DOM["Partition: Domain rules (CMP-03)"]
        V1{type, ngày, lý do hợp lệ<br/>end ≥ start ≥ hôm nay · cùng năm?}
        D(Đếm ngày công T2–T6) --> V3{ngày công ≥ 1?}
    end
    subgraph STORE["Partition: JsonStore (CMP-04)"]
        SAVE(Lưu PENDING + lịch sử) --> DS[("db.json «datastore»")]
    end
    MERR{ } --> RESP
    G0 -- "[không]" --> MERR
    G0 -- "[có]" --> R
    R -- "[không] 403" --> MERR
    R -- "[có]" --> V1
    V1 -- "[không] 400" --> MERR
    V1 -- "[có]" --> D
    V3 -- "[không] 400" --> MERR
    V3 -- "[có]" --> O
    O -- "[có] 409" --> MERR
    O -- "[không]" --> T
    T -- "[không]" --> M2
    T -- "[có]" --> B
    B -- "[không] 422" --> MERR
    B -- "[có]" --> M2
    M2 --> SAVE
    DS --> OK
```

## 5. Development view — Component diagram

```mermaid
flowchart LR
    subgraph Browser["«execEnv» Browser"]
        UI["«component»<br/>CMP-05 WebUI"]
    end
    subgraph Node["«execEnv» Node.js process"]
        HTTP["«component»<br/>CMP-01 HttpAdapter"]
        SVC["«component»<br/>CMP-02 LeaveService"]
        DOM["«component»<br/>CMP-03 LeaveDomain"]
        REPO["«component»<br/>CMP-04 JsonStore"]
    end
    IREST(("REST API<br/>/api/*"))
    ILEAVE(("ILeaveService"))
    IRULES(("ILeaveRules"))
    ISTORE(("IStore"))
    FILE[("«artifact»<br/>db.json")]

    HTTP --- IREST
    SVC --- ILEAVE
    DOM --- IRULES
    REPO --- ISTORE
    UI -. "«use»" .-> IREST
    HTTP -. "«use»" .-> ILEAVE
    HTTP -. "«use» DomainError" .-> IRULES
    SVC -. "«use»" .-> IRULES
    SVC -. "«use»" .-> ISTORE
    HTTP -. "«create» (seed, dataFile)" .-> REPO
    REPO -. "«read/write»" .-> FILE
```

**Ký hiệu:** vòng tròn = interface được cung cấp (lollipop); mũi tên nét đứt «use» = interface được yêu cầu (socket) — cặp provide/use trên cùng interface là assembly connector. `HttpAdapter` tạo `JsonStore` với seed và `DATA_FILE`.

**Quy tắc phụ thuộc:** chỉ đi từ ngoài vào trong (`server → service → domain`); `domain` không import gì của
dự án; `service` nhận `store` và `now()` qua constructor (dependency injection) để test với đồng hồ cố định.

## 6. Physical view — Deployment

```mermaid
flowchart LR
    subgraph WS["«device» Workstation"]
        subgraph BR["«execEnv» Browser"]
            UIA["«artifact» index.html · app.js · styles.css<br/>Chrome / Edge / Firefox"]
        end
        subgraph ND["«execEnv» Node.js 22"]
            APP["«artifact» app/src/*.js<br/>1 instance · HOST=127.0.0.1 · PORT=3000"]
        end
        F[("«artifact» db.json<br/>DATA_FILE")]
    end
    subgraph GH["«device» GitHub cloud"]
        CI["«execEnv» Actions runner<br/>ubuntu · Node 22"]
    end
    BR -- "«protocol» HTTP/1.1 · loopback only" --> ND
    APP -- "«protocol» file I/O" --> F
    Dev([Developer]) -- "«protocol» HTTPS git push" --> CI
```

«execEnv» = «executionEnvironment» (viết tắt để vừa khung sơ đồ).

| Cấu hình | Mặc định | Ý nghĩa |
|---|---|---|
| `HOST` | `127.0.0.1` | Địa chỉ bind — chỉ máy cục bộ (RISK-01) |
| `PORT` | 3000 | Cổng HTTP |
| `DATA_FILE` | `app/data/db.json` | Vị trí file dữ liệu (được `.gitignore`) |
| `LOG_REQUESTS` | tắt | `1` = log `METHOD path status ms` mỗi request |

## 7. Scenarios view — Use case

```mermaid
flowchart LR
    EMP(["👤 Nhân viên"])
    MGR(["👤 Quản lý trực tiếp"])
    subgraph LF["LeaveFlow"]
        UC1(["UC-01 Gửi đơn nghỉ"])
        UC2(["UC-02 Xem số dư & đơn của tôi"])
        UC3(["UC-03 Hủy đơn chờ duyệt"])
        UC4(["UC-04 Xem hộp duyệt nhóm"])
        UC5(["UC-05 Duyệt đơn"])
        UC6(["UC-06 Từ chối đơn có lý do"])
        UC7(["UC-07 Xem chi tiết & lịch sử"])
        INC1(["Kiểm tra hợp lệ & số dư"])
        INC2(["Kiểm tra quyền & trạng thái"])
    end
    EMP --- UC1 & UC2 & UC3 & UC7
    MGR --- UC4 & UC5 & UC6 & UC7
    UC1 -. "«include»" .-> INC1
    UC3 -. "«include»" .-> INC2
    UC5 -. "«include»" .-> INC2
    UC6 -. "«include»" .-> INC2
```

| Use case | Story | Lớp hiện thực |
|---|---|---|
| UC-01 | US-01 | CMP-05 → CMP-01 → CMP-02 → CMP-03/04 |
| UC-02 | US-02 | API-03, API-04 |
| UC-03 | US-03 | API-07 |
| UC-04 | US-04 | API-04 `scope=team` |
| UC-05, UC-06 | US-05, US-06, US-08 | API-08, API-09 (include "Kiểm tra quyền & trạng thái") |
| UC-07 | US-07 | API-06 |

## 8. Quality attribute scenarios

| NFR | Kích thích | Phản hồi mong đợi | Quyết định thiết kế |
|---|---|---|---|
| NFR-01 | 200 request đọc liên tiếp | p95 < 200 ms | Dữ liệu in-memory, không framework (ADR-001, ADR-002) |
| NFR-03 | Tắt tiến trình giữa chừng / restart | Không mất đơn đã xác nhận, file không hỏng | Ghi `db.json.tmp` rồi `rename` (nguyên tử trên cùng ổ đĩa) |
| NFR-04 | Request không có `X-User-Id`, sai quyền, `/../src/server.js`, body 11 KB | 401 / 403 / 404 / 413 | Guard tập trung ở CMP-01, phân quyền ở CMP-02, `path.normalize` + kiểm tra prefix |
| NFR-04 | Lý do chứa `<script>` | Hiển thị dạng text | `escapeHtml` trước khi chèn vào DOM |
| NFR-05 | Dev sửa quy tắc số dư | Test domain đỏ ngay | Domain thuần, test đơn vị không cần server |

## 9. Architecture decisions

| ADR | Quyết định | Trạng thái |
|---|---|---|
| [ADR-001](./ADR-001-node-no-framework.md) | Node.js thuần (`node:http`, `node:test`), không framework | Accepted |
| [ADR-002](./ADR-002-json-file-store.md) | Lưu dữ liệu bằng file JSON thay vì DBMS | Accepted |
| [ADR-003](./ADR-003-simulated-auth.md) | Giả lập định danh bằng header `X-User-Id` | Accepted (giới hạn v1.0) |

## 10. Rủi ro kỹ thuật

| ID | Rủi ro | Xác suất | Ảnh hưởng | Giảm thiểu | Owner |
|---|---|---|---|---|---|
| RISK-01 | Định danh giả lập bị lạm dụng nếu public | Thấp (chỉ local) | Cao | Chỉ bind localhost khi demo; SSO ở v2.0 | Tech lead |
| RISK-02 | File JSON không chịu được nhiều tiến trình ghi đồng thời | Thấp | Trung bình | Chạy 1 tiến trình; chuyển SQLite khi > 1 nhóm (ADR-002) | Owner |
| RISK-03 | Múi giờ làm lệch "hôm nay" | Trung bình | Thấp | Thống nhất UTC trong domain; ghi chú runbook | Owner |
