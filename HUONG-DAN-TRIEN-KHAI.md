# Hướng dẫn triển khai: Aiven (MySQL) + Render (nestjs) + Vercel (giaodien)

Thứ tự nên làm: **Aiven → Render → Vercel → quay lại Render sửa CORS_ORIGIN**.

## 1. Aiven: MySQL
1. Tạo dịch vụ MySQL (gói free nếu có), chờ trạng thái *Running*.
2. Ở trang dịch vụ, lấy: **Host, Port, User, Password, Database** (mặc định `defaultdb`). Port của Aiven không phải 3306.
3. Tải file **CA certificate** (`ca.pem`), mở bằng Notepad để copy toàn bộ nội dung.
4. Mục *Allowed IP addresses*: để mở (0.0.0.0/0) hoặc thêm IP của Render (gói free của Render đổi IP nên thường phải để mở).

## 2. Render: backend (thư mục `nestjs`)
Cách nhanh: **New → Blueprint** → chọn repo; Render đọc file `render.yaml` ở thư mục gốc. Hoặc tạo **Web Service** thủ công:

| Mục | Giá trị |
|---|---|
| Root Directory | `nestjs` |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm run start:prod` |
| Health Check Path | `/api/health` |

Biến môi trường (Environment):

| Biến | Giá trị |
|---|---|
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `22` |
| `JWT_SECRET` | chuỗi ngẫu nhiên dài (Blueprint tự sinh) |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASS` / `DB_NAME` | lấy từ Aiven |
| `DB_SSL` | `true` |
| `DB_SSL_CA` | dán nội dung `ca.pem` |
| `DB_SYNC` | `true` ở **lần chạy đầu** (xem bên dưới) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | tài khoản quản trị đầu tiên (mật khẩu ≥ 8 ký tự, có chữ và số) |
| `CORS_ORIGIN` | địa chỉ Vercel, điền sau ở bước 4 |

**Về `DB_SYNC`:** database Aiven mới chưa có bảng nào. Production mặc định tắt tự tạo bảng nên lần đầu phải đặt `DB_SYNC=true`. Khi log báo chạy xong và đăng nhập được, đổi thành `false` rồi deploy lại để backend không tự sửa cấu trúc bảng nữa.

Kiểm tra: mở `https://<ten-dich-vu>.onrender.com/api/health` phải thấy `{"status":"ok",...}`.

## 3. Vercel: giao diện (thư mục `giaodien`)
1. **Add New → Project** → chọn repo, **Root Directory** = `giaodien` (Vercel tự nhận Vite).
2. Environment Variables: `VITE_API_URL` = `https://<ten-dich-vu>.onrender.com/api` (có `/api`, không có `/` cuối).
3. Deploy. File `giaodien/vercel.json` đã có sẵn để tải lại trang (F5) ở đường dẫn như `/profile` không bị lỗi 404.

`VITE_API_URL` bị đóng cứng lúc build, nên sau này đổi địa chỉ backend phải **Redeploy** giao diện.

## 4. Quay lại Render: cho phép giao diện gọi API
Đặt `CORS_ORIGIN` = địa chỉ Vercel, ví dụ `https://quanlibaocaoluadao.vercel.app` (không có `/` cuối). Nhiều địa chỉ thì ngăn cách bằng dấu phẩy. Muốn cho cả các bản xem thử của Vercel: `https://*.vercel.app`.

## Lưu ý
- **Render gói free ngủ sau ~15 phút không có người dùng**; lần gọi đầu có thể chậm vài chục giây.
- **Render gói free chặn cổng SMTP (25/465/587)** từ 26/9/2025, nên tính năng "quên mật khẩu bằng email" không gửi được. Quản trị viên dùng chức năng *Đặt lại mật khẩu* ở trang Người dùng, hoặc nâng cấp gói trả phí, hoặc dùng dịch vụ gửi mail qua HTTP API.
- **Không đưa file `.env` và `ca.pem` lên GitHub.** `.env` đã nằm trong `.gitignore`; hãy thêm `*.pem` nếu bạn lưu file CA trong thư mục dự án.
- Swagger (`/api/docs`) mặc định tắt trên production vì ai cũng xem được danh sách API. Muốn mở thì đặt `SWAGGER_ENABLED=true` trên Render, và phải đã chạy `npm i @nestjs/swagger` rồi đẩy cả `package.json` lẫn `package-lock.json` lên GitHub (Render dùng `npm ci` nên hai file này phải khớp nhau).
- Dữ liệu mẫu (`SEED_DEMO`) không nên bật trên bản thật.

## Xử lý lỗi thường gặp
- **Trang đăng nhập báo "Không kết nối được máy chủ"**: mở F12 → Console. Nếu thấy `POST http://localhost:3000/... ERR_CONNECTION_REFUSED` nghĩa là bản build không có `VITE_API_URL`. Từ bản này `giaodien/.env.production` đã chứa địa chỉ API mặc định; nếu đổi backend sang địa chỉ khác, sửa file đó hoặc đặt `VITE_API_URL` trên Vercel, rồi **Redeploy**.
- **Lỗi CORS** (`blocked by CORS policy`): kiểm tra `CORS_ORIGIN` trên Render đúng địa chỉ Vercel, không có `/` cuối, rồi deploy lại backend.
- **Vercel đang ở trạng thái Rollback**: domain chính vẫn chạy bản cũ cho tới khi bấm *Promote to Production* ở bản deploy mới.
- **Không đưa mật khẩu thật vào `.env.example`**: file này được đưa lên GitHub, chỉ để giá trị mẫu. Mật khẩu thật chỉ đặt trong `.env` (cục bộ) hoặc Environment của Render.

## Trợ lý AI của Trung tâm hỗ trợ
1. Chạy `nestjs/sql/them-bang-truc-ban.sql` trên Aiven (Aiven console → Quick connect, hoặc dùng công cụ MySQL bất kỳ), hoặc đặt `DB_SYNC=true` một lần rồi đổi lại `false`.
2. Lấy khóa Gemini ở https://aistudio.google.com/apikey, thêm biến `GEMINI_API_KEY` trong Render → Environment, rồi Save (Render tự deploy lại).
3. Trên giao diện: vào *Trung tâm hỗ trợ* (`/ho-tro`), chọn khu vực. Khu vực không ai bấm "Bắt đầu ca trực" thì khung chat AI xuất hiện.
- Lỗi `404 ... model is no longer available to new users`: Google đã ngừng cấp model cũ cho tài khoản mới. Đặt biến `GEMINI_MODEL` trên Render sang model mới (mặc định hiện là `gemini-3.8-flash`).
