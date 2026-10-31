import { createParamDecorator, SetMetadata, type ExecutionContext } from '@nestjs/common'
import type { AuthUser } from './auth-user.js'
import type { VaiTro } from './auth.constants.js'

export const IS_PUBLIC_KEY = 'isPublic'
export const ROLES_KEY = 'roles'

// Mặc định mọi API đều yêu cầu đăng nhập; @Public() mở API đó cho khách
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

// Giới hạn API cho một số vai trò, vd @Roles('admin', 'can_bo')
export const Roles = (...roles: VaiTro[]) => SetMetadata(ROLES_KEY, roles)

// Lấy người đang đăng nhập: method(@CurrentUser() user: AuthUser)
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user,
)
