# Cập nhật 28: "Thiệt hại ghi nhận" cộng cả báo cáo đã bị từ chối

Lỗi: thẻ "Thiệt hại ghi nhận" ở Bảng điều hành cộng số tiền của mọi báo cáo, kể cả báo cáo đã bị từ chối (không đúng sự thật / không đủ cơ sở). Các nơi khác (Tra cứu, Đối tượng nghi vấn, Thống kê, và khối "Đối tượng bị báo cáo nhiều lần" từ cập nhật 25) đều không tính các báo cáo này, nên con số ở Bảng điều hành cao hơn thực tế.

## File đã sửa
- `nestjs/src/reports/reports.service.ts`, hàm `stats()`: `tongThietHai` bỏ qua báo cáo `tu_choi`; thêm trường `tuChoi` (số báo cáo bị từ chối) vào kết quả, các trường cũ giữ nguyên.
- `giaodien/src/pages/Dashboard.jsx`: "Trung bình mỗi báo cáo" chia cho số báo cáo không bị từ chối (trước đây chia cho tất cả nên lệch theo); nhãn khi chưa có số liệu ghi rõ "chưa bị từ chối".

## Không đổi
- "Tổng báo cáo", biểu đồ theo loại / theo tháng vẫn đếm mọi báo cáo đã tiếp nhận. CSDL không đổi.

## Cách kiểm tra
Có một báo cáo thiệt hại 80.000.000 đ, chuyển sang "Từ chối": "Thiệt hại ghi nhận" giảm đúng 80 triệu, "Tổng báo cáo" không đổi.
Chưa chạy `tsc` / `vite build` (môi trường không có `node_modules`).
