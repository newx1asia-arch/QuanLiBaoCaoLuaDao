# Cập nhật 18: Mã báo cáo và biểu đồ tháng phụ thuộc múi giờ của máy

Lỗi: giao diện tính "năm-tháng" bằng giờ của trình duyệt (`getFullYear()`, `getMonth()`), trong khi backend gom tháng theo giờ Việt Nam (UTC+7, từ cập nhật 1).
1. **Mã báo cáo** `BC-yymm-id` (hiện ở Bảng điều hành, Hàng đợi khẩn cấp, Đối tượng nghi vấn) là định danh nhưng phần `yymm` đổi theo máy: báo cáo tiếp nhận lúc 00:00 đến 07:00 sáng ngày mùng 1 (giờ Việt Nam) hiện mã tháng trước trên máy đặt múi giờ UTC (hoặc ở nước ngoài), và hiện mã tháng này trên máy đặt giờ Việt Nam. Hai người cùng nhìn một báo cáo có thể đọc ra hai mã khác nhau.
2. **Biểu đồ xu hướng và thẻ "so với tháng trước"** trên Bảng điều hành tính "tháng hiện tại" theo giờ máy, còn số liệu từ backend theo giờ Việt Nam. Ở máy khác múi giờ, vào những giờ đầu / cuối tháng, tháng mới nhất trên biểu đồ bị lệch một tháng so với dữ liệu (hiện 0 hoặc thiếu tháng).

## File đã sửa
- `giaodien/src/constants.js`: thêm `vnYearMonth()` (năm, tháng theo giờ Việt Nam); `reportCode()` dùng hàm này.
- `giaodien/src/pages/Dashboard.jsx`: `lastMonths()` tính các tháng liên tiếp từ tháng hiện tại theo giờ Việt Nam.

## Không đổi
- Backend, dữ liệu, bố cục giao diện. Máy đặt giờ Việt Nam: kết quả giống hệt như cũ, nên người dùng ở Việt Nam thường không thấy khác biệt.
- `todayISO()` (giới hạn ô chọn ngày xảy ra) vẫn theo giờ máy, đúng với "hôm nay" của người đang nhập.

## Cách kiểm tra
Đổi múi giờ máy sang UTC (hoặc dùng DevTools, Sensors, Location) rồi mở Bảng điều hành: tháng cuối của biểu đồ và mã báo cáo vẫn giống khi để giờ Việt Nam.
Chưa chạy `vite build` (môi trường không có `node_modules`).
