# Cập nhật 4: Cảnh báo bị ghi đè khi hai người thao tác cùng lúc

Lỗi: mọi thao tác trên cảnh báo (gửi duyệt, duyệt, từ chối, phát hành, thu hồi, sửa, xóa) đọc cảnh báo ra rồi `save` lại toàn bộ. Hai người (hoặc hai tab) cùng bấm thì cái sau ghi đè cái trước: có thể phát hành hai lần (kênh bị xếp hàng gửi hai lần, nhật ký ghi hai dòng), một người từ chối trong khi người kia duyệt thì kết quả tùy ai ghi sau, người soạn sửa bản nháp đúng lúc nó vừa được gửi duyệt thì bản gửi duyệt bị đổi ngược về nháp.

## File đã sửa
- `nestjs/src/alerts/alerts.service.ts`: mỗi thao tác đổi trạng thái chạy `UPDATE ... WHERE id = ? AND trangThai = <trạng thái đã đọc>`. Nếu người khác đã đổi trạng thái xen giữa thì trả lỗi 409 "Cảnh báo vừa được người khác thao tác, hãy tải lại trang rồi thử lại" thay vì ghi đè. Phát hành giành quyền trước (da_duyet -> da_phat_hanh) rồi mới xếp hàng gửi các kênh, nên chỉ một người phát hành được. Xóa chỉ thực hiện khi cảnh báo còn là nháp / bị từ chối.
- `giaodien/src/pages/Alerts.jsx`: khi gặp 409 thì tự tải lại danh sách để thấy trạng thái mới nhất.

## Không đổi
- Quy tắc phân quyền, luồng trạng thái, dạng dữ liệu API. Không thêm cột / bảng nào.

## Cách kiểm tra
Mở hai tab cùng một cảnh báo đã duyệt, bấm "Phát hành" ở cả hai: tab bấm sau phải báo lỗi 409, nhật ký chỉ có một dòng "Phát hành qua...". Luồng bình thường (soạn, gửi duyệt, duyệt, phát hành, thu hồi) vẫn chạy như cũ.
Đã kiểm tra: `tsc --noEmit` sạch, xem câu UPDATE sinh ra (cột JSON được ghi đúng). Chưa chạy với MySQL thật.
