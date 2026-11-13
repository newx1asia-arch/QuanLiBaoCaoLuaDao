# Cập nhật 12: Môi trường thật không còn tự nạp báo cáo mẫu

Lỗi: mỗi lần khởi động, nếu bảng `reports` còn trống thì backend tự thêm 3 báo cáo mẫu (SĐT 0912345678, link dautu-xyz.example.com...), kể cả khi chạy thật (`NODE_ENV=production`). Hệ thống triển khai mới sẽ lẫn dữ liệu giả vào Bảng điều hành, Tra cứu và Đối tượng nghi vấn, và người dùng thật tra cứu số 0912345678 sẽ thấy "đã bị báo cáo".

## File đã sửa
- `nestjs/src/reports/reports.service.ts`: `onModuleInit()` bỏ qua việc nạp 3 báo cáo mẫu khi `NODE_ENV=production`, trừ khi đặt `SEED_DEMO=true`.

## Không đổi
- Khi phát triển (không đặt `NODE_ENV=production`) vẫn nạp như cũ để có dữ liệu thử API. `SEED_DEMO=true` (160 báo cáo xem thử bản đồ) hoạt động như cũ. Dữ liệu đã có trong CSDL không bị đụng tới.

## Cách kiểm tra
Chạy với `NODE_ENV=production` trên CSDL trống: bảng `reports` vẫn trống sau khi khởi động. Chạy chế độ phát triển (`npm run start:dev`) trên CSDL trống: vẫn có 3 báo cáo mẫu.
Chưa chạy `tsc` (môi trường không có `node_modules`); thay đổi chỉ thêm một câu điều kiện.
