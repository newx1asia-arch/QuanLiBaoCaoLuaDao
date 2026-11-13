# Cập nhật 25: "Đối tượng bị báo cáo nhiều lần" trên Bảng điều hành đếm cả báo cáo đã bị từ chối

Lỗi: khối "Đối tượng bị báo cáo nhiều lần" ở Bảng điều hành tính cả báo cáo đã bị từ chối, trong khi trang Đối tượng nghi vấn, Tra cứu và trang Thống kê đều loại các báo cáo này (báo cáo bị từ chối là không đúng sự thật / không đủ cơ sở). Hậu quả:
1. Một đối tượng có 2 báo cáo đều bị từ chối vẫn hiện ở Bảng điều hành, nhưng bấm vào tên (hoặc "Xem tất cả") thì trang Đối tượng nghi vấn báo "Không có đối tượng nghi vấn nào phù hợp".
2. Đối tượng có 1 báo cáo hợp lệ + 1 báo cáo bị từ chối hiện "2 lần" ở Bảng điều hành nhưng chỉ "1 báo cáo" ở trang Đối tượng nghi vấn; tổng thiệt hại cũng bị cộng cả khoản của báo cáo bị từ chối.

## File đã sửa
- `nestjs/src/reports/reports.service.ts`, hàm `stats()`: truy vấn `lapLai` chỉ tính báo cáo có trạng thái khác `tu_choi`.

## Không đổi
- Giao diện, CSDL, định dạng dữ liệu API `/stats` (vẫn các trường như cũ).
- Các số tổng khác trên Bảng điều hành (Tổng báo cáo, Thiệt hại ghi nhận...) vẫn tính cả báo cáo bị từ chối như trước, vì đó là số báo cáo đã tiếp nhận.

## Cách kiểm tra
Tạo 2 báo cáo cùng một SĐT, chuyển cả hai sang "Từ chối": SĐT đó không còn trong khối "Đối tượng bị báo cáo nhiều lần" (trước đây vẫn hiện, bấm vào thì trang Đối tượng nghi vấn trống). Với đối tượng có 1 báo cáo hợp lệ + 1 bị từ chối: không hiện trong khối này nữa (chỉ còn 1 báo cáo hợp lệ), khớp với trang Đối tượng nghi vấn.
Chưa chạy `tsc` (môi trường không có `node_modules`).
