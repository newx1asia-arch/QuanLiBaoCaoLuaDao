# Cập nhật 3: `GET /api/stats` không còn đọc toàn bộ báo cáo

Lỗi / hạn chế: menu bên trái gọi `/api/stats` mỗi lần đổi trang (để lấy số trên huy hiệu), và API này tải mọi báo cáo (kể cả mô tả dài) vào bộ nhớ rồi mới đếm. Càng nhiều báo cáo càng chậm, tốn RAM và tốn băng thông cho mỗi lần bấm menu.

## File đã sửa
- `nestjs/src/reports/reports.service.ts`: hàm `stats()` viết lại bằng truy vấn tổng hợp MySQL (`COUNT`, `SUM`, `GROUP BY`, `HAVING`). Chỉ còn tải về: danh sách "cần xử lý gấp", 5 báo cáo mới nhất, và cột ngày tạo của báo cáo trong ~13 tháng gần nhất để gom theo tháng (giờ Việt Nam).

## Dạng dữ liệu trả về: giữ nguyên, giao diện không phải sửa
`tong, choXuLy, dangXacMinh, daXacNhan, tongThietHai, byType, byMonth, canXuLyGap, soDoiTuongNghiVan, lapLai, moiNhat`.

## Khác biệt nhỏ
- `lapLai` (đối tượng bị báo cáo từ 2 lần trở lên) giờ tối đa 10 dòng (trước: không giới hạn; trang đã có nút "Xem tất cả" sang Đối tượng nghi vấn). Thứ tự: nhiều lần nhất trước, bằng nhau thì mới nhất trước.
- Cách tính giữ như cũ: `tong` và `tongThietHai` gồm cả báo cáo bị từ chối; báo cáo xóa mềm không tính.

## Cách kiểm tra
Mở Bảng điều hành và so các số (tổng, chờ xử lý, đã xác nhận, tổng thiệt hại, biểu đồ loại, "Cần xử lý gấp", "Đối tượng bị báo cáo nhiều lần") với trước khi cập nhật: phải khớp. Huy hiệu menu vẫn hiện đúng số.
Đã kiểm tra: `tsc --noEmit` sạch và xem câu SQL sinh ra (đều có `xoaLuc IS NULL`). Chưa chạy với MySQL thật vì môi trường này không cài được MySQL.
