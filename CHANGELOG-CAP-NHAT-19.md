# Cập nhật 19: Mỗi lần đổi trang đều tải toàn bộ danh sách "cần xử lý gấp"

Lỗi / hạn chế: menu bên trái gọi `GET /api/stats` mỗi lần đổi trang chỉ để lấy các số trên huy hiệu, nhưng API này kèm theo TOÀN BỘ báo cáo ưu tiên cao đang mở (đủ mọi cột, cả mô tả dài). Càng tồn đọng nhiều báo cáo khẩn thì mỗi lần bấm menu càng tải nặng. (Cập nhật 3 đã bỏ việc đọc toàn bộ báo cáo, nhưng danh sách này vẫn không giới hạn.)

## File đã sửa
- `nestjs/src/reports/reports.service.ts`, hàm `stats()`: thêm trường `soCanXuLyGap` (đếm bằng một truy vấn COUNT); `canXuLyGap` chỉ còn 10 báo cáo mới nhất và chỉ các cột khối này cần (không có mô tả).
- `giaodien/src/components/Layout.jsx`: huy hiệu "gấp" lấy từ `soCanXuLyGap`.
- `giaodien/src/pages/Dashboard.jsx`: tiêu đề khối "Cần xử lý gấp (N)" dùng `soCanXuLyGap`; khi có hơn 10 báo cáo thì hiện nút "Xem tất cả" dẫn tới Danh sách báo cáo lọc ưu tiên cao.

## Khác biệt nhỏ
- Khối "Cần xử lý gấp" trên Bảng điều hành chỉ liệt kê 10 báo cáo mới nhất (trước đây liệt kê tất cả). Con số trong tiêu đề vẫn là tổng thật. Nút "Xem tất cả" mở Danh sách báo cáo lọc ưu tiên cao (gồm cả báo cáo đã xử lý xong, dùng thêm tab trạng thái để lọc).

## Không đổi
- Các trường khác của `/api/stats`, cách tính, phân quyền, CSDL. Giao diện cũ chưa cập nhật vẫn chạy được (trường `canXuLyGap` vẫn còn).

## Cách kiểm tra
Có hơn 10 báo cáo ưu tiên cao đang mở (từ 50 triệu): huy hiệu menu và tiêu đề khối hiện đúng tổng, bảng liệt kê 10 dòng và có nút "Xem tất cả". Dưới 10 báo cáo: như cũ, không có nút.
Chưa chạy `tsc` và `vite build` (môi trường không có `node_modules`).
