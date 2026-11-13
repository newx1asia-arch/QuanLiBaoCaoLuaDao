# Cập nhật 44: Trang Thống kê ghi rõ khi kỳ trước chưa có báo cáo hoặc không đổi

Vấn đề: ở hai thẻ "Tổng báo cáo" và "Thiệt hại ghi nhận", khi kỳ trước bằng 0 thì hiện "Chưa có số liệu kỳ trước" dù kỳ này đang có báo cáo; khi không đổi (0%) thì lại tô xanh như đang giảm.

## Đã sửa (chỉ `giaodien/src/pages/Statistics.jsx`)
- Kỳ trước bằng 0 mà kỳ này có số liệu -> hiện "Mới, kỳ trước chưa có" (màu đỏ, vì tăng là xấu với báo cáo lừa đảo).
- Thay đổi đúng 0% -> hiện "0% so với kỳ trước (không đổi)", không tô màu.
- Hai kỳ đều bằng 0 hoặc các trường hợp còn lại giữ như cũ.

## Cách kiểm tra
Ctrl+F5, mở "Báo cáo thống kê", thử chọn 7 ngày / 30 ngày và nhìn dòng dưới hai thẻ đầu.
