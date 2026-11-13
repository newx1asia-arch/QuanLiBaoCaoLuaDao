# Cập nhật 58: Swagger hiện đầy đủ cấu trúc kết quả của API Báo cáo

Mở `http://localhost:3000/api/docs`, nhóm **Báo cáo**: mỗi API giờ có mẫu kết quả (Example Value / Schema) và mục **Schemas** ở cuối trang liệt kê các mẫu, giống Swagger Petstore.

## Đã làm
- `nestjs/src/reports/dto/report-response.dto.ts` (mới): các lớp mô tả kết quả trả về, chỉ dùng cho Swagger:
  `ReportListResponseDto` (trang danh sách: `items`, `total`, `counts`), `ReportDetailDto` (chi tiết báo cáo kèm `lichSu`, `lienQuan`, `soBaoCaoCungDoiTuong`),
  `ReportItemDto`, `ReportRecordDto`, `ReportHistoryDto`, `DeletedResponseDto`.
- `nestjs/src/reports/reports.controller.ts`: gắn các lớp trên vào `@ApiOkResponse` / `@ApiCreatedResponse` của
  `GET /reports`, `GET /reports/:id`, `POST /reports`, `PATCH /reports/:id`, `DELETE /reports/:id`.
- Không đổi logic xử lý, đường dẫn, quy tắc kiểm tra hay dữ liệu API trả về.

## Cần làm khi nhận bản này
- `package-lock.json` trong `nestjs` của bản zip chưa có `@nestjs/swagger` (dù `package.json` đã khai báo). Chạy `npm install` trong thư mục `nestjs`, rồi đẩy cả `package.json` lẫn `package-lock.json` lên GitHub (Render dùng `npm ci` nên hai file phải khớp).
- `main.ts` trong bản này đã gọn: chỉ gọi `setupSwagger(app)` từ `common/swagger.ts`. Nếu `main.ts` trên máy bạn còn dòng `@Api` lẻ loi (gõ dở) hoặc đoạn `setupSwagger` viết thẳng trong file, hãy chép đè bằng `main.ts` của bản này.

## Chưa làm (sẽ làm từng bước ở các lần sau)
- Mẫu kết quả cho nhóm Tra cứu, Thống kê, Đối tượng nghi vấn, Cảnh báo.
- Các chỗ sai logic nhỏ đã tìm thấy khi đọc code (xem danh sách trong tin nhắn trả lời).
- Chưa chạy build được trong môi trường soạn (không có mạng): mới kiểm tra cú pháp bằng trình biên dịch TypeScript. Hãy chạy `npm run build` rồi `npm run start:dev` để thử.
