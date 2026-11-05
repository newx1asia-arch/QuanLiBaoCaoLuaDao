import type { VaiTro } from './auth.constants.js'

// Thông tin người đăng nhập, được gắn vào request sau khi qua JwtAuthGuard
export interface AuthUser {
  id: number
  email: string
  hoTen: string
  vaiTro: VaiTro
}
