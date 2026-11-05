export const LOAI_LUA_DAO = [
  { value: 'gia_danh', label: 'Giả danh (công an, ngân hàng, shipper...)' },
  { value: 'dau_tu', label: 'Đầu tư, tiền ảo, cho vay' },
  { value: 'viec_lam', label: 'Việc làm online, nhiệm vụ cộng tác viên' },
  { value: 'mua_ban', label: 'Mua bán online, sàn thương mại điện tử' },
  { value: 'tinh_cam', label: 'Lừa đảo tình cảm, kết bạn' },
  { value: 'khac', label: 'Khác' },
]

export const TRANG_THAI = {
  cho_xu_ly: { label: 'Chờ xử lý', cls: 'status-cho' },
  dang_xac_minh: { label: 'Đang xác minh', cls: 'status-dang' },
  da_xac_nhan: { label: 'Đã xác nhận', cls: 'status-xong' },
  tu_choi: { label: 'Từ chối', cls: 'status-huy' },
}

export const loaiLabel = (value) =>
  LOAI_LUA_DAO.find((l) => l.value === value)?.label ?? value

export const formatMoney = (n) =>
  new Intl.NumberFormat('vi-VN').format(Number(n) || 0) + ' đ'

// Ngày dạng YYYY-MM-DD (cột "ngày xảy ra") được đọc thẳng, không đi qua múi giờ nên không bị lệch sang ngày khác
export const formatDate = (d) => {
  if (!d) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d))
  return m ? `${m[3]}/${m[2]}/${m[1]}` : new Date(d).toLocaleDateString('vi-VN')
}

// Ngày hôm nay theo giờ máy người dùng, dạng YYYY-MM-DD (dùng làm giới hạn cho ô chọn ngày)
export const todayISO = () => {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

export const MUC_UU_TIEN = {
  cao: { label: 'Cao', cls: 'status-huy' },
  trung_binh: { label: 'Trung bình', cls: 'status-cho' },
  thap: { label: 'Thấp', cls: 'status-dang' },
}

export const CHUA_PHAN_CONG = 'Chưa phân công'

// Hệ thống chỉ dành cho cán bộ công an: mọi tài khoản đều là cán bộ hoặc quản trị viên
export const VAI_TRO = {
  can_bo: { label: 'Cán bộ', cls: 'status-cho' },
  admin: { label: 'Quản trị viên', cls: 'status-xong' },
}

// Luồng xử lý hợp lệ (khớp với backend): phải qua "Đang xác minh" mới được xác nhận.
// Báo cáo đã xác nhận / từ chối là kết thúc, chỉ quản trị viên được mở lại (về "Đang xác minh", kèm lý do)
export const CHUYEN_TRANG_THAI = {
  cho_xu_ly: ['dang_xac_minh', 'tu_choi'],
  dang_xac_minh: ['da_xac_nhan', 'tu_choi'],
  da_xac_nhan: [],
  tu_choi: [],
}

// Khớp quy tắc mật khẩu ở backend: tối thiểu 8 ký tự, có cả chữ và số
export const PASSWORD_HINT = 'Tối thiểu 8 ký tự, gồm cả chữ và số'
export const passwordError = (p) =>
  p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p) ? '' : `Mật khẩu chưa đủ mạnh. ${PASSWORD_HINT}.`

