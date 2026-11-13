# Cập nhật 37: Chấm trên bản đồ không còn lệch ra ngoài đất liền

Vấn đề: tâm của một số địa bàn (Điện Biên, Quảng Ninh, TP. Huế...) rơi ra ngoài hình giản lược của bản đồ, nhiều chấm khác nằm sát mép nên vòng sáng và chấm bị thò ra biển.

## Đã sửa
- Thêm `giaodien/src/utils/mapGeometry.js`: hàm kiểm tra điểm trong đa giác và `snapInside` kéo điểm vào trong đất liền, cách mép tối thiểu 8px.
- `giaodien/src/components/VietnamMap.jsx`: vị trí vẽ của mỗi địa bàn được tính một lần bằng `snapInside`. Điểm đã nằm sâu bên trong giữ nguyên. Dữ liệu (lat/lon trong `constants.js`) không bị đổi, chỉ đổi chỗ vẽ chấm; nhãn tên cũng đặt theo vị trí mới.

## Cách kiểm tra
Tải lại trang Bảng điều hành (Ctrl+F5), xem bản đồ "Bản đồ điểm nóng toàn quốc" và trang Bản đồ điểm nóng: các chấm nằm trong phần đất liền. Muốn chấm vào sâu hơn hoặc nông hơn, đổi số 8 ở dòng `POS` trong `VietnamMap.jsx`.
