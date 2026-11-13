# Cập nhật 20: Nút "Trước / Sau" ở Người dùng và Đối tượng nghi vấn nhảy trang sai khi bấm nhanh

Lỗi: cùng lỗi đã sửa ở Danh sách báo cáo (cập nhật 14) nhưng hai trang này còn sót. Nút chuyển trang tính trang mới từ bộ lọc `f` đã chụp lúc vẽ giao diện (`setF({ ...f, page: f.page + 1 })`).
1. Bấm hai lần liên tiếp trước khi giao diện kịp vẽ lại thì cả hai lần cùng tính từ trang cũ, nên chỉ sang được 1 trang thay vì 2.
2. Nếu bấm đúng lúc ô tìm kiếm vừa hết thời gian chờ 350 ms (đang cập nhật từ khóa), bộ lọc cũ được ghi đè lên từ khóa mới: từ khóa vừa gõ bị mất, danh sách quay về kết quả cũ.

## File đã sửa
- `giaodien/src/pages/Users.jsx`: hai nút chuyển trang dùng dạng cập nhật theo giá trị mới nhất (`setF((p) => ...)`), trang luôn nằm trong khoảng 1 đến tổng số trang.
- `giaodien/src/pages/Suspects.jsx`: sửa tương tự.

## Không đổi
- Backend, dữ liệu, giao diện nhìn bên ngoài, các bộ lọc khác.

## Cách kiểm tra
Mở trang Người dùng (hoặc Đối tượng nghi vấn) có từ 3 trang trở lên, bấm nhanh "Sau →" hai lần: phải sang trang 3 (trước đây đứng ở trang 2). Bấm "← Trước" ở trang 1 hoặc "Sau →" ở trang cuối: không đổi trang.
Chưa chạy `vite build` (môi trường không có `node_modules`).
