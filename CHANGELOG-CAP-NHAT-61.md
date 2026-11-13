# Cập nhật 61: sửa trợ lý AI (Gemini) không phản hồi, đổi email hỗ trợ

## Đã sửa
1. `nestjs/src/support/gemini.service.ts`
   - Lỗi "Trợ lý AI không phản hồi" xảy ra khi lệnh gọi Google bị ngắt (hết thời gian chờ, lỗi mạng, khóa API lẫn ký tự lạ). Trước đây chỉ có 1 model, chờ tới 60 giây rồi báo lỗi chung.
   - Giờ: tự thử lần lượt model chính rồi các model dự phòng (`GEMINI_FALLBACK_MODELS`, mặc định `gemini-3.6-flash,gemini-2.5-flash`), mỗi lần chờ tối đa 25 giây.
   - Tự bỏ khoảng trắng, dấu nháy và ký tự lạ trong `GEMINI_API_KEY` (lỗi hay gặp khi dán khóa vào Render).
   - Ghi nguyên nhân gốc vào Logs của Render (ETIMEDOUT, ENOTFOUND...) và thông báo cho người dùng kèm lý do ngắn, ví dụ "(hết thời gian chờ)" hoặc "(mã 403)".
2. `giaodien/src/constants.js`: email hỗ trợ đổi thành `newx1asia@gmail.com` (hiện ở menu, trang Trung tâm hỗ trợ).
3. `nestjs/.env.example`: thêm `GEMINI_FALLBACK_MODELS` và `SUPPORT_EMAIL` (trợ lý AI cũng nhắc đúng email này).

## Cách làm
- Backend (Render): deploy lại. Vào Render -> Logs, hỏi thử AI một câu rồi xem dòng `[Gemini]` để biết nguyên nhân thật nếu vẫn lỗi.
- Giao diện (Vercel): deploy lại để thấy email mới.
- Kiểm tra `GEMINI_API_KEY` trên Render: dán lại khóa mới từ https://aistudio.google.com/apikey, không có dấu nháy.

## Bổ sung (lần 2): lỗi "mã 404"
- Google trả 404 nghĩa là tên model (vd `gemini-flash-latest` đặt trên Render) không tồn tại với khóa này.
- Backend giờ tự gọi danh sách model của Google, chọn tối đa 3 model `gemini-X-flash` mới nhất dùng được với khóa rồi thử lần lượt. Danh sách được ghi vào Logs (dòng `Model dùng được với khóa này`).
- Nên xóa biến `GEMINI_MODEL` trên Render (hoặc đặt tên model có trong Logs).

## Bổ sung (lần 3): lỗi "hết thời gian chờ"
- Model 3.x đặt mức suy nghĩ `minimal` (trước là `low`), giới hạn câu trả lời 1024 token để trả lời nhanh hơn.
- Mỗi lần gọi chờ tối đa 35 giây; sau 2 lần hết giờ thì dừng để không vượt giới hạn ~100 giây của Render.
- Nếu vẫn hết giờ: xem Render -> Logs dòng `[Gemini]` (có ETIMEDOUT / ENETUNREACH... là mạng của Render không tới được Google).

## Bổ sung (lần 4): model bị quá tải (503 / hết giờ)
- Log Render cho thấy `gemini-3.8-flash` quá tải, `gemini-3.7-flash` được Google chuyển sang 3.8 nên cũng 503, `gemini-2.5-flash` đã bị ngừng với khóa mới.
- Mặc định giờ dùng `gemini-3.5-flash-lite`, dự phòng `gemini-3.1-flash-lite`, `gemini-3.6-flash`, `gemini-3.5-flash`. Chờ tối đa 20 giây mỗi model.
- Trên Render: xóa biến `GEMINI_MODEL` hoặc đặt `gemini-3.5-flash-lite`.
