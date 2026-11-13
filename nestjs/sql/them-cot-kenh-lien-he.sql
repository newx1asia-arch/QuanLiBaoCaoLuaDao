-- Dùng khi chạy production với DB_SYNC=false (không tự sửa bảng).
-- Thêm 2 cột cho tính năng "người dân tự gửi báo cáo" (trang công khai /bao-cao):
--   kenh   : nguồn tiếp nhận, 'can_bo' (cán bộ nhập hộ, mặc định cho báo cáo cũ) hoặc 'nguoi_dan'
--   lienHe : số điện thoại / email người dân để lại (tùy chọn)
-- Khi chạy phát triển (DB_SYNC bật mặc định) không cần chạy file này, backend tự thêm cột.

ALTER TABLE reports ADD COLUMN kenh VARCHAR(20) NOT NULL DEFAULT 'can_bo';
ALTER TABLE reports ADD COLUMN lienHe VARCHAR(100) NULL;
CREATE INDEX IDX_reports_kenh ON reports (kenh);
