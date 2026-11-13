# Cập nhật 60: Trung tâm hỗ trợ có trợ lý AI

- Trang mới `/ho-tro` (nút "Mở trung tâm hỗ trợ" ở thanh bên).
- Cán bộ chọn khu vực (Bắc: PA05 Hà Nội, Trung và Nam: PA05 TP.HCM) và bấm **Bắt đầu ca trực**. Ca tự kết thúc sau 12 giờ (đổi bằng `DUTY_HOURS`).
- Khu vực **có** cán bộ khác đang trực: hiện danh sách để liên hệ. Khu vực **không có ai trực**: hiện khung chat với trợ lý AI (Gemini).
- Máy chủ kiểm tra lại điều kiện này mỗi lần hỏi AI (không chỉ dựa vào giao diện), giới hạn 20 lần hỏi mỗi người mỗi giờ (`AI_LIMIT_PER_HOUR`).
- Trợ lý chỉ hướng dẫn sử dụng hệ thống, **không truy cập được dữ liệu báo cáo hay tài khoản**; câu trả lời hiển thị dạng văn bản thuần.

## Cần làm khi triển khai
1. **Tạo bảng**: chạy `nestjs/sql/them-bang-truc-ban.sql` trên Aiven (hoặc đặt `DB_SYNC=true` một lần rồi đổi lại `false`).
2. **Khóa AI**: lấy ở https://aistudio.google.com/apikey, đặt `GEMINI_API_KEY` trong Environment của Render (không ghi vào file đưa lên GitHub). Tùy chọn `GEMINI_MODEL` (mặc định `gemini-3.8-flash`).
3. Chưa làm bước 1 hoặc 2 thì hệ thống vẫn chạy bình thường: chưa tạo bảng thì coi như không ai trực, chưa có khóa thì trang hỗ trợ báo "Trợ lý AI chưa được bật".

## File thay đổi
- Backend mới: `nestjs/src/support/*`, `nestjs/sql/them-bang-truc-ban.sql`; sửa `app.module.ts`, `.env.example`.
- Giao diện mới: `giaodien/src/pages/Support.jsx`, `support.css`, `services/supportApi.js`; sửa `App.jsx`, `components/Layout.jsx`.
