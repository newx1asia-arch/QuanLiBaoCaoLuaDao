# Cập nhật 40: Địa bàn chỉ có 1 báo cáo không còn bị tô mức "Trung bình"

Vấn đề: mức nóng của địa bàn tính theo tỉ lệ so với địa bàn nóng nhất. Khi cả nước chỉ có 1 báo cáo (hoặc địa bàn nóng nhất chỉ có 1), địa bàn đó có tỉ lệ 100% nên bị tô "Trung bình" (vàng), trái với chú thích trong code là không báo động vì một vụ lẻ. Ảnh Bảng điều hành: Hà Nội 1 báo cáo hiện "Trung bình".

## Đã sửa
- `nestjs/src/reports/statistics.service.ts`, hàm `mucDiemNong`: mức "Trung bình" cần tối thiểu 2 báo cáo. Địa bàn có 1 báo cáo là "Thấp". Các mức Cao (từ 2 báo cáo, từ 33% địa bàn nóng nhất) và Rất cao (từ 3 báo cáo, từ 66%) giữ nguyên.

## Cách kiểm tra
Khởi động lại backend, Ctrl+F5 ở Bảng điều hành: Hà Nội (1 báo cáo) hiện chấm xanh lam, nhãn "Thấp". Muốn đổi ngưỡng, sửa số 2 ở dòng `trung_binh` trong `mucDiemNong`.
