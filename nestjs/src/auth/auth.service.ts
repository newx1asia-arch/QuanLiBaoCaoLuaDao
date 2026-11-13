import { ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomInt, timingSafeEqual } from 'node:crypto'
import { LessThan, MoreThan, Repository } from 'typeorm'
import type { AuthUser } from './auth-user.js'
import { User } from './entities/user.entity.js'
import { Report } from '../reports/entities/report.entity.js'
import { LoginDto } from './dto/login.dto.js'
import { UpdateProfileDto } from './dto/update-profile.dto.js'
import { ChangePasswordDto } from './dto/change-password.dto.js'
import { hashPassword, verifyPassword } from './password.util.js'
import { ForgotPasswordDto } from './dto/forgot-password.dto.js'
import { ResetWithCodeDto } from './dto/reset-with-code.dto.js'
import { MailService } from './mail.service.js'
import { TokenService } from './token.service.js'

const MAX_FAILS = 5
const WINDOW_MS = 15 * 60 * 1000 // đếm số lần sai trong 15 phút
const LOCK_MS = 15 * 60 * 1000 // sai quá số lần cho phép thì tạm khóa 15 phút

const RESET_MINUTES = 15 // mã quên mật khẩu có hiệu lực 15 phút
const RESET_COOLDOWN_MS = 60 * 1000 // mỗi email chỉ được yêu cầu mã mới sau 60 giây
const RESET_MAX_TRIES = 5 // mỗi mã chỉ được nhập sai tối đa 5 lần
const FORGOT_PER_IP = 10 // mỗi IP tối đa 10 yêu cầu gửi mã / giờ
const FORGOT_WINDOW_MS = 60 * 60 * 1000

export const toPublicUser = (u: User) => ({ id: u.id, email: u.email, hoTen: u.hoTen, vaiTro: u.vaiTro, ngayTao: u.ngayTao })

