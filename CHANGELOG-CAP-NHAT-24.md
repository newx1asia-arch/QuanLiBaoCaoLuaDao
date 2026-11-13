# Cập nhật 24: Nhãn "63 tỉnh, thành" không khớp với hệ thống

Lỗi: khối đầu Bảng điều hành ghi cứng "63 tỉnh, thành", trong khi toàn bộ hệ thống (danh sách địa bàn, bản đồ, bộ lọc, backend) đang dùng 34 tỉnh, thành sau sắp xếp đơn vị hành chính.

## File đã sửa
- `giaodien/src/constants.js`: nhãn lấy số lượng từ `TINH_THANH.length`, nên đổi danh sách địa bàn thì nhãn tự đổi theo.

## Không đổi
- Backend, dữ liệu, bố cục. Hai nhãn còn lại ("Bảo mật cấp độ 4", "Phản hồi dưới 15 phút") vẫn là nội dung mẫu, hãy sửa cho đúng thực tế của đơn vị.

## Cách kiểm tra
Mở Bảng điều hành: nhãn thứ hai ở khối đầu hiện "34 tỉnh, thành".
Chưa chạy `vite build` (môi trường không có `node_modules`).
