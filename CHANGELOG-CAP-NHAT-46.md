# Cập nhật 46: Trang Báo cáo thống kê nhớ bộ lọc trên địa chỉ

Vấn đề: chọn "7 ngày" hoặc một hình thức lừa đảo rồi tải lại trang (F5) là mất bộ lọc, quay về 30 ngày / mọi hình thức; cũng không gửi được đường dẫn đúng bộ lọc cho đồng nghiệp.

## Đã sửa (chỉ `giaodien/src/pages/Statistics.jsx`)
- Khoảng thời gian và hình thức lừa đảo được lưu trên địa chỉ: `/statistics?days=7&type=dau_tu`. Giá trị mặc định (30 ngày, mọi hình thức) không hiện trên địa chỉ.
- Giá trị lạ trên địa chỉ (ví dụ `?days=5`) tự về mặc định, không gây lỗi. Nút Quay lại của trình duyệt không bị kẹt vì mỗi lần đổi bộ lọc thay thế dòng lịch sử hiện tại.

## Cách kiểm tra
Mở /statistics, chọn "7 ngày" và một hình thức, nhấn F5: bộ lọc vẫn giữ nguyên, địa chỉ có `?days=7&type=...`.
