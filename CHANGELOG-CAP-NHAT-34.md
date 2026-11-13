# Cập nhật 34: Bỏ nút "In báo cáo", sửa lỗi số âm trong file CSV

Từ bản này cập nhật từng việc một. Lần này gồm 2 việc nhỏ.

## 1. Bỏ nút "In báo cáo" ở trang Báo cáo thống kê
Nút gọi lệnh in của trình duyệt nhưng không cho kết quả dùng được, nên bỏ. Trang vẫn còn nút "Xuất thống kê địa bàn" (CSV).
- `giaodien/src/pages/Statistics.jsx`: xóa nút.
- Giữ nguyên các kiểu CSS in trong `index.css` (không ảnh hưởng gì), có thể dọn sau.

## 2. Lỗi: số âm trong file CSV bị biến thành chữ
Vấn đề: hàm xuất CSV thêm dấu `'` trước mọi ô bắt đầu bằng `-`, `+`, `=`, `@` để Excel không hiểu nhầm là công thức. Quy tắc này áp cả cho SỐ, nên cột "Tăng / giảm (%)" của file "Xuất thống kê địa bàn" khi báo cáo giảm (vd -12,5) hiện thành `'-12.5` dạng chữ: không tính tổng, không sắp xếp được.
Cách sửa: chỉ thêm dấu `'` cho ô kiểu chữ; số giữ nguyên. Chữ do người dùng nhập (vd `=SUM(A1)`, `+84912345678`) vẫn được bảo vệ như cũ.
- `giaodien/src/services/exportCsv.js`: hàm `downloadCsv`.

## Cách kiểm tra
Vào Báo cáo thống kê, chọn khoảng thời gian có địa bàn giảm so với kỳ trước, bấm "Xuất thống kê địa bàn", mở bằng Excel: cột "Tăng / giảm (%)" là số âm bình thường.

## Còn để lại cho các lần sau (chưa sửa)
- File "Xuất thống kê địa bàn": cột "Mức độ" đang ghi mã (`rat_cao`) thay vì nhãn "Rất cao".
- Trang thống kê và bản đồ điểm nóng đang đếm cả báo cáo bị từ chối, trong khi tiền thiệt hại và trang Đối tượng nghi vấn thì không tính.
- Báo cáo người dân gửi chưa xác minh vẫn góp vào mức "Nguy hiểm" (từ 3 họ tên khác nhau).
