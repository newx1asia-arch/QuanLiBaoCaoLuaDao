import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Alert } from './entities/alert.entity.js'
import { SaveAlertDto, QueryAlertDto } from './dto/alert.dto.js'
import { KENH_LABEL, type KetQuaKenh, type NhatKyCanhBao } from './alerts.constants.js'
import { isAdmin } from '../auth/auth.constants.js'
import type { AuthUser } from '../auth/auth-user.js'

const log = (user: AuthUser, noiDung: string): NhatKyCanhBao => ({ time: new Date().toISOString(), nguoi: user.hoTen, nguoiId: user.id, noiDung })

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name)
  constructor(@InjectRepository(Alert) private repo: Repository<Alert>) {}

  async list(q: QueryAlertDto) {
    const items = await this.repo.find({ where: q.status ? { trangThai: q.status } : {}, order: { id: 'DESC' }, take: 200 })
    const rows = await this.repo.createQueryBuilder('a').select('a.trangThai', 's').addSelect('COUNT(*)', 'n').groupBy('a.trangThai').getRawMany()
    const counts: Record<string, number> = { all: 0 }
    rows.forEach((x) => { counts[x.s] = Number(x.n); counts.all += Number(x.n) })
    return { items, counts }
  }

  async get(id: number) {
    const a = await this.repo.findOneBy({ id })
    if (!a) throw new NotFoundException('Không tìm thấy cảnh báo')
    return a
  }

  // Chỉ người soạn (hoặc quản trị viên) được sửa, và chỉ khi chưa gửi duyệt hoặc đã bị từ chối
  private assertEditable(a: Alert, user: AuthUser) {
    if (a.nguoiSoanId !== user.id && !isAdmin(user.vaiTro)) throw new ForbiddenException('Chỉ người soạn hoặc quản trị viên được sửa cảnh báo này')
    if (!['nhap', 'tu_choi'].includes(a.trangThai)) throw new BadRequestException('Cảnh báo đã gửi duyệt hoặc đã phát hành, không thể sửa')
  }

  private normalize(dto: SaveAlertDto) {
    const tinhThanh = dto.phamVi === 'dia_ban' ? (dto.tinhThanh ?? []) : []
    return {
      tieuDe: dto.tieuDe, mucDo: dto.mucDo, noiDung: dto.noiDung,
      noiDungSms: dto.noiDungSms || null, noiDungUngDung: dto.noiDungUngDung || null, noiDungMxh: dto.noiDungMxh || null,
      kenh: dto.kenh, phamVi: dto.phamVi, tinhThanh,
    }
  }

  async create(dto: SaveAlertDto, user: AuthUser) {
    return this.repo.save(this.repo.create({
      ...this.normalize(dto), nguoiSoanId: user.id, nguoiSoan: user.hoTen, nhatKy: [log(user, 'Soạn cảnh báo (bản nháp)')],
    }))
  }

  async update(id: number, dto: SaveAlertDto, user: AuthUser) {
    const a = await this.get(id)
    this.assertEditable(a, user)
    Object.assign(a, this.normalize(dto))
    a.nhatKy = [...a.nhatKy, log(user, a.trangThai === 'tu_choi' ? 'Sửa lại sau khi bị từ chối' : 'Sửa bản nháp')]
    a.trangThai = 'nhap'
    return this.repo.save(a)
  }

  // Gửi duyệt: mỗi kênh đã chọn phải có nội dung, phạm vi theo địa bàn phải chọn ít nhất một tỉnh, thành
  async submit(id: number, user: AuthUser) {
    const a = await this.get(id)
    this.assertEditable(a, user)
    const thieu: string[] = []
    if (!a.noiDung.trim() && a.kenh.includes('website')) thieu.push(KENH_LABEL.website)
    if (a.kenh.includes('sms') && !a.noiDungSms) thieu.push(KENH_LABEL.sms)
    if (a.kenh.includes('ung_dung') && !a.noiDungUngDung) thieu.push(KENH_LABEL.ung_dung)
    if (a.kenh.includes('mang_xa_hoi') && !a.noiDungMxh) thieu.push(KENH_LABEL.mang_xa_hoi)
    if (thieu.length) throw new BadRequestException(`Chưa có nội dung cho: ${thieu.join(', ')}`)
    if (a.phamVi === 'dia_ban' && !a.tinhThanh.length) throw new BadRequestException('Chọn ít nhất một tỉnh, thành cho phạm vi theo địa bàn')
    a.trangThai = 'cho_duyet'
    a.ghiChuDuyet = null
    a.nhatKy = [...a.nhatKy, log(user, 'Gửi duyệt')]
    return this.repo.save(a)
  }

  // Duyệt / từ chối: chỉ quản trị viên và không được tự duyệt cảnh báo do chính mình soạn (hai người cùng xác nhận)
  private async review(id: number, user: AuthUser) {
    const a = await this.get(id)
    if (a.trangThai !== 'cho_duyet') throw new BadRequestException('Cảnh báo không ở trạng thái chờ duyệt')
    if (a.nguoiSoanId === user.id) throw new ForbiddenException('Bạn không thể tự duyệt cảnh báo do chính mình soạn. Hãy nhờ quản trị viên khác')
    return a
  }

  async approve(id: number, ghiChu: string | undefined, user: AuthUser) {
    const a = await this.review(id, user)
    a.trangThai = 'da_duyet'
    a.nguoiDuyetId = user.id
    a.nguoiDuyet = user.hoTen
    a.ghiChuDuyet = ghiChu || null
    a.nhatKy = [...a.nhatKy, log(user, ghiChu ? `Duyệt. Ghi chú: ${ghiChu}` : 'Duyệt')]
    return this.repo.save(a)
  }

  async reject(id: number, ghiChu: string | undefined, user: AuthUser) {
    if (!ghiChu) throw new BadRequestException('Vui lòng ghi rõ lý do từ chối')
    const a = await this.review(id, user)
    a.trangThai = 'tu_choi'
    a.nguoiDuyetId = user.id
    a.nguoiDuyet = user.hoTen
    a.ghiChuDuyet = ghiChu
    a.nhatKy = [...a.nhatKy, log(user, `Từ chối. Lý do: ${ghiChu}`)]
    return this.repo.save(a)
  }

  // Phát hành: chỉ cảnh báo đã duyệt. Website đăng ngay; kênh khác xếp hàng chờ gửi
  async publish(id: number, user: AuthUser) {
    const a = await this.get(id)
    if (a.trangThai !== 'da_duyet') throw new BadRequestException('Chỉ phát hành được cảnh báo đã duyệt')
    a.ketQuaKenh = await Promise.all(a.kenh.map((k) => this.dispatch(a, k)))
    a.trangThai = 'da_phat_hanh'
    a.phatHanhLuc = new Date()
    a.nhatKy = [...a.nhatKy, log(user, `Phát hành qua: ${a.kenh.map((k) => KENH_LABEL[k]).join(', ')}`)]
    return this.repo.save(a)
  }

  // ĐIỂM NỐI NHÀ CUNG CẤP: thay các nhánh dưới bằng lời gọi cổng SMS Brandname, dịch vụ push (FCM/APNs) và API mạng xã hội.
  // Hiện chỉ ghi nhận "cho_gui" để bộ phận kỹ thuật lấy từ cột ketQuaKenh mà gửi; hệ thống KHÔNG tự gửi tin ra ngoài.
  private async dispatch(a: Alert, kenh: string): Promise<KetQuaKenh> {
    if (kenh === 'website') return { kenh, trangThai: 'da_dang', ghiChu: 'Đã đăng trên website (API công khai /api/public/alerts)' }
    this.logger.log(`Cảnh báo #${a.id}: kênh ${kenh} đã xếp hàng chờ gửi (chưa tích hợp nhà cung cấp)`)
    return { kenh, trangThai: 'cho_gui', ghiChu: 'Đã xếp hàng chờ gửi, chưa tích hợp nhà cung cấp' }
  }

  async withdraw(id: number, ghiChu: string | undefined, user: AuthUser) {
    const a = await this.get(id)
    if (a.trangThai !== 'da_phat_hanh') throw new BadRequestException('Cảnh báo chưa được phát hành')
    a.trangThai = 'da_thu_hoi'
    a.nhatKy = [...a.nhatKy, log(user, ghiChu ? `Thu hồi khỏi website. Lý do: ${ghiChu}` : 'Thu hồi khỏi website')]
    return this.repo.save(a)
  }

  async remove(id: number, user: AuthUser) {
    const a = await this.get(id)
    this.assertEditable(a, user)
    await this.repo.delete(id)
    return { deleted: true }
  }

  // Danh sách cho website công khai: chỉ cảnh báo đã phát hành có kênh website, không lộ người soạn / người duyệt
  async publicList(province?: string) {
    const rows = await this.repo.find({ where: { trangThai: 'da_phat_hanh' }, order: { phatHanhLuc: 'DESC' }, take: 50 })
    return rows
      .filter((a) => a.kenh.includes('website') && (a.phamVi === 'toan_quoc' || !province || a.tinhThanh.includes(province)))
      .map((a) => ({ id: a.id, tieuDe: a.tieuDe, mucDo: a.mucDo, noiDung: a.noiDung, phamVi: a.phamVi, tinhThanh: a.tinhThanh, phatHanhLuc: a.phatHanhLuc }))
  }
}
