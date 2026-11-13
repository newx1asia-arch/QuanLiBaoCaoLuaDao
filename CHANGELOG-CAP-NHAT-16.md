# Cập nhật 16: Quản trị viên sửa bản nháp của người khác rồi tự duyệt cảnh báo

Lỗi: quy tắc "hai người xác nhận" chỉ kiểm tra người soạn GỐC (`nguoiSoanId`). Quản trị viên A có quyền sửa cảnh báo do người B soạn; A sửa nội dung, bấm gửi duyệt rồi tự duyệt và phát hành, vì A không phải người soạn gốc. Như vậy một mình A quyết định toàn bộ nội dung cảnh báo công khai, không ai kiểm tra.

## File đã sửa
- `nestjs/src/alerts/alerts.service.ts`: thêm `daThamGiaSoan()` (xem nhật ký: đã Soạn, Sửa hoặc Gửi duyệt cảnh báo này). Duyệt / từ chối bị chặn với người soạn gốc và với bất kỳ ai đã soạn, sửa hoặc gửi duyệt.
- `giaodien/src/pages/Alerts.jsx`: ẩn nút Duyệt / Từ chối và hiện dòng giải thích với cùng điều kiện, khớp backend.

## Không đổi
- Phân quyền sửa / xóa, luồng trạng thái, dạng dữ liệu API, CSDL. Duyệt hoặc từ chối ở các vòng trước (cảnh báo bị từ chối, sửa lại rồi gửi duyệt) không làm mất quyền duyệt của người đó nếu họ không sửa hay gửi duyệt lại.

## Lưu ý
- Hệ thống cần ít nhất hai quản trị viên để duyệt cảnh báo; nếu chỉ còn một quản trị viên thì cảnh báo do người đó đụng tới sẽ không ai duyệt được (như trước đây với cảnh báo do chính họ soạn).

## Cách kiểm tra
Dùng hai tài khoản admin A, B và một cán bộ C. C soạn cảnh báo (nháp). A sửa nội dung rồi gửi duyệt: A không còn nút Duyệt / Từ chối (gọi thẳng API sẽ nhận lỗi 403). B mở thì duyệt được.
Chưa chạy `tsc` và `vite build` (môi trường không có `node_modules`).
