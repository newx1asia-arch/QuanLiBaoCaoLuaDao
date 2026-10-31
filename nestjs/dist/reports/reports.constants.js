export const LOAI = ['gia_danh', 'dau_tu', 'viec_lam', 'mua_ban', 'tinh_cam', 'khac'];
export const TRANG_THAI = ['cho_xu_ly', 'dang_xac_minh', 'da_xac_nhan', 'tu_choi'];
export const UU_TIEN = ['cao', 'trung_binh', 'thap'];
export const TRANG_THAI_LABEL = {
    cho_xu_ly: 'Chờ xử lý',
    dang_xac_minh: 'Đang xác minh',
    da_xac_nhan: 'Đã xác nhận',
    tu_choi: 'Từ chối',
};
export const tinhUuTien = (n) => (n >= 50e6 ? 'cao' : n >= 10e6 ? 'trung_binh' : 'thap');
export const normalizeTarget = (s) => String(s || '').toLowerCase().replace(/^https?:\/\//, '').replace(/[\s.\-]/g, '');
//# sourceMappingURL=reports.constants.js.map