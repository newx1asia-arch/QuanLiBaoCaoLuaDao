# Cập nhật 32: README và Postman thiếu toàn bộ API Cảnh báo

Vấn đề: phần "Cảnh báo phát hành" (soạn, duyệt, phát hành, thu hồi, trang công khai) có đủ 11 API nhưng không có trong bảng API ở `nestjs/README.md` và không có request nào trong file Postman, nên không thể thử API này bằng Postman như các phần khác.

## File đã sửa
- `nestjs/README.md`: thêm 7 dòng vào bảng API (danh sách / soạn, xem / sửa / xóa, gửi duyệt, duyệt / từ chối, phát hành, thu hồi, danh sách công khai), ghi rõ ai được dùng và các quy tắc chính (không tự duyệt, thu hồi bắt buộc lý do).
- `nestjs/postman/baocao-luadao.postman_collection.json`: thêm nhóm "Cảnh báo" gồm 11 request mẫu, đặt trước nhóm "Tra cứu". Request công khai (`/public/alerts`) tắt xác thực.

## Không đổi
- Mã nguồn backend và giao diện, các request Postman cũ.

## Cách kiểm tra
Import lại file Postman: thấy nhóm "Cảnh báo". Đăng nhập, chạy "Soạn cảnh báo" rồi "Gửi duyệt". "Duyệt" cần tài khoản admin khác người đã soạn. "Danh sách công khai" chạy được không cần token. Số `1` trong đường dẫn là id mẫu, đổi theo id thật.
