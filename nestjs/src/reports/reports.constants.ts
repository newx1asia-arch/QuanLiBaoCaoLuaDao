export const LOAI = ['gia_danh', 'dau_tu', 'viec_lam', 'mua_ban', 'tinh_cam', 'khac'] as const
export const TRANG_THAI = ['cho_xu_ly', 'dang_xac_minh', 'da_xac_nhan', 'tu_choi'] as const
export const UU_TIEN = ['cao', 'trung_binh', 'thap'] as const

// 34 tỉnh, thành phố sau sắp xếp đơn vị hành chính (khớp với giaodien/src/constants.js).
// Nếu đơn vị bạn vẫn dùng 63 tỉnh, thành: sửa danh sách này và TINH_THANH ở giaodien/src/constants.js cho giống nhau.
export const TINH_THANH = [
  'ha_noi', 'hue', 'quang_ninh', 'cao_bang', 'lang_son', 'lai_chau', 'dien_bien', 'son_la', 'thanh_hoa',
  'nghe_an', 'ha_tinh', 'tuyen_quang', 'lao_cai', 'thai_nguyen', 'phu_tho', 'bac_ninh', 'hung_yen',
  'hai_phong', 'ninh_binh', 'quang_tri', 'da_nang', 'quang_ngai', 'gia_lai', 'khanh_hoa', 'lam_dong',
  'dak_lak', 'tp_hcm', 'dong_nai', 'tay_ninh', 'can_tho', 'vinh_long', 'dong_thap', 'ca_mau', 'an_giang',
] as const

export const TINH_THANH_LABEL: Record<string, string> = {
  ha_noi: 'Hà Nội', hue: 'TP. Huế', quang_ninh: 'Quảng Ninh', cao_bang: 'Cao Bằng', lang_son: 'Lạng Sơn',
  lai_chau: 'Lai Châu', dien_bien: 'Điện Biên', son_la: 'Sơn La', thanh_hoa: 'Thanh Hóa', nghe_an: 'Nghệ An',
  ha_tinh: 'Hà Tĩnh', tuyen_quang: 'Tuyên Quang', lao_cai: 'Lào Cai', thai_nguyen: 'Thái Nguyên', phu_tho: 'Phú Thọ',
  bac_ninh: 'Bắc Ninh', hung_yen: 'Hưng Yên', hai_phong: 'Hải Phòng', ninh_binh: 'Ninh Bình', quang_tri: 'Quảng Trị',
  da_nang: 'Đà Nẵng', quang_ngai: 'Quảng Ngãi', gia_lai: 'Gia Lai', khanh_hoa: 'Khánh Hòa', lam_dong: 'Lâm Đồng',
  dak_lak: 'Đắk Lắk', tp_hcm: 'TP. Hồ Chí Minh', dong_nai: 'Đồng Nai', tay_ninh: 'Tây Ninh', can_tho: 'Cần Thơ',
  vinh_long: 'Vĩnh Long', dong_thap: 'Đồng Tháp', ca_mau: 'Cà Mau', an_giang: 'An Giang',
}

// Giá trị lọc đặc biệt: báo cáo chưa ghi nhận tỉnh, thành
export const CHUA_RO_DIA_BAN = 'chua_ro'

export const CHUA_PHAN_CONG = 'Chưa phân công'

export const TRANG_THAI_LABEL: Record<string, string> = {
  cho_xu_ly: 'Chờ xử lý',
  dang_xac_minh: 'Đang xác minh',
  da_xac_nhan: 'Đã xác nhận',
  tu_choi: 'Từ chối',
}

// Luồng xử lý hợp lệ: phải qua "Đang xác minh" mới được xác nhận.
// Báo cáo đã xác nhận / từ chối là kết thúc: chỉ quản trị viên được mở lại (về "Đang xác minh", kèm lý do)
export const CHUYEN_TRANG_THAI: Record<string, string[]> = {
  cho_xu_ly: ['dang_xac_minh', 'tu_choi'],
  dang_xac_minh: ['da_xac_nhan', 'tu_choi'],
  da_xac_nhan: [],
  tu_choi: [],
}

// >= 50 triệu: cao, >= 10 triệu: trung bình, còn lại: thấp (khớp với frontend)
export const tinhUuTien = (n: number) => (n >= 50e6 ? 'cao' : n >= 10e6 ? 'trung_binh' : 'thap')

// Nhận diện link: có http(s):// hoặc www., hoặc dạng tên-miền.đuôi (và có chữ cái, để không nhầm với số điện thoại)
const LINK = /^(https?:\/\/|www\.)|^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$)/

// Chuẩn hóa SĐT/STK/link để phát hiện đối tượng bị báo cáo trùng
export const normalizeTarget = (s: string) => {
  const t = String(s || '').trim().toLowerCase()
  if (LINK.test(t) && /[a-z]/.test(t)) {
    // Link: bỏ giao thức, www., #phần-neo và dấu / cuối; giữ nguyên dấu chấm trong tên miền
    return t.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/#.*$/, '').replace(/\/+$/, '')
  }
  const compact = t.replace(/[\s.\-()]/g, '')
  // SĐT Việt Nam: +84912345678 và 84912345678 cùng nghĩa với 0912345678
  if (/^\+?84\d{9}$/.test(compact)) return '0' + compact.replace(/^\+?84/, '')
  return compact
}

// Mức độ của một đối tượng bị báo cáo (dùng chung cho Tra cứu và Đối tượng nghi vấn):
// đã được cán bộ xác nhận, hoặc từ 3 người khác nhau cùng báo cáo thì coi là nguy hiểm
export const mucDoDoiTuong = (soBaoCao: number, daXacNhan: number, soNguoiBaoCao: number) =>
  soBaoCao === 0 ? 'chua_co' : daXacNhan > 0 || soNguoiBaoCao >= 3 ? 'nguy_hiem' : 'can_than'

export const MUC_DO_NGHI_VAN = ['nguy_hiem', 'can_than'] as const
export const KIEU_DOI_TUONG = ['sdt', 'tai_khoan', 'link'] as const
export const NGUY_CO = ['cao', 'trung_binh', 'thap'] as const

// Phân loại đối tượng từ khóa đã chuẩn hóa: có chữ cái là link, 10 số bắt đầu bằng 0 là SĐT, còn lại là số tài khoản
export const kieuDoiTuong = (key: string): (typeof KIEU_DOI_TUONG)[number] =>
  /[a-z]/.test(key) ? 'link' : /^0\d{9}$/.test(key) ? 'sdt' : 'tai_khoan'

// Mức nguy cơ của một cụm báo cáo: thiệt hại lớn hoặc nhiều người cùng báo cáo thì nguy cơ cao
export const tinhNguyCo = (thietHai: number, soNguoiBaoCao: number): (typeof NGUY_CO)[number] =>
  tinhUuTien(thietHai) === 'cao' || soNguoiBaoCao >= 5 ? 'cao' : thietHai >= 10e6 || soNguoiBaoCao >= 3 ? 'trung_binh' : 'thap'
