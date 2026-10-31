import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Report } from './entities/report.entity.js'
import { ReportHistory } from './entities/report-history.entity.js'
import { CreateReportDto } from './dto/create-report.dto.js'
import { UpdateReportDto } from './dto/update-report.dto.js'
import { QueryReportDto } from './dto/query-report.dto.js'
import { TRANG_THAI_LABEL, normalizeTarget, tinhUuTien } from './reports.constants.js'
import { isStaff } from '../auth/auth.constants.js'
import type { AuthUser } from '../auth/auth-user.js'

const withPriority = (r: Report) => ({ ...r, uuTien: tinhUuTien(r.soTienThietHai) })

@Injectable()
export class ReportsService implements OnModuleInit {
  constructor(
    @InjectRepository(Report) private repo: Repository<Report>,
    @InjectRepository(ReportHistory) private hist: Repository<ReportHistory>,
  ) {}

  // Nạp vài báo cáo mẫu khi bảng còn trống để có dữ liệu thử API
  async onModuleInit() {
    if (await this.repo.count()) return
    const seed: CreateReportDto[] = [
      { tieuDe: 'Giả danh nhân viên ngân hàng yêu cầu cung cấp OTP', loai: 'gia_danh', doiTuong: '0912345678', soTienThietHai: 15000000, ngayXayRa: '2026-10-20', moTa: 'Tự xưng nhân viên ngân hàng, yêu cầu đọc mã OTP.', nguoiBaoCao: 'Nguyễn Văn A' },
      { tieuDe: 'Web đầu tư tiền ảo không cho rút tiền', loai: 'dau_tu', doiTuong: 'https://dautu-xyz.example.com', soTienThietHai: 80000000, ngayXayRa: '2026-10-15', moTa: 'Nạp tiền nhưng không rút được, bị yêu cầu đóng thêm phí.', nguoiBaoCao: 'Trần Thị B' },
      { tieuDe: 'Shop online nhận cọc rồi chặn liên lạc', loai: 'mua_ban', doiTuong: '0912 345 678', soTienThietHai: 2300000, ngayXayRa: '2026-10-10', moTa: 'Chuyển cọc xong thì bị chặn.', nguoiBaoCao: 'Phạm Thị D' },
    ]
    for (const s of seed) await this.insert(s, s.nguoiBaoCao!, null)
  }

