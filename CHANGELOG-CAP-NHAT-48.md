# Cập nhật 48: Làm lại trang "Tạo báo cáo mới" (lấp khoảng trống, trang trí, sửa logic form)

Vấn đề: form chỉ rộng 640px nên bên phải trống hẳn; form báo lỗi chung một dòng, chưa kiểm tra đủ như backend; ô số tiền cho gõ "1e3" hay số thập phân; lỡ tay bấm Hủy là mất hết nội dung.

## Giao diện
- Khối đầu trang kiểu Bảng điều hành: nền đỏ họa tiết, mặt trống đồng, cờ đỏ sao vàng, khung góc vàng, 3 huy hiệu.
- Biểu mẫu chia 3 phần có số thứ tự: Thông tin vụ việc, Đối tượng và thiệt hại, Người báo cáo và diễn biến.
- Cột bên phải (cố định khi cuộn, xuống dưới form trên màn hình nhỏ):
  - **Tiến độ nhập liệu**: thanh tiến độ và danh sách 4 trường bắt buộc, tick xanh khi xong.
  - **Dự kiến sau khi gửi**: mức ưu tiên, thời hạn xử lý (SLA) và đơn vị tiếp nhận, đổi ngay khi nhập số tiền / chọn tỉnh.
  - **Lưu ý khi nhập** kèm hoa sen vàng; **Đường dây nóng** kèm mặt trống đồng mờ.

## Logic
- Báo lỗi ngay dưới từng ô (viền đỏ), bấm Gửi thì nhảy tới ô lỗi đầu tiên. Quy tắc khớp backend: tiêu đề từ 5 ký tự, đối tượng từ 3, tên người báo cáo từ 2, ngày từ năm 2000 và không ở tương lai, số tiền tối đa 1.000 tỷ.
- Ô số tiền chỉ nhận chữ số, hiện dấu chấm phân cách và dòng "Tương đương 15 triệu".
- Rời ô "Đối tượng" thì tra nhanh: đã bị báo cáo mấy lần (chỉ cảnh báo, không chặn gửi). Tra cứu lỗi hoặc quá nhanh thì bỏ qua.
- Có chữ đã nhập mà bấm Hủy hoặc đóng tab thì hỏi lại. Ô mô tả có bộ đếm 5.000 ký tự. Không gửi hai lần khi bấm nhanh.
- Sửa cập nhật state theo kiểu hàm (tránh mất chữ khi gõ rất nhanh).

## File
- Sửa: `giaodien/src/pages/ReportForm.jsx`, `giaodien/src/constants.js` (thêm `tinhUuTien`, khớp backend)
- Mới: `giaodien/src/report-form.css`

Không đổi backend, không cần khởi động lại API. Chỉ cần Ctrl+F5.
