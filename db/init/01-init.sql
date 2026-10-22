-- ====================================================================
-- DE 36: HE THONG QUAN LY CHUNG CU / CAN HO (APARTMENT MANAGEMENT)
-- MSSV: DTC245200572 - Sinh vien: Le Hoang Quan - Lop: K23.K1.CNTT K23C
-- Database Initialization Script (PostgreSQL 16)
-- ====================================================================

CREATE TABLE IF NOT EXISTS apartments (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    floor INTEGER NOT NULL,
    area NUMERIC(6, 2) NOT NULL, -- dien tich m2
    bedrooms INTEGER NOT NULL DEFAULT 2,
    status VARCHAR(30) NOT NULL DEFAULT 'OCCUPIED', -- OCCUPIED, VACANT, MAINTENANCE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS residents (
    id SERIAL PRIMARY KEY,
    apartment_id INTEGER REFERENCES apartments(id) ON DELETE SET NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    identity_card VARCHAR(25) NOT NULL,
    email VARCHAR(100),
    residency_type VARCHAR(30) NOT NULL DEFAULT 'PERMANENT', -- PERMANENT (Thuong tru), TEMPORARY (Tam tru)
    moved_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_fees (
    id SERIAL PRIMARY KEY,
    apartment_id INTEGER REFERENCES apartments(id) ON DELETE CASCADE,
    billing_month VARCHAR(10) NOT NULL, -- e.g., '10/2026'
    electricity_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    water_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    management_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    parking_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) GENERATED ALWAYS AS (electricity_fee + water_fee + management_fee + parking_fee) STORED,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID', -- UNPAID, PAID
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL', -- GENERAL, MAINTENANCE, SECURITY, EMERGENCY
    content TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
    created_by VARCHAR(100) NOT NULL DEFAULT 'Ban Quản trị Tòa nhà',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    apartment_id INTEGER REFERENCES apartments(id) ON DELETE SET NULL,
    resident_name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'OTHER', -- NOISE, ELEVATOR, SANITATION, SECURITY, OTHER
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, RESOLVED
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Index optimization
CREATE INDEX IF NOT EXISTS idx_apartments_room ON apartments(room_number);
CREATE INDEX IF NOT EXISTS idx_residents_apartment ON residents(apartment_id);
CREATE INDEX IF NOT EXISTS idx_service_fees_apartment ON service_fees(apartment_id);
CREATE INDEX IF NOT EXISTS idx_service_fees_status ON service_fees(payment_status);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);

-- ====================================================================
-- SEED INITIAL MOCK DATA
-- ====================================================================

-- 1. Insert Apartments
INSERT INTO apartments (room_number, floor, area, bedrooms, status) VALUES
('A-101', 1, 75.5, 2, 'OCCUPIED'),
('A-102', 1, 85.0, 3, 'OCCUPIED'),
('A-103', 1, 65.0, 2, 'VACANT'),
('B-201', 2, 92.5, 3, 'OCCUPIED'),
('B-202', 2, 70.0, 2, 'OCCUPIED'),
('B-203', 2, 70.0, 2, 'MAINTENANCE'),
('C-301', 3, 110.0, 4, 'OCCUPIED'),
('C-302', 3, 80.0, 2, 'OCCUPIED')
ON CONFLICT (room_number) DO NOTHING;

-- 2. Insert Residents
INSERT INTO residents (apartment_id, full_name, phone, identity_card, email, residency_type, moved_in_date) VALUES
(1, 'Lê Hoàng Quân', '0912345678', '001206012345', 'quang.phan@gmail.com', 'PERMANENT', '2024-01-15'),
(1, 'Nguyễn Thị Ánh', '0987654321', '001206012346', 'anh.nguyen@gmail.com', 'PERMANENT', '2024-01-15'),
(2, 'Trần Bình Quân', '0903112233', '001206023456', 'quan.tran@gmail.com', 'PERMANENT', '2024-03-10'),
(4, 'Lê Hoàng Quân', '0934556677', '001206034567', 'quan.le@gmail.com', 'TEMPORARY', '2025-06-01'),
(5, 'Hoàng Anh Tú', '0945667788', '001206045678', 'tu.hoang@gmail.com', 'PERMANENT', '2024-02-20'),
(7, 'Đàm Việt Hoàng', '0967889900', '001206056789', 'hoang.dam@gmail.com', 'PERMANENT', '2023-11-05'),
(8, 'Bùi Duy Hưng', '0978990011', '001206067890', 'hung.bui@gmail.com', 'TEMPORARY', '2025-01-10');

-- 3. Insert Service Fees (Billing 10/2026)
INSERT INTO service_fees (apartment_id, billing_month, electricity_fee, water_fee, management_fee, parking_fee, payment_status, due_date, paid_at) VALUES
(1, '10/2026', 450000, 120000, 500000, 150000, 'PAID', '2026-10-25', '2026-10-20 09:30:00+07'),
(2, '10/2026', 620000, 180000, 550000, 200000, 'UNPAID', '2026-10-25', NULL),
(4, '10/2026', 510000, 140000, 600000, 150000, 'UNPAID', '2026-10-25', NULL),
(5, '10/2026', 380000, 95000, 480000, 100000, 'PAID', '2026-10-25', '2026-10-18 14:15:00+07'),
(7, '10/2026', 890000, 250000, 750000, 250000, 'UNPAID', '2026-10-25', NULL),
(8, '10/2026', 410000, 110000, 520000, 150000, 'PAID', '2026-10-25', '2026-10-21 16:45:00+07');

-- 4. Insert Announcements
INSERT INTO announcements (title, category, content, priority, created_by) VALUES
('Bảo trì và kiểm định an toàn thang máy Block A', 'MAINTENANCE', 'Ban Quản trị xin thông báo: Từ 08h30 đến 11h30 ngày 25/10/2026, thang máy số 2 Block A sẽ tạm dừng hoạt động để bảo dưỡng định kỳ. Cư dân vui lòng sử dụng thang máy số 1.', 'HIGH', 'Ban Quản trị Tòa nhà'),
('Nhắc nhở nộp phí dịch vụ và tiền điện nước tháng 10/2026', 'GENERAL', 'Kính gửi quý Cư dân, hạn cuối nộp phí dịch vụ sinh hoạt tháng 10 là trước 17h00 ngày 25/10/2026 qua chuyển khoản hoặc trực tiếp tại sảnh lễ tân.', 'NORMAL', 'Ban Quản lý Tài chính'),
('Phổ biến quy chế phòng cháy chữa cháy (PCCC) quý 4/2026', 'SECURITY', 'Đề nghị toàn thể cư dân không để xe điện tại hành lang chung, không chắn cửa thoát hiểm và tham gia buổi diễn tập PCCC vào sáng Chủ Nhật tuần này.', 'URGENT', 'Đội An ninh PCCC');

-- 5. Insert Complaints
INSERT INTO complaints (apartment_id, resident_name, title, category, description, status, response) VALUES
(2, 'Trần Bình Quân', 'Tiếng ồn thi công tại căn B-203 quá giờ quy định', 'NOISE', 'Căn B-203 khoan đục tường vào lúc 12h30 trưa làm ảnh hưởng giờ nghỉ của các hộ xung quanh.', 'RESOLVED', 'Ban quản lý đã liên hệ nhắc nhở chủ hộ và đội thợ tuân thủ nghiêm giờ giấc thi công.'),
(4, 'Lê Hoàng Quân', 'Áp lực nước sinh hoạt tầng 2 bị yếu vào giờ cao điểm', 'OTHER', 'Nước sinh hoạt buổi chiều từ 18h30 - 20h00 chảy rất chậm, khó tắm giặt.', 'IN_PROGRESS', 'Kỹ thuật viên đang kiểm tra trạm bơm tăng áp tầng mái và đường ống cấp.'),
(7, 'Đàm Việt Hoàng', 'Đèn chiếu sáng hành lang tầng 3 chập chờn', 'MAINTENANCE', 'Bóng đèn led trước cửa căn C-301 nhấp nháy liên tục 2 ngày nay.', 'PENDING', NULL);
