# Cập nhật 49: Trang Tra cứu nhận từ khóa trên địa chỉ (?q=)

Vấn đề: trang Tra cứu luôn trống khi mở, không gửi được đường dẫn tới một kết quả, F5 là mất kết quả.

## Đã sửa
- `giaodien/src/pages/Lookup.jsx`: đọc `?q=...` trên địa chỉ và tự tra cứu một lần khi mở trang; mỗi lần tra cứu ghi từ khóa lên địa chỉ (thay dòng lịch sử hiện tại, nút Quay lại không bị kẹt). F5 hoặc gửi liên kết cho đồng nghiệp vẫn ra đúng kết quả.
- `giaodien/src/pages/ReportForm.jsx`: cảnh báo "đối tượng đã bị báo cáo N lần" có thêm liên kết "Xem chi tiết tra cứu", mở trang Tra cứu ở tab mới nên không mất nội dung đang nhập.

## Cách kiểm tra
Mở `/lookup?q=0912345678`: kết quả hiện ngay. Ở form tạo báo cáo, nhập 0912345678 vào ô Đối tượng rồi bấm ra ngoài, bấm liên kết trong khung cảnh báo.

Không đổi backend. Chỉ cần Ctrl+F5.
