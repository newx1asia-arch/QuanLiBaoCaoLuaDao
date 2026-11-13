# QuanLiBaoCaoLuaDao

Hệ thống quản lý báo cáo lừa đảo dành cho **cán bộ công an**: cán bộ tiếp nhận và xử lý báo cáo, quản trị viên quản lý tài khoản. Không có đăng ký công khai, tài khoản do quản trị viên cấp.

- `nestjs/` — API (NestJS + MySQL). Hướng dẫn cài đặt, phân quyền, danh sách API: xem `nestjs/README.md`
- `giaodien/` — giao diện (React + Vite): `npm install` rồi `npm run dev` (http://localhost:5173)

## Chạy lần đầu

1. Tạo database MySQL (xem `nestjs/README.md`).
2. `cd nestjs`, sao chép `.env.example` thành `.env` và điền thông tin thật, `npm install`, `npm run start:dev`.
3. `cd giaodien`, `npm install`, `npm run dev`.
4. Đăng nhập bằng tài khoản admin lấy từ `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `nestjs/.env` (tạo tự động ở lần chạy đầu tiên).

Chức năng chính: đăng nhập / quên mật khẩu (mã 6 số qua email), phân quyền cán bộ - quản trị viên, quản lý người dùng, hồ sơ cá nhân, tiếp nhận báo cáo, **tra cứu đối tượng** (SĐT / số tài khoản / link đã bị báo cáo chưa), nhận việc và xử lý báo cáo theo luồng trạng thái, lọc báo cáo **giao cho tôi**, xuất CSV, giao diện sáng / tối, **bản đồ điểm nóng toàn quốc** và **báo cáo thống kê có biểu đồ** (xem `CHANGELOG-BAN-DO-THONG-KE.md`), cùng **trang người dân tự gửi báo cáo không cần đăng nhập** tại `/bao-cao` (xem `CHANGELOG-CAP-NHAT-33.md`).

> Lưu ý bảo mật: file `nestjs/.env` chứa mật khẩu và khóa bí mật, **không được đưa lên GitHub** (đã có trong `.gitignore`). Xem `CHANGELOG-SUA-LOI.md`.
