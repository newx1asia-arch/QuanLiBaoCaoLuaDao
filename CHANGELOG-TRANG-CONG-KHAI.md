# Trang cảnh báo công khai (không cần đăng nhập)

Địa chỉ: `http://localhost:5173/canh-bao`

## File mới
- `giaodien/src/pages/PublicAlerts.jsx`: trang công khai (liên kết "Dành cho cán bộ" nhỏ ở chân trang) hiển thị các cảnh báo đã phát hành qua kênh Website (tìm kiếm, lọc theo địa bàn và mức độ, xem thêm, sao chép nội dung, tự tải lại mỗi phút).
- `giaodien/src/public-alerts.css`: giao diện riêng của trang.

## File đã sửa
- `giaodien/src/App.jsx`: thêm route `/canh-bao` nằm ngoài khu vực yêu cầu đăng nhập.
- `giaodien/src/services/alertApi.js`: thêm `getPublicAlerts` gọi `GET /api/public/alerts` không kèm token.
- `giaodien/src/pages/Alerts.jsx`: thêm nút "Xem trang công khai".
- `giaodien/src/pages/Login.jsx`: thêm liên kết "Xem cảnh báo lừa đảo mới nhất" ở chân trang đăng nhập.

## Không đổi
Backend `nestjs` (API `/api/public/alerts` đã có sẵn).
