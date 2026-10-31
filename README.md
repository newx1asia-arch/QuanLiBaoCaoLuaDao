# QuanLiBaoCaoLuaDao

Hệ thống quản lý báo cáo lừa đảo: người dân đăng ký tài khoản để gửi và theo dõi báo cáo, cán bộ xử lý, quản trị viên quản lý người dùng.

- `nestjs/` — API (NestJS + MySQL), xem hướng dẫn cài đặt, đăng nhập và phân quyền trong `nestjs/README.md`
- `giaodien/` — giao diện (React + Vite): `npm install` rồi `npm run dev` (http://localhost:5173)

Chạy lần đầu: tạo database, sao chép `nestjs/.env.example` thành `nestjs/.env`, chạy backend, rồi đăng nhập bằng tài khoản admin mặc định được ghi trong README của backend.

Chức năng chính: đăng ký / đăng nhập / quên mật khẩu (mã 6 số qua email), phân quyền người dân - cán bộ - quản trị viên, quản lý người dùng, hồ sơ cá nhân, **tra cứu đối tượng** (SĐT / số tài khoản / link đã bị báo cáo chưa), lọc báo cáo **giao cho tôi**, xuất CSV, giao diện sáng / tối.
