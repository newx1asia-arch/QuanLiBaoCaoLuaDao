-- Dùng khi chạy production với DB_SYNC=false (không tự sửa bảng).
-- Thêm cột "tỉnh, thành" cho báo cáo. Báo cáo cũ để trống (hiển thị "Chưa xác định").
-- Khi chạy phát triển (DB_SYNC bật mặc định) không cần chạy file này, backend tự thêm cột.

ALTER TABLE reports ADD COLUMN tinhThanh VARCHAR(30) NULL;
CREATE INDEX IDX_reports_tinhThanh ON reports (tinhThanh);
