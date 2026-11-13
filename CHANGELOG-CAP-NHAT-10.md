# Cập nhật 10: Mã quên mật khẩu 6 số có thể bị dò bằng yêu cầu song song

Lỗi: `POST /api/auth/reset-password` kiểm tra "mã đã sai quá 5 lần chưa" rồi mới so mã, và chỉ ghi `resetSoLan + 1` SAU khi so sai, dựa trên số lần đã đọc ra từ đầu. Nếu kẻ xấu gửi hàng trăm yêu cầu cùng lúc, tất cả cùng đọc thấy "đã sai 0 lần" nên đều được so mã. Giới hạn 5 lần thử thực tế không có tác dụng, mã 6 số (1 triệu khả năng) có thể bị dò trong thời gian hiệu lực 15 phút.
Lỗi liên quan: hai yêu cầu cùng dùng một mã đúng có thể cùng thành công (đổi mật khẩu hai lần, `tokenVersion` có thể bị cộng thiếu).

## File đã sửa
- `nestjs/src/auth/auth.service.ts`, hàm `resetPassword()`:
  - Trước khi so mã, "giữ chỗ" một lượt thử bằng câu `UPDATE ... SET resetSoLan = resetSoLan + 1 WHERE id = ? AND resetHash = <mã đã đọc> AND resetHetHan > NOW() AND resetSoLan < 5`. Nếu không cập nhật được dòng nào thì từ chối ngay. Nhờ vậy dù có gửi song song bao nhiêu yêu cầu, một mã chỉ bị thử tối đa 5 lần.
  - Đổi mật khẩu bằng `UPDATE ... WHERE id = ? AND resetHash = <mã đã đọc>`, đồng thời xóa mã và tăng `tokenVersion = tokenVersion + 1` ngay trong câu lệnh. Một mã chỉ đổi được mật khẩu một lần.
  - Chỉ băm mật khẩu mới (scrypt, tốn CPU) sau khi mã đã đúng, không băm cho các lượt đoán sai.

## Không đổi
- Dạng dữ liệu API, thông báo lỗi ("Mã xác nhận không đúng hoặc đã hết hạn"), giao diện, CSDL (không thêm cột / bảng). Luồng bình thường (nhận mã qua email, nhập mã + mật khẩu mới) chạy như cũ.

## Cách kiểm tra
1. Quên mật khẩu bình thường: nhận mã, nhập đúng mã + mật khẩu mới, đăng nhập được bằng mật khẩu mới.
2. Nhập sai mã 5 lần: lần thứ 6, kể cả nhập đúng mã, vẫn báo lỗi; phải yêu cầu mã mới (sau 60 giây).
3. Gửi nhiều yêu cầu `reset-password` song song với mã sai (ví dụ dùng Postman Runner hoặc `xargs -P`): số lần sai trong CSDL (`resetSoLan`) không vượt quá 5.
Chưa chạy với MySQL thật và chưa chạy `tsc --noEmit` (môi trường này không có `node_modules`, không cài được); bạn chạy `npx tsc --noEmit` trong `nestjs/` giúp mình xem sạch không.
