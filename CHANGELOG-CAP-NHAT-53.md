# Cập nhật 53: Làm đẹp chân thanh bên, chân trang và phần trống của trang Tra cứu

## Chân thanh bên (mọi trang)
- Khối "Trung tâm hỗ trợ": nền tím than chuyển đỏ sẫm, viền vàng, mặt trống đồng mờ ở góc, nút vàng "Liên hệ kỹ thuật →" và hiện rõ địa chỉ email hỗ trợ.
- Hoa sen và khối hỗ trợ được dồn xuống đáy thanh bên khi còn chỗ trống (trước đây lơ lửng giữa chừng).
- `giaodien/src/components/Layout.jsx`, `giaodien/src/dashboard-polish.css`.

## Chân trang (mọi trang)
- Đường kẻ vàng có ngôi sao nhỏ ở giữa.

## Trang Tra cứu đối tượng
- Chưa có kết quả thì hiện khung hướng dẫn thay vì để trống: biểu tượng khiên vàng và 3 thẻ minh họa định dạng (số điện thoại, số tài khoản, đường link).
- Mục "Tra cứu gần đây" (tối đa 5, bấm để tra lại, có nút Xóa). Lưu bằng sessionStorage: đóng tab là mất, không giữ lâu dài trên máy dùng chung.
- `giaodien/src/pages/Lookup.jsx`, `giaodien/src/report-form.css`.

Không đổi backend. Chỉ cần Ctrl+F5.
