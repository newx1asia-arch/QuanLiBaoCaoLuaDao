-- Xóa toàn bộ dữ liệu mẫu do SEED_DEMO=true nạp vào (160 báo cáo xem thử bản đồ và biểu đồ).
-- Báo cáo thật và 3 báo cáo mẫu ban đầu của hệ thống không bị ảnh hưởng.
-- Sau khi xóa, hãy bỏ dòng SEED_DEMO=true trong nestjs/.env, nếu không lần khởi động sau sẽ nạp lại.

DELETE FROM report_history WHERE reportId IN (SELECT id FROM (SELECT id FROM reports WHERE moTa LIKE 'Dữ liệu mẫu dùng để xem thử%') AS t);
DELETE FROM reports WHERE moTa LIKE 'Dữ liệu mẫu dùng để xem thử%';
