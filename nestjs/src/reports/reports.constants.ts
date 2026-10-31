export const LOAI = ['gia_danh', 'dau_tu', 'viec_lam', 'mua_ban', 'tinh_cam', 'khac'] as const
export const TRANG_THAI = ['cho_xu_ly', 'dang_xac_minh', 'da_xac_nhan', 'tu_choi'] as const
export const UU_TIEN = ['cao', 'trung_binh', 'thap'] as const

export const TRANG_THAI_LABEL: Record<string, string> = {
  cho_xu_ly: 'Chờ xử lý',
  dang_xac_minh: 'Đang xác minh',
  da_xac_nhan: 'Đã xác nhận',
  tu_choi: 'Từ chối',
}

// >= 50 triệu: cao, >= 10 triệu: trung bình, còn lại: thấp (khớp với frontend)
export const tinhUuTien = (n: number) => (n >= 50e6 ? 'cao' : n >= 10e6 ? 'trung_binh' : 'thap')

// Chuẩn hóa SĐT/STK/link để phát hiện đối tượng bị báo cáo trùng
export const normalizeTarget = (s: string) =>
  String(s || '').toLowerCase().replace(/^https?:\/\//, '').replace(/[\s.\-]/g, '')
