# Cập nhật 30: Trang Thống kê / Bản đồ điểm nóng đọc thừa dữ liệu, chậm dần khi báo cáo nhiều

Vấn đề: `/stats/overview` đọc nguyên cả báo cáo (kể cả mô tả dài, tên người báo cáo, tên cán bộ...) của hai kỳ liên tiếp (tối đa 2 năm khi chọn 12 tháng) vào bộ nhớ rồi mới tính. Bảng điều hành gọi API này (30 ngày) mỗi phút cho mỗi tab đang mở, nên dữ liệu càng nhiều càng chậm và tốn bộ nhớ.

## File đã sửa
- `nestjs/src/reports/statistics.service.ts`, hàm `overview()`: chỉ đọc 8 cột cần để tính (`id, ngayTao, loai, trangThai, tinhThanh, soTienThietHai, doiTuong, doiTuongKey`).

## Không đổi
- Kết quả trả về, cách tính, giao diện, CSDL. Chỉ là đọc ít dữ liệu hơn.

## Cách kiểm tra
Mở Bảng điều hành, Báo cáo thống kê, Bản đồ điểm nóng: các con số giống hệt trước khi cập nhật.
Chưa chạy `tsc` (môi trường không có `node_modules`).
