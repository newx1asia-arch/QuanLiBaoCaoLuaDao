# Cập nhật 59: Swagger hiện đầy đủ cấu trúc kết quả của Tra cứu và Đối tượng nghi vấn

## Đã làm
- `nestjs/src/reports/dto/suspect-response.dto.ts` (mới): mẫu kết quả cho `GET /lookup`, `GET /suspects`, `GET /suspects/detail`.
- `nestjs/src/reports/lookup.controller.ts` và `suspects.controller.ts`: gắn mẫu kết quả vào `@ApiOkResponse`.
- Không đổi logic xử lý, đường dẫn hay dữ liệu API trả về.

## Chưa làm
- Mẫu kết quả cho `GET /monitor`, nhóm Thống kê và nhóm Cảnh báo.
- Các chỗ logic nhỏ đã liệt kê ở tin nhắn trước.
