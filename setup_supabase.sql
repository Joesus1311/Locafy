-- SETUP SCRIPT FOR LOCAFY SUPABASE DATABASE (WITH RICH SEED DATA)
-- Copy and run this script in your Supabase project's SQL Editor (https://supabase.com/)

-- 1. DROP EXISTING TABLES
DROP TABLE IF EXISTS locafy_otps CASCADE;
DROP TABLE IF EXISTS locafy_chats CASCADE;
DROP TABLE IF EXISTS locafy_notifications CASCADE;
DROP TABLE IF EXISTS locafy_contracts CASCADE;
DROP TABLE IF EXISTS locafy_maintenance CASCADE;
DROP TABLE IF EXISTS locafy_payments CASCADE;
DROP TABLE IF EXISTS locafy_bookings CASCADE;
DROP TABLE IF EXISTS locafy_listings CASCADE;
DROP TABLE IF EXISTS locafy_accounts CASCADE;

-- 2. CREATE ACCOUNTS TABLE
CREATE TABLE locafy_accounts (
    username VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Stored as btoa("locafy_" + password)
    role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
    name VARCHAR(255),
    phone VARCHAR(50),
    verified BOOLEAN DEFAULT FALSE,
    doc_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE LISTINGS TABLE
CREATE TABLE locafy_listings (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    location TEXT NOT NULL,
    room_count VARCHAR(100),
    layout VARCHAR(255),
    amenities TEXT, -- Comma-separated list
    contact VARCHAR(100),
    owner_username VARCHAR(100) REFERENCES locafy_accounts(username) ON DELETE CASCADE,
    image TEXT, -- Base64 data URL
    censored BOOLEAN DEFAULT FALSE,
    rented BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'empty',
    tenant JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE BOOKINGS TABLE
CREATE TABLE locafy_bookings (
    id VARCHAR(100) PRIMARY KEY,
    tenant_name VARCHAR(255),
    tenant_phone VARCHAR(50),
    owner_username VARCHAR(100) REFERENCES locafy_accounts(username) ON DELETE CASCADE,
    room_title VARCHAR(255),
    room_id VARCHAR(100),
    date VARCHAR(50),
    time VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    deposit_amount VARCHAR(100),
    deposit_paid BOOLEAN DEFAULT FALSE,
    renter_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE PAYMENTS TABLE
CREATE TABLE locafy_payments (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Chưa thanh toán', 'Chờ xác nhận', 'Đã thanh toán'
    date VARCHAR(50),
    due_date VARCHAR(50),
    tenant_email VARCHAR(255),
    owner_username VARCHAR(100),
    room_title VARCHAR(255),
    payment_method VARCHAR(100),
    room_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE MAINTENANCE (ISSUES) TABLE
CREATE TABLE locafy_maintenance (
    id VARCHAR(100) PRIMARY KEY,
    tenant_name VARCHAR(255),
    room_title VARCHAR(255),
    type VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    date VARCHAR(50),
    owner_username VARCHAR(100),
    image TEXT, -- Base64 data URL
    renter_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREATE CONTRACTS TABLE
CREATE TABLE locafy_contracts (
    id VARCHAR(100) PRIMARY KEY,
    room_id VARCHAR(100),
    room_title VARCHAR(255),
    price NUMERIC,
    deposit_months INTEGER,
    duration INTEGER,
    owner_username VARCHAR(100),
    renter_name VARCHAR(255),
    renter_id VARCHAR(100),
    renter_phone VARCHAR(50),
    renter_email VARCHAR(255),
    signature_a TEXT, -- Base64 landlord signature
    signature_b TEXT, -- Base64 tenant signature
    status VARCHAR(50) DEFAULT 'pending_renter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CREATE NOTIFICATIONS TABLE
CREATE TABLE locafy_notifications (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    type VARCHAR(50),
    read BOOLEAN DEFAULT FALSE,
    date VARCHAR(100),
    renter_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CREATE CHATS TABLE
CREATE TABLE locafy_chats (
    id BIGSERIAL PRIMARY KEY,
    chat_id VARCHAR(255) NOT NULL, -- Formatted as: landlordUsername_tenantUsername
    sender_username VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    time VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9b. CREATE OTP TABLE (Xác thực email khi đăng ký)
-- Lưu tạm thông tin tài khoản (payload) + mã OTP, có hạn 5-10 phút.
-- Khi xác thực đúng, server sẽ chuyển payload sang locafy_accounts rồi xóa dòng này.
CREATE TABLE locafy_otps (
    email VARCHAR(255) PRIMARY KEY,
    code VARCHAR(10) NOT NULL,
    payload JSONB NOT NULL,        -- { name, username, email, phone, password(hash bcrypt), role }
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. INDEXES FOR PERFORMANCE
CREATE INDEX idx_listings_owner ON locafy_listings(owner_username);
CREATE INDEX idx_bookings_owner ON locafy_bookings(owner_username);
CREATE INDEX idx_bookings_renter ON locafy_bookings(renter_email);
CREATE INDEX idx_payments_tenant ON locafy_payments(tenant_email);
CREATE INDEX idx_maintenance_owner ON locafy_maintenance(owner_username);
CREATE INDEX idx_contracts_renter ON locafy_contracts(renter_email);
CREATE INDEX idx_notifications_renter ON locafy_notifications(renter_email);
CREATE INDEX idx_chats_id ON locafy_chats(chat_id);

-- 11. SEED RICH ACCOUNTS (Password for all accounts is '123456' -> 'bG9jYWZ5XzEyMzQ1Ng==')
INSERT INTO locafy_accounts (username, email, password, role, name, phone, verified) VALUES 
('buyer123', 'buyer@locafy.com', 'bG9jYWZ5XzEyMzQ1Ng==', 'buyer', 'Nguyễn Văn Hải (Renter)', '0987654321', TRUE),
('buyer2', 'buyer2@locafy.com', 'bG9jYWZ5XzEyMzQ1Ng==', 'buyer', 'Trần Thị Mai (Renter)', '0977888999', TRUE),
('buyer3', 'buyer3@locafy.com', 'bG9jYWZ5XzEyMzQ1Ng==', 'buyer', 'Phạm Minh Đức (Renter)', '0933222111', TRUE),
('seller123', 'seller@locafy.com', 'bG9jYWZ5XzEyMzQ1Ng==', 'seller', 'Lê Hùng Sơn (Landlord)', '0912345678', TRUE),
('seller2', 'seller2@locafy.com', 'bG9jYWZ5XzEyMzQ1Ng==', 'seller', 'Hoàng Thu Thủy (Landlord)', '0901234567', TRUE),
('admin123', 'admin@locafy.com', 'bG9jYWZ5XzEyMzQ1Ng==', 'admin', 'Hệ Thống Locafy (Admin)', '0900000000', TRUE);

-- 12. SEED EXPANDED REALISTIC LISTINGS (Around Hoa Lac High-Tech Park & FPT University)
INSERT INTO locafy_listings (id, title, description, price, location, room_count, layout, amenities, contact, owner_username, censored, status, rented, tenant) VALUES 
(
  'seller-room-1', 
  'Căn Hộ Studio Cao Cấp Gần Đại Học FPT', 
  'Phòng trọ khép kín mới 100% tại khu Bến Trung, Thạch Hòa, Thạch Thất. Cực gần trường Đại học FPT, Đại học Quốc gia Hà Nội. Đầy đủ nội thất cao cấp: giường tủ, điều hòa Inverter tiết kiệm điện, tủ lạnh, bếp từ nấu ăn sạch sẽ, vệ sinh khép kín hiện đại. Có khu để xe máy rộng rãi, bảo vệ 24/7, camera an ninh toàn khu.', 
  3200000, 
  'Khu Bến Trung, Thạch Hòa, Thạch Thất, Hà Nội', 
  '3 phòng trống', 
  'Phòng khép kín đơn, 28m2', 
  'Wi-Fi, Điều hòa, Nóng lạnh, Máy giặt chung, Tủ lạnh, Kệ bếp, Ban công, Thang máy, An ninh 24/7', 
  '0912345678', 
  'seller123', 
  TRUE, 
  'empty',
  FALSE,
  NULL
),
(
  'seller-room-2', 
  'Chung Cư Mini Full Đồ Tân Xã - Hòa Lạc', 
  'Căn hộ chung cư mini thiết kế hiện đại tại Tân Xã, Thạch Thất. Cách hồ Tân Xã chỉ 200m thoáng mát trong lành, thuận tiện di chuyển tới Khu Công nghệ cao Hòa Lạc. Phòng rộng rãi ngập tràn ánh sáng tự nhiên với ban công riêng. Trang bị sẵn nóng lạnh, điều hòa, tủ quần áo lớn, bàn làm việc học tập.', 
  3800000, 
  'Đường Tân Xã, Tân Xã, Thạch Thất, Hà Nội', 
  '1 phòng trống', 
  '1 phòng ngủ riêng biệt, 35m2', 
  'Wi-Fi, Điều hòa, Nóng lạnh, Máy giặt riêng, Tủ lạnh, Giường đệm, Tủ quần áo, Ban công thoáng', 
  '0912345678', 
  'seller123', 
  TRUE, 
  'rented',
  TRUE,
  '{"name": "Trần Thị Mai", "phone": "0977888999", "email": "buyer2@locafy.com", "startDate": "2026-06-23", "status": "Đang ở"}'::jsonb
),
(
  'seller-room-3', 
  'Phòng Trọ Giá Rẻ Bình Yên Cho Sinh Viên', 
  'Phòng trọ giá cực tốt tại xã Bình Yên, Thạch Thất. Thích hợp cho các bạn sinh viên muốn tiết kiệm chi phí. Phòng sạch sẽ, có gác xép tối ưu không gian, wc khép kín. Không chung chủ, giờ giấc tự do ra vào vân tay bảo mật tốt.', 
  1800000, 
  'Thôn Cánh Chủ, Bình Yên, Thạch Thất, Hà Nội', 
  '5 phòng trống', 
  'Phòng khép kín có gác xép, 20m2', 
  'Wi-Fi, Nóng lạnh, Gác xép tiện lợi, Bếp nấu ăn, Khóa cổng vân tay, Chỗ để xe miễn phí', 
  '0912345678', 
  'seller123', 
  TRUE, 
  'empty',
  FALSE,
  NULL
),
(
  'seller-room-4', 
  'Nhà Nguyên Căn 3 Tầng Hòa Lạc - Thích Hợp Cho Nhóm Bạn', 
  'Nhà nguyên căn 3 tầng rộng rãi tại Thạch Hòa. Thích hợp cho nhóm sinh viên 5-6 người ở chung hoặc hộ gia đình thuê dài hạn. Nhà gồm 3 phòng ngủ riêng biệt, phòng khách rộng rãi, bếp nấu ăn đầy đủ. Sân thượng rộng thoáng mát view toàn cảnh Hòa Lạc.', 
  8500000, 
  'Thôn 4, Thạch Hòa, Thạch Thất, Hà Nội', 
  'Nguyên căn', 
  '3 phòng ngủ, 2 WC, 120m2 diện tích sử dụng', 
  'Wi-Fi, Điều hòa đầy đủ các phòng, Nóng lạnh, Máy giặt sấy, Kệ bếp lớn, Sân thượng, Sân đỗ ô tô', 
  '0901234567', 
  'seller2', 
  TRUE, 
  'empty',
  FALSE,
  NULL
),
(
  'seller-room-5', 
  'Căn Hộ Dịch Vụ Hạng Sang Vinhomes Smart City (Hòa Lạc Express)', 
  'Căn hộ dịch vụ cao cấp bậc nhất nằm cạnh trục đại lộ Thăng Long, thuận tiện di chuyển về Hòa Lạc. Tòa nhà có thang máy tốc độ cao, hồ bơi sân vườn cao cấp, phòng đầy đủ nội thất thông minh Smart Home đẳng cấp châu Âu.', 
  5500000, 
  'Trục Đại lộ Thăng Long kéo dài, Thạch Thất, Hà Nội', 
  '2 phòng trống', 
  'Studio Suite Sang Trọng, 40m2', 
  'Wi-Fi tốc độ cao, Điều hòa trung tâm, Nóng lạnh, Máy giặt sấy, Tủ lạnh Side-by-Side, Bếp từ âm, Smart TV', 
  '0901234567', 
  'seller2', 
  TRUE, 
  'empty',
  FALSE,
  NULL
),
(
  'seller-room-6', 
  'Phòng Trọ Khép Kín Giá Rẻ Gần Ngã Tư Lục Quân', 
  'Cho thuê phòng trọ giá học sinh sinh viên gần ngã tư Lục Quân, Thạch Thất. Phòng nằm trong khu dân cư yên tĩnh, an ninh tốt, chủ nhà thân thiện. Điện nước giá nhà nước cực rẻ.', 
  1500000, 
  'Gần Ngã tư Lục Quân, Cổ Đông, Thạch Thất, Hà Nội', 
  '2 phòng trống', 
  'Phòng khép kín tầng 2, 18m2', 
  'Wi-Fi, Nóng lạnh, Quạt trần, Giường tủ đơn giản, Chỗ phơi đồ rộng rãi', 
  '0901234567', 
  'seller2', 
  TRUE, 
  'empty',
  FALSE,
  NULL
);

-- 13. SEED RICH BOOKINGS (Lịch hẹn xem phòng trọ)
INSERT INTO locafy_bookings (id, tenant_name, tenant_phone, owner_username, room_title, room_id, date, time, status, deposit_amount, deposit_paid, renter_email) VALUES 
('b-1', 'Nguyễn Văn Hải', '0987654321', 'seller123', 'Căn Hộ Studio Cao Cấp Gần Đại Học FPT', 'seller-room-1', '2026-06-25', '09:30', 'pending', '500,000 VND', FALSE, 'buyer@locafy.com'),
('b-2', 'Nguyễn Văn Hải', '0987654321', 'seller123', 'Chung Cư Mini Full Đồ Tân Xã - Hòa Lạc', 'seller-room-2', '2026-06-24', '14:00', 'approved', '1,000,000 VND', TRUE, 'buyer@locafy.com'),
('b-3', 'Trần Thị Mai', '0977888999', 'seller123', 'Phòng Trọ Giá Rẻ Bình Yên Cho Sinh Viên', 'seller-room-3', '2026-06-20', '18:00', 'cancelled', '0 VND', FALSE, 'buyer2@locafy.com'),
('b-4', 'Phạm Minh Đức', '0933222111', 'seller2', 'Nhà Nguyên Căn 3 Tầng Hòa Lạc', 'seller-room-4', '2026-06-26', '16:00', 'pending', '2,000,000 VND', FALSE, 'buyer3@locafy.com'),
('b-5', 'Trần Thị Mai', '0977888999', 'seller2', 'Căn Hộ Dịch Vụ Hạng Sang Smart City', 'seller-room-5', '2026-06-23', '10:30', 'approved', '1,500,000 VND', TRUE, 'buyer2@locafy.com');

-- 14. SEED RICH PAYMENTS (Hóa đơn tiền thuê nhà/dịch vụ)
INSERT INTO locafy_payments (id, title, amount, status, date, due_date, tenant_email, owner_username, room_title, payment_method, room_id) VALUES 
('p-1', 'Hóa đơn tiền nhà Tháng 6 - Căn Studio FPT', 3200000, 'Đã thanh toán', '2026-06-01', '2026-06-05', 'buyer@locafy.com', 'seller123', 'Căn Hộ Studio Cao Cấp Gần Đại Học FPT', 'Chuyển khoản ngân hàng', 'seller-room-1'),
('p-2', 'Hóa đơn tiền điện nước Tháng 5 - Căn Studio FPT', 450000, 'Đã thanh toán', '2026-06-02', '2026-06-07', 'buyer@locafy.com', 'seller123', 'Căn Hộ Studio Cao Cấp Gần Đại Học FPT', 'Ví điện tử Momo', 'seller-room-1'),
('p-3', 'Hóa đơn tiền nhà Tháng 7 - Căn Studio FPT', 3200000, 'Chờ chủ nhà xác nhận', '2026-06-20', '2026-07-05', 'buyer@locafy.com', 'seller123', 'Căn Hộ Studio Cao Cấp Gần Đại Học FPT', 'Chuyển khoản ngân hàng', 'seller-room-1'),
('p-4', 'Hóa đơn tiền điện Tháng 6 - Chung Cư Mini Tân Xã', 350000, 'Chưa thanh toán', '2026-06-22', '2026-06-30', 'buyer2@locafy.com', 'seller123', 'Chung Cư Mini Full Đồ Tân Xã - Hòa Lạc', 'Chưa thanh toán', 'seller-room-2'),
('p-5', 'Hóa đơn cọc giữ chỗ phòng trọ Cánh Chủ', 1800000, 'Đã thanh toán', '2026-06-15', '2026-06-18', 'buyer3@locafy.com', 'seller123', 'Phòng Trọ Giá Rẻ Bình Yên Cho Sinh Viên', 'Chuyển khoản ngân hàng', 'seller-room-3');

-- 15. SEED RICH MAINTENANCE REQUESTS (Báo cáo sự cố thiết bị)
INSERT INTO locafy_maintenance (id, tenant_name, room_title, type, description, status, priority, date, owner_username, image, renter_email) VALUES 
('m-1', 'Nguyễn Văn Hải', 'Căn Hộ Studio Cao Cấp Gần Đại Học FPT', 'Điện nước', 'Bình nóng lạnh phòng tắm không hoạt động bật nóng nhưng nước chảy ra lạnh ngắt.', 'resolved', 'high', '2026-06-10', 'seller123', '', 'buyer@locafy.com'),
('m-2', 'Nguyễn Văn Hải', 'Căn Hộ Studio Cao Cấp Gần Đại Học FPT', 'Internet', 'Mạng Wifi phòng 204 giật lag chập chờn liên tục, không thể học online học bài được.', 'processing', 'medium', '2026-06-22', 'seller123', '', 'buyer@locafy.com'),
('m-3', 'Trần Thị Mai', 'Chung Cư Mini Full Đồ Tân Xã - Hòa Lạc', 'Nội thất / Thiết bị', 'Vòi xịt toilet bị rò rỉ nước liên tục làm tràn nước ra sàn phòng tắm.', 'pending', 'medium', '2026-06-23', 'seller123', '', 'buyer2@locafy.com'),
('m-4', 'Phạm Minh Đức', 'Nhà Nguyên Căn 3 Tầng Hòa Lạc', 'Điện nước', 'Mất nước sinh hoạt toàn bộ tầng 3 nghi ngờ do hỏng phao cơ bồn chứa nước mái.', 'pending', 'high', '2026-06-23', 'seller2', '', 'buyer3@locafy.com');

-- 16. SEED RICH CONTRACTS (Hợp đồng thuê phòng điện tử)
INSERT INTO locafy_contracts (id, room_id, room_title, price, deposit_months, duration, owner_username, renter_name, renter_id, renter_phone, renter_email, signature_a, signature_b, status) VALUES 
(
  'c-101', 
  'seller-room-1', 
  'Căn Hộ Studio Cao Cấp Gần Đại Học FPT', 
  3200000, 
  2, 
  12, 
  'seller123', 
  'Nguyễn Văn Hải', 
  '001202030405', 
  '0987654321', 
  'buyer@locafy.com', 
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACkq...', -- Dummy base64 sig
  '', 
  'pending_renter'
),
(
  'c-102', 
  'seller-room-2', 
  'Chung Cư Mini Full Đồ Tân Xã - Hòa Lạc', 
  3800000, 
  1, 
  6, 
  'seller123', 
  'Trần Thị Mai', 
  '002303040506', 
  '0977888999', 
  'buyer2@locafy.com', 
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACkq...', 
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACkq...', 
  'active'
);

-- 17. SEED RICH NOTIFICATIONS (Thông báo người dùng)
INSERT INTO locafy_notifications (id, title, description, type, read, date, renter_email) VALUES 
('notif-1', 'Lịch hẹn xem phòng đã được chủ nhà đồng ý', 'Yêu cầu đặt lịch hẹn xem căn Studio Hòa Lạc lúc 14:00 ngày mai của bạn đã được chủ nhà chấp nhận.', 'appointment', FALSE, '2026-06-22T20:00:00.000Z', 'buyer@locafy.com'),
('notif-2', 'Yêu cầu sửa chữa thiết bị đã hoàn tất', 'Chủ nhà báo cáo sự cố "Bình nóng lạnh hỏng" tại phòng trọ của bạn đã được sửa chữa khắc phục.', 'maintenance', TRUE, '2026-06-12T15:30:00.000Z', 'buyer@locafy.com'),
('notif-3', 'Yêu cầu ký số hợp đồng thuê nhà mới', 'Chủ nhà đã soạn thảo và gửi hợp đồng thuê nhà điện tử cho bạn. Vui lòng vào xem và ký xác nhận.', 'contract', FALSE, '2026-06-22T08:00:00.000Z', 'buyer@locafy.com'),
('notif-4', 'Hóa đơn tháng mới cần thanh toán', 'Hóa đơn tiền thuê phòng và điện nước tháng 7 của bạn đã được khởi tạo. Hạn thanh toán đến ngày 05/07.', 'payment', FALSE, '2026-06-22T09:00:00.000Z', 'buyer@locafy.com'),
('notif-5', 'Lịch hẹn xem phòng bị từ chối', 'Chủ trọ rất tiếc phải từ chối lịch xem căn hộ dịch vụ Smart City vào ngày mai vì phòng vừa có khách thuê cọc.', 'appointment', TRUE, '2026-06-21T18:00:00.000Z', 'buyer2@locafy.com');

-- 18. SEED RICH CHAT CONVERSATION LOGS (For message-manage & user/message)
-- Dialogue 1: Landlord (seller123) & Tenant Nguyễn Văn Hải (buyer123)
-- Chat ID format: landlordUsername_tenantUsername
INSERT INTO locafy_chats (chat_id, sender_username, text, time) VALUES 
('seller123_buyer123', 'buyer123', 'Chào anh Sơn, em thấy tin đăng căn hộ Studio ở Bến Trung gần FPT. Không biết phòng đó hiện tại còn trống không ạ?', '10:30 AM'),
('seller123_buyer123', 'seller123', 'Chào Hải, phòng này hiện tại vẫn còn trống em nhé. Vị trí rất tiện, đi học FPT chỉ 5 phút thôi.', '10:35 AM'),
('seller123_buyer123', 'buyer123', 'Dạ tốt quá. Phòng này giá cọc bao nhiêu tháng tiền nhà vậy anh?', '10:38 AM'),
('seller123_buyer123', 'seller123', 'Bên anh cọc 2 tháng tiền nhà và đóng tiền vào mùng 1 đến mùng 5 hàng tháng em nhé.', '10:40 AM'),
('seller123_buyer123', 'buyer123', 'Dạ có bớt được cọc chút nào không anh? Vì em là sinh viên năm nhất gom tiền hơi khó.', '10:41 AM'),
('seller123_buyer123', 'seller123', 'Nếu em thuê lâu dài cam kết 1 năm trở lên thì anh hỗ trợ giảm cọc còn 1.5 tháng tiền phòng nhé.', '10:45 AM');

-- Dialogue 2: Landlord (seller123) & Tenant Trần Thị Mai (buyer2@locafy.com -> username buyer2)
INSERT INTO locafy_chats (chat_id, sender_username, text, time) VALUES 
('seller123_buyer2', 'buyer2', 'Anh ơi căn chung cư mini Tân Xã giá 3.8 triệu có máy giặt riêng không anh?', 'Hôm qua'),
('seller123_buyer2', 'seller123', 'Có đầy đủ điều hòa, máy lạnh, máy giặt, kệ bếp và chỗ để xe miễn phí nhé em.', 'Hôm qua'),
('seller123_buyer2', 'buyer2', 'Dạ thế chiều nay em qua xem phòng được không anh?', 'Hôm qua'),
('seller123_buyer2', 'seller123', 'Được chứ, chiều nay 5h anh rảnh, em qua ngã 3 Tân Xã gọi anh ra đón vào nhé.', 'Hôm qua');
