# Cập nhật 39: Báo cáo có mã tỉnh lạ không còn "biến mất" khỏi bản đồ

Vấn đề: báo cáo có mã tỉnh không nằm trong 34 địa bàn hiện hành (ví dụ dữ liệu cũ từ thời 63 tỉnh) không được tính ở địa bàn nào trên bản đồ và cũng không nằm trong mục "chưa ghi địa bàn", nên tổng trên bản đồ nhỏ hơn tổng thật.

## Đã sửa
- `nestjs/src/reports/statistics.service.ts`: "chưa rõ địa bàn" gồm cả báo cáo chưa ghi tỉnh lẫn báo cáo có mã tỉnh không còn hợp lệ.
- `nestjs/src/reports/reports.service.ts`: bộ lọc `province=chua_ro` ở danh sách báo cáo dùng cùng quy tắc, để bấm "Xem danh sách" ra đúng số báo cáo đã đếm.

## Cách kiểm tra
Khởi động lại backend (NestJS). Dữ liệu hiện tại không đổi nếu mọi báo cáo đều có mã tỉnh hợp lệ. Muốn thử: đặt một báo cáo có tinhThanh = 'binh_duong' trong CSDL, ghi chú "báo cáo chưa ghi địa bàn" ở bản đồ sẽ tăng thêm 1 và mở danh sách sẽ thấy báo cáo đó.
