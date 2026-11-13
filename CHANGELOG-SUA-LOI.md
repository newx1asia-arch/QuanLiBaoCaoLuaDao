# Các thay đổi trong bản sửa này

## Bảo mật (cần làm ngay)

- File `nestjs/.env` (mật khẩu MySQL, mật khẩu admin, `JWT_SECRET`) đang nằm trong bản zip, nên nhiều khả năng đã bị đưa lên GitHub. `.gitignore` chỉ có tác dụng với file chưa từng được commit. Hãy:
  1. Đổi mật khẩu MySQL, mật khẩu admin và tạo `JWT_SECRET` mới.
  2. Chạy `git rm --cached nestjs/.env` rồi commit. Nếu repo công khai, coi các giá trị cũ là đã lộ (xóa khỏi file thôi chưa đủ vì còn trong lịch sử commit).
- Đã thêm `nestjs/.env.example` và `giaodien/.env.example` (không chứa giá trị thật). README cũ nhắc tới file này nhưng nó chưa hề có.

## Lỗi và logic sai đã sửa

**Giao diện không khớp với backend**
- Backend đã bỏ đăng ký công khai và vai trò người dân, nhưng giao diện vẫn còn trang Đăng ký (gọi API không tồn tại), nút "Đăng ký" ở trang Đăng nhập, vai trò "Người dân" trong danh sách. Đã xóa hết, kèm code nhánh người dân không bao giờ chạy tới.
- Trang chi tiết báo cáo cho chọn mọi trạng thái, rồi để server từ chối. Nay chỉ hiện các trạng thái hợp lệ theo luồng, đòi lý do khi xác nhận / từ chối / mở lại (trước đây chỉ kiểm tra "từ chối"), cán bộ chưa phụ trách thấy nút "Nhận xử lý", cán bộ khác thấy lý do bị khóa thao tác.
- Giao diện không gửi `phienBan` nên cơ chế chặn hai người sửa cùng lúc ở backend không bao giờ hoạt động. Nay có gửi; bị 409 thì tự tải lại bản mới nhất.
- Nút xóa ghi "xóa vĩnh viễn" trong khi backend xóa mềm. Đã sửa câu chữ.

**Phân công cán bộ**
- Trước: phân công theo họ tên, trùng tên là bị từ chối. Nay phân công theo id (`canBoId`); `GET /users/staff` trả `[{ id, hoTen }]`.
- Đổi họ tên ở trang Hồ sơ thì tên trên các báo cáo đang phụ trách cũng đổi theo.

**Xử lý lỗi và hiển thị**
- Mọi phản hồi 404 bị trả về `null` ngầm, nên thao tác trên báo cáo vừa bị xóa gây lỗi "Cannot read properties of null". Nay lỗi được ném rõ ràng; mất kết nối cho thông báo dễ hiểu.
- Trang chi tiết: mở báo cáo liên quan thì không còn hiện tạm dữ liệu của báo cáo trước; mất mạng không còn bị báo nhầm là "không tìm thấy".
- Hộp thoại (Tạo tài khoản, Đặt lại mật khẩu) có thể tự đóng ngay khi mở ở chế độ dev (React StrictMode).
- Dashboard: "so với tháng trước" và biểu đồ so với tháng có báo cáo gần nhất chứ không phải tháng liền trước. Nay đủ 6 tháng liên tiếp, tháng trống là 0.
- Ngày xảy ra (YYYY-MM-DD) không còn bị lệch ngày do múi giờ khi hiển thị.
- Form tạo báo cáo: kiểm tra tiêu đề, ngày tương lai, số tiền ngay tại trình duyệt; ô ngày không cho chọn ngày tương lai.

**Danh sách và tìm kiếm**
- Sắp xếp theo thiệt hại / ngày xảy ra có nhiều dòng bằng nhau thì phân trang có thể lặp hoặc sót báo cáo. Nay luôn xếp thêm theo id.
- Tìm kiếm: gõ `%` hoặc `_` không còn bị hiểu là ký tự đại diện; gõ SĐT / STK có dấu cách ("0912 345 678") giờ tìm ra báo cáo đã lưu dạng "0912345678".
- Gõ tìm kiếm chờ 350 ms rồi mới gọi server, không gọi mỗi phím.
- Xuất CSV: lấy từng đợt 500 thay vì một yêu cầu 100000 dòng (giới hạn `pageSize` giờ là 500), tên file có ngày, tải ổn định hơn trên Firefox, báo lỗi nếu thất bại.

**Dọn dẹp**
- Xóa `register` thừa trong `auth.service.ts` (vẫn ghi vai trò `nguoi_dan` không còn tồn tại).
- Bỏ `tinhUuTien`, `normalizeTarget`, `isStaff` không dùng ở giao diện.
- `synchronize` của TypeORM: mặc định tắt khi `NODE_ENV=production` (đặt `DB_SYNC=true` để bật).
- README (gốc và backend) viết lại cho khớp hệ thống hiện tại; Postman bỏ request đăng ký, đổi PATCH sang `canBoId`.
- `.gitignore` thêm `dist/` và `*.tsbuildinfo`. Hai thứ này, cùng `node_modules`, không có trong zip này; `npm install` và `npm run build` sẽ tạo lại.

## Thay đổi API (nếu bạn có client khác ngoài giao diện này)

- `PATCH /api/reports/:id`: trường `canBo` (họ tên) được thay bằng `canBoId` (số; `null` = hủy phân công, chỉ admin).
- `GET /api/users/staff`: trả `[{ id, hoTen }]` thay vì mảng tên.
- `GET /api/reports`: `pageSize` tối đa 500.

## Chưa làm (để lần sau)

- `GET /api/stats` vẫn đọc toàn bộ báo cáo vào bộ nhớ rồi tính. Với vài nghìn báo cáo thì ổn; nhiều hơn nên chuyển sang truy vấn tổng hợp trong MySQL.
- Đếm đăng nhập sai và giới hạn tra cứu lưu trong bộ nhớ, mất khi khởi động lại và không dùng chung được nếu chạy nhiều bản backend.
- Chưa có test tự động và chưa dùng migration (đang dựa vào `synchronize`).

## Đã kiểm tra thế nào

Backend biên dịch sạch bằng `tsc`; đã chạy thử các DTO mới (`canBoId` nhận số, chuỗi số, `null`, từ chối chữ và số thập phân) và các hàm chuẩn hóa. Giao diện đã quét lỗi cú pháp và tên biến thiếu bằng trình kiểm tra của TypeScript. **Chưa chạy được với MySQL thật và chưa chạy `vite build`** trong môi trường này, nên hãy chạy thử các luồng sau: đăng nhập, nhận việc, đổi trạng thái đủ luồng, admin phân công / hủy, sửa cùng lúc từ hai trình duyệt (phải báo 409), tìm kiếm có dấu cách, xuất CSV.
