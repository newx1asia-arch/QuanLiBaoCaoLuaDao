-- Dùng khi chạy production với DB_SYNC=false (không tự tạo bảng).
-- Tạo bảng lưu trạng thái "Đang trực" của cán bộ cho Trung tâm hỗ trợ (có trợ lý AI khi khu vực không có người trực).
-- Khi chạy phát triển (DB_SYNC bật mặc định) không cần chạy file này, backend tự tạo bảng.
-- Chưa chạy file này thì đăng nhập và các chức năng khác vẫn bình thường, chỉ khu vực hỗ trợ coi như chưa có ai trực.

CREATE TABLE IF NOT EXISTS truc_ban (
  userId INT NOT NULL PRIMARY KEY,
  khuVuc VARCHAR(10) NOT NULL,
  dangTruc TINYINT(1) NOT NULL DEFAULT 0,
  capNhat DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
