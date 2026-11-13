# Cập nhật 5: Khối "Giám sát trực tiếp" không còn đọc toàn bộ báo cáo mỗi 15 giây

Lỗi / hạn chế: `GET /api/monitor` được giao diện gọi lại mỗi 15 giây (mỗi người đang mở Bảng điều hành), và mỗi lần đều tải toàn bộ báo cáo vào bộ nhớ rồi gom nhóm bằng JavaScript.

## File đã sửa
- `nestjs/src/reports/monitor.service.ts`: hàm `monitor()` tính bằng truy vấn tổng hợp MySQL (đếm theo trạng thái, theo loại, báo cáo 24 giờ, số đối tượng nghi vấn / nguy hiểm). Chỉ báo cáo trong 30 ngày gần nhất (cửa sổ tìm chiến dịch) và chỉ các cột cần thiết mới được tải về.
- `nestjs/src/reports/reports.constants.ts`: thêm hằng `NGUONG_NGUOI_BAO_CAO = 3`, dùng chung cho `mucDoDoiTuong` và truy vấn đếm đối tượng nguy hiểm, để hai nơi không lệch quy tắc.

## Không đổi
- Dạng dữ liệu trả về và giao diện. Quy tắc tính giữ nguyên: báo cáo bị từ chối không tính; "nguy hiểm" = đã có báo cáo được xác nhận, hoặc từ 3 người báo cáo khác nhau.
- `GET /api/suspects` (trang Đối tượng nghi vấn) vẫn đọc toàn bộ như cũ, để sửa ở lượt sau.

## Cách kiểm tra
Mở Bảng điều hành, so khối Giám sát (tiến độ xử lý %, số báo cáo 24 giờ, số đối tượng nghi vấn / nguy hiểm, quy trình 4 trạng thái, chiến dịch nổi bật) với trước khi cập nhật: phải khớp. Tạo thêm báo cáo, sau tối đa 15 giây số trên khối tự cập nhật.
Đã kiểm tra: `tsc --noEmit` sạch. Chưa chạy với MySQL thật. Lưu ý: truy vấn đếm đối tượng nguy hiểm là SQL thuần (`reports`, `doiTuongKey`...), nếu đổi tên bảng / cột ở entity thì phải sửa theo.
