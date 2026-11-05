# Backend: NestJS + MySQL

Hệ thống chỉ dành cho cán bộ công an: không có đăng ký công khai và không có vai trò người dân. Tài khoản `can_bo` / `admin` do quản trị viên tạo (POST /api/users).

## Cài đặt

1. Tạo database trong MySQL:
   `CREATE DATABASE baocao_luadao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. Sao chép `.env.example` thành `.env`, điền `DB_USER`, `DB_PASS`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
3. `npm install` rồi `npm run start:dev`  (API: http://localhost:3000/api)
4. Postman: Import `postman/baocao-luadao.postman_collection.json`, chạy **Xác thực → Đăng nhập** trước (token tự được lưu cho các request sau).

Bảng tự được tạo khi chạy (`synchronize`), mặc định bật khi phát triển và tắt khi `NODE_ENV=production` (đặt `DB_SYNC=true` nếu muốn bật).
Nếu database còn tài khoản người dân của bản cũ, xóa trước khi chạy: `DELETE FROM users WHERE vaiTro = 'nguoi_dan';`

## Đăng nhập và phân quyền

Lần chạy đầu tiên (bảng `users` còn trống), hệ thống tự tạo tài khoản admin theo `ADMIN_EMAIL` / `ADMIN_PASSWORD`
(nếu bỏ trống: `admin@baocao.local` / `Admin@12345`, **hãy đổi mật khẩu ngay**).

Mọi API đều cần header `Authorization: Bearer <token>`, trừ đăng nhập và quên mật khẩu.

| Vai trò | Cách có tài khoản | Quyền |
|---|---|---|
| `can_bo` (Cán bộ) | Admin tạo | Xem tất cả báo cáo, tạo báo cáo, tra cứu, tự nhận báo cáo chưa ai phụ trách; đổi trạng thái / ghi chú báo cáo mình phụ trách |
| `admin` | Tạo tự động lần đầu / admin khác tạo | Mọi quyền của cán bộ + phân công cho người khác, mở lại báo cáo đã kết thúc, xóa báo cáo, quản lý người dùng |

Bảo mật đã có: mật khẩu băm scrypt kèm salt; JWT HS256 (không cần thư viện ngoài); đổi/đặt lại mật khẩu thì token cũ ở mọi thiết bị hết hiệu lực;
khóa tài khoản hoặc đổi vai trò có hiệu lực ngay; sai mật khẩu 5 lần thì tạm khóa 15 phút (theo email + IP); admin không thể tự khóa hoặc tự hạ quyền chính mình.

## Quy tắc xử lý báo cáo

- Cán bộ chỉ tự nhận báo cáo **chưa ai phụ trách**. Chỉ admin phân công cho người khác hoặc hủy phân công.
- Chỉ người phụ trách (hoặc admin) được đổi trạng thái và ghi chú. Cán bộ xử lý báo cáo chưa ai nhận thì được tự động nhận.
- Phân công theo **id cán bộ** (`canBoId`, lấy từ `GET /api/users/staff`), không theo họ tên nên hai người trùng tên không bị nhầm.
- Trạng thái đi theo luồng `cho_xu_ly → dang_xac_minh → da_xac_nhan / tu_choi` (cũng có thể `cho_xu_ly → tu_choi`). Báo cáo đã kết thúc chỉ admin mở lại (về `dang_xac_minh`).
- Xác nhận / từ chối / mở lại **bắt buộc ghi lý do** (`ghiChu`).
- PATCH có thể gửi `phienBan` (số phiên bản đang xem): nếu người khác đã sửa trước thì trả 409 thay vì ghi đè.
- Xóa báo cáo là xóa mềm (cột `xoaLuc`), dữ liệu vẫn nằm trong CSDL để truy vết.
- Mức ưu tiên tự tính theo thiệt hại: từ 50 triệu là cao, từ 10 triệu là trung bình, còn lại là thấp.

## Quên mật khẩu

1. Người dùng nhập email ở trang **Quên mật khẩu**, backend tạo mã 6 số (hiệu lực 15 phút, mỗi email chờ 60 giây mới xin được mã mới, mỗi IP tối đa 10 yêu cầu/giờ).
2. Mã được gửi qua email. **Khi chưa cấu hình `SMTP_HOST`**, mã được in ra terminal của backend (dòng `[CHƯA CẤU HÌNH SMTP] Mã đặt lại mật khẩu của ...`), đủ để dùng thử khi chạy trên máy bạn.
3. Người dùng nhập mã và mật khẩu mới. Mã đúng thì đổi được mật khẩu và mọi thiết bị đang đăng nhập bị đăng xuất; mã chỉ dùng được một lần, sai quá 5 lần thì mã bị khóa.

Bảo mật: DB chỉ lưu bản băm của mã (không lưu mã gốc); API không tiết lộ email nào đã đăng ký; tài khoản bị khóa không nhận mã.
Gửi email thật: `npm i nodemailer`, rồi điền `SMTP_*` trong `.env`. Chưa muốn gửi email thì quản trị viên vẫn đặt lại mật khẩu giúp người dùng ở trang **Người dùng**.

## API

| Method | Đường dẫn | Ai dùng | Việc |
|---|---|---|---|
| POST | /api/auth/login | Công khai | Đăng nhập, trả `token` |
| POST | /api/auth/forgot-password | Công khai | Quên mật khẩu bước 1: gửi mã 6 số về email (luôn trả lời giống nhau) |
| POST | /api/auth/reset-password | Công khai | Quên mật khẩu bước 2: `email`, `ma`, `matKhauMoi` |
| GET / PATCH | /api/auth/me | Đã đăng nhập | Xem / đổi họ tên |
| POST | /api/auth/change-password | Đã đăng nhập | Đổi mật khẩu (trả token mới) |
| GET | /api/reports | Cán bộ, admin | Danh sách: keyword, status, type, priority, province (mã tỉnh, thành hoặc `chua_ro`), mine=1 (giao cho tôi), sort, dir, page, pageSize (tối đa 500) |
| GET | /api/reports/:id | Cán bộ, admin | Chi tiết + lịch sử + báo cáo cùng đối tượng |
| POST | /api/reports | Cán bộ, admin | Tạo báo cáo |
| PATCH | /api/reports/:id | Cán bộ, admin | Đổi trạng thái / phân công (`canBoId`) / ghi chú, kèm `phienBan` |
| DELETE | /api/reports/:id | Admin | Xóa mềm báo cáo |
| GET | /api/lookup?q= | Cán bộ, admin | Tra cứu SĐT / STK / link đã bị báo cáo chưa: chỉ trả số liệu tổng hợp |
| GET | /api/stats | Cán bộ, admin | Số liệu trang Tổng quan |
| GET | /api/stats/overview | Cán bộ, admin | Thống kê chi tiết và bản đồ điểm nóng: `days` (7 / 30 / 90 / 180 / 365), `type` (hình thức lừa đảo, tùy chọn). Trả tổng quan so với kỳ trước, xu hướng theo ngày / tuần / tháng, theo hình thức, theo tỉnh thành, khung giờ, đối tượng bị báo cáo nhiều |
| GET | /api/suspects | Cán bộ, admin | Đối tượng nghi vấn (gom theo SĐT / STK / link, không tính báo cáo bị từ chối): keyword, level (`nguy_hiem` / `can_than`), kind (`sdt` / `tai_khoan` / `link`), page, pageSize (tối đa 100) |
| GET | /api/suspects/detail?q= | Cán bộ, admin | Hồ sơ một đối tượng: số liệu tổng hợp + các báo cáo liên quan |
| GET | /api/monitor | Cán bộ, admin | Khối "Giám sát trực tiếp": quy trình xử lý, chiến dịch nổi bật trong 30 ngày, tiến độ ứng phó, diễn biến xử lý. Giao diện gọi lại mỗi 15 giây |
| GET | /api/users/staff | Cán bộ, admin | Danh sách cán bộ `[{ id, hoTen }]` để phân công |
| GET / POST | /api/users | Admin | Danh sách (keyword, role, page, pageSize) / tạo tài khoản |
| PATCH | /api/users/:id | Admin | Đổi vai trò, khóa / mở khóa |
| POST | /api/users/:id/reset-password | Admin | Đặt lại mật khẩu |

## Địa bàn (tỉnh, thành) và dữ liệu mẫu

- Báo cáo có thêm trường `tinhThanh` (tùy chọn). Danh sách mã nằm ở `src/reports/reports.constants.ts` (34 tỉnh, thành), phải khớp với `giaodien/src/constants.js`.
- Chạy phát triển: backend tự thêm cột. Chạy production với `DB_SYNC=false`: chạy `sql/them-cot-tinh-thanh.sql` một lần.
- Xem thử bản đồ và biểu đồ: thêm `SEED_DEMO=true` vào `.env`, khởi động lại backend để nạp 160 báo cáo mẫu. Xóa bằng `sql/xoa-du-lieu-mau.sql`.

## Chạy bản build

`npm run build` rồi `npm run start:prod` (đặt `NODE_ENV=production`, bắt buộc có `JWT_SECRET`). Thư mục `dist/` và file `*.tsbuildinfo` do build sinh ra, không cần lưu trong git.
