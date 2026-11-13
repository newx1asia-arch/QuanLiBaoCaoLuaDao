# Cập nhật 36: Cờ bay và trống đồng xoay chạy lại

Vấn đề: cờ không bay, trống đồng không xoay. Mã hiệu ứng vẫn còn nguyên (`flag-wave`, `drum-spin`), nhưng CSS tự tắt cả hai khi máy bật chế độ "giảm chuyển động" (Windows: Cài đặt > Trợ năng > Hiệu ứng hình ảnh > Hiệu ứng hoạt hình đang tắt, hoặc chế độ tiết kiệm pin, máy ảo, điều khiển từ xa). Máy bật chế độ này sẽ mất hiệu ứng ở mọi bản.

## Đã sửa
- `giaodien/src/index.css`: bỏ quy tắc tắt hiệu ứng cờ và trống đồng khi bật chế độ giảm chuyển động. Các hiệu ứng khác (chấm nhấp nháy, hiệu ứng khi rê chuột, khung tải) vẫn tắt theo chế độ đó như cũ.

## Lưu ý
- Trống đồng quay một vòng mất 160 giây và mờ (độ mờ 17%) nên quay rất chậm, nhìn kỹ mới thấy. Cờ bay nhẹ ở góc banner và trên thanh đầu trang.
- Người dùng cần giảm chuyển động vì lý do sức khỏe sẽ vẫn thấy cờ và trống chuyển động. Muốn trả lại như cũ, thêm lại dòng ghi trong chú thích ở cuối file `index.css`.

## Cách kiểm tra
Tải lại trang bằng Ctrl+F5. Nhìn lá cờ đỏ ở góc banner "Bảng điều hành tổng quan": cờ lượn nhẹ. Nếu vẫn đứng yên, mở DevTools (F12) > Ctrl+Shift+P > gõ "Rendering" > xem ô "Emulate CSS media feature prefers-reduced-motion" có đang chọn "reduce" không.
