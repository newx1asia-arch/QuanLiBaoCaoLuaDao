# Cập nhật 38: Khung thông tin địa bàn ghi rõ khi báo cáo "mới phát sinh"

Vấn đề: khi hôm qua / kỳ trước có 0 báo cáo thì không tính được phần trăm, khung bên phải bản đồ hiện "—" và "Chưa có số liệu" dù địa bàn đang có báo cáo mới, dễ hiểu nhầm là địa bàn không có dữ liệu. Ngoài ra khi chưa địa bàn nào có báo cáo, bản đồ vẫn tự chọn địa bàn đầu danh sách (0 báo cáo).

## Đã sửa (chỉ file `giaodien/src/components/HotspotMapCard.jsx`)
- "So với hôm qua": hôm qua 0, hôm nay có báo cáo -> hiện "Mới" (màu đỏ). Cả hai bằng 0 -> vẫn "—".
- "So với kỳ trước": kỳ trước 0, kỳ này có báo cáo -> hiện "Mới phát sinh". Cả hai bằng 0 -> "Chưa có số liệu".
- `hottest()`: nếu không địa bàn nào có báo cáo thì không chọn sẵn địa bàn nào (khung bên phải hiện gợi ý chọn trên bản đồ).

## Cách kiểm tra
Ctrl+F5 ở Bảng điều hành: Hà Nội đang có 1 báo cáo, hôm qua 0 -> ô "So với hôm qua" hiện "Mới", dòng "So với kỳ trước" hiện "Mới phát sinh".