@Injectable()
export class AuthService {
  // Đếm đăng nhập sai theo cặp email + IP (lưu trong bộ nhớ, mất khi khởi động lại server)
  private readonly fails = new Map<string, { n: number; first: number; until: number }>()
  // Băm sẵn một mật khẩu giả: email không tồn tại vẫn tốn thời gian như email có thật
  private readonly dummyHash = hashPassword('mat-khau-gia-0')
  private readonly forgotByIp = new Map<string, { n: number; first: number }>()

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly tokens: TokenService,
    private readonly mail: MailService,
  ) {}

  private session(u: User) {
    return { token: this.tokens.sign(u.id, u.tokenVersion), expiresIn: this.tokens.expiresIn, user: toPublicUser(u) }
  }

  async login(dto: LoginDto, ip: string) {
    const key = `${dto.email}|${ip}`
    this.assertNotLocked(key)

    const u = await this.users.createQueryBuilder('u').addSelect('u.matKhau').where('u.email = :email', { email: dto.email }).getOne()
    const ok = await verifyPassword(dto.matKhau, u ? u.matKhau : await this.dummyHash)
    if (!u || !ok) {
      this.recordFail(key)
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng')
    }
    if (!u.hoatDong) throw new ForbiddenException('Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên')

    this.fails.delete(key)
    return this.session(u)
  }

  async me(auth: AuthUser) {
    const u = await this.users.findOneBy({ id: auth.id })
    if (!u) throw new UnauthorizedException('Tài khoản không tồn tại')
    return toPublicUser(u)
  }

  async updateProfile(auth: AuthUser, dto: UpdateProfileDto) {
    const u = await this.users.findOneBy({ id: auth.id })
    if (!u) throw new UnauthorizedException('Tài khoản không tồn tại')
    u.hoTen = dto.hoTen
    const saved = await this.users.save(u)
    // Báo cáo lưu kèm tên cán bộ phụ trách để hiển thị: đổi họ tên thì cập nhật theo, không để lại tên cũ
    // Giữ nguyên phienBan: TypeORM tự tăng cột phiên bản sau mỗi lệnh UPDATE, nếu không người khác đang mở báo cáo này sẽ bị báo xung đột 409 oan
    await this.users.manager.update(Report, { canBoId: saved.id }, { canBo: saved.hoTen, phienBan: () => 'phienBan' })
    return toPublicUser(saved)
  }

  // Đổi mật khẩu xong, mọi token cũ (ở thiết bị khác) đều hết hiệu lực; trả token mới cho thiết bị hiện tại
  async changePassword(auth: AuthUser, dto: ChangePasswordDto) {
    const u = await this.users.createQueryBuilder('u').addSelect('u.matKhau').where('u.id = :id', { id: auth.id }).getOne()
    if (!u) throw new UnauthorizedException('Tài khoản không tồn tại')
    if (!(await verifyPassword(dto.matKhauCu, u.matKhau))) throw new BadRequestException('Mật khẩu hiện tại không đúng')
    if (dto.matKhauCu === dto.matKhauMoi) throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại')
    u.matKhau = await hashPassword(dto.matKhauMoi)
    u.tokenVersion += 1
    return this.session(await this.users.save(u))
  }

  // Quên mật khẩu bước 1: luôn trả lời giống nhau để người ngoài không dò được email nào đã đăng ký
  async forgotPassword(dto: ForgotPasswordDto, ip: string) {
    this.limitForgot(ip)
    const generic = { message: 'Nếu email đã đăng ký, mã xác nhận 6 số sẽ được gửi tới email đó. Mã có hiệu lực 15 phút.' }

    const u = await this.users.createQueryBuilder('u').addSelect(['u.resetHetHan', 'u.resetSoLan']).where('u.email = :email', { email: dto.email }).getOne()
    if (!u || !u.hoatDong) return generic

    // Mã cũ còn hiệu lực thì số lần đã thử sai được giữ lại, không đặt về 0 khi xin mã mới. Nếu không, cứ mỗi 60 giây kẻ xấu
    // xin mã mới là có thêm 5 lượt đoán. Đã dùng hết lượt thì phải chờ mã cũ hết hạn (tối đa 15 phút) mới xin được mã mới
    const conHan = !!u.resetHetHan && u.resetHetHan.getTime() > Date.now()
    if (conHan && u.resetSoLan >= RESET_MAX_TRIES) return generic

    const lastSent = u.resetHetHan ? u.resetHetHan.getTime() - RESET_MINUTES * 60000 : 0
    if (Date.now() - lastSent < RESET_COOLDOWN_MS) return generic

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
    await this.users.update(u.id, {
      resetHash: this.tokens.digest(`${u.id}:${code}`),
      resetHetHan: new Date(Date.now() + RESET_MINUTES * 60000),
      resetSoLan: conHan ? u.resetSoLan : 0,
    })
    // Không chờ gửi xong để thời gian phản hồi không tiết lộ email có tồn tại hay không
    void this.mail.sendResetCode(u.email, u.hoTen, code, RESET_MINUTES).catch(() => undefined)
    return generic
  }

  // Quên mật khẩu bước 2: đúng mã thì đổi mật khẩu và đăng xuất mọi thiết bị.
  // Mỗi lượt thử được "giữ chỗ" bằng một câu UPDATE nguyên tử TRƯỚC khi so mã, nên dù gửi hàng trăm yêu cầu song song
  // thì mã 6 số vẫn chỉ bị thử tối đa RESET_MAX_TRIES lần (trước đây các yêu cầu cùng đọc "đã sai 0 lần" nên đếm không kịp).
  // Việc đổi mật khẩu cũng chỉ thành công một lần cho mỗi mã: yêu cầu thứ hai dùng lại cùng mã sẽ bị từ chối.
  async resetPassword(dto: ResetWithCodeDto) {
    const bad = () => new BadRequestException('Mã xác nhận không đúng hoặc đã hết hạn')
    const u = await this.users
      .createQueryBuilder('u')
      .addSelect(['u.resetHash', 'u.resetHetHan', 'u.resetSoLan'])
      .where('u.email = :email', { email: dto.email })
      .getOne()
    if (!u || !u.hoatDong || !u.resetHash || !u.resetHetHan) throw bad()
    if (u.resetHetHan.getTime() < Date.now() || u.resetSoLan >= RESET_MAX_TRIES) throw bad()

    // Giữ chỗ 1 lượt thử: chỉ thành công khi mã vẫn là mã đã đọc, chưa hết hạn và chưa dùng hết số lượt
    const luot = await this.users.update(
      { id: u.id, resetHash: u.resetHash, resetHetHan: MoreThan(new Date()), resetSoLan: LessThan(RESET_MAX_TRIES) },
      { resetSoLan: () => 'resetSoLan + 1' },
    )
    if (!luot.affected) throw bad()

    const given = Buffer.from(this.tokens.digest(`${u.id}:${dto.ma}`), 'hex')
    const expected = Buffer.from(u.resetHash, 'hex')
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw bad() // lượt thử đã được tính ở trên

    // Đổi mật khẩu chỉ khi mã vẫn còn nguyên (chưa bị yêu cầu khác dùng mất hoặc bị thay bằng mã mới)
    const res = await this.users.update(
      { id: u.id, resetHash: u.resetHash },
      {
        matKhau: await hashPassword(dto.matKhauMoi),
        tokenVersion: () => 'tokenVersion + 1',
        resetHash: null,
        resetHetHan: null,
        resetSoLan: 0,
      },
    )
    if (!res.affected) throw bad()
    // Người dùng đang bị tạm khóa vì đăng nhập sai nhiều lần thì được thử lại ngay với mật khẩu mới
    for (const k of this.fails.keys()) if (k.startsWith(`${dto.email}|`)) this.fails.delete(k)
    return { ok: true, message: 'Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.' }
  }

  private limitForgot(ip: string) {
    const now = Date.now()
    let e = this.forgotByIp.get(ip)
    if (!e || now - e.first > FORGOT_WINDOW_MS) e = { n: 0, first: now }
    e.n += 1
    this.forgotByIp.set(ip, e)
    if (e.n > FORGOT_PER_IP) {
      throw new HttpException('Bạn đã yêu cầu mã quá nhiều lần, vui lòng thử lại sau', HttpStatus.TOO_MANY_REQUESTS)
    }
    if (this.forgotByIp.size > 5000) {
      for (const [k, v] of this.forgotByIp) if (now - v.first > FORGOT_WINDOW_MS) this.forgotByIp.delete(k)
    }
  }

  private assertNotLocked(key: string) {
    const e = this.fails.get(key)
    if (!e) return
    const now = Date.now()
    if (e.until > now) {
      const phut = Math.ceil((e.until - now) / 60000)
      throw new HttpException(`Đăng nhập sai quá nhiều lần, vui lòng thử lại sau ${phut} phút`, HttpStatus.TOO_MANY_REQUESTS)
    }
    if (e.until) this.fails.delete(key) // đã hết thời gian khóa
  }

  private recordFail(key: string) {
    const now = Date.now()
    let e = this.fails.get(key)
    if (!e || now - e.first > WINDOW_MS) e = { n: 0, first: now, until: 0 }
    e.n += 1
    if (e.n >= MAX_FAILS) e.until = now + LOCK_MS
    this.fails.set(key, e)
    if (this.fails.size > 5000) {
      for (const [k, v] of this.fails) if (now - v.first > WINDOW_MS && v.until < now) this.fails.delete(k)
    }
  }
}
