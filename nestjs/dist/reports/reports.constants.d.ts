export declare const LOAI: readonly ["gia_danh", "dau_tu", "viec_lam", "mua_ban", "tinh_cam", "khac"];
export declare const TRANG_THAI: readonly ["cho_xu_ly", "dang_xac_minh", "da_xac_nhan", "tu_choi"];
export declare const UU_TIEN: readonly ["cao", "trung_binh", "thap"];
export declare const TRANG_THAI_LABEL: Record<string, string>;
export declare const tinhUuTien: (n: number) => "cao" | "trung_binh" | "thap";
export declare const normalizeTarget: (s: string) => string;
