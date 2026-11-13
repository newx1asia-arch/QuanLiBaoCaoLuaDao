# Bổ sung: Bản đồ điểm nóng toàn quốc và Báo cáo thống kê

## Cách xem thử nhanh

1. Thêm dòng `SEED_DEMO=true` vào `nestjs/.env`, khởi động lại backend (`npm run start:dev`). Backend nạp 160 báo cáo mẫu rải khắp các tỉnh, thành, trải trong 6 tháng.
2. Chạy giao diện (`npm run dev` trong `giaodien/`), đăng nhập, xem: **Bảng điều hành** (có thẻ bản đồ), **Bản đồ điểm nóng** (`/hotspots`), **Báo cáo thống kê** (`/statistics`).
3. Dùng thật: xóa dữ liệu mẫu bằng `nestjs/sql/xoa-du-lieu-mau.sql` và bỏ dòng `SEED_DEMO`.

## Giao diện (`giaodien/`)

- **Thẻ "Bản đồ điểm nóng toàn quốc"** trên Bảng điều hành (`components/HotspotMapCard.jsx`): bản đồ + khung chi tiết địa bàn đang chọn (báo cáo 24 giờ, so với hôm qua, đang xử lý, thiệt hại, hình thức phổ biến, nút "Xem báo cáo địa bàn"). Tự làm mới mỗi phút, tạm dừng khi tab bị ẩn.
- **Trang `/hotspots` "Bản đồ điểm nóng"** (`pages/Hotspots.jsx`): lọc theo 7 ngày đến 12 tháng và hình thức lừa đảo, xếp hạng địa bàn, hình thức nổi bật ở các điểm nóng, bảng số liệu 34 địa bàn, xuất CSV.
- **Trang `/statistics` "Báo cáo thống kê"** (`pages/Statistics.jsx`): 4 chỉ số có so sánh kỳ trước; biểu đồ đường xu hướng; biểu đồ tròn tình trạng xử lý và cơ cấu hình thức; cột chồng hình thức theo thời gian; xếp hạng tỉnh, thành; thiệt hại theo hình thức; bản đồ nhiệt khung giờ tiếp nhận; mức ưu tiên; đối tượng bị báo cáo nhiều. Có nút xuất CSV và in báo cáo.
- Bản đồ và biểu đồ vẽ bằng SVG thuần (`components/VietnamMap.jsx`, `components/Charts.jsx`), **không thêm thư viện nào**, không cần mạng. Hỗ trợ giao diện tối và bàn phím (Tab, Enter).
- Form tạo báo cáo có ô **Tỉnh, thành**; danh sách báo cáo có cột và bộ lọc **Địa bàn** (`?province=`); chi tiết báo cáo và file CSV xuất ra có thêm tỉnh, thành.
- Menu trái thêm "Bản đồ điểm nóng" và "Báo cáo thống kê".

## Backend (`nestjs/`)

- Báo cáo có thêm cột `tinhThanh` (tùy chọn, báo cáo cũ để trống). Danh sách 34 tỉnh, thành ở `reports.constants.ts`.
- `GET /api/stats/overview?days=&type=` (file mới `statistics.service.ts`, `dto/query-overview.dto.ts`). `GET /api/reports` nhận thêm `province`.
- `demo-seed.ts`: dữ liệu mẫu khi đặt `SEED_DEMO=true`.
- `sql/them-cot-tinh-thanh.sql` (production), `sql/xoa-du-lieu-mau.sql`. Postman có thêm request mới.

## Lưu ý

- **Đường viền bản đồ là hình giản lược để minh họa, không phải ranh giới hành chính chính thức.** Khi triển khai thật, hãy thay `VIEN_VN` trong `VietnamMap.jsx` bằng dữ liệu bản đồ do cơ quan có thẩm quyền cung cấp. Quần đảo Hoàng Sa, Trường Sa đã được thể hiện.
- Vị trí điểm là tâm gần đúng của từng tỉnh, thành sau sắp xếp (34 đơn vị). Nếu vẫn dùng 63 tỉnh, thành: sửa `TINH_THANH` ở cả hai nơi (backend và `giaodien/src/constants.js`) cho giống nhau.
- Mức "nóng" so sánh giữa các địa bàn trong cùng kỳ chọn, cần tối thiểu 2 đến 3 báo cáo mới lên mức cao, để một vụ lẻ không gây báo động.
- Báo cáo cũ chưa có tỉnh, thành không hiện trên bản đồ; số lượng được ghi ở dòng "báo cáo chưa ghi địa bàn", bấm vào để xem và bổ sung.
- Thống kê tính theo thời điểm tiếp nhận, giờ Việt Nam (UTC+7), không tính báo cáo đã xóa mềm.
