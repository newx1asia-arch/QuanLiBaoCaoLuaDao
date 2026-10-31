import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import type { AuthUser } from './auth-user.js'
import { IS_PUBLIC_KEY } from './decorators.js'
import { TokenService } from './token.service.js'
import { User } from './entities/user.entity.js'

// Guard toàn cục: mọi API đều cần "Authorization: Bearer <token>" trừ API gắn @Public()
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()])) return true

    const req = ctx.switchToHttp().getRequest<{ headers: Record<string, string | undefined>; user?: AuthUser }>()
    const [scheme, token] = (req.headers.authorization ?? '').split(' ')
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('Vui lòng đăng nhập')

    const payload = this.tokens.verify(token)
    // Đọc lại từ DB mỗi request để khóa tài khoản / đổi vai trò / đổi mật khẩu có hiệu lực ngay
    const u = await this.users.findOneBy({ id: payload.sub })
    if (!u || !u.hoatDong || u.tokenVersion !== payload.tv) {
      throw new UnauthorizedException('Phiên đăng nhập không còn hiệu lực, vui lòng đăng nhập lại')
    }
    req.user = { id: u.id, email: u.email, hoTen: u.hoTen, vaiTro: u.vaiTro as AuthUser['vaiTro'] }
    return true
  }
}
