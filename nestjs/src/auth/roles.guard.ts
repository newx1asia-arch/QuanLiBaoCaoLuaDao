import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { AuthUser } from './auth-user.js'
import type { VaiTro } from './auth.constants.js'
import { ROLES_KEY } from './decorators.js'

// Chạy sau JwtAuthGuard: kiểm tra vai trò khi API có gắn @Roles(...)
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<VaiTro[] | undefined>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()])
    if (!roles?.length) return true
    const user = ctx.switchToHttp().getRequest<{ user?: AuthUser }>().user
    if (!user || !roles.includes(user.vaiTro)) throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này')
    return true
  }
}
