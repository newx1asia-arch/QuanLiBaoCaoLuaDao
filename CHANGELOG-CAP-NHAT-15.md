# Cập nhật 15: Xin mã quên mật khẩu mới làm "hồi lại" lượt đoán mã

Lỗi: mỗi lần xin mã mới, `resetSoLan` (số lần đã nhập sai) bị đặt về 0. Mỗi email cách 60 giây được xin mã mới, nên kẻ xấu luôn có thêm 5 lượt đoán mỗi phút (khoảng 7.000 lượt mỗi ngày cho một email), dù mỗi mã chỉ được thử 5 lần. Bản cập nhật 10 chỉ chặn việc đoán song song trên cùng một mã, chưa chặn cách này.

## File đã sửa
- `nestjs/src/auth/auth.service.ts`, hàm `forgotPassword()`:
  - Khi mã cũ còn hiệu lực, mã mới thừa kế số lần đã sai (không đặt về 0).
  - Đã dùng hết 5 lượt mà mã cũ chưa hết hạn thì không phát mã mới (vẫn trả lời chung chung như mọi trường hợp, không lộ email có tồn tại hay không); chờ mã cũ hết hạn (tối đa 15 phút) rồi xin lại. Mã hết hạn thì bộ đếm về 0 như cũ.
  - Kết quả: mỗi email chỉ bị đoán tối đa 5 lần mỗi 15 phút (khoảng 480 lần mỗi ngày thay vì khoảng 7.000).

## Đánh đổi cần biết
- Người dùng thật nhập sai mã 5 lần phải chờ tối đa 15 phút mới xin mã mới được. Người nhập sai 3 lần rồi xin mã mới chỉ còn 2 lượt thử trên mã mới.
- Ai đó biết email của người khác có thể cố tình dùng hết lượt để làm người đó chờ 15 phút (không đổi được mật khẩu, không đọc được tài khoản).

## Không đổi
- API, thông báo, giao diện, CSDL (không thêm cột). Luồng bình thường (xin mã, nhập đúng mã) chạy như cũ.

## Cách kiểm tra
Xin mã, nhập sai 5 lần (báo lỗi), xin mã mới ngay sau 60 giây: không có mail mới. Chờ 15 phút (hoặc đặt `RESET_MINUTES` nhỏ để thử) rồi xin lại: có mã mới, nhập đúng thì đổi được mật khẩu.
Chưa chạy `tsc` (môi trường không có `node_modules`); bạn chạy `npx tsc --noEmit` trong `nestjs/`.
