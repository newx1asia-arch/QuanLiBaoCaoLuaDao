# Cập nhật 21: Tìm kiếm bằng ký tự chỉ có dấu câu trả về toàn bộ dữ liệu

Lỗi: ô tìm kiếm ở Danh sách báo cáo và Đối tượng nghi vấn so khớp thêm theo "khóa chuẩn hóa" (bỏ khoảng trắng, dấu chấm, gạch ngang, ngoặc). Gõ chỉ toàn các ký tự đó (vd `-`, `.`, `()`) thì khóa chuẩn hóa là chuỗi rỗng, câu `LIKE '%%'` khớp mọi dòng, nên kết quả là TẤT CẢ báo cáo / đối tượng thay vì những dòng có chứa ký tự đó.

## File đã sửa
- `nestjs/src/reports/reports.service.ts`, hàm `list()`: chỉ thêm điều kiện theo khóa chuẩn hóa khi khóa không rỗng.
- `nestjs/src/reports/monitor.service.ts`, hàm `suspects()`: tương tự (khóa rỗng thì chỉ so theo tên hiển thị).

## Không đổi
- Cách tìm khi từ khóa có chữ hoặc số (vd `0912 345 678` vẫn tìm ra `0912345678`), giao diện, CSDL.

## Cách kiểm tra
Ở Danh sách báo cáo gõ `-` hoặc `.`: chỉ hiện báo cáo có chứa ký tự đó trong tiêu đề, đối tượng hoặc tên người báo cáo (trước đây hiện tất cả). Gõ `0912 345 678` vẫn ra báo cáo lưu `0912345678`.
Chưa chạy `tsc` (môi trường không có `node_modules`).
