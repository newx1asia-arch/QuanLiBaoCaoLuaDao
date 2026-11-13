# Cập nhật 55: Chuẩn bị triển khai Vercel (giaodien) + Render (nestjs) + Aiven (MySQL)

## Backend (nestjs)
- `app.module.ts`: hỗ trợ MySQL có SSL (`DB_SSL`, `DB_SSL_CA` hoặc `DB_SSL_CA_PATH`) vì Aiven bắt buộc mã hóa; thêm `DB_POOL` (mặc định 10 kết nối) và `DB_CONNECT_TIMEOUT_MS`.
- `main.ts`: `CORS_ORIGIN` nhận nhiều địa chỉ (ngăn cách dấu phẩy), tự bỏ dấu `/` cuối, hỗ trợ `*` (vd `https://*.vercel.app`); cache preflight 1 ngày; tự đặt `TRUST_PROXY=1` khi chạy trên Render; lắng nghe `0.0.0.0`; bật dừng êm (shutdown hooks).
- `health.controller.ts` (mới): `GET /api/health` không cần đăng nhập, không chạm DB, dùng làm Health Check của Render.
- `.env.example`: bổ sung các biến mới và ghi chú.
- `package.json`: thêm `engines` (Node ≥ 20.19).

## Giao diện (giaodien)
- `vercel.json` (mới): chuyển mọi đường dẫn về `index.html` để F5 ở `/profile`, `/reports`... không bị 404; thêm vài header bảo mật.
- `.env.example` (mới): hướng dẫn biến `VITE_API_URL`.
- `package.json`: thêm `engines`.

## Gốc dự án
- `render.yaml` (mới): Blueprint cho Render (build có `--include=dev` vì `nest build` cần devDependencies).
- `HUONG-DAN-TRIEN-KHAI.md` (mới): hướng dẫn từng bước Aiven → Render → Vercel.
- `.gitignore`: thêm `.env.local`.

## Cần biết
- Database Aiven mới chưa có bảng: lần chạy đầu phải đặt `DB_SYNC=true`, xong đổi về `false`.
- Render gói free chặn cổng SMTP nên không gửi được email quên mật khẩu.
- Chưa chạy `npm run build` được trong môi trường soạn (không có mạng), hãy chạy thử `npm run build` ở cả hai thư mục trước khi đẩy lên GitHub.
