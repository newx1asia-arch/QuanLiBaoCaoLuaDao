# Cập nhật 11: Đổi khoảng trắng trong tên người báo cáo là được tính thành "người khác"

Lỗi: mức "nguy hiểm" của đối tượng dựa trên số NGƯỜI báo cáo khác nhau (từ 3 người), được tính bằng `LOWER(TRIM(nguoiBaoCao))`. Chỉ cắt khoảng trắng hai đầu, nên "Nguyễn Văn A" và "Nguyễn  Văn A" (hai dấu cách ở giữa), hoặc cùng một tên gõ bằng hai kiểu mã hóa dấu tiếng Việt, bị đếm là hai người. Một người nhập 3 báo cáo cùng đối tượng, mỗi lần đổi khoảng trắng một chút, là tự dựng được cảnh báo "nguy hiểm". Kiểm tra báo cáo trùng khi tạo mới cũng lọt vì lý do tương tự.

## File đã sửa
- `nestjs/src/reports/dto/create-report.dto.ts`: tên người báo cáo được gộp khoảng trắng liên tiếp thành một và chuẩn hóa NFC trước khi kiểm tra và lưu.

## Không đổi
- API, giao diện, CSDL, cách đếm ở Tra cứu / Đối tượng nghi vấn / Giám sát.

## Lưu ý
- Chỉ áp dụng cho báo cáo tạo từ nay. Báo cáo cũ đã lưu tên lệch khoảng trắng giữ nguyên (không tự sửa dữ liệu cũ).

## Cách kiểm tra
Tạo 2 báo cáo cùng đối tượng, tên "Trần Thị B" và "Trần   Thị B" (nhiều dấu cách), khác ngày: ở Tra cứu, số người báo cáo phải là 1 chứ không phải 2. Tạo lại đúng báo cáo cũ nhưng thêm dấu cách trong tên cùng ngày: phải báo trùng (409).
Chưa chạy `tsc` (môi trường không có `node_modules`); thay đổi chỉ gồm một hàm Transform đơn giản.
