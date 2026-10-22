# Hệ Thống Quản Lý Chung Cư / Căn Hộ (Apartment Management System) - Đề 36

> **Báo cáo Thực hành môn:** Triển khai và Quản trị Hệ thống Phần mềm (TKQT HTPM K23)  
> **Trường:** Đại học Công nghệ Thông tin và Truyền thông - Đại học Thái Nguyên (ICTU)  
> **Khoa:** Công nghệ Thông tin  
> **Sinh viên thực hiện:** Lê Hoàng Quân  
> **Mã số sinh viên (MSSV):** `DTC245200572`  
> **Lớp / Khóa:** K23.K1.CNTT K23C  
> **Năm học:** 2026 - 2027  

---

## 🏢 1. Giới thiệu Đề tài

Hệ thống **Quản lý Chung cư / Căn hộ** giải quyết toàn diện bài toán vận hành của Ban Quản trị tòa nhà chung cư hiện đại, bao gồm:
- **Quản lý Căn hộ & Cư dân:** Số phòng, diện tích, trạng thái lưu trú thường trú/tạm trú, thông tin nhân thân CCCD.
- **Quản lý Phí Dịch vụ & Hóa đơn:** Thu tiền điện, nước, phí quản lý tòa nhà, phí gửi phương tiện theo từng chu kỳ hàng tháng.
- **Bảng tin & Thông báo:** Phát đi các thông báo khẩn cấp (PCCC, bảo trì kỹ thuật, diễn tập) tức thời đến toàn thể cư dân.
- **Tiếp nhận Khiếu nại & Phản ánh:** Cư dân gửi phản ánh tiếng ồn, sự cố thang máy, vệ sinh; Ban Quản trị xử lý và phản hồi trực tiếp.
- **DevOps & Quan sát toàn diện (Observability):** Tích hợp Nginx Reverse Proxy (SSL/HTTPS + Security Headers), cơ sở dữ liệu PostgreSQL + pgAdmin, giám sát hiệu năng với Prometheus + Grafana, và quản lý log tập trung với Loki + Promtail.

---

## 🛠️ 2. Kiến trúc Hệ thống & Ngăn xếp Công nghệ (Tech Stack)

```
[ Internet Client / Browser ]
           │
           │ (HTTPS:443 / HTTP:80 Redirect)
           ▼
┌────────────────────────────────────────────────────────┐
│               apartment-nginx (Reverse Proxy)          │
│   - SSL/TLS Self-Signed Certificate                    │
│   - Hardening Security Headers (A+ Grade)              │
└──────────────────────────┬─────────────────────────────┘
                           │ (HTTP:5000)
                           ▼
┌────────────────────────────────────────────────────────┐
│            apartment-app (Node.js Express)             │
│   - RESTful APIs & Quản lý Căn hộ / Cư dân / Hóa đơn   │
│   - User non-root (node), Microservices pattern        │
│   - Prom-client Metrics Exporter (/metrics)            │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌─────────────────────────────┐ ┌────────────────────────┐
│ apartment-db (PostgreSQL 16)│ │ Monitoring & Logging   │
│ - Isolated Backend Network  │ │ - Prometheus (9090)    │
│ - Schema & Seed Data        │ │ - Grafana (3000)       │
│ - pgAdmin 4 UI (5050)       │ │ - Loki (3100)          │
└─────────────────────────────┘ │ - Promtail (Log Agent) │
                                └────────────────────────┘
```

| Dịch vụ | Docker Image | Cổng ngoài (Host) | Cổng nội bộ | Mục đích sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Nginx Proxy** | `nginx:1.27-alpine` | `80`, `443` | `80`, `443` | Reverse proxy, SSL tự ký, Security Headers |
| **Web App** | `custom (node:20-alpine)` | - (Nội bộ) | `5000` | Ứng dụng Quản lý Chung cư (Đề 36) |
| **PostgreSQL** | `postgres:16-alpine` | - (Nội bộ) | `5432` | Lưu trữ cơ sở dữ liệu quan hệ |
| **pgAdmin 4** | `dpage/pgadmin4:latest` | `5050` | `80` | Giao diện quản trị cơ sở dữ liệu web |
| **Prometheus** | `prom/prometheus:v2.51.0` | `9090` | `9090` | Cào metrics hiệu năng hệ thống định kỳ |
| **Grafana** | `grafana/grafana:10.4.1` | `3000` | `3000` | Trực quan hóa Metrics & tra cứu Log tập trung |
| **Loki** | `grafana/loki:2.9.4` | `3100` | `3100` | Lưu trữ và xử lý nhật ký container (LogQL) |
| **Promtail** | `grafana/promtail:2.9.4` | - (Nội bộ) | `9080` | Thu thập log container từ Docker daemon |

