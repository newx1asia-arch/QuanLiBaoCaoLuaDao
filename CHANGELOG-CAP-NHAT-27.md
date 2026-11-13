# Cập nhật 27: "Xuất CSV" dùng từ khóa cũ nếu bấm ngay sau khi gõ

Lỗi: ở Danh sách báo cáo, bộ lọc từ khóa chỉ được áp dụng sau 350 ms ngừng gõ. Nút "Xuất CSV" lấy từ khóa từ bộ lọc đó (`f.keyword`), nên nếu bấm xuất ngay sau khi gõ thì file CSV ra theo từ khóa cũ (hoặc không có từ khóa) trong khi ô tìm kiếm đang hiện từ khóa mới.

## File đã sửa
- `giaodien/src/pages/ReportList.jsx`, hàm `exportCsv()`: truyền từ khóa đang gõ (`kw`) vào bộ lọc khi xuất.

## Không đổi
- Backend, các bộ lọc khác, nội dung và định dạng file CSV, danh sách đang hiển thị.

## Cách kiểm tra
Gõ một từ khóa ở ô tìm kiếm rồi bấm "Xuất CSV" ngay (trong chưa đầy 0,35 giây): file chỉ chứa báo cáo khớp từ khóa vừa gõ (trước đây ra theo từ khóa trước đó).
Chưa chạy `vite build` (môi trường không có `node_modules`).
