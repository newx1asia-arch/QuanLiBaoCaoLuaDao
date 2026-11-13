# Cập nhật 50: Trang người dân gửi báo cáo (/bao-cao) báo lỗi từng ô, chặn nhập sai số tiền

Vấn đề: trang công khai chỉ hiện một dòng lỗi chung ở đầu form (người dân phải tự đoán ô nào sai); ô số tiền cho gõ "1e3" và số thập phân; điền dở rồi lỡ đóng tab là mất hết.

## Đã sửa
- `giaodien/src/pages/PublicReport.jsx`:
  - Báo lỗi ngay dưới từng ô (viền đỏ); bấm Gửi thì nhảy tới ô lỗi đầu tiên. Quy tắc khớp backend: tóm tắt từ 5 ký tự, đối tượng từ 3, họ tên từ 2, ngày từ năm 2000 và không ở tương lai, số tiền tối đa 1.000 tỷ. Chưa tích ô cam đoan thì báo lỗi ngay dưới ô đó.
  - Ô số tiền chỉ nhận chữ số, có dấu chấm phân cách và dòng "Tương đương 15 triệu".
  - Điền dở mà tải lại / đóng tab thì trình duyệt hỏi lại. Ô diễn biến có bộ đếm 5.000 ký tự.
  - Không gửi hai lần khi bấm nhanh; cập nhật state theo kiểu hàm.
- `giaodien/src/index.css`: kiểu viền đỏ và dòng lỗi từng ô (`.field-input.invalid`, `.field-msg`) chuyển từ `report-form.css` sang đây để hai trang dùng chung.
- `giaodien/src/report-form.css`, `public-report.css`: bỏ phần đã chuyển, thêm bộ đếm ký tự cho trang công khai.

Không đổi backend. Chỉ cần Ctrl+F5.

## Cách kiểm tra
Mở /bao-cao (không cần đăng nhập), bấm "Gửi báo cáo" khi để trống: con trỏ nhảy vào ô Tóm tắt, các ô thiếu hiện lỗi đỏ bên dưới. Gõ "abc" vào ô số tiền: không nhận chữ.
