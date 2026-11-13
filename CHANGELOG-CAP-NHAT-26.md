# Cập nhật 26: Thiếu file `nestjs/.env.example`

Lỗi: `README.md` và `nestjs/README.md` hướng dẫn "sao chép `.env.example` thành `.env`" nhưng file này không có trong dự án (`.gitignore` đã chặn `.env`, còn `.env.example` chưa bao giờ được thêm). Người mới cài không biết phải điền những biến nào.

## File thêm
- `nestjs/.env.example`: liệt kê mọi biến môi trường backend đang đọc (`PORT`, `CORS_ORIGIN`, `NODE_ENV`, `TRUST_PROXY`, `DB_*`, `JWT_SECRET`, `JWT_EXPIRES_HOURS`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SMTP_*`, `SEED_DEMO`), kèm chú thích. Các biến tùy chọn để dạng chú thích (bỏ `#` khi cần dùng).

## Không đổi
- Mã nguồn, giao diện, CSDL. File `.env` thật của bạn không bị đụng tới.

## Cách kiểm tra
`cd nestjs`, `cp .env.example .env` (Windows: `copy .env.example .env`), điền `JWT_SECRET`, `ADMIN_PASSWORD` và thông tin MySQL, rồi `npm run start:dev`.
