# Bổ sung: Soạn và duyệt cảnh báo trước khi phát hành

## Luồng
Bản nháp → Chờ duyệt → Đã duyệt → Đã phát hành (→ Đã thu hồi). Bị từ chối thì trả về người soạn, sửa rồi gửi duyệt lại.
- Cán bộ và quản trị viên: soạn, sửa, gửi duyệt, xóa bản nháp của mình.
- Quản trị viên: duyệt, từ chối (bắt buộc ghi lý do), phát hành, thu hồi. **Không tự duyệt cảnh báo do chính mình soạn.**
- Mọi bước được ghi vào nhật ký của cảnh báo.

## Nội dung và phạm vi
- Chọn kênh: Website, SMS, Thông báo ứng dụng, Mạng xã hội; mỗi kênh có nội dung riêng, đếm ký tự (SMS tiếng Việt có dấu tính 70 ký tự/tin) và nút điền nhanh từ nội dung website.
- Phạm vi: toàn quốc hoặc theo địa bàn (chọn nhiều tỉnh, thành, có tìm kiếm và chọn nhanh theo vùng).
- Gửi duyệt chỉ được khi mọi kênh đã chọn có nội dung và phạm vi địa bàn đã chọn tỉnh.

## Giới hạn hiện tại (quan trọng)
- **Website**: đăng ngay khi phát hành qua API công khai `GET /api/public/alerts?province=ha_noi` (không cần đăng nhập, chỉ trả cảnh báo đã phát hành, không lộ người soạn/duyệt). Hệ thống này chưa có trang công khai, cần gọi API đó từ website của đơn vị.
- **SMS, ứng dụng, mạng xã hội**: chỉ được ghi nhận "Chờ gửi" trong cột `ketQuaKenh`, **hệ thống chưa tự gửi ra ngoài**. Điểm nối nhà cung cấp (SMS Brandname, FCM/APNs, API mạng xã hội) là hàm `dispatch` trong `nestjs/src/alerts/alerts.service.ts`.
- Cần ít nhất 2 quản trị viên để có người duyệt.

## Tệp mới
- Backend: `nestjs/src/alerts/` (module, entity `alerts`, DTO, service, controller). Bảng tự tạo khi `DB_SYNC` bật.
- API: `GET/POST /alerts`, `GET/PUT/DELETE /alerts/:id`, `POST /alerts/:id/{submit,approve,reject,publish,withdraw}`.
- Giao diện: trang `/alerts` (menu "Cảnh báo phát hành"), `components/AlertEditor.jsx`, `services/alertApi.js`.
