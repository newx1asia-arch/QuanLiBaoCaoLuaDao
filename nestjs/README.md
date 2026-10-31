# Backend: NestJS + MySQL

1. Tạo database trong MySQL:
   `CREATE DATABASE baocao_luadao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. Sao chép `.env.example` thành `.env`, điền `DB_USER`, `DB_PASS` đúng với MySQL của bạn (xem thêm `JWT_SECRET`, `ADMIN_*` bên dưới)
3. `npm install` rồi `npm run start:dev`  (API: http://localhost:3000/api)
4. Postman: Import `postman/baocao-luadao.postman_collection.json`, chạy **Xác thực → Đăng nhập** trước (token tự được lưu cho các request sau)

## Đăng nhập và phân quyền

Lần chạy đầu tiên (bảng `users` còn trống), hệ thống tự tạo tài khoản admin theo `ADMIN_EMAIL` / `ADMIN_PASSWORD`
(mặc định `admin@baocao.local` / `Admin@12345` — **hãy đổi mật khẩu ngay**).

Mọi API đều cần header `Authorization: Bearer <token>`, trừ đăng ký và đăng nhập.

| Vai trò | Cách có tài khoản | Quyền |
|---|---|---|
| `nguoi_dan` (Người dân) | Tự đăng ký | Gửi báo cáo; chỉ xem được báo cáo và thống kê **của mình**; không thấy ghi chú nội bộ |
| `can_bo` (Cán bộ) | Admin tạo | Xem tất cả báo cáo; đổi trạng thái, phân công, ghi chú |
| `admin` | Admin khác tạo / tạo tự động lần đầu | Mọi quyền của cán bộ + xóa báo cáo + quản lý người dùng |

Bảo mật đã có: mật khẩu băm scrypt kèm salt; JWT HS256 (không cần thư viện ngoài); đổi/đặt lại mật khẩu thì token cũ ở mọi thiết bị hết hiệu lực;
khóa tài khoản hoặc đổi vai trò có hiệu lực ngay; sai mật khẩu 5 lần thì tạm khóa 15 phút (theo email + IP); admin không thể tự khóa hoặc tự hạ quyền chính mình.

## Quên mật khẩu

1. Người dùng nhập email ở trang **Quên mật khẩu**, backend tạo mã 6 số (hiệu lực 15 phút, mỗi email chờ 60 giây mới xin được mã mới, mỗi IP tối đa 10 yêu cầu/giờ).
2. Mã được gửi qua email. **Khi chưa cấu hình `SMTP_HOST`**, mã được in ra terminal của backend (dòng `[CHƯA CẤU HÌNH SMTP] Mã đặt lại mật khẩu của ...`), đủ để dùng thử khi chạy trên máy bạn.
3. Người dùng nhập mã và mật khẩu mới. Mã đúng thì đổi được mật khẩu và mọi thiết bị đang đăng nhập bị đăng xuất; mã chỉ dùng được một lần, sai quá 5 lần thì mã bị khóa.

Bảo mật: DB chỉ lưu bản băm của mã (không lưu mã gốc); API không tiết lộ email nào đã đăng ký; tài khoản bị khóa không nhận mã.
Gửi email thật: `npm i nodemailer`, rồi điền `SMTP_*` trong `.env`. Chưa muốn gửi email thì quản trị viên vẫn đặt lại mật khẩu giúp người dùng ở trang **Người dùng**.

## API

| Method | Đường dẫn | Ai dùng | Việc |
|---|---|---|---|
| POST | /api/auth/register | Công khai | Đăng ký (luôn là người dân), trả `token` |
| POST | /api/auth/login | Công khai | Đăng nhập, trả `token` |
| POST | /api/auth/forgot-password | Công khai | Quên mật khẩu bước 1: gửi mã 6 số về email (luôn trả lời giống nhau) |
| POST | /api/auth/reset-password | Công khai | Quên mật khẩu bước 2: `email`, `ma`, `matKhauMoi` |
| GET / PATCH | /api/auth/me | Đã đăng nhập | Xem / đổi họ tên |
| POST | /api/auth/change-password | Đã đăng nhập | Đổi mật khẩu (trả token mới) |
| GET | /api/reports | Đã đăng nhập | Danh sách: keyword, status, type, priority, mine=1 (giao cho tôi), sort, dir, page, pageSize (người dân chỉ thấy của mình) |
| GET | /api/lookup?q= | Đã đăng nhập | Tra cứu SĐT / STK / link đã bị báo cáo chưa: chỉ trả số liệu tổng hợp |
| GET | /api/reports/:id | Đã đăng nhập | Chi tiết + lịch sử + báo cáo cùng đối tượng |
| POST | /api/reports | Đã đăng nhập | Tạo báo cáo |
| PATCH | /api/reports/:id | Cán bộ, admin | Đổi trạng thái / phân công / ghi chú |
| DELETE | /api/reports/:id | Admin | Xóa báo cáo và lịch sử |
| GET | /api/stats | Đã đăng nhập | Số liệu trang Tổng quan (người dân: chỉ của mình) |
| GET | /api/users/staff | Cán bộ, admin | Tên cán bộ để phân công |
| GET / POST | /api/users | Admin | Danh sách (keyword, role, page, pageSize) / tạo tài khoản |
| PATCH | /api/users/:id | Admin | Đổi vai trò, khóa / mở khóa |
| POST | /api/users/:id/reset-password | Admin | Đặt lại mật khẩu |

## Nâng cấp từ bản cũ

`synchronize: true` sẽ tự thêm bảng `users` và các cột mới (`reports.nguoiTaoId`, `report_history.noiBo`, `users.resetHash`, `users.resetHetHan`, `users.resetSoLan`).
Báo cáo cũ có `nguoiTaoId` rỗng nên chỉ cán bộ/admin xem được.
