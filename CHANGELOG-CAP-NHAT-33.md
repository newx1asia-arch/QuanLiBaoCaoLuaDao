# Cập nhật 33: Trang người dân tự gửi báo cáo, không cần đăng nhập

Trước đây chỉ cán bộ đăng nhập mới lập được báo cáo (cán bộ nhập hộ người dân). Nay người dân vào trang `/bao-cao` tự điền và gửi, không cần tài khoản.

## Cách hoạt động
- Người dân mở `/bao-cao` (có nút "Gửi báo cáo lừa đảo" ở trang `/canh-bao` và liên kết ở trang đăng nhập), điền form, gửi. Màn hình báo thành công kèm mã tiếp nhận dạng `BC-2611-0042`.
- Báo cáo vào danh sách của cán bộ ở trạng thái "Chờ xử lý", chưa ai phụ trách, có nhãn "Người dân gửi". Cán bộ nhận xử lý, xác minh như báo cáo thường. Lịch sử ghi "Người dân (gửi trực tuyến)".
- Họ tên và thông tin liên hệ (tùy chọn) của người dân chỉ cán bộ đăng nhập xem được.

## Bảo vệ API công khai
- `POST /api/public/reports` là API duy nhất mở cho khách và chỉ cho gửi mới. Trả về chỉ gồm `{ id, ngayTao }`.
- Giới hạn 10 báo cáo / giờ / IP, ô bẫy chống bot, từ chối báo cáo trùng (cùng đối tượng, cùng họ tên, cùng ngày) mà không nêu số báo cáo đã có.
- Dùng lại toàn bộ quy tắc kiểm tra của báo cáo cán bộ (độ dài, ngày không ở tương lai, loại, tỉnh, thành).

## File mới
- `giaodien/src/pages/PublicReport.jsx`, `giaodien/src/public-report.css`: trang `/bao-cao`.
- `nestjs/src/reports/public-reports.controller.ts`, `nestjs/src/reports/dto/create-public-report.dto.ts`: API công khai.
- `nestjs/sql/them-cot-kenh-lien-he.sql`: thêm cột khi chạy production với `DB_SYNC=false`.

## File đã sửa
- Backend: `reports.constants.ts` (hằng KENH), `entities/report.entity.ts` (cột `kenh`, `lienHe`), `dto/query-report.dto.ts` (lọc `kenh`), `reports.service.ts` (`createPublic`, giới hạn theo IP, `insert` nhận thêm kênh), `reports.module.ts`, `nestjs/README.md`, file Postman (thêm request công khai).
- Giao diện: `App.jsx` (route `/bao-cao`), `services/reportApi.js`, `pages/PublicAlerts.jsx` (nút gửi báo cáo), `pages/Login.jsx` (liên kết), `pages/ReportList.jsx` (nhãn và bộ lọc "Người dân gửi"), `pages/ReportDetail.jsx` (nguồn, liên hệ), `services/exportCsv.js` (cột Nguồn), `dashboard-polish.css` (kiểu nhãn).

## Cần làm khi cập nhật
- Chạy phát triển: khởi động lại backend, bảng tự thêm 2 cột. Production (`DB_SYNC=false`): chạy `nestjs/sql/them-cot-kenh-lien-he.sql`.
- Chạy sau nginx: đặt `TRUST_PROXY=1` để giới hạn theo IP đúng từng người.

## Cách kiểm tra
Mở `http://localhost:5173/bao-cao` (không đăng nhập), gửi một báo cáo, ghi lại mã. Đăng nhập cán bộ, vào "Báo cáo": thấy báo cáo mới có nhãn "Người dân gửi"; tick "Người dân gửi" để lọc. Gửi lại đúng thông tin đó: báo đã tiếp nhận trước đó. Gửi hơn 10 lần trong 1 giờ: bị chặn.

## Chưa làm
- Chưa có tra cứu tình trạng báo cáo cho người dân, chưa đính kèm ảnh chụp màn hình, chưa có CAPTCHA (nếu bị spam nặng nên thêm).
