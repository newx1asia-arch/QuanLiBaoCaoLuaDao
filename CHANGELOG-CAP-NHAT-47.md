# Cập nhật 47: Danh sách báo cáo lọc được theo "N ngày gần nhất", số liệu các trang khớp nhau

Vấn đề: trang Thống kê và khối Giám sát đếm báo cáo trong 30 ngày (hoặc kỳ chọn), còn danh sách báo cáo bấm vào từ đó lại hiện mọi thời gian nên số lệch (vd chip "N báo cáo liên quan").

## Đã sửa
- `nestjs/src/reports/dto/query-report.dto.ts`, `reports.service.ts`: GET /reports nhận thêm `days` (7, 30, 90, 180, 365) = chỉ báo cáo tiếp nhận trong N ngày gần nhất, tính theo ngày tiếp nhận giống trang Thống kê. Tab số lượng theo trạng thái cũng tính theo bộ lọc này.
- `giaodien/src/pages/ReportList.jsx`: đọc `?days=` trên địa chỉ, hiện nhãn "N ngày gần nhất" cạnh bộ lọc; "Xóa lọc" bỏ luôn bộ lọc này; xuất CSV theo đúng bộ lọc.
- `giaodien/src/components/Charts.jsx`, `pages/Statistics.jsx`: tên từng trạng thái trong biểu đồ tròn "Tình trạng xử lý" bấm được, mở danh sách đúng trạng thái, kỳ và hình thức đang chọn.
- `giaodien/src/components/LiveMonitor.jsx`: chip "báo cáo liên quan" và nút "Mở báo cáo liên quan" mở danh sách đúng hình thức trong 30 ngày.

## Lưu ý
Khối Giám sát không tính báo cáo bị từ chối, danh sách thì có. Nếu chiến dịch có báo cáo bị từ chối thì danh sách nhiều hơn số trên chip; các báo cáo đó hiện kèm nhãn "Từ chối".

## Cách kiểm tra
Khởi động lại backend, Ctrl+F5. Ở /statistics bấm "Chờ xử lý" trong biểu đồ tròn: mở /reports?status=cho_xu_ly&days=30, số trên tab bằng số ở biểu đồ.
