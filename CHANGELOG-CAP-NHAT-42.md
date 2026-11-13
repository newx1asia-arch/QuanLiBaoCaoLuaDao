# Cập nhật 42: Thẻ "Tổng báo cáo" không còn báo giảm sai đầu tháng

Vấn đề: thẻ "Tổng báo cáo" so số báo cáo của tháng đang diễn ra (chưa hết) với cả tháng trước. Ngày 10 của tháng, tháng này mới có 10 ngày nên gần như luôn hiện "giảm" mạnh dù tình hình không đổi.

## Đã sửa (chỉ `giaodien/src/pages/Dashboard.jsx`)
- Chỉ hiện phần trăm khi tháng này đã vượt tháng trước (tăng thật, dù tháng chưa hết).
- Các trường hợp còn lại hiện số báo cáo của hai tháng, ví dụ "3 báo cáo tháng này · tháng trước 12". Không còn hiện phần trăm giảm.

## Cách kiểm tra
Ctrl+F5 ở Bảng điều hành, nhìn dòng dưới số "Tổng báo cáo".
