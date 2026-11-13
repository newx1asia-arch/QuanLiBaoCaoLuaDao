# Cập nhật 9: Ba lỗi nhỏ ở giao diện

1. **Trang Người dùng: tìm kiếm gọi server mỗi phím gõ.** Nay chờ 350 ms sau lần gõ cuối mới tìm (giống trang Danh sách báo cáo).
2. **Trang Người dùng: thông báo tắt sớm.** Thông báo ("Đã khóa tài khoản"...) dùng `setTimeout` không được hủy; làm hai thao tác liên tiếp trong 2,5 giây thì thông báo thứ hai bị đồng hồ của thông báo đầu tắt sớm. Nay mỗi thông báo có đồng hồ riêng, thông báo mới thay thế cái cũ.
3. **Xuất CSV: tên file lệch ngày.** Tên file `bao-cao-lua-dao-YYYY-MM-DD.csv` lấy ngày theo giờ UTC, nên xuất lúc 00:00–07:00 sáng (giờ Việt Nam) ghi ngày hôm trước. Nay dùng ngày theo giờ máy người dùng.

## File đã sửa
- `giaodien/src/pages/Users.jsx`
- `giaodien/src/services/exportCsv.js`

## Không đổi
- Backend và dữ liệu.

## Cách kiểm tra
Trang Người dùng: gõ nhanh vào ô tìm kiếm, danh sách chỉ tải lại sau khi ngừng gõ; khóa rồi mở khóa liên tiếp, thông báo thứ hai hiện đủ 2,5 giây. Xuất CSV: tên file mang ngày hôm nay theo giờ máy.
Đã kiểm tra: `vite build` thành công.
