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

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN') : ''

export const MUC_UU_TIEN = {
  cao: { label: 'Cao', cls: 'status-huy' },
  trung_binh: { label: 'Trung bình', cls: 'status-cho' },
  thap: { label: 'Thấp', cls: 'status-dang' },
}

export const CHUA_PHAN_CONG = 'Chưa phân công'

export const VAI_TRO = {
  nguoi_dan: { label: 'Người dân', cls: 'status-dang' },
  can_bo: { label: 'Cán bộ', cls: 'status-cho' },
  admin: { label: 'Quản trị viên', cls: 'status-xong' },
}

// Cán bộ và quản trị viên xử lý báo cáo; người dân chỉ gửi và theo dõi báo cáo của mình
export const isStaff = (user) => user?.vaiTro === 'can_bo' || user?.vaiTro === 'admin'

// Khớp quy tắc mật khẩu ở backend: tối thiểu 8 ký tự, có cả chữ và số
export const PASSWORD_HINT = 'Tối thiểu 8 ký tự, gồm cả chữ và số'
export const passwordError = (p) =>
  p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p) ? '' : `Mật khẩu chưa đủ mạnh. ${PASSWORD_HINT}.`

// Mức ưu tiên tự động theo thiệt hại: >= 50 triệu là cao, >= 10 triệu là trung bình
export const tinhUuTien = (r) =>
  r.soTienThietHai >= 50e6 ? 'cao' : r.soTienThietHai >= 10e6 ? 'trung_binh' : 'thap'

// Chuẩn hóa đối tượng (SĐT/STK/link) để phát hiện báo cáo trùng
export const normalizeTarget = (s) =>
  String(s || '').toLowerCase().replace(/^https?:\/\//, '').replace(/[\s.\-]/g, '')

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('vi-VN', { hour12: false }) : ''

// Kết quả tra cứu đối tượng: màu trùng với các khung thông báo (field-error / field-warn / field-success)
export const MUC_DO_TRA_CUU = {
  nguy_hiem: { cls: 'field-error', title: 'Nguy hiểm: đối tượng này đã bị báo cáo lừa đảo', hint: 'Không chuyển tiền và không cung cấp mã OTP hay thông tin cá nhân cho đối tượng này.' },
  can_than: { cls: 'field-warn', title: 'Cần thận trọng: đã có báo cáo nhưng chưa được cán bộ xác nhận', hint: 'Hãy xác minh kỹ trước khi giao dịch.' },
  chua_co: { cls: 'field-success', title: 'Chưa có báo cáo nào về đối tượng này', hint: 'Điều này chưa có nghĩa là an toàn. Nếu bạn nghi ngờ, hãy gửi báo cáo.' },
}
