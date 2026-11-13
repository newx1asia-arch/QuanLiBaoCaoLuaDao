# Cập nhật 8: Quản trị viên tự đặt lại mật khẩu của mình bị đăng xuất không báo

Lỗi: ở trang Người dùng, hàng của chính quản trị viên cũng có nút "Đặt lại mật khẩu". Đặt lại xong, hệ thống tăng `tokenVersion` để đăng xuất người đó khỏi mọi thiết bị, nhưng khác với "Đổi mật khẩu" ở trang Tài khoản, API đặt lại không cấp token mới. Kết quả: giao diện báo "Đã đặt lại mật khẩu" rồi ở thao tác kế tiếp bị đá ra trang đăng nhập mà không hiểu vì sao.

## File đã sửa
- `nestjs/src/auth/users.service.ts`, `nestjs/src/auth/users.controller.ts`: `POST /api/users/:id/reset-password` từ chối khi `:id` là chính người gọi, kèm thông báo hướng dẫn dùng trang Tài khoản (nơi phải nhập mật khẩu hiện tại).
- `giaodien/src/pages/Users.jsx`: hàng của chính mình không còn nút "Đặt lại mật khẩu" mà có nút "Đổi mật khẩu của bạn" dẫn tới `/profile`.

## Không đổi
- Đặt lại mật khẩu cho người khác, khóa / mở khóa, đổi vai trò: như cũ.

## Cách kiểm tra
Đăng nhập admin, mở Người dùng: hàng "(bạn)" có nút "Đổi mật khẩu của bạn" (mở trang Tài khoản); các hàng khác vẫn có "Đặt lại mật khẩu" và "Khóa". Gọi thẳng API với id của mình (Postman) phải nhận lỗi 400.
Đã kiểm tra: `tsc --noEmit` (backend) sạch, `vite build` (giao diện) thành công.
