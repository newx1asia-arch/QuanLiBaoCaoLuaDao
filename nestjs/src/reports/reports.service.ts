import {
  BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus,
  Injectable, NotFoundException, OnModuleInit,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Report } from './entities/report.entity.js'
import { ReportHistory } from './entities/report-history.entity.js'
import { User } from '../auth/entities/user.entity.js'
import { CreateReportDto } from './dto/create-report.dto.js'
import { UpdateReportDto } from './dto/update-report.dto.js'
import { QueryReportDto } from './dto/query-report.dto.js'
import { CHUA_PHAN_CONG, CHUA_RO_DIA_BAN, CHUYEN_TRANG_THAI, TRANG_THAI_LABEL, mucDoDoiTuong, normalizeTarget, tinhUuTien } from './reports.constants.js'
import { isAdmin } from '../auth/auth.constants.js'
import { escapeLike } from '../common/sql.util.js'
import type { AuthUser } from '../auth/auth-user.js'
import { seedDemo } from './demo-seed.js'

const withPriority = (r: Report) => ({ ...r, uuTien: tinhUuTien(r.soTienThietHai) })

const LOOKUP_MAX = 30 // mỗi tài khoản tối đa 30 lượt tra cứu
const LOOKUP_WINDOW_MS = 60 * 1000 // trong 1 phút

@Injectable()
export class ReportsService implements OnModuleInit {
  // Đếm lượt tra cứu theo tài khoản (trong bộ nhớ, mất khi khởi động lại server)
  private readonly lookups = new Map<number, { n: number; first: number }>()

  constructor(
    @InjectRepository(Report) private repo: Repository<Report>,
    @InjectRepository(ReportHistory) private hist: Repository<ReportHistory>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.backfill()
    // Đặt SEED_DEMO=true trong nestjs/.env để nạp thêm dữ liệu mẫu (có tỉnh, thành) xem thử bản đồ và biểu đồ. Chạy lại không nạp trùng
    if (process.env.SEED_DEMO === 'true') await seedDemo(this.repo.manager)
    if (await this.repo.count({ withDeleted: true })) return
    // Nạp vài báo cáo mẫu khi bảng còn trống để có dữ liệu thử API
    const seed: CreateReportDto[] = [
      { tieuDe: 'Giả danh nhân viên ngân hàng yêu cầu cung cấp OTP', loai: 'gia_danh', doiTuong: '0912345678', soTienThietHai: 15000000, ngayXayRa: '2026-10-20', moTa: 'Tự xưng nhân viên ngân hàng, yêu cầu đọc mã OTP.', nguoiBaoCao: 'Nguyễn Văn A', tinhThanh: 'ha_noi' },
      { tieuDe: 'Web đầu tư tiền ảo không cho rút tiền', loai: 'dau_tu', doiTuong: 'https://dautu-xyz.example.com', soTienThietHai: 80000000, ngayXayRa: '2026-10-15', moTa: 'Nạp tiền nhưng không rút được, bị yêu cầu đóng thêm phí.', nguoiBaoCao: 'Trần Thị B', tinhThanh: 'tp_hcm' },
      { tieuDe: 'Shop online nhận cọc rồi chặn liên lạc', loai: 'mua_ban', doiTuong: '0912 345 678', soTienThietHai: 2300000, ngayXayRa: '2026-10-10', moTa: 'Chuyển cọc xong thì bị chặn.', nguoiBaoCao: 'Phạm Thị D', tinhThanh: 'da_nang' },
    ]
    for (const s of seed) await this.insert(s, null, 'Hệ thống')
  }

  // Chạy mỗi lần khởi động (không hại gì nếu chạy lại): cập nhật khóa đối tượng theo cách chuẩn hóa mới
  // và gắn canBoId cho báo cáo cũ chỉ có tên cán bộ (chỉ khi tìm ra đúng 1 người khớp tên)
  private async backfill() {
    const rows = await this.repo.find({ withDeleted: true })
    for (const r of rows) {
      const patch: { doiTuongKey?: string; canBoId?: number } = {}
      const key = normalizeTarget(r.doiTuong)
      if (key !== r.doiTuongKey) patch.doiTuongKey = key
      if (r.canBoId == null && r.canBo !== CHUA_PHAN_CONG) {
        const found = await this.users.find({ where: { hoTen: r.canBo, hoatDong: true, vaiTro: In(['can_bo', 'admin']) } })
        if (found.length === 1) patch.canBoId = found[0].id
      }
      if (Object.keys(patch).length) await this.repo.update(r.id, patch)
    }
  }

