# LeaveFlow — ứng dụng quản lý đơn nghỉ phép

Ứng dụng mini dùng để minh họa trọn vòng đời Agentic SDLC. Tài liệu đầy đủ: [../docs/README.md](../docs/README.md).

## Chạy nhanh (không cần `npm install`)

Yêu cầu: Node.js ≥ 22. Ứng dụng **không có dependency** nào (ADR-001).

```bash
cd app
npm start
```

Mở http://localhost:3000 và chọn người dùng demo ở góc dưới thanh bên (sidebar). Có giao diện tối, lịch tháng, lọc/tìm kiếm, xuất CSV (quản lý).

| User | Vai trò | Ghi chú |
|---|---|---|
| Nguyễn Văn An (u1) | EMPLOYEE | Quản lý: u3 |
| Trần Thị Bình (u2) | EMPLOYEE | Quản lý: u3 |
| Lê Minh Chi (u3) | MANAGER | Duyệt đơn của u1, u2 |

## Kiểm thử

| Lệnh | Tác dụng |
|---|---|
| `npm run lint` | Kiểm tra cú pháp + quy tắc vệ sinh code |
| `npm test` | 35 test tự động (unit + integration + characterization) |
| `npm run test:integration` | Integration test trên server HTTP thật |
| `npm run test:char` | Characterization: hành vi API v1.0.0 (golden master) |
| `npm run test:mutation` | Mutation score (ngưỡng 80 %) |
| `npm run scan` · `npm run approved-tests` | Quét dependency/secret · kiểm test đã duyệt không bị sửa |
| `npm run test:coverage` | Kèm báo cáo coverage |
| `npm run test:report` | Lint + test + coverage + junit, lưu evidence vào `docs/07-verification/evidence/<run-id>/` |

## Cấu trúc

```text
app/
├── public/                 # CMP-05 Web UI (HTML/CSS/JS thuần)
├── src/
│   ├── server.js           # CMP-01 HTTP adapter + router
│   ├── service/            # CMP-02 use case + phân quyền
│   ├── domain/             # CMP-03 quy tắc nghiệp vụ thuần
│   ├── repo/               # CMP-04 JsonStore (ghi file nguyên tử)
│   └── data/seed.js        # user demo
├── tests/
│   ├── unit/               # TC-01…TC-27
│   └── api/                # TC-28…TC-32
└── scripts/                # lint.js, run-tests.js
```

## Cấu hình

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | `3000` | Cổng HTTP |
| `DATA_FILE` | `app/data/db.json` | File dữ liệu (đã `.gitignore`) |
| `LOG_REQUESTS` | — | `1` để log từng request |
