# Cập nhật 43: Thẻ "Đang xử lý" và "Cần xử lý gấp" mở đúng danh sách

Vấn đề:
- Thẻ "Đang xử lý" ở Bảng điều hành cộng cả "chờ tiếp nhận" và "đang xác minh", nhưng bấm vào chỉ mở danh sách "chờ xử lý" nên số không khớp.
- Nút "Xem tất cả" của khối "Cần xử lý gấp" mở danh sách ưu tiên cao gồm cả báo cáo đã xác nhận hoặc từ chối, nên nhiều hơn số trong khối.

## Đã sửa
- `nestjs/src/reports/dto/query-report.dto.ts` và `reports.service.ts`: bộ lọc `status` nhận thêm giá trị `dang_xu_ly` = chờ xử lý + đang xác minh. Các giá trị cũ giữ nguyên.
- `giaodien/src/pages/ReportList.jsx`: thêm tab "Đang xử lý" (kèm số lượng) trước các tab trạng thái.
- `giaodien/src/pages/Dashboard.jsx`: thẻ "Đang xử lý" dẫn tới `?status=dang_xu_ly`; nút "Xem tất cả" của "Cần xử lý gấp" dẫn tới `?priority=cao&status=dang_xu_ly` (đúng cách đếm của khối).

## Cách kiểm tra
Khởi động lại backend, Ctrl+F5. Bấm thẻ "Đang xử lý": danh sách mở ở tab "Đang xử lý" và số tab bằng số trên thẻ.