  async list(q: QueryReportDto, user: AuthUser) {
    const { page = 1, pageSize = 8, sort = 'id', dir = 'desc' } = q
    const qb = this.repo.createQueryBuilder('r')
    if (q.mine === '1') qb.andWhere('r.canBoId = :me', { me: user.id }) // báo cáo giao cho tôi (theo id, không theo tên)
    if (q.type) qb.andWhere('r.loai = :type', { type: q.type })
    if (q.province === CHUA_RO_DIA_BAN) qb.andWhere('r.tinhThanh IS NULL')
    else if (q.province) qb.andWhere('r.tinhThanh = :province', { province: q.province })
    if (q.priority === 'cao') qb.andWhere('r.soTienThietHai >= 50000000')
    if (q.priority === 'trung_binh') qb.andWhere('r.soTienThietHai >= 10000000 AND r.soTienThietHai < 50000000')
    if (q.priority === 'thap') qb.andWhere('r.soTienThietHai < 10000000')
    if (q.keyword?.trim()) {
      const kw = q.keyword.trim()
      // Khớp thêm theo khóa chuẩn hóa để gõ "0912 345 678" vẫn tìm ra báo cáo lưu "0912345678"
      const key = normalizeTarget(kw)
      qb.andWhere('(r.tieuDe LIKE :kw OR r.doiTuong LIKE :kw OR r.nguoiBaoCao LIKE :kw OR r.doiTuongKey LIKE :key)', {
        kw: `%${escapeLike(kw)}%`,
        key: `%${escapeLike(key)}%`,
      })
    }

    // Số lượng theo từng trạng thái (áp dụng các bộ lọc khác, trừ trạng thái) để hiển thị trên tab
    const rows = await qb.clone().select('r.trangThai', 's').addSelect('COUNT(*)', 'n').groupBy('r.trangThai').getRawMany()
    const counts: Record<string, number> = { all: 0 }
    rows.forEach((x) => {
      counts[x.s] = Number(x.n)
      counts.all += Number(x.n)
    })

    if (q.status) qb.andWhere('r.trangThai = :st', { st: q.status })
    const [items, total] = await qb
      .orderBy(`r.${sort}`, dir === 'asc' ? 'ASC' : 'DESC') // sort đã được DTO giới hạn trong danh sách cho phép
      .addOrderBy('r.id', 'DESC') // cùng giá trị sắp xếp thì xếp theo id, nếu không các trang có thể bị lặp / sót báo cáo
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()
    return { items: items.map(withPriority), total, counts }
  }

  // Tra cứu đối tượng: chỉ trả số liệu tổng hợp. Giới hạn số lượt để không ai quét hàng loạt được dữ liệu
  async lookup(raw: string, user: AuthUser) {
    this.limitLookup(user.id)
    const key = normalizeTarget(raw)
    if (key.length < 3) throw new BadRequestException('Nhập ít nhất 3 ký tự để tra cứu')
    // Báo cáo bị từ chối (không đúng sự thật / không đủ cơ sở) không được tính
    const rows = await this.repo.find({ where: { doiTuongKey: key } })
    const hopLe = rows.filter((r) => r.trangThai !== 'tu_choi')
    const daXacNhan = hopLe.filter((r) => r.trangThai === 'da_xac_nhan').length
    // Đếm số NGƯỜI báo cáo khác nhau: một người nhập nhiều báo cáo không thể tự dựng cảnh báo "nguy hiểm"
    const soNguoiBaoCao = new Set(hopLe.map((r) => r.nguoiBaoCao.trim().toLowerCase())).size
    const theoLoai: Record<string, number> = {}
    hopLe.forEach((r) => (theoLoai[r.loai] = (theoLoai[r.loai] || 0) + 1))
    // Đã được cán bộ xác nhận, hoặc từ 3 người khác nhau cùng báo cáo thì coi là nguy hiểm (quy tắc dùng chung với trang Đối tượng nghi vấn)
    const mucDo = mucDoDoiTuong(hopLe.length, daXacNhan, soNguoiBaoCao)
    return {
      q: raw,
      mucDo,
      soBaoCao: hopLe.length,
      daXacNhan,
      tongThietHai: hopLe.reduce((s, r) => s + r.soTienThietHai, 0),
      loai: Object.entries(theoLoai).map(([loai, soLan]) => ({ loai, soLan })).sort((a, b) => b.soLan - a.soLan),
      baoCaoGanNhat: hopLe.map((r) => r.ngayXayRa).sort().at(-1) ?? null,
    }
  }

