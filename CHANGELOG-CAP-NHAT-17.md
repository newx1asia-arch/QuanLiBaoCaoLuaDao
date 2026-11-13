# Cập nhật 17: Chạy sau nginx thì giới hạn theo IP tính chung cho cả hệ thống

Lỗi: backend dùng `@Ip()` để giới hạn đăng nhập sai (theo email + IP) và xin mã quên mật khẩu (10 lần / giờ / IP). Khi triển khai sau nginx hoặc load balancer mà không bật "trust proxy", Express thấy IP của chính máy trung gian cho mọi yêu cầu. Hậu quả: 10 lượt xin mã quên mật khẩu mỗi giờ là của CẢ hệ thống, người thứ 11 trong giờ đó (kể cả người dùng thật) bị báo "yêu cầu mã quá nhiều lần"; kẻ xấu chỉ cần xin mã liên tục là chặn được mọi người khác.

## File đã sửa
- `nestjs/src/main.ts`: đọc biến `TRUST_PROXY` trong `.env` (ví dụ `1` = có một máy trung gian) và bật "trust proxy" tương ứng, để `@Ip()` trả IP thật của người dùng.
- `nestjs/README.md`: thêm hướng dẫn `TRUST_PROXY` ở phần chạy bản build.

## Không đổi
- Mặc định (không đặt `TRUST_PROXY`) hành vi như cũ, nên chạy trực tiếp hoặc ở máy cá nhân không đổi gì. Không đổi API, giao diện, CSDL.

## Lưu ý
- Chỉ đặt `TRUST_PROXY` khi thật sự có máy trung gian: nếu không, người ngoài có thể gửi header `X-Forwarded-For` giả để đổi IP và né giới hạn. Nên dùng số (số máy trung gian), tránh `true`.

## Cách kiểm tra
Sau nginx với `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`, đặt `TRUST_PROXY=1`, khởi động lại. Hai người ở hai IP khác nhau cùng xin mã: giới hạn 10 lần / giờ tính riêng từng IP (thêm log tạm `ip` ở `forgotPassword` để xem).
Chưa chạy `tsc` (môi trường không có `node_modules`). Nếu `tsc` báo thiếu kiểu `@nestjs/platform-express`, chạy `npm i` lại trong `nestjs/` (thư viện này đã có trong `package.json`).
