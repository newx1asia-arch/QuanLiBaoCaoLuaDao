export const VAI_TRO = ['can_bo', 'admin'] as const
export type VaiTro = (typeof VAI_TRO)[number]

// Hệ thống chỉ dành cho cán bộ công an: mọi tài khoản đều là cán bộ hoặc quản trị viên
export const isAdmin = (vaiTro: string) => vaiTro === 'admin'

// Ít nhất 8 ký tự, có cả chữ và số
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/
export const PASSWORD_MESSAGE = 'Mật khẩu phải từ 8 ký tự, gồm cả chữ và số'
