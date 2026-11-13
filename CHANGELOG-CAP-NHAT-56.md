# Cập nhật 56: Dọn dự án và thêm Swagger

## Dọn dẹp
- Xóa `giaodien/.env.example`: giao diện không cần file env, biến `VITE_API_URL` đặt thẳng trên Vercel (khi chạy máy mình mặc định đã trỏ về http://localhost:3000/api). Mục này thay thế dòng "giaodien/.env.example (mới)" ở cập nhật 55.
- Xóa thư mục `nestjs/postman` và bỏ hướng dẫn Postman trong `nestjs/README.md`.
- `.gitignore`: thêm `*.pem` (không để lộ chứng chỉ CA). `node_modules/` và `dist/` đã được bỏ qua ở cả `giaodien` lẫn `nestjs` từ trước, nên không bị đẩy lên GitHub; Vercel và Render tự chạy `npm install` khi build.

## Swagger (tài liệu API)
- `nestjs/src/main.ts`: thêm `setupSwagger()`, mở tại `/api/docs`, có nút Authorize (Bearer token), nhớ token khi tải lại trang, tự gom nhóm API theo tài nguyên.
- Nạp động: chưa cài `@nestjs/swagger` thì server vẫn chạy bình thường, chỉ báo cảnh báo. Cài bằng: `cd nestjs` rồi `npm i @nestjs/swagger`.
- Mặc định bật khi phát triển, tắt khi production (`SWAGGER_ENABLED=true` để bật).
- Không cần thêm decorator `@Api...` vào từng controller để Swagger chạy. Phần mô tả trường dữ liệu của các DTO sẽ đầy đủ hơn khi bật plugin Swagger của Nest CLI (bước riêng, làm sau khi đã cài thư viện).
