import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import type { AuthUser } from './auth-user.js'
import { User } from './entities/user.entity.js'
import { CreateUserDto } from './dto/create-user.dto.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import { QueryUserDto } from './dto/query-user.dto.js'
import { ResetPasswordDto } from './dto/reset-password.dto.js'
import { toPublicUser } from './auth.service.js'
import { hashPassword } from './password.util.js'

const withStatus = (u: User) => ({ ...toPublicUser(u), hoatDong: u.hoatDong })

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly log = new Logger('Users')

  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  // Lần chạy đầu chưa có tài khoản nào thì tạo sẵn 1 admin để đăng nhập
  async onModuleInit() {
    if (await this.repo.count()) return
    const email = String(this.config.get('ADMIN_EMAIL', 'admin@baocao.local')).toLowerCase()
    const password = this.config.get<string>('ADMIN_PASSWORD')
    if (!password && process.env.NODE_ENV === 'production') {
      this.log.warn('Chưa có tài khoản nào và thiếu ADMIN_PASSWORD, bỏ qua việc tạo admin mặc định')
      return
    }
    const matKhau = password || 'Admin@12345'
    await this.repo.save(this.repo.create({ email, hoTen: 'Quản trị viên', matKhau: await hashPassword(matKhau), vaiTro: 'admin' }))
    this.log.warn(`Đã tạo admin mặc định: ${email}${password ? '' : ' / Admin@12345 (hãy đổi mật khẩu ngay)'}`)
  }

  async list(q: QueryUserDto) {
    const { page = 1, pageSize = 10 } = q
    const qb = this.repo.createQueryBuilder('u')
    if (q.role) qb.andWhere('u.vaiTro = :role', { role: q.role })
    if (q.keyword?.trim()) qb.andWhere('(u.hoTen LIKE :kw OR u.email LIKE :kw)', { kw: `%${q.keyword.trim()}%` })
    const [items, total] = await qb
      .orderBy('u.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()
    return { items: items.map(withStatus), total }
  }

  // Danh sách tên cán bộ để phân công xử lý báo cáo
  async staff(): Promise<string[]> {
    const rows = await this.repo.find({ where: { vaiTro: In(['can_bo', 'admin']), hoatDong: true }, order: { hoTen: 'ASC' } })
    return [...new Set(rows.map((u) => u.hoTen))]
  }

  async create(dto: CreateUserDto) {
    if (await this.repo.findOneBy({ email: dto.email })) throw new ConflictException('Email này đã được đăng ký')
    const u = await this.repo.save(
      this.repo.create({ email: dto.email, hoTen: dto.hoTen, matKhau: await hashPassword(dto.matKhau), vaiTro: dto.vaiTro }),
    )
    return withStatus(u)
  }

  async update(id: number, dto: UpdateUserDto, actor: AuthUser) {
    const u = await this.repo.findOneBy({ id })
    if (!u) throw new NotFoundException('Không tìm thấy người dùng')
    // Không cho tự hạ quyền / tự khóa mình: luôn còn ít nhất một admin đang hoạt động
    if (u.id === actor.id && ((dto.vaiTro && dto.vaiTro !== u.vaiTro) || dto.hoatDong === false)) {
      throw new BadRequestException('Bạn không thể đổi vai trò hoặc khóa chính tài khoản của mình')
    }
    if (dto.vaiTro) u.vaiTro = dto.vaiTro
    if (dto.hoatDong !== undefined) u.hoatDong = dto.hoatDong
    return withStatus(await this.repo.save(u))
  }

  async resetPassword(id: number, dto: ResetPasswordDto) {
    const u = await this.repo.findOneBy({ id })
    if (!u) throw new NotFoundException('Không tìm thấy người dùng')
    u.matKhau = await hashPassword(dto.matKhau)
    u.tokenVersion += 1 // đăng xuất người đó khỏi mọi thiết bị
    await this.repo.save(u)
    return { ok: true }
  }
}
