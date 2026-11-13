# Cập nhật 13: Hàng đợi khẩn cấp trên Bảng điều hành bị thiếu hồ sơ khi có hơn 500 hồ sơ đang mở

Lỗi: hook `useOpenReports` (dùng cho khối "Hàng đợi khẩn cấp" và "Năng lực đơn vị") chỉ xin đợt đầu 500 hồ sơ cho mỗi trạng thái (chờ xử lý, đang xác minh). Khi có hơn 500 hồ sơ ở một trạng thái, các hồ sơ cũ hơn bị bỏ qua mà không báo gì. Đó thường chính là hồ sơ tồn đọng lâu và quá hạn SLA, nên hàng đợi thiếu đúng những hồ sơ cần thấy nhất, còn số liệu năng lực đơn vị thì thấp hơn thực tế.

## File đã sửa
- `giaodien/src/hooks.js`: thêm hàm `tatCaTheoTrangThai()` tải lần lượt từng đợt 500 cho tới khi đủ (có chặn an toàn tối đa 10 đợt = 5000 hồ sơ mỗi trạng thái). `useOpenReports` dùng hàm này.

## Không đổi
- Backend, dạng dữ liệu, giao diện. Với dưới 500 hồ sơ mỗi trạng thái thì số lần gọi API như cũ (1 yêu cầu mỗi trạng thái).

## Lưu ý
- Khối này tự tải lại mỗi 15 giây; khi có hơn 500 hồ sơ mở, mỗi lần tải lại sẽ tốn thêm yêu cầu theo số đợt.

## Cách kiểm tra
Có hơn 500 hồ sơ "chờ xử lý" (nạp mẫu `SEED_DEMO=true` rồi tạo thêm, hoặc thử hạ tạm `MOI_DOT` xuống 5 trong `hooks.js` và `pageSize` backend cho phép): Bảng điều hành phải hiện đủ hồ sơ, hồ sơ cũ nhất vẫn có mặt trong hàng đợi.
Chưa chạy `vite build` (môi trường không có `node_modules`).
