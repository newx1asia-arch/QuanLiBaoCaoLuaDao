# Cập nhật 23: Mã chiến dịch tính tháng theo giờ UTC

Lỗi: mã chiến dịch `CD-yymm-LOẠI` (khối "Giám sát trực tiếp") lấy năm, tháng của báo cáo đầu tiên theo giờ UTC, trong khi mọi nơi khác (thống kê theo tháng, mã báo cáo `BC-yymm-id`) dùng giờ Việt Nam (UTC+7). Báo cáo đầu tiên của chiến dịch tiếp nhận từ 00:00 đến 07:00 sáng ngày mùng 1 (giờ Việt Nam) bị ghi nhầm vào tháng trước (cùng kiểu lỗi với cập nhật 18, lần này ở backend).

## File đã sửa
- `nestjs/src/reports/monitor.logic.ts`, hàm `timChienDich()`: tính `yymm` theo giờ Việt Nam.

## Không đổi
- Cách chọn chiến dịch, các số liệu, giao diện, CSDL. Phần lớn thời gian mã giống hệt như cũ.

## Cách kiểm tra
Chiến dịch có báo cáo đầu tiên lúc 02:00 sáng 01/12 (giờ Việt Nam) giờ có mã `CD-2612-...` (trước đây `CD-2611-...`).
Chưa chạy `tsc` (môi trường không có `node_modules`).
