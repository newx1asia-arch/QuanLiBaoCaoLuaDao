# Cập nhật 51: Số tiền có dấu phẩy ngăn cách hàng nghìn, làm lại trang Tra cứu

## Ô số tiền (form Tạo báo cáo và trang /bao-cao)
- Hiện dạng `10,000,000,000` khi gõ (dấu phẩy ngăn cách hàng nghìn), dòng gợi ý bên dưới vẫn ghi "Tương đương 10 tỷ".
- Gõ giữa chừng con trỏ không còn nhảy về cuối ô. Chỉ nhận chữ số, dữ liệu gửi lên vẫn là số nguyên (không có dấu phẩy).
- `giaodien/src/constants.js`: thêm `formatThousands`, `caretAfterDigits`. Sửa `ReportForm.jsx`, `PublicReport.jsx`.

## Trang Tra cứu đối tượng
- Khối đầu trang kiểu Bảng điều hành (trống đồng, cờ, khung góc vàng). Ô tìm kiếm và kết quả chiếm đúng cột chính thay vì khung hẹp 640px.
- Cột bên phải: **Cách đọc kết quả** (Nguy hiểm / Cần thận trọng / Chưa có báo cáo kèm giải thích), **Lưu ý khi tra cứu** kèm hoa sen, **Đường dây nóng** kèm trống đồng mờ.
- Sửa `giaodien/src/pages/Lookup.jsx`, `giaodien/src/report-form.css` (dùng chung kiểu với trang Tạo báo cáo).

Không đổi backend. Chỉ cần Ctrl+F5.