---

## 🚀 3. Hướng dẫn Khởi chạy Hệ thống

### Bước 1: Clone Repository
```bash
git clone https://github.com/DTC245200572/DTC245200572-apartment-management.git
cd DTC245200572-apartment-management
```

### Bước 2: Thiết lập Biến môi trường
Hệ thống sử dụng file `.env` để bảo mật thông tin nhạy cảm. Bạn có thể copy từ `.env.example`:
```bash
cp .env.example .env
```
*(File `.env` mẫu đã được cấu hình mật khẩu mạnh sẵn sàng cho môi trường thực hành).*

### Bước 3: Khởi chạy toàn bộ hệ thống bằng Docker Compose
```bash
docker compose up -d --build
```

### Bước 4: Kiểm tra trạng thái các Container
```bash
docker compose ps
```
Đảm bảo tất cả 8 container đều hiển thị trạng thái `Up` (và `healthy` đối với database & app).

---

## 🌐 4. Danh sách Địa chỉ Truy cập Dịch vụ

- **Trang chủ Hệ thống Quản lý Chung cư:** [https://localhost](https://localhost) *(hoặc http://localhost để kiểm tra chuyển hướng tự động 301 sang HTTPS)*
- **Prometheus Metrics Endpoint:** [http://localhost/metrics](http://localhost/metrics) hoặc [http://localhost:9090](http://localhost:9090)
- **pgAdmin 4 (Quản trị Database):** [http://localhost:5050](http://localhost:5050)
  - *Email đăng nhập:* `admin@apartment.ictu.edu.vn`
  - *Mật khẩu:* `AdminP@ssword2026!`
- **Grafana Dashboard (Giám sát & Logs):** [http://localhost:3000](http://localhost:3000)
  - *Tài khoản:* `admin`
  - *Mật khẩu:* `AdminGrafana2026!`
  - *Dashboard sẵn có:* `Apartment Management Observability (De 36)`
- **Loki Server:** [http://localhost:3100/ready](http://localhost:3100/ready)

---

## 🔍 5. Kiểm thử LogQL trên Grafana Explore

Vào **Grafana** -> **Explore** -> Chọn nguồn dữ liệu **Loki**:

1. **Lọc lỗi HTTP 5xx từ Nginx Access Log:**
   ```logql
   {container="apartment-nginx"} |~ "HTTP/[0-9.]+ 5[0-9]{2}"
   ```
2. **Lọc log lỗi ngoại lệ từ ứng dụng Chung cư:**
   ```logql
   {container="apartment-app"} | json | level="ERROR"
   ```
3. **Theo dõi các sự kiện nộp phí dịch vụ căn hộ:**
   ```logql
   {container="apartment-app"} |= "Service fee paid"
   ```

*(Bạn có thể nhấn nút "Kích hoạt HTTP 500 Test LogQL" trong mục DevOps & Observability trên giao diện web để sinh log mẫu ngay lập tức).*

---

## 🛡️ 6. Các Giải pháp Bảo mật (Hardening) đã Triển khai

1. **Non-Root Execution:** Container Web Node.js chạy với user `node` (UID: 1000), loại bỏ nguy cơ leo thang đặc quyền lên máy chủ vật lý.
2. **Network Isolation:** Thiết lập 3 mạng bridge nội bộ độc lập (`frontend_net`, `backend_net`, `monitoring_net`). Cơ sở dữ liệu PostgreSQL tuyệt đối không mở port ra môi trường bên ngoài máy chủ host.
3. **HTTPS & Security Headers:** Nginx triển khai SSL tự ký kèm bộ HTTP headers phòng chống XSS, Clickjacking, MIME-Sniffing (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`).
4. **Environment Isolation:** Cô lập biến môi trường qua `.env`, loại bỏ hardcode credentials trong mã nguồn.

---

## 📦 7. Lịch sử Git Commits chuẩn Đề tài

Repository được tổ chức theo đúng 3 mốc commit yêu cầu của môn học:
- **Commit 1:** `feat: Web apartment management app + PostgreSQL + pgAdmin + Nginx reverse proxy & security headers`
- **Commit 2:** `feat: Integrate Prometheus and Grafana observability stack with pre-configured dashboard`
- **Commit 3:** `feat: Implement centralized logging with Loki + Promtail and verified LogQL queries`
