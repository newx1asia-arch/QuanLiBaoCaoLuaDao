# Bổ sung: Hàng đợi khẩn cấp (SLA) và Năng lực xử lý đơn vị

Không đổi backend, không thêm bảng: mọi số liệu tính từ báo cáo đang mở (Chờ xử lý + Đang xác minh).

## Bảng điều hành (`giaodien/`)
- **Hồ sơ theo mức độ khẩn cấp** (`components/UrgentQueue.jsx`): sắp theo SLA còn lại ít nhất; bộ lọc Tất cả / Sắp quá hạn / Chưa phân công. Mỗi hồ sơ có mã, địa bàn, nội dung, mức ưu tiên, đồng hồ đếm ngược SLA, thanh tiến độ thời gian, nút **Chi tiết** (mở nhanh hộp thoại) và **Nhận xử lý**.
- **Nhận xử lý** gọi `PATCH /reports/:id` (nhận việc + chuyển "Đang xác minh"), cập nhật dòng ngay trên giao diện và hiện thông báo xác nhận. Gửi kèm `phienBan` nên nếu người khác nhận trước sẽ báo xung đột và tải lại.
- **Năng lực xử lý đơn vị** (`components/UnitCapacity.jsx`): vòng công suất tổng hợp, số hồ sơ còn nhận được, so sánh tải 4 đơn vị, màu đổi theo mức tải (dưới 60% xanh, 60–85% cam, từ 85% đỏ), nút **Mở bảng điều phối nguồn lực** để chỉnh công suất định mức và xem mức tải thay đổi.
- Hai khối dùng chung một lần tải (`hooks.js`, `useOpenReports`), tự làm mới 15 giây, tạm dừng khi tab ẩn.
- **Form tạo báo cáo**: ô tỉnh, thành nhóm theo vùng Bắc → Nam.
- **Tối ưu**: các trang ngoài Bảng điều hành và Đăng nhập tải theo nhu cầu (`React.lazy`), giảm dung lượng tải lần đầu.

## Quy ước cần xác nhận (sửa ở `constants.js`)
- SLA: ưu tiên cao 24 giờ, trung bình 72 giờ, thấp 7 ngày (`SLA_GIO`). "Sắp quá hạn" = còn dưới 25% thời hạn.
- Công suất định mức 4 đơn vị là **số giả định** (`DON_VI`); hãy thay bằng biên chế thật.
- CSDL chưa có bảng đơn vị, nên tải được suy ra: PA05 Hà Nội = hồ sơ từ miền Bắc/Bắc Trung Bộ (kể cả chưa ghi tỉnh); PA05 TP.HCM = các tỉnh còn lại; Trung tâm giám sát = hồ sơ chờ tiếp nhận; Tổ xác minh liên ngành = hồ sơ đang xác minh. Hai đơn vị sau tính theo toàn quốc nên vòng tổng hợp là tổng suất dùng của 4 đơn vị.
- Chỉnh công suất trong bảng điều phối chỉ lưu tạm trên trình duyệt.
