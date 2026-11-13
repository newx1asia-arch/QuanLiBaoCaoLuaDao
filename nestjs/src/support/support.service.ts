import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import type { AuthUser } from '../auth/auth-user.js'
import { User } from '../auth/entities/user.entity.js'
import { TrucBan } from './entities/truc-ban.entity.js'
import { ChatDto, SetDutyDto } from './dto/support.dto.js'
import { GeminiService } from './gemini.service.js'
import { AI_GIOI_HAN_MOI_GIO, TEN_KHU_VUC, TRUC_HET_HAN_GIO, type KhuVuc } from './support.constants.js'

@Injectable()
export class SupportService {
  // Số lần hỏi AI của từng người trong 1 giờ gần nhất (lưu trong bộ nhớ, đủ cho một bản chạy)
  private readonly lanHoi = new Map<number, number[]>()

  constructor(
    @InjectRepository(TrucBan) private readonly truc: Repository<TrucBan>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly ai: GeminiService,
  ) {}

  // Cán bộ khác (không tính người đang hỏi) đang trực ở khu vực này và ca trực chưa hết hạn
  private async nguoiTruc(khuVuc: string, loaiTru: number) {
    const tu = new Date(Date.now() - TRUC_HET_HAN_GIO * 3600 * 1000)
    const rows = await this.truc
      .createQueryBuilder('t')
      .innerJoin(User, 'u', 'u.id = t.userId')
      .where('t.dangTruc = 1 AND t.khuVuc = :khuVuc AND t.capNhat > :tu AND t.userId <> :loaiTru AND u.hoatDong = 1', { khuVuc, tu, loaiTru })
      .select('u.hoTen', 'hoTen')
      .addSelect('u.email', 'email')
      .orderBy('t.capNhat', 'DESC')
      .getRawMany<{ hoTen: string; email: string }>()
    return rows
  }

  // Bảng truc_ban chưa tạo (DB_SYNC tắt và chưa chạy file SQL) thì coi như chưa có ai trực để AI vẫn hoạt động
  private async an<T>(fn: () => Promise<T>, dongBo: T): Promise<T> {
    try { return await fn() } catch { return dongBo }
  }

  async status(u: AuthUser, khuVucHoi?: string) {
    const own = await this.an(() => this.truc.findOneBy({ userId: u.id }), null)
    const homNay = own && own.dangTruc && own.capNhat.getTime() > Date.now() - TRUC_HET_HAN_GIO * 3600 * 1000
    const khuVuc = (khuVucHoi ?? own?.khuVuc ?? null) as KhuVuc | null
    const nguoiTruc = khuVuc ? await this.an(() => this.nguoiTruc(khuVuc, u.id), []) : []
    return {
      khuVuc,
      tenKhuVuc: khuVuc ? TEN_KHU_VUC[khuVuc] : null,
      toiDangTruc: Boolean(homNay),
      hetHanSauGio: TRUC_HET_HAN_GIO,
      nguoiTruc,
      coNguoiTruc: nguoiTruc.length > 0,
      aiSanSang: this.ai.sanSang,
    }
  }

  async setDuty(u: AuthUser, dto: SetDutyDto) {
    await this.truc.save({ userId: u.id, khuVuc: dto.khuVuc, dangTruc: dto.dangTruc, capNhat: new Date() })
    return this.status(u, dto.khuVuc)
  }

  private kiemTraGioiHan(userId: number) {
    const moc = Date.now() - 3600 * 1000
    const gan = (this.lanHoi.get(userId) ?? []).filter((t) => t > moc)
    if (gan.length >= AI_GIOI_HAN_MOI_GIO) {
      throw new HttpException(`Bạn đã hỏi trợ lý ${AI_GIOI_HAN_MOI_GIO} lần trong 1 giờ qua, vui lòng thử lại sau`, HttpStatus.TOO_MANY_REQUESTS)
    }
    gan.push(Date.now())
    this.lanHoi.set(userId, gan)
  }

  async chat(u: AuthUser, dto: ChatDto) {
    // Kiểm tra lại ở máy chủ, không tin giao diện: có người trực thì không dùng AI thay họ
    const nguoiTruc = await this.an(() => this.nguoiTruc(dto.khuVuc, u.id), [])
    if (nguoiTruc.length > 0) {
      throw new ForbiddenException('Đang có cán bộ trực ở khu vực này, vui lòng liên hệ trực tiếp cán bộ trực')
    }
    const turns = dto.messages
    if (turns[0].role !== 'user' || turns[turns.length - 1].role !== 'user') {
      throw new HttpException('Cuộc trò chuyện phải bắt đầu và kết thúc bằng tin nhắn của bạn', HttpStatus.BAD_REQUEST)
    }
    this.kiemTraGioiHan(u.id)
    return { reply: await this.ai.chat(turns) }
  }
}
