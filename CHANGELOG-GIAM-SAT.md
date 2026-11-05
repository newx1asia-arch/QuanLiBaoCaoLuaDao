# Bổ sung: Đối tượng nghi vấn và Giám sát trực tiếp

Mọi số liệu đều tính từ báo cáo và lịch sử xử lý đã có trong CSDL, không thêm bảng mới nên không cần di chuyển dữ liệu.

## Giao diện (`giaodien/`)

- **Bảng điều hành**: thêm khối "Giám sát trực tiếp" (`components/LiveMonitor.jsx`) nằm trên các ô chỉ số:
  - Huy hiệu GIÁM SÁT TRỰC TIẾP, "Cập nhật X giây trước", tự tải lại mỗi 15 giây, tạm dừng khi tab bị ẩn, báo "Mất kết nối" khi mất mạng.
  - Cảnh báo chiến dịch nổi bật: hình thức lừa đảo có nhiều báo cáo nhất trong 30 ngày qua (tối thiểu 2 báo cáo).
  - Quy trình đang giám sát: Chờ tiếp nhận → Đang xác minh → Đã xác nhận → Từ chối, bấm vào để mở danh sách báo cáo theo trạng thái.
  - Tiến độ ứng phó (vòng tròn %), số báo cáo đã kết luận, số cán bộ phụ trách.
  - Nút "Mở hồ sơ cảnh báo": mức cảnh báo, phạm vi ảnh hưởng, trạng thái, đối tượng nổi bật, dòng thời gian diễn biến xử lý, nút mở danh sách báo cáo liên quan.
- **Trang mới `/suspects` "Đối tượng nghi vấn"** (`pages/Suspects.jsx`): danh sách SĐT / số tài khoản / link bị báo cáo, lọc theo mức độ và loại đối tượng, tìm kiếm, phân trang, bấm vào để xem hồ sơ và các báo cáo liên quan.
- Menu bên trái có mục "Đối tượng nghi vấn" kèm số lượng. Trên điện thoại, mục "Nghi vấn" thay chỗ "Tra cứu" (thanh dưới tối đa 5 mục); vẫn vào Tra cứu được từ trang Đối tượng nghi vấn.
- Danh sách báo cáo nhận thêm bộ lọc `?type=` trên địa chỉ. `Modal` có thêm tuỳ chọn `wide`.

## Backend (`nestjs/`)

- `GET /api/suspects`, `GET /api/suspects/detail?q=`, `GET /api/monitor` (file mới: `suspects.controller.ts`, `monitor.service.ts`, `monitor.logic.ts`, `dto/query-suspect.dto.ts`).
- `GET /api/stats` thêm trường `soDoiTuongNghiVan`.
- Quy tắc mức độ "nguy hiểm" (đã được xác nhận, hoặc từ 3 người khác nhau cùng báo cáo) chuyển vào `reports.constants.ts` để Tra cứu và Đối tượng nghi vấn dùng chung một quy tắc.
- Postman và `nestjs/README.md` có thêm 3 API mới.

## Lưu ý khi xem thử

- Khối cảnh báo chỉ hiện chiến dịch khi có từ 2 báo cáo cùng hình thức lừa đảo trong 30 ngày. Nếu chưa có, khối hiển thị trạng thái "Chưa phát hiện chiến dịch nổi bật". Hãy tạo vài báo cáo cùng loại (ví dụ "Giả danh") để thấy đầy đủ.
- "Phạm vi ảnh hưởng" tính theo số đối tượng và số người báo cáo. CSDL hiện chưa lưu tỉnh/thành nên chưa có phạm vi địa lý như bản thiết kế Figma.
