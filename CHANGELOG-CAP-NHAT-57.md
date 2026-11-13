# Cập nhật 57: Tài liệu Swagger đầy đủ cho toàn bộ API

Mở `http://localhost:3000/api/docs` (bản thật: đặt `SWAGGER_ENABLED=true`).

## Đã làm
- `@nestjs/swagger` (^12) trở thành thư viện chính thức trong `nestjs/package.json`, không còn nạp động. Sau khi chép file mới, chạy `npm install` trong `nestjs` để cập nhật `package-lock.json`, rồi đẩy cả hai file lên GitHub (Render dùng `npm ci` nên hai file phải khớp).
- `common/swagger.ts` (mới): cấu hình Swagger tập trung (tiêu đề, mô tả cách dùng, nút Authorize kiểu Bearer JWT, 10 nhóm có mô tả) và các decorator dùng chung (`ApiLogin` gắn ổ khóa + lỗi 401/403, `ApiNotFound`, `ApiConflict`, `ApiRateLimited`).
- Mọi controller có `@ApiTags`, `@ApiOperation` (tóm tắt + mô tả luật nghiệp vụ), `@ApiParam`, mã lỗi và kiểu kết quả. API cần đăng nhập có ổ khóa như Swagger Petstore; API công khai (đăng nhập, quên mật khẩu, gửi báo cáo công khai, cảnh báo công khai, health) không có ổ khóa.
- Mọi DTO (đăng nhập, người dùng, báo cáo, tra cứu, thống kê, cảnh báo) có `@ApiProperty` với mô tả tiếng Việt, ví dụ, danh sách giá trị cho phép và giới hạn độ dài, nên các ô nhập và tham số lọc hiện đầy đủ trên giao diện thử.
- `auth/dto/auth-response.dto.ts` (mới): mẫu kết quả cho đăng nhập, người dùng, danh sách người dùng.
- Không đổi logic xử lý, đường dẫn hay quy tắc kiểm tra dữ liệu của API.

## Chưa làm
- Kết quả trả về của báo cáo, thống kê, cảnh báo, đối tượng nghi vấn mới chỉ có mô tả chữ, chưa có mẫu cấu trúc từng trường (vì dịch vụ trả về nhiều dạng dữ liệu tự dựng). Muốn đầy đủ hơn cần khai báo thêm các lớp kết quả.
- Chưa chạy build được trong môi trường soạn (không có mạng): chỉ kiểm tra cú pháp bằng trình biên dịch TypeScript. Hãy chạy `npm run build` rồi `npm run start:dev` để thử.
