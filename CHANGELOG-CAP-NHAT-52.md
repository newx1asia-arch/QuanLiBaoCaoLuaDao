# Cập nhật 52: Làm lại trang "Hồ sơ của tôi"

Vấn đề: hai khung hẹp 640px xếp dọc, bên phải trống; đổi mật khẩu chỉ báo lỗi sau khi bấm; họ tên có khoảng trắng thừa vẫn gửi nguyên.

## Đã sửa
- `giaodien/src/pages/Profile.jsx`:
  - Khối đầu trang kiểu Bảng điều hành (trống đồng, cờ, khung góc vàng) kèm nút Đăng xuất.
  - Cột bên phải: thẻ tài khoản (ảnh đại diện chữ cái đầu, họ tên, email, vai trò, ngày tham gia), **An toàn tài khoản** kèm hoa sen, **Đường dây nóng** kèm trống đồng mờ.
  - Ô mật khẩu mới hiện 3 quy tắc (từ 8 ký tự, có chữ, có số), đạt quy tắc nào thì đổi sang tick xanh ngay khi gõ.
  - Họ tên được cắt khoảng trắng đầu cuối và gộp khoảng trắng liên tiếp trước khi gửi; nút Lưu chỉ sáng khi tên thật sự khác.
- `giaodien/src/report-form.css`: thêm kiểu cho thẻ tài khoản và danh sách quy tắc mật khẩu.

Không đổi backend. Chỉ cần Ctrl+F5.
