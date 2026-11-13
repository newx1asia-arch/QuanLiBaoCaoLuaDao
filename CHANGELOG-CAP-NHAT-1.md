# Cập nhật 1: Biểu đồ xu hướng trên Bảng điều hành

Lỗi: ở khối "Xu hướng tiếp nhận báo cáo", chọn "12 tháng" thì 6 tháng cũ hơn luôn hiện 0, vì backend `GET /api/stats` chỉ trả 6 tháng gần nhất.
Lỗi liên quan: backend gom báo cáo theo tháng theo giờ UTC. Báo cáo tiếp nhận lúc 00:00–07:00 sáng ngày mùng 1 (giờ Việt Nam) bị tính vào tháng trước, nên số "tháng này" và "so với tháng trước" lệch.

## File đã sửa
- `nestjs/src/reports/reports.service.ts`: hàm `stats()` gom tháng theo giờ Việt Nam (`thangVN`) và trả tối đa 12 tháng thay vì 6.

## Không đổi
- Giao diện (`giaodien/`) giữ nguyên: Dashboard vốn đã tự điền 0 cho tháng trống và chỉ lấy đúng số tháng đang chọn.

## Cách kiểm tra
1. Chạy lại backend (`npm run start:dev`), mở Bảng điều hành, chọn "12 tháng": các tháng cũ phải hiện đúng số báo cáo (nếu CSDL có dữ liệu những tháng đó; có thể nạp mẫu bằng `SEED_DEMO=true`).
2. `tsc --noEmit` ở `nestjs/` chạy sạch.
