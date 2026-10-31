export declare const VAI_TRO: readonly ["nguoi_dan", "can_bo", "admin"];
export type VaiTro = (typeof VAI_TRO)[number];
export declare const isStaff: (vaiTro: string) => vaiTro is "can_bo" | "admin";
export declare const PASSWORD_REGEX: RegExp;
export declare const PASSWORD_MESSAGE = "M\u1EADt kh\u1EA9u ph\u1EA3i t\u1EEB 8 k\u00FD t\u1EF1, g\u1ED3m c\u1EA3 ch\u1EEF v\u00E0 s\u1ED1";
