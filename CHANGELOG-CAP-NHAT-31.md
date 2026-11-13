# Cập nhật 31: Thu hồi cảnh báo đã công khai không có chỗ nhập lý do

Lỗi: backend có ghi "Thu hồi khỏi website. Lý do: ..." vào nhật ký, nhưng hộp thoại cảnh báo không có ô nhập lý do khi thu hồi (ô ghi chú chỉ hiện lúc duyệt / từ chối). Nút "Thu hồi khỏi website" luôn gửi lý do rỗng, nên một cảnh báo đã công khai bị gỡ mà nhật ký không biết vì sao.

## File đã sửa
- `giaodien/src/pages/Alerts.jsx`: hiện ô "Lý do thu hồi (bắt buộc)" cho quản trị viên khi cảnh báo đã phát hành; bấm thu hồi mà chưa nhập lý do thì báo lỗi.
- `nestjs/src/alerts/alerts.service.ts`, hàm `withdraw()`: bắt buộc có lý do (như khi từ chối), nhật ký luôn ghi kèm lý do.

## Không đổi
- Quy trình duyệt, phát hành, quyền hạn, CSDL, các cảnh báo đã thu hồi trước đây.
- Lưu ý: gọi `POST /alerts/:id/withdraw` không kèm `ghiChu` (vd từ Postman) giờ bị từ chối với lỗi 400.

## Cách kiểm tra
Phát hành một cảnh báo, mở lại bằng tài khoản quản trị viên: có ô "Lý do thu hồi (bắt buộc)". Bấm "Thu hồi khỏi website" khi để trống: báo "Vui lòng ghi rõ lý do thu hồi."; nhập lý do rồi bấm: nhật ký ghi "Thu hồi khỏi website. Lý do: ...".
Chưa chạy `tsc` / `vite build` (môi trường không có `node_modules`).
