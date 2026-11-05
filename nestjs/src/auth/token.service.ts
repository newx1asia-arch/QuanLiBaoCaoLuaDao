import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHmac, timingSafeEqual } from 'node:crypto'

export interface TokenPayload {
  sub: number // id người dùng
  tv: number // tokenVersion: tăng lên khi đổi/đặt lại mật khẩu để vô hiệu hóa token cũ
  iat: number
  exp: number
}

const DEV_SECRET = 'dev-only-secret-doi-gia-tri-nay-trong-file-env'
const b64url = (v: string | Buffer) => Buffer.from(v).toString('base64url')

// JWT HS256 tự cài bằng node:crypto, không cần thêm thư viện
@Injectable()
export class TokenService {
  private readonly secret: string
  readonly expiresIn: number // giây

  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET')
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('Thiếu JWT_SECRET trong môi trường production')
    }
    if (!secret) new Logger('Auth').warn('Chưa đặt JWT_SECRET trong .env, đang dùng khóa mặc định (chỉ dùng khi phát triển)')
    this.secret = secret || DEV_SECRET
    this.expiresIn = Number(config.get('JWT_EXPIRES_HOURS', 12)) * 3600
  }

  private signature(data: string) {
    return createHmac('sha256', this.secret).update(data).digest()
  }

  // Băm một giá trị kèm khóa bí mật của server (dùng cho mã đặt lại mật khẩu)
  digest(data: string): string {
    return this.signature(`digest:${data}`).toString('hex')
  }

  sign(sub: number, tv: number): string {
    const iat = Math.floor(Date.now() / 1000)
    const head = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const body = b64url(JSON.stringify({ sub, tv, iat, exp: iat + this.expiresIn }))
    return `${head}.${body}.${b64url(this.signature(`${head}.${body}`))}`
  }

  verify(token: string): TokenPayload {
    const invalid = () => new UnauthorizedException('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại')
    const parts = token.split('.')
    if (parts.length !== 3) throw invalid()
    const [head, body, sig] = parts
    const expected = this.signature(`${head}.${body}`)
    const given = Buffer.from(sig, 'base64url')
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw invalid()
    try {
      if (JSON.parse(Buffer.from(head, 'base64url').toString()).alg !== 'HS256') throw invalid()
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload
      if (typeof payload.sub !== 'number' || typeof payload.exp !== 'number') throw invalid()
      if (payload.exp <= Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedException('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại')
      }
      return payload
    } catch (e) {
      throw e instanceof UnauthorizedException ? e : invalid()
    }
  }
}
