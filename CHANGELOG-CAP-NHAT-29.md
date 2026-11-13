# Cập nhật 29: Trang Thống kê và Bản đồ điểm nóng vẫn cộng thiệt hại của báo cáo bị từ chối

Lỗi: cập nhật 28 đã loại báo cáo bị từ chối khỏi thẻ "Thiệt hại ghi nhận" ở Bảng điều hành, nhưng trang Báo cáo thống kê và Bản đồ điểm nóng (cùng dùng API `/stats/overview`) vẫn cộng cả khoản đó. Cùng một nhãn "Thiệt hại ghi nhận" ở hai trang cho ra hai con số khác nhau.

## File đã sửa
- `nestjs/src/reports/statistics.service.ts`, hàm `overview()`: mọi tổng thiệt hại (tổng quan, kỳ trước, theo hình thức, theo địa bàn, báo cáo chưa ghi địa bàn, từng mốc thời gian) bỏ qua báo cáo `tu_choi`. "Thiệt hại trung bình mỗi báo cáo" chia cho số báo cáo không bị từ chối.
- `giaodien/src/pages/Statistics.jsx`: chú thích ở biểu đồ "Thiệt hại theo hình thức" ghi rõ không tính báo cáo bị từ chối.

## Không đổi
- Số lượng báo cáo (tổng, theo trạng thái, theo loại, theo địa bàn, mức ưu tiên, khung giờ) vẫn đếm mọi báo cáo đã tiếp nhận, kể cả bị từ chối. Định dạng dữ liệu API, CSDL không đổi.

## Cách kiểm tra
Chuyển một báo cáo thiệt hại 80.000.000 đ sang "Từ chối": "Thiệt hại ghi nhận" ở Báo cáo thống kê giảm đúng 80 triệu (bằng với Bảng điều hành khi chọn 30 ngày), "Tổng báo cáo" không đổi.
Chưa chạy `tsc` / `vite build` (môi trường không có `node_modules`).
