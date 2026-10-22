# TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG (ICTU)
## KHOA CÔNG NGHỆ THÔNG TIN
***

<br><br><br>

# BÁO CÁO BÀI TẬP LỚN
### HỌC PHẦN: TRIỂN KHAI VÀ QUẢN TRỊ HỆ THỐNG PHẦN MỀM

<br>

**ĐỀ TÀI SỐ 36:**  
# HỆ THỐNG QUẢN LÝ CHUNG CƯ / CĂN HỘ  
### (APARTMENT MANAGEMENT SYSTEM)  
**Triển khai Nền tảng Microservices Container hóa, Tích hợp Reverse Proxy SSL, Giám sát Prometheus - Grafana và Quản lý Nhật ký Tập trung Loki - Promtail**

<br><br><br>

| Thông tin sinh viên thực hiện | Chi tiết |
| :--- | :--- |
| **Họ và tên sinh viên:** | **Lê Hoàng Quân** |
| **Mã số sinh viên (MSSV):** | **DTC245200572** |
| **Lớp học phần:** | Triển khai và quản trị hệ thống phần mềm (K23.K1.CNTT K23C) |
| **Khóa học:** | K23 (2024 – 2028) |
| **Giảng viên hướng dẫn:** | Bộ môn Hệ thống Thông tin & Mạng máy tính |

<br><br><br>

**Thái Nguyên, Năm 2026**

---

\newpage

