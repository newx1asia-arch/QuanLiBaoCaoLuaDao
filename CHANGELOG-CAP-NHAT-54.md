# Cập nhật 54: Sửa khối "Trung tâm hỗ trợ" bị mất/cắt ở chân thanh bên

## Nguyên nhân
- `.support-card` có `overflow: hidden` nên trong cột flex của thanh bên nó được phép co về gần 0 khi màn hình thấp (hoặc Windows phóng 125%), làm nội dung bị cắt mất.

## Đã sửa
- `.hotline-card`, `.support-card` luôn giữ nguyên chiều cao (`flex: none`); phần menu không còn bị ép co.
- Màn hình cao dưới 940px: ẩn hoa sen trang trí để khối hỗ trợ hiện đủ mà không phải cuộn.
- `giaodien/src/dashboard-polish.css`

Không đổi backend. Chỉ cần Ctrl+F5.
