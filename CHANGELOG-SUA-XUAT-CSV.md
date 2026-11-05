# Sửa lỗi xuất CSV bị dồn vào một cột

## Nguyên nhân
File CSV dùng dấu phẩy để ngăn cách các cột. Máy Windows tiếng Việt mặc định dùng dấu chấm phẩy (;), nên Excel/WPS không tách cột và dồn cả hàng vào cột A.

## Đã sửa
- `giaodien/src/services/exportCsv.js`: thêm dòng đầu `sep=,` để Excel/WPS tách cột đúng. Áp dụng cho cả 3 chỗ xuất: Danh sách báo cáo, Bản đồ điểm nóng, Thống kê.