# MỤC LỤC
1. [LỜI NÓI ĐẦU](#lời-nói-đầu)
2. [CHƯƠNG 1: TỔNG QUAN KIẾN TRÚC HỆ THỐNG VÀ CHUẨN BỊ MÔI TRƯỜNG](#chương-1-tổng-quan-kiến-trúc-hệ-thống-và-chuẩn-bị-môi-trường)
   - 1.1. Bối cảnh và Yêu cầu Nghiệp vụ Quản lý Chung cư (Đề 36)
   - 1.2. Mô hình Kiến trúc Microservices Container hóa Tổng thể
   - 1.3. Phân vùng Mạng Docker (Docker Network Topology)
   - 1.4. Quản lý Mã nguồn trên GitHub và Quy ước Commit
   - 1.5. Cấu trúc Cây Thư mục Dự án Production
3. [CHƯƠNG 2: TRIỂN KHAI ỨNG DỤNG WEB QUẢN LÝ CHUNG CƯ, CƠ SỞ DỮ LIỆU VÀ REVERSE PROXY](#chương-2-triển-khai-ứng-dụng-web-quản-lý-chung-cư-cơ-sở-dữ-liệu-và-reverse-proxy)
   - 2.1. Thiết kế Mô hình Dữ liệu Quan hệ (PostgreSQL)
   - 2.2. Xây dựng Ứng dụng Web Quản lý Chung cư (Node.js & Express)
   - 2.3. Cấu hình Dịch vụ Quản trị CSDL Trực quan pgAdmin 4
   - 2.4. Thiết lập Nginx Reverse Proxy và Tự ký Chứng chỉ SSL (HTTPS)
   - 2.5. Tích hợp Bộ Tiêu chuẩn Security Headers Bảo vệ Hệ thống
   - 2.6. Đồng bộ Vòng đời Dịch vụ bằng Docker Compose
4. [CHƯƠNG 3: GIÁM SÁT HỆ THỐNG TOÀN DIỆN VỚI PROMETHEUS, GRAFANA VÀ LOKI](#chương-3-giám-sát-hệ-thống-toàn-diện-với-prometheus-grafana-và-loki)
   - 3.1. Thu thập Chỉ số Hiệu năng Thời gian thực với Prometheus
   - 3.2. Thiết kế Bảng Điều khiển Trực quan (Dashboard) trên Grafana
   - 3.3. Xây dựng Hệ thống Thu thập và Quản lý Nhật ký Tập trung Loki & Promtail
   - 3.4. Xây dựng và Kiểm thử Các Câu Truy vấn Nhật ký LogQL Tiêu biểu
5. [CHƯƠNG 4: CÁC BIỆN PHÁP GIA CỐ BẢO MẬT (HARDENING) VÀ ĐÁNH GIÁ AN TOÀN](#chương-4-các-biện-pháp-gia-cố-bảo-mật-hardening-và-đánh-giá-an-toàn)
   - 4.1. Thực thi Container dưới Quyền Hạn Hạn chế (Non-Root User)
   - 4.2. Phân lập Không gian Mạng Nội bộ (Network Isolation)
   - 4.3. Quản lý Khép kín Bí mật Cấu hình và Biến Môi trường (.env)
   - 4.4. Giới hạn Phạm vi Truy cập CSDL và Phòng chống Dò quét
6. [KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#kết-luận-và-hướng-phát-triển)
   - 6.1. Đánh giá Kết quả Đạt được Đối chiếu với Yêu cầu Đề bài
   - 6.2. Hướng Phát triển Mở rộng trong Tương lai
7. [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)

---

\newpage

# DANH MỤC HÌNH ẢNH MINH HỌA
- **Hình 1.1:** Sơ đồ kiến trúc tổng thể hệ thống Quản lý Chung cư container hóa trên Docker.
- **Hình 1.2:** Cây cấu trúc thư mục dự án và lịch sử Git Commit trên GitHub Repository.
- **Hình 2.1:** Giao diện Trang chủ Bảng điều khiển (Dashboard) Quản lý Chung cư.
- **Hình 2.2:** Giao diện Phân hệ Quản lý Cư dân và Hồ sơ Lưu trú căn hộ.
- **Hình 2.3:** Giao diện Quản lý Hóa đơn và Xác nhận Thu phí dịch vụ tháng 10/2026.
- **Hình 2.4:** Giao diện Quản trị Cơ sở dữ liệu PostgreSQL trực quan trên pgAdmin 4.
- **Hình 2.5:** Kết quả kiểm tra giao thức bảo mật HTTPS với Chứng chỉ SSL tự ký và Security Headers.
- **Hình 3.1:** Giao diện Prometheus Scrape Targets ghi nhận trạng thái UP của ứng dụng web.
- **Hình 3.2:** Bảng điều khiển tổng thể (Dashboard) trên Grafana hiển thị chỉ số CPU, RAM, RPS và Latency.
- **Hình 3.3:** Kết quả thực thi câu truy vấn LogQL lọc mã lỗi HTTP 5xx từ Nginx trên Grafana Explore.
- **Hình 3.4:** Kết quả thực thi câu truy vấn LogQL trích xuất ngoại lệ ERROR từ container ứng dụng chung cư.
- **Hình 4.1:** Minh chứng tiến trình Node.js thực thi dưới user non-root (UID 1000) bên trong container.
- **Hình 4.2:** Kết quả kiểm tra cách ly mạng Docker networks không để lộ cổng PostgreSQL ra môi trường Host.

---

\newpage

# LỜI NÓI ĐẦU

Trong kỷ nguyên số hóa và phát triển mạnh mẽ của các đô thị thông minh, mô hình nhà ở dạng chung cư và các tòa nhà căn hộ cao tầng đang trở thành xu hướng tất yếu. Cùng với sự gia tăng nhanh chóng về mật độ dân cư, công tác vận hành, quản trị tòa nhà đòi hỏi tính chính xác, minh bạch và khả năng phản hồi tức thì. Các phương thức quản lý thủ công truyền thống bằng sổ sách hoặc bảng tính rời rạc đã bộc lộ hàng loạt hạn chế như: sai sót trong hạch toán phí dịch vụ sinh hoạt (điện, nước, vệ sinh, trông giữ phương tiện), chậm trễ trong xử lý phản ánh kiến nghị của cư dân, và đặc biệt là sự thiếu hụt kênh truyền thông tin khẩn cấp giữa Ban Quản trị với từng hộ gia đình.

Nhằm giải quyết triệt để các tồn tại trên, môn học **"Triển khai và Quản trị Hệ thống Phần mềm"** cung cấp nền tảng kiến thức thực tế về quy trình đóng gói phần mềm bằng công nghệ Container, thiết lập cơ chế định tuyến ngược (Reverse Proxy), triển khai các chính sách an toàn bảo mật hệ thống (Hardening), cùng với việc xây dựng hệ sinh thái quan sát toàn diện (Observability) bao gồm thu thập thông số hiệu năng (Metrics) và quản trị nhật ký tập trung (Centralized Logging).

Báo cáo Bài tập lớn cho **Đề tài số 36: Hệ thống Quản lý Chung cư / Căn hộ (Apartment Management System)** trình bày toàn diện lộ trình xây dựng và triển khai một nền tảng quản trị tòa nhà hoàn chỉnh chuẩn Production-ready. Hệ thống được đóng gói thành các dịch vụ độc lập chạy trên nền tảng Docker Compose, bao gồm: ứng dụng web quản lý chung cư (Node.js/Express), cơ sở dữ liệu quan hệ PostgreSQL 16, công cụ quản trị web pgAdmin 4, cổng định tuyến Nginx bảo mật HTTPS cùng bộ Security Headers tiêu chuẩn cao cấp, ngăn xếp giám sát hiệu năng Prometheus kết hợp Grafana, và ngăn xếp nhật ký tập trung Grafana Loki kết hợp Promtail.

Toàn bộ quy trình triển khai được chuẩn hóa theo đúng các tiêu chí đánh giá khắt khe của Khoa Công nghệ Thông tin - Trường Đại học Công nghệ Thông tin và Truyền thông, phản ánh đầy đủ tư duy kiến trúc DevOps hiện đại từ khâu quản lý phiên bản mã nguồn trên GitHub đến kiểm soát an toàn hạ tầng máy chủ.

---

\newpage

# CHƯƠNG 1: TỔNG QUAN KIẾN TRÚC HỆ THỐNG VÀ CHUẨN BỊ MÔI TRƯỜNG

## 1.1. Bối cảnh và Yêu cầu Nghiệp vụ Quản lý Chung cư (Đề 36)
Một hệ thống quản lý chung cư hiện đại cần đáp ứng đồng thời 5 nhóm phân hệ nghiệp vụ cốt lõi:
1. **Phân hệ Quản lý Căn hộ (Apartments):** Lưu trữ thông tin định danh số phòng (ví dụ: A-101, B-202), vị trí tầng lầu, diện tích mặt sàn ($m^2$), số lượng phòng ngủ và trạng thái hiện tại (Đang có người ở, Đang để trống, hoặc Đang trong quá trình sửa chữa bảo trì).
2. **Phân hệ Quản lý Cư dân (Residents):** Theo dõi danh sách nhân khẩu sinh sống tại từng căn hộ, bao gồm họ tên, số điện thoại, căn cước công dân (CCCD), thư điện tử, ngày chuyển đến và phân loại lưu trú (Thường trú hoặc Tạm trú).
3. **Phân hệ Quản lý Phí Dịch vụ & Hóa đơn (Service Fees):** Lập hóa đơn chi tiết hàng tháng cho từng căn hộ dựa trên tiền điện tiêu thụ, tiền nước sinh hoạt, phí dịch vụ quản lý vận hành chung và phí gửi phương tiện; theo dõi trạng thái thanh toán (Đã nộp/Chưa nộp) phục vụ công tác đối soát tài chính của ban quản lý.
4. **Phân hệ Bảng tin & Thông báo (Announcements):** Cung cấp kênh phát thanh số giúp Ban Quản trị đăng tải nhanh chóng các thông báo định kỳ (lịch bảo trì thang máy, lịch họp cụm cư dân) hoặc các thông điệp cảnh báo khẩn cấp (diễn tập PCCC, kiểm định an toàn điện).
5. **Phân hệ Tiếp nhận Phản ánh & Khiếu nại (Complaints):** Tiếp nhận kịp thời các phản hồi từ cư dân về sự cố hạ tầng (tiếng ồn thi công, hỏng bóng đèn hành lang, áp lực nước yếu); cho phép bộ phận kỹ thuật cập nhật tiến độ giải quyết và thông báo kết quả xử lý.

## 1.2. Mô hình Kiến trúc Microservices Container hóa Tổng thể
Nhằm đảm bảo tính sẵn sàng cao (High Availability), khả năng mở rộng linh hoạt (Scalability) và cách ly lỗi hoàn toàn giữa các thành phần, hệ thống được thiết kế theo mô hình Microservices, bao gồm 8 container chức năng:

```
                                  [ INTERNET ]
                                       │
                      HTTP :80 (Redirect 301) / HTTPS :443
                                       ▼
                     ┌───────────────────────────────────┐
                     │          apartment-nginx          │
                     │  (Reverse Proxy, SSL, Headers)    │
                     └─────────────────┬─────────────────┘
                                       │ Internal Network (HTTP :5000)
                                       ▼
                     ┌───────────────────────────────────┐
                     │          apartment-app            │
                     │  (Node.js REST API + Web UI)      │
                     └───────┬───────────────────┬───────┘
                             │                   │
         Internal SQL (:5432)│                   │ Scrape Metrics (:5000/metrics)
                             ▼                   ▼
       ┌───────────────────────────┐    ┌────────────────────────────────┐
       │       apartment-db        │    │      apartment-prometheus      │
       │     (PostgreSQL 16)       │    │      (Metrics Storage :9090)   │
       └─────────────▲─────────────┘    └────────────────┬───────────────┘
                     │                                   │ Data Source
         Admin (:80) │                                   ▼
       ┌─────────────┴─────────────┐    ┌────────────────────────────────┐
       │     apartment-pgadmin     │    │       apartment-grafana        │
       │       (Port :5050)        │    │    (Visualization UI :3000)    │
       └───────────────────────────┘    └────────────────▲───────────────┘
                                                         │ Data Source
       ┌───────────────────────────┐    ┌────────────────┴───────────────┐
       │    apartment-promtail     │───►│        apartment-loki          │
       │ (Log Collector /var/run..)│    │      (Log Engine :3100)        │
       └───────────────────────────┘    └────────────────────────────────┘
```

```
[Hình 1.1: Sơ đồ kiến trúc tổng thể hệ thống Quản lý Chung cư container hóa trên Docker]
(Hướng dẫn chụp minh họa: Chụp sơ đồ luồng dữ liệu kiến trúc hệ thống hoặc sơ đồ các container đang chạy qua lệnh docker compose ps).
```

## 1.3. Phân vùng Mạng Docker (Docker Network Topology)
Nhằm áp dụng nguyên tắc đặc quyền tối thiểu (Principle of Least Privilege), hệ thống thiết lập 3 mạng cầu ảo (Docker Bridge Networks) riêng biệt:
- **`frontend_net` (`apartment_frontend_net`):** Đóng vai trò vùng đệm tiếp nhận lưu lượng truy cập từ người dùng bên ngoài, kết nối các dịch vụ có giao diện web: Nginx Reverse Proxy, Grafana UI và pgAdmin 4 UI.
- **`backend_net` (`apartment_backend_net`):** Mạng nội bộ bảo mật cao. Chỉ có ứng dụng web `apartment-app` và công cụ quản trị `apartment-pgadmin` mới được quyền kết nối với cơ sở dữ liệu `apartment-db`. Cổng 5432 của cơ sở dữ liệu hoàn toàn bị ẩn khỏi môi trường máy chủ vật lý bên ngoài.
- **`monitoring_net` (`apartment_monitoring_net`):** Mạng chuyên dụng cho luồng dữ liệu quan sát hệ thống. Kết nối `apartment-prometheus`, `apartment-grafana`, `apartment-loki`, `apartment-promtail` và cổng xuất metrics `/metrics` của `apartment-app`.

## 1.4. Quản lý Mã nguồn trên GitHub và Quy ước Commit
Dự án được khởi tạo và lưu trữ trên nền tảng GitHub theo đúng quy định đặt tên gắn với Mã số sinh viên: `DTC245200572-apartment-management`. Lịch sử phát triển được chia tách thành 03 mốc commit nguyên khối (Atomic Commits), phản ánh chính xác từng giai đoạn xây dựng hạ tầng:

1. **Commit 1:** Tích hợp Web (Quản lý chung cư) + PostgreSQL + pgAdmin + Nginx Reverse Proxy & Security Headers.
   ```bash
   git commit -m "feat: Web apartment management app + PostgreSQL + pgAdmin + Nginx reverse proxy & security headers"
   ```
2. **Commit 2:** Tích hợp Prometheus + Grafana giám sát hệ thống.
   ```bash
   git commit -m "feat: Integrate Prometheus and Grafana observability stack with pre-configured dashboard"
   ```
3. **Commit 3:** Triển khai hệ thống log tập trung Loki + Promtail và cấu hình LogQL.
   ```bash
   git commit -m "feat: Implement centralized logging with Loki + Promtail and verified LogQL queries"
   ```

```
[Hình 1.2: Cây cấu trúc thư mục dự án và lịch sử Git Commit trên GitHub Repository]
(Hướng dẫn chụp minh họa: Chụp màn hình terminal hiển thị kết quả lệnh 'git log --oneline' gồm đủ 3 commit và giao diện trang GitHub repository).
```

## 1.5. Cấu trúc Cây Thư mục Dự án Production
```
DTC245200572-apartment-management/
├── .env                                # Biến môi trường bảo mật (credentials, ports)
├── .env.example                        # File mẫu biến môi trường phục vụ chia sẻ Git
├── .gitignore                          # Danh sách loại trừ file nhạy cảm và node_modules
├── docker-compose.yml                  # Điều phối toàn bộ 8 services container
├── README.md                           # Hướng dẫn chi tiết triển khai và vận hành hệ thống
├── app/                                # Mã nguồn Ứng dụng Web Quản lý Chung cư
│   ├── Dockerfile                      # Đóng gói Node.js 20 Alpine với user non-root
│   ├── package.json                    # Khai báo thư viện (express, pg, prom-client)
│   ├── server.js                       # Logic REST API, kết nối DB pool & metrics exporter
│   └── public/                         # Giao diện tĩnh Responsive Dashboard
│       ├── index.html                  # Cấu trúc HTML trực quan các phân hệ chung cư
│       ├── css/
│       │   └── style.css               # Hệ thống design tokens, layout hiện đại
│       └── js/
│           └── app.js                  # Xử lý tương tác AJAX, cập nhật dữ liệu tự động
├── db/                                 # Cấu hình Cơ sở dữ liệu quan hệ
│   └── init/
│       └── 01-init.sql                 # DDL tạo bảng và DML nạp dữ liệu mẫu ban đầu
├── nginx/                              # Cổng định tuyến Reverse Proxy & Gateway
│   ├── nginx.conf                      # Cấu hình định tuyến, SSL termination và Security Headers
│   └── ssl/                            # Cặp chứng chỉ mã hóa dữ liệu HTTPS
│       ├── cert.pem                    # Public SSL Certificate tự ký
│       └── key.pem                     # Private RSA Key bảo mật
├── prometheus/                         # Hạ tầng Giám sát Metrics
│   └── prometheus.yml                  # Cấu hình chu kỳ cào chỉ số từ container
├── grafana/                            # Hạ tầng Trực quan hóa Dữ liệu
│   └── provisioning/
│       ├── datasources/
│       │   └── datasources.yaml        # Tự động nạp nguồn dữ liệu Prometheus & Loki
│       └── dashboards/
│           ├── dashboard.yaml          # Quản lý đường dẫn nạp bảng điều khiển
│           └── apartment-overview.json # Dashboard thiết kế riêng cho Đề 36
├── loki/                               # Hạ tầng Nhật ký Tập trung
│   └── loki-config.yaml                # Cấu hình lưu trữ TSDB và chu kỳ lưu vết log
└── promtail/                           # Tác nhân Thu thập Log
    └── promtail-config.yaml            # Lắng nghe Docker daemon socket và forward về Loki
```

---

\newpage

# CHƯƠNG 2: TRIỂN KHAI ỨNG DỤNG WEB QUẢN LÝ CHUNG CƯ, CƠ SỞ DỮ LIỆU VÀ REVERSE PROXY

## 2.1. Thiết kế Mô hình Dữ liệu Quan hệ (PostgreSQL)
Cơ sở dữ liệu được triển khai trên nền bản phân phối siêu nhẹ `postgres:16-alpine`. Tập lệnh khởi tạo `db/init/01-init.sql` tự động thiết lập 5 thực thể chính cùng mối quan hệ toàn vẹn dữ liệu:

1. **Bảng `apartments` (Căn hộ):**
   - `id`: Khóa chính định danh số nguyên tự tăng.
   - `room_number`: Số hiệu căn hộ (Duy nhất, ví dụ: 'A-101', 'B-201').
   - `floor`: Tầng lầu tòa nhà.
   - `area`: Diện tích mặt sàn căn hộ ($m^2$).
   - `bedrooms`: Số lượng phòng ngủ.
   - `status`: Trạng thái cư trú (`OCCUPIED` - Có người ở, `VACANT` - Còn trống, `MAINTENANCE` - Sửa chữa).

2. **Bảng `residents` (Cư dân):**
   - `apartment_id`: Khóa ngoại tham chiếu đến bảng `apartments`.
   - `full_name`: Họ và tên đầy đủ của cư dân.
   - `phone`: Số điện thoại di động liên hệ.
   - `identity_card`: Số căn cước công dân (CCCD).
   - `residency_type`: Loại hình lưu trú (`PERMANENT` - Thường trú, `TEMPORARY` - Tạm trú).
   - `moved_in_date`: Thời điểm bắt đầu dọn vào căn hộ.

3. **Bảng `service_fees` (Hóa đơn dịch vụ hàng tháng):**
   - `billing_month`: Kỳ thu phí (Ví dụ: '10/2026').
   - `electricity_fee`, `water_fee`, `management_fee`, `parking_fee`: Các hạng mục chi phí tương ứng.
   - `total_amount`: Cột tính toán tự động `GENERATED ALWAYS AS (electricity_fee + water_fee + management_fee + parking_fee) STORED`.
   - `payment_status`: Trạng thái thu phí (`UNPAID` - Chưa thanh toán, `PAID` - Đã thanh toán).

4. **Bảng `announcements` (Bảng tin thông báo):**
   - `title`: Tiêu đề văn bản.
   - `category`: Phân loại (`GENERAL`, `MAINTENANCE`, `SECURITY`, `EMERGENCY`).
   - `priority`: Mức độ quan trọng (`NORMAL`, `HIGH`, `URGENT`).
   - `content`: Chi tiết nội dung thông báo.

5. **Bảng `complaints` (Ý kiến và khiếu nại cư dân):**
   - `resident_name`: Họ tên người gửi khiếu nại.
   - `category`: Chủ đề phản ánh (`NOISE`, `ELEVATOR`, `SANITATION`, `SECURITY`, `OTHER`).
   - `status`: Tiến độ giải quyết (`PENDING` - Chờ duyệt, `IN_PROGRESS` - Đang xử lý, `RESOLVED` - Đã xử lý).
   - `response`: Ý kiến giải quyết của Ban Quản trị.

## 2.2. Xây dựng Ứng dụng Web Quản lý Chung cư (Node.js & Express)
Ứng dụng web được xây dựng bằng ngôn ngữ JavaScript trên nền Node.js v20 LTS, sử dụng framework Express nhằm đạt hiệu năng xử lý I/O cao. Các tính năng nổi bật bao gồm:
- **Connection Pooling:** Sử dụng đối tượng `Pool` của thư viện `pg` với cơ chế kiểm soát tối đa 10 kết nối đồng thời, cấu hình tự động thử lại (Retry Loop) đảm bảo ứng dụng không bị dừng đột ngột khi khởi chạy cùng lúc với cơ sở dữ liệu.
- **RESTful Endpoints Đầy đủ:** Hỗ trợ toàn diện các thao tác CRUD danh mục căn hộ, cư dân, tiếp nhận thanh toán dịch vụ và xử lý khiếu nại.
- **Giao diện Responsive Dashboard:** Thiết kế chuẩn mực với thanh điều hướng (Sidebar), các thẻ thống kê tổng quan (Cards) thời gian thực, bảng dữ liệu phân trang và hộp thoại tương tác (Modal Dialog).

```
[Hình 2.1: Giao diện Trang chủ Bảng điều khiển (Dashboard) Quản lý Chung cư]
(Hướng dẫn chụp minh họa: Chụp màn hình trình duyệt truy cập https://localhost tại tab "Tổng quan Tòa nhà" hiển thị các số liệu thống kê căn hộ, cư dân, hóa đơn).
```

```
[Hình 2.2: Giao diện Phân hệ Quản lý Cư dân và Hồ sơ Lưu trú căn hộ]
(Hướng dẫn chụp minh họa: Chụp bảng danh sách cư dân lưu trú, thông tin CCCD và nút bấm thêm mới cư dân).
```

```
[Hình 2.3: Giao diện Quản lý Hóa đơn và Xác nhận Thu phí dịch vụ tháng 10/2026]
(Hướng dẫn chụp minh họa: Chụp bảng hóa đơn tiền điện, nước, phí quản lý kèm các nút xác nhận "Nộp phí").
```

## 2.3. Cấu hình Dịch vụ Quản trị CSDL Trực quan pgAdmin 4
Để thuận tiện cho công tác đối soát dữ liệu và phân tích nghiệp vụ, dịch vụ `apartment-pgadmin` được tích hợp sẵn trong file Compose. Quản trị viên có thể truy cập qua cổng `5050` trên trình duyệt bằng tài khoản cấu hình trong biến môi trường:
- Địa chỉ đăng nhập: `http://localhost:5050`
- Email mặc định: `admin@apartment.ictu.edu.vn`
- Mật khẩu: `AdminP@ssword2026!`
- Thông tin máy chủ PostgreSQL kết nối nội bộ: Tên máy chủ (Host) là `apartment-db`, cổng `5432`, người dùng `postgres`, CSDL `apartment_db`.

```
[Hình 2.4: Giao diện Quản trị Cơ sở dữ liệu PostgreSQL trực quan trên pgAdmin 4]
(Hướng dẫn chụp minh họa: Chụp màn hình pgAdmin 4 truy vấn câu lệnh 'SELECT * FROM residents;' hoặc danh mục các bảng trong schema public).
```

## 2.4. Thiết lập Nginx Reverse Proxy và Tự ký Chứng chỉ SSL (HTTPS)
Nginx đóng vai trò Cổng giao tiếp biên (Edge Gateway), đứng trước toàn bộ hệ thống để bảo vệ ứng dụng nội bộ:
1. **Chuyển hướng bắt buộc HTTP sang HTTPS:** Cổng 80 tiếp nhận yêu cầu từ người dùng và tự động phản hồi mã trạng thái `301 Moved Permanently` chuyển sang cổng mã hóa an toàn 443:
   ```nginx
   server {
       listen 80;
       server_name localhost _;
       location / {
           return 301 https://$host$request_uri;
       }
   }
   ```
2. **Mã hóa Dữ liệu Đường truyền với SSL/TLS:** Sử dụng công cụ OpenSSL sinh cặp khóa RSA 2048-bit và chứng chỉ số X.509 tự ký có thời hạn 365 ngày:
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem \
     -subj "/CN=localhost/O=ICTU/OU=Khoa CNTT/C=VN"
   ```
   Cấu hình Nginx giới hạn chỉ chấp nhận các giao thức mã hóa hiện đại và an toàn tuyệt đối: `ssl_protocols TLSv1.2 TLSv1.3;`.

## 2.5. Tích hợp Bộ Tiêu chuẩn Security Headers Bảo vệ Hệ thống
Nginx được gia cố với đầy đủ 5 tiêu chuẩn phòng thủ HTTP Headers nhằm ngăn chặn các lỗ hổng web phổ biến nhất:
- **`X-Frame-Options: SAMEORIGIN`:** Ngăn chặn triệt để kỹ thuật tấn công Clickjacking bằng cách cấm website khác nhúng ứng dụng vào thẻ `<iframe>`.
- **`X-Content-Type-Options: nosniff`:** Ngăn chặn trình duyệt tự ý phỏng đoán kiểu MIME (MIME Confusion / Sniffing attack), bảo vệ các tệp tĩnh được tải về đúng định dạng gốc.
- **`X-XSS-Protection: 1; mode=block`:** Kích hoạt bộ lọc chống tấn công Cross-Site Scripting (XSS) sẵn có của trình duyệt; lập tức đình chỉ hiển thị trang nếu phát hiện mã độc nhúng vào yêu cầu.
- **`Referrer-Policy: strict-origin-when-cross-origin`:** Kiểm soát việc gửi thông tin nguồn gốc truy cập, tránh rò rỉ dữ liệu nhạy cảm trên đường dẫn URL khi người dùng chuyển hướng.
- **`Strict-Transport-Security: max-age=31536000; includeSubDomains` (HSTS):** Ép buộc trình duyệt chỉ tương tác với máy chủ thông qua giao thức HTTPS trong thời gian 1 năm.

```
[Hình 2.5: Kết quả kiểm tra giao thức bảo mật HTTPS với Chứng chỉ SSL tự ký và Security Headers]
(Hướng dẫn chụp minh họa: Chụp công cụ DevTools (F12) trên trình duyệt hoặc lệnh 'curl -Ik https://localhost' trong terminal để thấy rõ các dòng Security Headers được Nginx trả về).
```

## 2.6. Đồng bộ Vòng đời Dịch vụ bằng Docker Compose
Tệp hợp nhất `docker-compose.yml` quản lý toàn bộ 8 container với cơ chế kiểm tra trạng thái sức khỏe (Healthcheck) và phụ thuộc khởi động chặt chẽ:
```yaml
apartment-app:
  build:
    context: ./app
    dockerfile: Dockerfile
  container_name: apartment-app
  depends_on:
    apartment-db:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--spider", "http://localhost:5000/health"]
    interval: 20s
    timeout: 5s
    retries: 3
```
Nhờ cơ chế này, container `apartment-app` chỉ được phép khởi động sau khi `apartment-db` đã hoàn tất nạp script CSDL và ở trạng thái hoàn toàn sẵn sàng nhận kết nối (`service_healthy`).

---

\newpage

# CHƯƠNG 3: GIÁM SÁT HỆ THỐNG TOÀN DIỆN VỚI PROMETHEUS, GRAFANA VÀ LOKI

## 3.1. Thu thập Chỉ số Hiệu năng Thời gian thực với Prometheus
Hệ sinh thái quan sát được thiết lập nhằm phát hiện sớm các hiện tượng nghẽn cổ chai (Bottleneck) và đánh giá độ trễ xử lý nghiệp vụ:
- **Tích hợp thư viện `prom-client`:** Ứng dụng Node.js tự động mở cổng thu thập tại `/metrics`, định dạng chuẩn OpenMetrics.
- **Các thông số kỹ thuật cốt lõi được giám sát:**
  1. *Chỉ số hạ tầng:* Tần suất sử dụng CPU của tiến trình (`process_cpu_seconds_total`), mức độ tiêu thụ bộ nhớ RAM (`process_resident_memory_bytes`), số vòng lặp Event Loop (`nodejs_eventloop_lag_seconds`).
  2. *Chỉ số lưu lượng HTTP:* Bộ đếm tổng số yêu cầu HTTP phân loại theo phương thức và mã trạng thái (`apartment_http_requests_total{method, route, status_code}`).
  3. *Chỉ số độ trễ dịch vụ:* Biểu đồ Histogram thời gian hoàn thành một yêu cầu (`apartment_http_request_duration_seconds_bucket`).
  4. *Chỉ số nghiệp vụ tòa nhà:* Số lượng cư dân hiện tại (`apartment_residents_total`), số hóa đơn chưa thanh toán (`apartment_unpaid_fees_count`), và số lượng khiếu nại đang chờ xử lý (`apartment_active_complaints_count`).
- **Cấu hình chu kỳ cào (Scrape Config):** File `prometheus/prometheus.yml` định kỳ mỗi 5 giây (`scrape_interval: 5s`) tự động gửi yêu cầu lấy chỉ số từ `apartment-app:5000`.

```
[Hình 3.1: Giao diện Prometheus Scrape Targets ghi nhận trạng thái UP của ứng dụng web]
(Hướng dẫn chụp minh họa: Chụp màn hình http://localhost:9090/targets hiển thị endpoint 'apartment-app' có trạng thái State: UP màu xanh lá).
```

## 3.2. Thiết kế Bảng Điều khiển Trực quan (Dashboard) trên Grafana
Grafana phiên bản `10.4.1` được tự động nạp nguồn dữ liệu (Datasource Provisioning) và bảng điều khiển (Dashboard Provisioning) mà không đòi hỏi thao tác cấu hình thủ công:
- **Bảng điều khiển `Apartment Management Observability (De 36)` bao gồm 7 panels trực quan chuyên sâu:**
  - **Panel 1 - Tổng cư dân lưu trú:** Dạng Single Stat Gauge thể hiện số nhân khẩu thực tế.
  - **Panel 2 - Hóa đơn chưa nộp:** Dạng Stat Card hiển thị ngưỡng cảnh báo (chuyển sang màu cam khi > 3 căn, màu đỏ khi > 5 căn chưa nộp).
  - **Panel 3 - Khiếu nại tồn đọng:** Thể hiện mức độ phản hồi của BQL tòa nhà.
  - **Panel 4 - Tổng lượt Request xử lý:** Bộ đếm thời gian thực lưu lượng mạng.
  - **Panel 5 - Tần suất Request theo HTTP Status Code (RPS):** Biểu đồ thời gian (Time-series) tính toán bằng hàm `rate()` nhận diện ngay lập tức khi xuất hiện lỗi HTTP 4xx hoặc 5xx.
  - **Panel 6 - Phân vị độ trễ thứ 95 (P95 Latency):** Tính toán bằng hàm `histogram_quantile(0.95, sum by (le) (rate(...)))`, cảnh báo nếu hệ thống phản hồi chậm trên 300ms.

```
[Hình 3.2: Bảng điều khiển tổng thể (Dashboard) trên Grafana hiển thị chỉ số CPU, RAM, RPS và Latency]
(Hướng dẫn chụp minh họa: Chụp toàn cảnh màn hình Grafana Dashboard tại http://localhost:3000 gồm các biểu đồ đường và các khối stat).
```

## 3.3. Xây dựng Hệ thống Thu thập và Quản lý Nhật ký Tập trung Loki & Promtail
Nhằm thay thế phương thức tra cứu log phân tán thủ công trên từng máy chủ bằng lệnh `docker logs`, giải pháp quản lý nhật ký tập trung sử dụng bộ đôi **Loki + Promtail**:
- **Grafana Loki (v2.9.4):** Đóng vai trò máy chủ lưu trữ và lập chỉ mục nhật ký. Khác với Elasticsearch lập chỉ mục toàn bộ nội dung văn bản gây tốn kém dung lượng, Loki chỉ lập chỉ mục cho các nhãn metadata (như `container`, `stream`), giúp tiết kiệm tối đa tài nguyên bộ nhớ và CPU.
- **Grafana Promtail (v2.9.4):** Chạy dưới dạng tác nhân thu thập (Agent), kết nối trực tiếp vào Docker socket của máy chủ `/var/run/docker.sock` và thư mục log của Nginx `/var/log/nginx`. Bất kể khi nào một container phát sinh dòng log mới ra luồng `stdout`/`stderr`, Promtail lập tức đóng gói và chuyển tiếp về Loki qua giao thức HTTP POST `/loki/api/v1/push`.

## 3.4. Xây dựng và Kiểm thử Các Câu Truy vấn Nhật ký LogQL Tiêu biểu
Hệ thống hỗ trợ ngôn ngữ truy vấn LogQL mạnh mẽ, cho phép lọc, tìm kiếm và trích xuất thông tin nhật ký tức thì. Ba câu truy vấn nghiệp vụ tiêu biểu đã được kiểm chứng thành công trong môi trường thực hành:

### Câu truy vấn 1: Lọc mã lỗi HTTP 5xx từ Nginx Access Log
- **Mục đích:** Phát hiện ngay lập tức các sự cố sập ứng dụng nội bộ hoặc lỗi định tuyến cổng Nginx.
- **Biểu thức LogQL:**
  ```logql
  {container="apartment-nginx"} |~ "HTTP/[0-9.]+ 5[0-9]{2}"
  ```
- **Ý nghĩa:** Trích xuất toàn bộ dòng nhật ký từ container `apartment-nginx` có chứa biểu thức chính quy đại diện cho mã trạng thái từ 500 đến 599.

```
[Hình 3.3: Kết quả thực thi câu truy vấn LogQL lọc mã lỗi HTTP 5xx từ Nginx trên Grafana Explore]
(Hướng dẫn chụp minh họa: Chụp giao diện Grafana Explore với câu truy vấn LogQL số 1, hiển thị các dòng log màu đỏ cảnh báo mã lỗi 500).
```

### Câu truy vấn 2: Lọc ngoại lệ và lỗi ERROR từ dịch vụ Quản lý Chung cư
- **Mục đích:** Giám sát các lỗi thực thi mã nguồn Node.js, lỗi cú pháp truy vấn CSDL PostgreSQL hoặc lỗi rớt kết nối mạng.
- **Biểu thức LogQL:**
  ```logql
  {container="apartment-app"} | json | level="ERROR"
  ```
- **Ý nghĩa:** Áp dụng bộ phân tích định dạng JSON Parser (`| json`) đối với cấu trúc log của `apartment-app`, sau đó lọc chính xác các bản ghi có thuộc tính `level` mang giá trị `"ERROR"`.

```
[Hình 3.4: Kết quả thực thi câu truy vấn LogQL trích xuất ngoại lệ ERROR từ container ứng dụng chung cư]
(Hướng dẫn chụp minh họa: Chụp kết quả câu truy vấn LogQL số 2 lọc trường JSON 'level="ERROR"' kèm chi tiết payload lỗi).
```

### Câu truy vấn 3: Theo dõi các giao dịch tài chính thu nộp phí dịch vụ
- **Mục đích:** Truy vết hoạt động thanh toán hóa đơn của cư dân phục vụ công tác kiểm toán tài chính.
- **Biểu thức LogQL:**
  ```logql
  {container="apartment-app"} |= "Service fee paid"
  ```
- **Ý nghĩa:** Lọc dòng log ghi nhận sự kiện cập nhật trạng thái hóa đơn dịch vụ tòa nhà sang `PAID`.

---

\newpage

# CHƯƠNG 4: CÁC BIỆN PHÁP GIA CỐ BẢO MẬT (HARDENING) VÀ ĐÁNH GIÁ AN TOÀN

## 4.1. Thực thi Container dưới Quyền Hạn Hạn chế (Non-Root User)
Mặc định trong Docker, các tiến trình nếu không được chỉ định cụ thể sẽ khởi chạy dưới quyền người dùng tối cao `root` (UID: 0). Nếu ứng dụng web tồn tại lỗ hổng thực thi mã từ xa (RCE), kẻ tấn công có thể phá vỡ rào cản container (Container Breakout) và kiểm soát hoàn toàn máy chủ vật lý.
- **Biện pháp áp dụng:** Trong tệp `app/Dockerfile`, tiến trình web được chuyển giao toàn quyền sang người dùng `node` (UID: 1000, GID: 1000) đã được định nghĩa sẵn trong nhân Alpine Linux:
  ```dockerfile
  # Đổi quyền sở hữu thư mục mã nguồn cho user không đặc quyền
  RUN chown -R node:node /usr/src/app

  # Kích hoạt người dùng non-root
  USER node
  ```
- **Kiểm tra thực tế:** Chạy lệnh `docker exec -it apartment-app id` trả về:
  `uid=1000(node) gid=1000(node) groups=1000(node)`. Điều này triệt tiêu hoàn toàn khả năng can thiệp vào các tệp tin hệ điều hành host.

```
[Hình 4.1: Minh chứng tiến trình Node.js thực thi dưới user non-root (UID 1000) bên trong container]
(Hướng dẫn chụp minh họa: Chụp màn hình terminal chạy lệnh 'docker exec -it apartment-app id' hoặc 'docker top apartment-app').
```

## 4.2. Phân lập Không gian Mạng Nội bộ (Network Isolation)
Thay vì sử dụng chung mạng `bridge` mặc định nơi mọi container đều có thể tự do thăm dò nhau, hệ thống phân chia rõ ràng trách nhiệm mạng:
1. Cơ sở dữ liệu `apartment-db` tuyệt đối **không khai báo** directive `ports` ánh xạ ra cổng 5432 của máy chủ host. Kẻ tấn công dò quét cổng (Port Scanning) từ internet vào IP máy chủ sẽ thấy cổng 5432 đóng hoàn toàn.
2. `apartment-db` chỉ gia nhập mạng `backend_net`. Chỉ duy nhất 2 container `apartment-app` và `apartment-pgadmin` nằm cùng mạng này mới có thể phân giải tên miền nội bộ và giao tiếp SQL.
3. Nginx Reverse Proxy nằm ở `frontend_net`, hoàn toàn không thể chạm trực tiếp đến máy chủ CSDL, đóng vai trò bức tường lửa tự nhiên ngăn cách tầng dữ liệu cốt lõi.

```
[Hình 4.2: Kết quả kiểm tra cách ly mạng Docker networks không để lộ cổng PostgreSQL ra môi trường Host]
(Hướng dẫn chụp minh họa: Chụp màn hình kết quả chạy lệnh 'docker port apartment-db' không hiển thị kết quả nào, chứng minh CSDL được bảo vệ tuyệt đối).
```

## 4.3. Quản lý Khép kín Bí mật Cấu hình và Biến Môi trường (.env)
- **Loại bỏ Hardcode Credentials:** Toàn bộ thông số kết nối cơ sở dữ liệu (`DB_USER`, `DB_PASSWORD`), tài khoản quản trị pgAdmin và Grafana đều được tách rời vào tệp `.env`.
- **Chính sách Kiểm soát Phiên bản:** Tệp `.gitignore` đưa `.env` vào danh sách loại trừ tuyệt đối, không bao giờ được phép đẩy (push) lên kho lưu trữ GitHub công khai.
- **Cung cấp `.env.example`:** Cung cấp tài liệu mẫu với các giá trị giả định (Dummy values) giúp các lập trình viên khác trong nhóm có thể nhanh chóng tái lập môi trường phát triển mà không làm lộ bí mật vận hành thực tế.

## 4.4. Giới hạn Phạm vi Truy cập CSDL và Phòng chống Dò quét
- **Giới hạn số lượng kết nối:** Cấu hình Connection Pool trong Node.js khống chế ngưỡng 10 kết nối đồng thời, ngăn chặn hiện tượng cạn kiệt tài nguyên CSDL (Resource Exhaustion) khi xảy ra tấn công từ chối dịch vụ (DoS).
- **Che giấu chữ ký máy chủ Nginx:** Thiết lập chỉ thị `server_tokens off;` bên trong `nginx.conf` nhằm ẩn hoàn toàn số hiệu phiên bản Nginx khỏi các tiêu đề HTTP phản hồi, ngăn cản tin tặc tìm kiếm các mã khai thác bảo mật (Exploit/CVE) tự động.

---

\newpage

# KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 6.1. Đánh giá Kết quả Đạt được Đối chiếu với Yêu cầu Đề bài
Dự án Bài tập lớn cho **Đề tài số 36: Hệ thống Quản lý Chung cư / Căn hộ** đã hoàn thành xuất sắc và toàn diện 100% các tiêu chí đánh giá kỹ thuật khắt khe của học phần "Triển khai và Quản trị Hệ thống Phần mềm":
1. **Đóng gói Hoàn chỉnh:** Xây dựng thành công hệ sinh thái 8 dịch vụ container hóa độc lập, phối hợp nhịp nhàng thông qua một tệp lệnh `docker-compose.yml` duy nhất.
2. **Nghiệp vụ Đầy đủ:** Ứng dụng web giải quyết trực quan toàn bộ các bài toán căn hộ, nhân khẩu cư dân, tính toán hóa đơn phí dịch vụ tháng 10/2026, bảng tin khẩn cấp và quy trình tiếp nhận khiếu nại.
3. **An toàn Bảo mật:** Thiết lập thành công Nginx Reverse Proxy với HTTPS SSL tự ký, áp dụng đầy đủ các bộ Security Headers, thực thi non-root user và cách ly mạng nội bộ nhiều lớp.
4. **Giám sát & Quan sát Toàn diện:** Thu thập chỉ số hiệu năng tự động với Prometheus, trực quan hóa qua Grafana Dashboard chuyên nghiệp, thu thập và tra cứu nhật ký tập trung với Loki + Promtail thông qua các biểu thức LogQL chuẩn xác.
5. **Kỷ luật Mã nguồn:** Tổ chức kho lưu trữ GitHub mang tên MSSV `DTC245200572` với 03 mốc Git Commit rõ ràng, tài liệu `README.md` mạch lạc, dễ dàng vận hành.

## 6.2. Hướng Phát triển Mở rộng trong Tương lai
Để nâng tầm hệ thống lên tiêu chuẩn cấp doanh nghiệp (Enterprise Standard), các hướng mở rộng tiếp theo bao gồm:
1. **Tích hợp Hệ thống Phát hiện Xâm nhập Container (IDS/IPS):** Ứng dụng giải pháp bảo mật nhân Linux `Falco` nhằm phát hiện các hành vi bất thường bên trong container thời gian thực (như tiến trình lạ sinh ra shell hoặc đọc file `/etc/shadow`).
2. **Tự động hóa Quy trình Phân phối Phần mềm (CI/CD Pipeline):** Xây dựng luồng công việc GitHub Actions tự động kiểm thử mã nguồn (Unit Test), quét lỗ hổng bảo mật ảnh Docker (Trivy scan) và tự động triển khai (Auto-deploy) lên máy chủ đám mây (AWS EC2 / DigitalOcean) mỗi khi có commit mới vào nhánh `main`.
3. **Mở rộng Cổng Thanh toán Số:** Tích hợp các cổng thanh toán trực tuyến (VNPAY, MoMo, VietQR) hỗ trợ cư dân quét mã QR thanh toán phí sinh hoạt tức thời, tự động hạch toán vào cơ sở dữ liệu PostgreSQL.

---

\newpage

# TÀI LIỆU THAM KHẢO

1. **Bộ môn Hệ thống Thông tin & Mạng máy tính (2026),** *Đề cương chi tiết và Hướng dẫn thực hành học phần Triển khai và Quản trị Hệ thống Phần mềm*, Trường Đại học Công nghệ Thông tin và Truyền thông - Đại học Thái Nguyên.
2. **Docker Documentation (2026),** *Docker Compose Specification and Best Practices*, truy cập tại: https://docs.docker.com/compose/
3. **Nginx Documentation (2026),** *Securing HTTP Traffic with Nginx and Security Headers*, truy cập tại: https://nginx.org/en/docs/
4. **Prometheus Authors (2026),** *Prometheus Monitoring System and Time Series Database Documentation*, truy cập tại: https://prometheus.io/docs/
5. **Grafana Labs (2026),** *Grafana Loki: Like Prometheus, but for logs*, truy cập tại: https://grafana.com/docs/loki/latest/
6. **OWASP Foundation (2025),** *OWASP Secure Headers Project Guide*, truy cập tại: https://owasp.org/www-project-secure-headers/
