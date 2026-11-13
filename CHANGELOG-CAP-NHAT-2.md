# Cập nhật 2: Trang cảnh báo công khai bị thiếu cảnh báo

Lỗi: `GET /api/public/alerts` lấy 50 cảnh báo đã phát hành mới nhất rồi mới lọc theo kênh website và tỉnh, thành. Nếu 50 cảnh báo mới nhất đều chỉ phát qua SMS / ứng dụng, hoặc thuộc tỉnh khác, trang `/canh-bao` hiện trống hoặc thiếu dù còn cảnh báo phù hợp cũ hơn.

## File đã sửa
- `nestjs/src/alerts/alerts.service.ts`: `publicList()` đọc từng đợt 100, lọc, dừng khi đủ 50 cảnh báo phù hợp hoặc hết dữ liệu; thêm `id` vào thứ tự sắp xếp để cùng thời điểm phát hành không bị lặp / sót; tách hàm `toPublic()`.

## Không đổi
- Dữ liệu trả về (các trường) và giao diện giữ nguyên.

## Cách kiểm tra
Phát hành 1 cảnh báo có kênh website, sau đó phát hành hơn 50 cảnh báo chỉ có kênh SMS. Mở `/canh-bao`: cảnh báo website vẫn phải hiện (trước đây biến mất). `tsc --noEmit` chạy sạch.
