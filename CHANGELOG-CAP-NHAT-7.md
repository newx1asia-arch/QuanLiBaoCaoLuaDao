# Cập nhật 7: Trang "Đối tượng nghi vấn" không còn đọc toàn bộ báo cáo

Lỗi / hạn chế: mỗi lần mở, lọc, tìm kiếm hoặc chuyển trang ở `/suspects`, `GET /api/suspects` tải toàn bộ báo cáo (mọi cột) vào bộ nhớ rồi gom nhóm bằng JavaScript.

## File đã sửa
- `nestjs/src/reports/monitor.service.ts`: hàm `suspects()` để MySQL gom nhóm theo đối tượng (đếm báo cáo, số người báo cáo khác nhau, đã xác nhận, đang xử lý, tổng thiệt hại, ngày gần nhất...). Mỗi đối tượng chỉ còn một dòng nhẹ để lọc / sắp xếp / phân trang; tên hiển thị và cơ cấu loại chỉ được lấy cho các đối tượng trong trang hiện tại. Khi bằng nhau về mức độ, số báo cáo, thiệt hại thì đối tượng mới hơn xếp trước (trước đây thứ tự không cố định).
- `nestjs/src/reports/monitor.logic.ts`: kiểu tham số của `sapXepNghiVan` nới ra (chỉ cần 3 trường mức độ, số báo cáo, thiệt hại) để dùng được cho dòng đã gom nhóm; nơi gọi cũ không bị ảnh hưởng.

## Không đổi
- Dạng dữ liệu trả về, giao diện, quy tắc mức độ (nguy hiểm / cần thận trọng), việc loại báo cáo bị từ chối. `GET /api/suspects/detail` giữ nguyên.

## Khác biệt nhỏ
- Tìm kiếm khớp nếu bất kỳ báo cáo nào của đối tượng có chuỗi đối tượng chứa từ khóa (trước chỉ xét tên của báo cáo mới nhất).
- Việc gom nhóm theo khóa đối tượng do MySQL thực hiện, theo collation của cột (không phân biệt hoa thường; cũng giống cách Tra cứu và Hồ sơ đối tượng đang so khớp).

## Cách kiểm tra
Mở `/suspects` và so với trước khi cập nhật: tổng số, số theo tab (Nguy hiểm / Cần thận trọng), thứ tự, số báo cáo, số người báo cáo, thiệt hại, cơ cấu loại. Thử tìm theo SĐT có dấu cách ("0912 345 678"), theo link, lọc theo loại đối tượng, chuyển trang.
Đã kiểm tra: `tsc --noEmit` sạch, xem câu SQL sinh ra. Chưa chạy với MySQL thật.