export const formatDateTime = (d) => {
  if (!d) return ''
  const t = new Date(d)
  return `${t.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}, ${t.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
}

// Kết quả tra cứu đối tượng: màu trùng với các khung thông báo (field-error / field-warn / field-success)
export const MUC_DO_TRA_CUU = {
  nguy_hiem: { cls: 'field-error', title: 'Nguy hiểm: đối tượng này đã bị báo cáo lừa đảo', hint: 'Không chuyển tiền và không cung cấp mã OTP hay thông tin cá nhân cho đối tượng này.' },
  can_than: { cls: 'field-warn', title: 'Cần thận trọng: đã có báo cáo nhưng chưa được cán bộ xác nhận', hint: 'Hãy xác minh kỹ trước khi giao dịch.' },
  chua_co: { cls: 'field-success', title: 'Chưa có báo cáo nào về đối tượng này', hint: 'Điều này chưa có nghĩa là an toàn. Nếu bạn nghi ngờ, hãy gửi báo cáo.' },
}

// ---------- Thương hiệu và thông tin liên hệ hiển thị trên giao diện (thay bằng thông tin thật của đơn vị bạn) ----------
export const APP_NAME = 'Trung tâm tiếp nhận cảnh báo lừa đảo'
export const APP_KICKER = 'Cục An ninh mạng'
export const HOTLINE = { label: 'Đường dây nóng', value: '156 / 5656' }
export const SUPPORT_EMAIL = 'hotro@example.com'
export const APP_VERSION = '2.5.0'

// Rút gọn số tiền: 38,6 tỷ / 120 triệu / 950.000 đ
export const formatMoneyShort = (n) => {
  const v = Number(n) || 0
  const f = (x) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(x)
  if (v >= 1e9) return `${f(v / 1e9)} tỷ`
  if (v >= 1e6) return `${f(v / 1e6)} triệu`
  return formatMoney(v)
}

// Mã báo cáo hiển thị: BC-2606-0042 (năm tháng tạo + số thứ tự)
export const reportCode = (r) => {
  const d = new Date(r.ngayTao)
  const ym = Number.isNaN(d.getTime()) ? '0000' : `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}`
  return `BC-${ym}-${String(r.id).padStart(4, '0')}`
}

// Chữ cái đầu của họ tên để làm ảnh đại diện
export const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase() || '?'

// ---------- Đối tượng nghi vấn và giám sát trực tiếp ----------
export const MUC_DO_NGHI_VAN = {
  nguy_hiem: { label: 'Nguy hiểm', cls: 'status-huy', pri: 'cao' },
  can_than: { label: 'Cần thận trọng', cls: 'status-cho', pri: 'trung_binh' },
}

export const KIEU_DOI_TUONG = { sdt: 'Số điện thoại', tai_khoan: 'Số tài khoản', link: 'Đường link' }

export const NGUY_CO = {
  cao: { label: 'Nguy cơ cao', cls: 'tone-high' },
  trung_binh: { label: 'Nguy cơ trung bình', cls: 'tone-mid' },
  thap: { label: 'Nguy cơ thấp', cls: 'tone-low' },
}

export const TRANG_THAI_CHIEN_DICH = { dang_xu_ly: 'Đang xử lý', da_xu_ly: 'Đã xử lý xong' }

// Khối "Giám sát trực tiếp" tự tải lại sau mỗi khoảng này (mili giây)
export const MONITOR_REFRESH_MS = 15000

// "Giả danh (công an, ngân hàng...)" -> "Giả danh"
export const loaiNgan = (value) => loaiLabel(value).split(' (')[0]

// "12 giây trước", "3 phút trước"
export const timeAgo = (seconds) =>
  seconds < 60 ? `${seconds} giây trước` : seconds < 3600 ? `${Math.floor(seconds / 60)} phút trước` : `${Math.floor(seconds / 3600)} giờ trước`

// ---------- Địa bàn: tỉnh, thành (34 đơn vị) và bản đồ điểm nóng ----------
// Khớp với TINH_THANH ở nestjs/src/reports/reports.constants.ts. lat/lon là tâm gần đúng của địa bàn, dùng để đặt điểm trên bản đồ.
// Nếu đơn vị vẫn dùng 63 tỉnh, thành: sửa cả hai nơi cho giống nhau.
export const TINH_THANH = [
  { value: 'ha_noi', label: 'Hà Nội', lat: 21.03, lon: 105.85 },
  { value: 'hai_phong', label: 'Hải Phòng', lat: 20.85, lon: 106.68 },
  { value: 'quang_ninh', label: 'Quảng Ninh', lat: 21.0, lon: 107.2 },
  { value: 'bac_ninh', label: 'Bắc Ninh', lat: 21.2, lon: 106.1 },
  { value: 'hung_yen', label: 'Hưng Yên', lat: 20.65, lon: 106.1 },
  { value: 'ninh_binh', label: 'Ninh Bình', lat: 20.25, lon: 105.97 },
  { value: 'phu_tho', label: 'Phú Thọ', lat: 21.3, lon: 105.2 },
  { value: 'thai_nguyen', label: 'Thái Nguyên', lat: 21.7, lon: 105.8 },
  { value: 'tuyen_quang', label: 'Tuyên Quang', lat: 22.3, lon: 105.0 },
  { value: 'cao_bang', label: 'Cao Bằng', lat: 22.67, lon: 106.26 },
  { value: 'lang_son', label: 'Lạng Sơn', lat: 21.85, lon: 106.76 },
  { value: 'lao_cai', label: 'Lào Cai', lat: 22.0, lon: 104.3 },
  { value: 'lai_chau', label: 'Lai Châu', lat: 22.4, lon: 103.45 },
  { value: 'dien_bien', label: 'Điện Biên', lat: 21.39, lon: 103.02 },
  { value: 'son_la', label: 'Sơn La', lat: 21.33, lon: 103.91 },
  { value: 'thanh_hoa', label: 'Thanh Hóa', lat: 19.81, lon: 105.78 },
  { value: 'nghe_an', label: 'Nghệ An', lat: 18.68, lon: 105.68 },
  { value: 'ha_tinh', label: 'Hà Tĩnh', lat: 18.34, lon: 105.91 },
  { value: 'quang_tri', label: 'Quảng Trị', lat: 17.5, lon: 106.55 },
  { value: 'hue', label: 'TP. Huế', lat: 16.46, lon: 107.59 },
  { value: 'da_nang', label: 'Đà Nẵng', lat: 15.9, lon: 108.3 },
  { value: 'quang_ngai', label: 'Quảng Ngãi', lat: 14.9, lon: 108.3 },
  { value: 'gia_lai', label: 'Gia Lai', lat: 13.9, lon: 108.6 },
  { value: 'dak_lak', label: 'Đắk Lắk', lat: 12.8, lon: 108.3 },
  { value: 'khanh_hoa', label: 'Khánh Hòa', lat: 12.0, lon: 109.0 },
  { value: 'lam_dong', label: 'Lâm Đồng', lat: 11.7, lon: 108.2 },
  { value: 'dong_nai', label: 'Đồng Nai', lat: 11.3, lon: 106.95 },
  { value: 'tp_hcm', label: 'TP. Hồ Chí Minh', lat: 10.78, lon: 106.7 },
  { value: 'tay_ninh', label: 'Tây Ninh', lat: 10.95, lon: 106.15 },
  { value: 'dong_thap', label: 'Đồng Tháp', lat: 10.4, lon: 106.0 },
  { value: 'vinh_long', label: 'Vĩnh Long', lat: 10.0, lon: 106.4 },
  { value: 'can_tho', label: 'Cần Thơ', lat: 9.7, lon: 105.75 },
  { value: 'an_giang', label: 'An Giang', lat: 10.2, lon: 105.1 },
  { value: 'ca_mau', label: 'Cà Mau', lat: 9.2, lon: 105.2 },
]
export const tinhLabel = (value) => TINH_THANH.find((t) => t.value === value)?.label ?? (value ? value : 'Chưa xác định')
export const CHUA_RO_DIA_BAN = 'chua_ro'

// Mức "nóng" của địa bàn (backend tính theo so sánh với địa bàn nóng nhất)
export const CAP_DO_NONG = {
  rat_cao: { label: 'Rất cao', color: '#9b111e', r: 11 },
  cao: { label: 'Cao', color: '#e07b00', r: 9 },
  trung_binh: { label: 'Trung bình', color: '#c9a227', r: 7 },
  thap: { label: 'Thấp', color: '#1f7a8c', r: 5.5 },
  khong: { label: 'Chưa có báo cáo', color: '#9aa3b2', r: 3.5 },
}

export const KHOANG_THOI_GIAN = [
  { value: 7, label: '7 ngày' },
  { value: 30, label: '30 ngày' },
  { value: 90, label: '90 ngày' },
  { value: 180, label: '6 tháng' },
  { value: 365, label: '12 tháng' },
]

// Màu cố định cho từng hình thức lừa đảo để mọi biểu đồ nhìn giống nhau
export const MAU_LOAI = { gia_danh: '#9b111e', dau_tu: '#d97706', viec_lam: '#1f5a96', mua_ban: '#1b7342', tinh_cam: '#8b5aa8', khac: '#6b7280' }
export const MAU_TRANG_THAI = { cho_xu_ly: '#d97706', dang_xac_minh: '#1f5a96', da_xac_nhan: '#1b7342', tu_choi: '#9aa3b2' }

// 12,5 -> "+12,5%"; null (kỳ trước không có số liệu) -> ""
export const formatPercent = (n) => (n == null ? '' : `${n > 0 ? '+' : ''}${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(n)}%`)
export const formatNumber = (n) => new Intl.NumberFormat('vi-VN').format(Number(n) || 0)

// ---------- Hàng đợi khẩn cấp (SLA) và năng lực đơn vị ----------
// SLA = thời hạn xử lý tính từ lúc tiếp nhận, theo mức ưu tiên (giờ). Đổi số ở đây nếu quy chế đơn vị khác.
export const SLA_GIO = { cao: 24, trung_binh: 72, thap: 168 }
// Còn dưới mức này của SLA (hoặc đã quá hạn) thì tính là "sắp quá hạn"
export const SLA_SAP_QUA_HAN = 0.25
export const QUEUE_REFRESH_MS = 15000

// Số hồ sơ mỗi đơn vị xử lý song song được (công suất định mức). Chỉnh theo biên chế thực tế.
// pham_vi: cách tính tải của đơn vị từ các hồ sơ đang mở (xem utils/capacity.js)
export const DON_VI = [
  { key: 'pa05_hn', ten: 'PA05 Hà Nội', congSuat: 40, phamVi: 'Hồ sơ từ Hà Nội và các tỉnh phía Bắc, Bắc Trung Bộ' },
  { key: 'pa05_hcm', ten: 'PA05 TP.HCM', congSuat: 40, phamVi: 'Hồ sơ từ TP.HCM và các tỉnh Trung, Nam Bộ' },
  { key: 'tt_giam_sat', ten: 'Trung tâm giám sát', congSuat: 30, phamVi: 'Hồ sơ chờ tiếp nhận trên toàn quốc' },
  { key: 'to_xac_minh', ten: 'Tổ xác minh liên ngành', congSuat: 25, phamVi: 'Hồ sơ đang xác minh trên toàn quốc' },
]

// Màu theo mức tải: dưới 60% ổn định, 60-85% cao, trên 85% quá tải
export const MUC_TAI = [
  { max: 60, key: 'on', label: 'Ổn định', color: '#1b7342' },
  { max: 85, key: 'cao', label: 'Tải cao', color: '#d97706' },
  { max: Infinity, key: 'qua_tai', label: 'Quá tải', color: '#b3261e' },
]
export const mucTai = (percent) => MUC_TAI.find((m) => percent < m.max) ?? MUC_TAI[2]

// Nhóm các vùng theo vĩ độ để chia địa bàn cho PA05 Hà Nội / TP.HCM
export const VI_DO_BAC = 16.0
export const KHU_VUC_NHOM = [
  { label: 'Miền Bắc', from: 19.5 },
  { label: 'Bắc Trung Bộ, Trung Bộ', from: 12.5 },
  { label: 'Nam Trung Bộ, Tây Nguyên, Nam Bộ', from: -90 },
]

// ---------- Soạn và duyệt cảnh báo ----------
export const KENH_CANH_BAO = [
  { value: 'website', label: 'Website', field: 'noiDung', max: 5000, hint: 'Đăng trên trang cảnh báo công khai' },
  { value: 'sms', label: 'Tin nhắn SMS', field: 'noiDungSms', max: 480, hint: 'Ngắn gọn; tiếng Việt có dấu tính 70 ký tự / tin' },
  { value: 'ung_dung', label: 'Thông báo ứng dụng', field: 'noiDungUngDung', max: 300, hint: 'Hiện trên màn hình khóa, nên dưới 150 ký tự' },
  { value: 'mang_xa_hoi', label: 'Mạng xã hội', field: 'noiDungMxh', max: 2000, hint: 'Có thể kèm hashtag và đường dẫn' },
]
export const MUC_DO_CANH_BAO = {
  thong_tin: { label: 'Thông tin', cls: 'status-dang' },
  canh_bao: { label: 'Cảnh báo', cls: 'status-cho' },
  khan_cap: { label: 'Khẩn cấp', cls: 'status-huy' },
}
export const TRANG_THAI_CANH_BAO = {
  nhap: { label: 'Bản nháp', cls: '' },
  cho_duyet: { label: 'Chờ duyệt', cls: 'status-cho' },
  da_duyet: { label: 'Đã duyệt', cls: 'status-dang' },
  tu_choi: { label: 'Bị từ chối', cls: 'status-huy' },
  da_phat_hanh: { label: 'Đã phát hành', cls: 'status-xong' },
  da_thu_hoi: { label: 'Đã thu hồi', cls: '' },
}
export const TRANG_THAI_KENH = { da_dang: 'Đã đăng', cho_gui: 'Chờ gửi', da_gui: 'Đã gửi', loi: 'Lỗi' }
export const phamViLabel = (a) =>
  a.phamVi === 'toan_quoc' ? 'Toàn quốc' : a.tinhThanh.length <= 3 ? a.tinhThanh.map(tinhLabel).join(', ') : `${a.tinhThanh.length} tỉnh, thành`

// Ba nhãn ở khối đầu Bảng điều hành. Đây là nội dung mẫu, hãy sửa cho đúng thực tế của đơn vị.
// icon: tên biểu tượng trong components/Icons.jsx (shield | globe | bolt)
export const HERO_BADGES = [
  { icon: 'shield', text: 'Bảo mật cấp độ 4' },
  { icon: 'globe', text: '63 tỉnh, thành' },
  { icon: 'bolt', text: 'Phản hồi dưới 15 phút' },
]
