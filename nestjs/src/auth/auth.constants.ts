export const VAI_TRO = ['nguoi_dan', 'can_bo', 'admin'] as const
export type VaiTro = (typeof VAI_TRO)[number]

// Cán bộ và quản trị viên được xem toàn bộ báo cáo và xử lý; người dân chỉ thấy báo cáo của mình
export const isStaff = (vaiTro: string) => vaiTro === 'can_bo' || vaiTro === 'admin'

// Ít nhất 8 ký tự, có cả chữ và số
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/
export const PASSWORD_MESSAGE = 'Mật khẩu phải từ 8 ký tự, gồm cả chữ và số'
