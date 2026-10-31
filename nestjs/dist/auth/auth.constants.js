export const VAI_TRO = ['nguoi_dan', 'can_bo', 'admin'];
export const isStaff = (vaiTro) => vaiTro === 'can_bo' || vaiTro === 'admin';
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/;
export const PASSWORD_MESSAGE = 'Mật khẩu phải từ 8 ký tự, gồm cả chữ và số';
//# sourceMappingURL=auth.constants.js.map