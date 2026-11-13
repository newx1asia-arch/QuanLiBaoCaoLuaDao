# Cập nhật 35: Nội dung không còn dồn sang trái trên màn hình rộng

Vấn đề: khung nội dung bị giới hạn rộng 1360px nhưng không được căn giữa, nên trên màn hình rộng (vd 1920px) nội dung dồn sang trái và chừa một dải trống lớn bên phải, nhìn như giao diện bị cắt.

## Đã sửa
- `giaodien/src/index.css`: khung nội dung `.app-content` căn giữa và nới giới hạn lên 1680px; chân trang `.app-footer` cùng bề rộng với nội dung; bản điện thoại giữ nguyên như cũ.

## Không đổi
- Không đụng tới hiệu ứng động (cờ bay, trống đồng xoay, nhấp nháy...), các file này giống hệt bản bạn gửi.

## Cách kiểm tra
Mở Bảng điều hành trên màn hình rộng: nội dung nằm giữa vùng bên phải thanh menu, không còn khoảng trống lệch một bên. Thu nhỏ cửa sổ, điện thoại: như trước.