  async get(id: number) {
    const r = await this.repo.findOne({ where: { id }, relations: { lichSu: true }, order: { lichSu: { id: 'ASC' } } })
    if (!r) throw new NotFoundException('Không tìm thấy báo cáo')
    const cungDoiTuong = (await this.repo.find({ where: { doiTuongKey: r.doiTuongKey } })).filter((x) => x.id !== id)
    return {
      ...withPriority(r),
      lichSu: r.lichSu,
      lienQuan: cungDoiTuong,
      soBaoCaoCungDoiTuong: cungDoiTuong.length + 1,
    }
  }

  // Lưu báo cáo và dòng lịch sử đầu tiên trong cùng một giao dịch: hoặc có cả hai, hoặc không có gì
  private async insert(dto: CreateReportDto, nguoiTaoId: number | null, tenNguoiTao: string) {
    return this.repo.manager.transaction(async (m) => {
      const r = await m.save(
        m.create(Report, {
          ...dto,
          soTienThietHai: dto.soTienThietHai ?? 0,
          doiTuongKey: normalizeTarget(dto.doiTuong),
          nguoiTaoId,
        }),
      )
      await m.save(m.create(ReportHistory, { report: r, noiDung: 'Tiếp nhận báo cáo', nguoi: tenNguoiTao, nguoiId: nguoiTaoId }))
      return r
    })
  }

  async create(dto: CreateReportDto, user: AuthUser) {
    this.checkNgayXayRa(dto.ngayXayRa)
    const key = normalizeTarget(dto.doiTuong)
    if (key.length < 3) throw new BadRequestException('Đối tượng lừa đảo không hợp lệ')
    // Cùng người báo cáo + cùng đối tượng + cùng ngày thì là báo cáo trùng, không tạo thêm
    const trung = await this.repo.findOneBy({ doiTuongKey: key, nguoiBaoCao: dto.nguoiBaoCao, ngayXayRa: dto.ngayXayRa })
    if (trung) throw new ConflictException(`Trường hợp này đã được ghi nhận ở báo cáo #${trung.id}`)
    const r = await this.insert(dto, user.id, user.hoTen)
    return this.get(r.id)
  }

