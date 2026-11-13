# Cập nhật 41: Giãn các chấm bị đè sát nhau trên bản đồ

Vấn đề: ở miền Bắc nhiều địa bàn nằm rất gần nhau (Hà Nội, Bắc Ninh, Hưng Yên, Hải Phòng...), sau khi kéo vào đất liền (cập nhật 37) có cặp chấm cách nhau dưới 11px nên đè lên nhau, khó bấm đúng.

## Đã sửa
- `giaodien/src/utils/mapGeometry.js`: thêm `spreadPoints` đẩy các điểm quá sát nhau ra xa tối thiểu 18px rồi kéo lại vào trong đất liền.
- `giaodien/src/components/VietnamMap.jsx`: vị trí vẽ lấy từ `spreadPoints`. Chấm dịch xa nhất 4,5px so với tâm địa bàn; dữ liệu `lat/lon` không đổi.

## Kiểm tra trên 34 địa bàn
Khoảng cách gần nhất giữa hai chấm tăng từ 10,4px lên 18px, mọi chấm vẫn nằm trong đất liền.

## Lưu ý
Chấm mức "Rất cao" và "Cao" có bán kính 9 đến 11px nên hai chấm lớn cạnh nhau vẫn có thể chạm nhau. Muốn giãn hơn, tăng số 18 trong `VietnamMap.jsx` (dòng `POS`).