  async list(q: QueryReportDto, user: AuthUser) {
    const { page = 1, pageSize = 8, sort = 'id', dir = 'desc' } = q
    const qb = this.repo.createQueryBuilder('r')
    if (!isStaff(user.vaiTro)) qb.andWhere('r.nguoiTaoId = :uid', { uid: user.id }) // người dân chỉ thấy báo cáo của mình
    if (q.mine === '1' && isStaff(user.vaiTro)) qb.andWhere('r.canBo = :me', { me: user.hoTen }) // báo cáo giao cho tôi
    if (q.type) qb.andWhere('r.loai = :type', { type: q.type })
    if (q.priority === 'cao') qb.andWhere('r.soTienThietHai >= 50000000')
    if (q.priority === 'trung_binh') qb.andWhere('r.soTienThietHai >= 10000000 AND r.soTienThietHai < 50000000')
    if (q.priority === 'thap') qb.andWhere('r.soTienThietHai < 10000000')
    if (q.keyword?.trim()) {
      qb.andWhere('(r.tieuDe LIKE :kw OR r.doiTuong LIKE :kw OR r.nguoiBaoCao LIKE :kw)', { kw: `%${q.keyword.trim()}%` })
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
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount()
    return { items: items.map(withPriority), total, counts }
  }

  // Tra cứu đối tượng: chỉ trả số liệu tổng hợp, không lộ nội dung báo cáo hay người báo cáo
  async lookup(raw: string) {
    const key = normalizeTarget(raw)
    if (key.length < 3) throw new BadRequestException('Nhập ít nhất 3 ký tự để tra cứu')
    // Báo cáo bị từ chối (không đúng sự thật / không đủ cơ sở) không được tính
    const rows = await this.repo.find({ where: { doiTuongKey: key } })
    const hopLe = rows.filter((r) => r.trangThai !== 'tu_choi')
    const daXacNhan = hopLe.filter((r) => r.trangThai === 'da_xac_nhan').length
    const theoLoai: Record<string, number> = {}
    hopLe.forEach((r) => (theoLoai[r.loai] = (theoLoai[r.loai] || 0) + 1))
    // Đã được cán bộ xác nhận, hoặc nhiều người cùng báo cáo thì coi là nguy hiểm
    const mucDo = hopLe.length === 0 ? 'chua_co' : daXacNhan > 0 || hopLe.length >= 3 ? 'nguy_hiem' : 'can_than'
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

  // user bỏ trống = gọi nội bộ (không giới hạn quyền)
  async get(id: number, user?: AuthUser) {
    const r = await this.repo.findOne({ where: { id }, relations: { lichSu: true }, order: { lichSu: { id: 'ASC' } } })
    const staff = !user || isStaff(user.vaiTro)
    // Báo cáo của người khác trả 404 (không phải 403) để không lộ việc nó có tồn tại
    if (!r || (!staff && r.nguoiTaoId !== user!.id)) throw new NotFoundException('Không tìm thấy báo cáo')
    const cungDoiTuong = (await this.repo.find({ where: { doiTuongKey: r.doiTuongKey } })).filter((x) => x.id !== id)
    return {
      ...withPriority(r),
      lichSu: staff ? r.lichSu : r.lichSu.filter((h) => !h.noiBo), // ẩn ghi chú nội bộ với người dân
      lienQuan: staff ? cungDoiTuong : [], // người dân chỉ biết số lượng, không xem được báo cáo của người khác
      soBaoCaoCungDoiTuong: cungDoiTuong.length + 1,
    }
  }

  private async insert(dto: CreateReportDto, nguoiBaoCao: string, nguoiTaoId: number | null) {
    const r = await this.repo.save(
      this.repo.create({
        ...dto,
        nguoiBaoCao,
        nguoiTaoId,
        soTienThietHai: dto.soTienThietHai ?? 0,
        doiTuongKey: normalizeTarget(dto.doiTuong),
      }),
    )
    await this.hist.save(this.hist.create({ report: r, noiDung: 'Tiếp nhận báo cáo', nguoi: 'Hệ thống' }))
    return r
  }

  async create(dto: CreateReportDto, user: AuthUser) {
    // Người dân: tên người báo cáo lấy theo tài khoản. Cán bộ/admin nhập hộ: phải nhập tên
    const nguoiBaoCao = isStaff(user.vaiTro) ? dto.nguoiBaoCao?.trim() : user.hoTen
    if (!nguoiBaoCao || nguoiBaoCao.length < 2) throw new BadRequestException('Vui lòng nhập tên người báo cáo')
    const r = await this.insert(dto, nguoiBaoCao, user.id)
    return this.get(r.id, user)
  }

  // Mỗi lần đổi trạng thái / phân công / ghi chú đều được ghi vào lịch sử
  async update(id: number, dto: UpdateReportDto, user: AuthUser) {
    const r = await this.repo.findOne({ where: { id } })
    if (!r) throw new NotFoundException('Không tìm thấy báo cáo')
    const ghiChu = dto.ghiChu?.trim()
    const logs: { noiDung: string; noiBo?: boolean }[] = []

    if (dto.canBo && dto.canBo !== r.canBo) {
      logs.push({ noiDung: `Phân công cho: ${dto.canBo}` })
      r.canBo = dto.canBo
    }
    if (dto.trangThai && dto.trangThai !== r.trangThai) {
      if (dto.trangThai === 'tu_choi' && !ghiChu) throw new BadRequestException('Vui lòng ghi rõ lý do khi từ chối báo cáo')
      const text = `Đổi trạng thái: ${TRANG_THAI_LABEL[r.trangThai]} → ${TRANG_THAI_LABEL[dto.trangThai]}`
      logs.push({ noiDung: ghiChu ? `${text}. Ghi chú: ${ghiChu}` : text })
      r.trangThai = dto.trangThai
    } else if (ghiChu) {
      logs.push({ noiDung: `Ghi chú nội bộ: ${ghiChu}`, noiBo: true })
    }

    await this.repo.save(r)
    if (logs.length) {
      await this.hist.save(logs.map((l) => this.hist.create({ report: r, noiDung: l.noiDung, noiBo: l.noiBo ?? false, nguoi: user.hoTen })))
    }
    return this.get(id, user)
  }

  async remove(id: number) {
    const r = await this.repo.findOneBy({ id })
    if (!r) throw new NotFoundException('Không tìm thấy báo cáo')
    await this.hist.createQueryBuilder().delete().where('reportId = :id', { id }).execute()
    await this.repo.remove(r)
    return { deleted: true }
  }

  // Người dân chỉ thấy số liệu của báo cáo do mình tạo
  async stats(user: AuthUser) {
    const where = isStaff(user.vaiTro) ? {} : { nguoiTaoId: user.id }
    const all = (await this.repo.find({ where, order: { id: 'DESC' } })).map(withPriority)
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
      lapLai: Object.values(byTarget).filter((t) => t.soLan >= 2).sort((a, b) => b.soLan - a.soLan),
      moiNhat: all.slice(0, 5),
    }
  }
}