  // Quy tắc xử lý:
  //  - Báo cáo chưa ai nhận: cán bộ nào cũng nhận được (chỉ nhận cho chính mình). Chỉ admin phân công cho người khác / hủy phân công
  //  - Chỉ cán bộ đang phụ trách (hoặc admin) được đổi trạng thái và ghi chú
  //  - Trạng thái đi theo CHUYEN_TRANG_THAI; xác nhận / từ chối / mở lại bắt buộc ghi lý do; báo cáo đã kết thúc chỉ admin mở lại
  async update(id: number, dto: UpdateReportDto, user: AuthUser) {
    const r = await this.repo.findOneBy({ id })
    if (!r) throw new NotFoundException('Không tìm thấy báo cáo')
    if (dto.phienBan != null && dto.phienBan !== r.phienBan) {
      throw new ConflictException('Báo cáo vừa được người khác cập nhật, hãy tải lại trang rồi thao tác lại')
    }
    const admin = isAdmin(user.vaiTro)
    const ghiChu = dto.ghiChu?.trim()
    const dangDoi = dto.trangThai && dto.trangThai !== r.trangThai ? dto.trangThai : null
    const logs: string[] = []

    // --- 1. Phân công (theo id cán bộ, không theo họ tên) ---
    if (dto.canBoId !== undefined && dto.canBoId !== r.canBoId) {
      if (dto.canBoId === null) {
        if (!admin) throw new ForbiddenException('Chỉ quản trị viên được hủy phân công')
        logs.push('Hủy phân công')
        r.canBoId = null
        r.canBo = CHUA_PHAN_CONG
      } else {
        const nguoiNhan = await this.findStaffById(dto.canBoId)
        const nhanViec = r.canBoId == null && nguoiNhan.id === user.id
        if (!admin && !nhanViec) {
          throw new ForbiddenException('Bạn chỉ có thể nhận xử lý báo cáo chưa có người phụ trách. Muốn chuyển cho cán bộ khác, hãy nhờ quản trị viên.')
        }
        logs.push(nhanViec ? 'Nhận xử lý báo cáo' : `Phân công cho: ${nguoiNhan.hoTen}`)
        r.canBoId = nguoiNhan.id
        r.canBo = nguoiNhan.hoTen
      }
    }

    // --- 2. Quyền xử lý (đổi trạng thái / ghi chú) ---
    if (dangDoi || ghiChu) {
      if (r.canBoId == null) {
        if (admin) throw new BadRequestException('Hãy phân công cán bộ phụ trách trước khi xử lý báo cáo')
        logs.push('Nhận xử lý báo cáo') // cán bộ xử lý báo cáo chưa ai nhận thì tự động nhận
        r.canBoId = user.id
        r.canBo = user.hoTen
      } else if (r.canBoId !== user.id && !admin) {
        throw new ForbiddenException(`Báo cáo đang do ${r.canBo} phụ trách, bạn không có quyền xử lý`)
      }
    }

    // --- 3. Trạng thái / ghi chú ---
    if (dangDoi) {
      const tu = r.trangThai
      const hopLe = CHUYEN_TRANG_THAI[tu] ?? []
      const moLai = admin && hopLe.length === 0 && dangDoi === 'dang_xac_minh' // chỉ admin mở lại báo cáo đã kết thúc
      if (!hopLe.includes(dangDoi) && !moLai) {
        throw new BadRequestException(
          hopLe.length
            ? `Không thể chuyển từ "${TRANG_THAI_LABEL[tu]}" sang "${TRANG_THAI_LABEL[dangDoi]}"`
            : `Báo cáo đã "${TRANG_THAI_LABEL[tu]}" nên không thể đổi trạng thái. Chỉ quản trị viên được mở lại`,
        )
      }
      if ((dangDoi === 'tu_choi' || dangDoi === 'da_xac_nhan' || moLai) && !ghiChu) {
        throw new BadRequestException('Vui lòng ghi rõ căn cứ / lý do khi xác nhận, từ chối hoặc mở lại báo cáo')
      }
      const text = `Đổi trạng thái: ${TRANG_THAI_LABEL[tu]} → ${TRANG_THAI_LABEL[dangDoi]}`
      logs.push(ghiChu ? `${text}. Ghi chú: ${ghiChu}` : text)
      r.trangThai = dangDoi
    } else if (ghiChu) {
      logs.push(`Ghi chú: ${ghiChu}`)
    }

    if (!logs.length) return this.get(id) // không có gì thay đổi

    // Giao dịch: cập nhật có điều kiện theo phienBan (người khác sửa xen giữa thì affected = 0) + ghi lịch sử
    await this.repo.manager.transaction(async (m) => {
      const res = await m.update(Report, { id, phienBan: r.phienBan }, { trangThai: r.trangThai, canBo: r.canBo, canBoId: r.canBoId })
      if (!res.affected) throw new ConflictException('Báo cáo vừa được người khác cập nhật, hãy tải lại trang rồi thao tác lại')
      await m.save(logs.map((noiDung) => m.create(ReportHistory, { report: r, noiDung, nguoi: user.hoTen, nguoiId: user.id })))
    })
    return this.get(id)
  }

