# Cập nhật 14: Nút "Trước / Sau" ở Danh sách báo cáo nhảy trang sai khi bấm nhanh

Lỗi: nút chuyển trang tính trang mới từ bộ lọc `f` đã chụp lúc vẽ giao diện (`setF({ ...f, page: f.page + 1 })`). Bấm hai lần liên tiếp trước khi giao diện kịp vẽ lại thì cả hai lần cùng tính từ trang cũ, nên chỉ sang được 1 trang thay vì 2. Ngoài ra nó có thể ghi đè một thay đổi bộ lọc vừa xảy ra xen giữa.

## File đã sửa
- `giaodien/src/pages/ReportList.jsx`: hai nút chuyển trang dùng dạng cập nhật theo giá trị mới nhất (`setF((p) => ...)`), trang luôn nằm trong khoảng 1 đến tổng số trang.

## Không đổi
- Backend, dữ liệu, giao diện nhìn bên ngoài, các bộ lọc khác.

## Cách kiểm tra
Mở Danh sách báo cáo có từ 3 trang trở lên, bấm nhanh "Sau →" hai lần: phải sang trang 3 (trước đây đứng ở trang 2). Bấm "← Trước" ở trang 1 hoặc "Sau →" ở trang cuối: không đổi trang.
Chưa chạy `vite build` (môi trường không có `node_modules`).