  // Xóa mềm: báo cáo biến mất khỏi hệ thống nhưng vẫn còn trong CSDL, kèm dòng lịch sử ghi ai đã xóa
  async remove(id: number, user: AuthUser) {
    const r = await this.repo.findOneBy({ id })
    if (!r) throw new NotFoundException('Không tìm thấy báo cáo')
    await this.repo.manager.transaction(async (m) => {
      await m.save(m.create(ReportHistory, { report: r, noiDung: 'Quản trị viên xóa báo cáo (dữ liệu vẫn được lưu trong CSDL)', nguoi: user.hoTen, nguoiId: user.id }))
      await m.softDelete(Report, id)
    })
    return { deleted: true }
  }

  async stats() {
    const all = (await this.repo.find({ order: { id: 'DESC' } })).map(withPriority)
    const byType: Record<string, number> = {}
    const byMonth: Record<string, number> = {}
    const byTarget: Record<string, { doiTuong: string; soLan: number; thietHai: number }> = {}
    all.forEach((r) => {
      byType[r.loai] = (byType[r.loai] || 0) + 1
      const m = r.ngayTao.toISOString().slice(0, 7)
      byMonth[m] = (byMonth[m] || 0) + 1
      const t = (byTarget[r.doiTuongKey] ||= { doiTuong: r.doiTuong, soLan: 0, thietHai: 0 })
      t.soLan += 1
      t.thietHai += r.soTienThietHai
    })
    const dem = (s: string) => all.filter((r) => r.trangThai === s).length
    return {
      tong: all.length,
      choXuLy: dem('cho_xu_ly'),
      dangXacMinh: dem('dang_xac_minh'),
      daXacNhan: dem('da_xac_nhan'),
      tongThietHai: all.reduce((s, r) => s + r.soTienThietHai, 0),
      byType,
      byMonth: Object.entries(byMonth).sort().slice(-6),
      canXuLyGap: all.filter((r) => ['cho_xu_ly', 'dang_xac_minh'].includes(r.trangThai) && r.uuTien === 'cao'),
      soDoiTuongNghiVan: new Set(all.filter((r) => r.trangThai !== 'tu_choi').map((r) => r.doiTuongKey)).size,
      lapLai: Object.values(byTarget).filter((t) => t.soLan >= 2).sort((a, b) => b.soLan - a.soLan),
      moiNhat: all.slice(0, 5),
    }
  }

  // Tìm cán bộ đang hoạt động theo id (không cho gán tài khoản không tồn tại / đã bị khóa)
  private async findStaffById(id: number) {
    const u = await this.users.findOneBy({ id, hoatDong: true, vaiTro: In(['can_bo', 'admin']) })
    if (!u) throw new BadRequestException('Không tìm thấy cán bộ này (hoặc tài khoản đã bị khóa)')
    return u
  }

  private checkNgayXayRa(d: string) {
    const t = new Date(`${d}T00:00:00Z`)
    if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== d) throw new BadRequestException('Ngày xảy ra không tồn tại')
    const gioiHan = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10) // dư 1 ngày cho chênh lệch múi giờ
    if (d > gioiHan) throw new BadRequestException('Ngày xảy ra không được ở tương lai')
    if (d < '2000-01-01') throw new BadRequestException('Ngày xảy ra quá xa, vui lòng kiểm tra lại')
  }

  private limitLookup(uid: number) {
    const now = Date.now()
    let e = this.lookups.get(uid)
    if (!e || now - e.first > LOOKUP_WINDOW_MS) e = { n: 0, first: now }
    e.n += 1
    this.lookups.set(uid, e)
    if (e.n > LOOKUP_MAX) throw new HttpException('Tra cứu quá nhanh, vui lòng thử lại sau ít phút', HttpStatus.TOO_MANY_REQUESTS)
    if (this.lookups.size > 5000) {
      for (const [k, v] of this.lookups) if (now - v.first > LOOKUP_WINDOW_MS) this.lookups.delete(k)
    }
  }
}
