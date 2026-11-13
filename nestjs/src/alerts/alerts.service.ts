import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Alert } from './entities/alert.entity.js'
import { SaveAlertDto, QueryAlertDto } from './dto/alert.dto.js'
import { KENH_LABEL, type KetQuaKenh, type NhatKyCanhBao } from './alerts.constants.js'
import { isAdmin } from '../auth/auth.constants.js'
import type { AuthUser } from '../auth/auth-user.js'

const XUNG_DOT = 'Cảnh báo vừa được người khác thao tác, hãy tải lại trang rồi thử lại'

const log = (user: AuthUser, noiDung: string): NhatKyCanhBao => ({ time: new Date().toISOString(), nguoi: user.hoTen, nguoiId: user.id, noiDung })

// Đã từng soạn, sửa hoặc gửi duyệt cảnh báo này (theo nhật ký). Duyệt / từ chối ở các vòng trước không tính
export const daThamGiaSoan = (a: { nhatKy: NhatKyCanhBao[] }, userId: number) =>
  (a.nhatKy ?? []).some((e) => e.nguoiId === userId && /^(Soạn|Sửa|Gửi duyệt)/.test(e.noiDung))

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

  // Cập nhật có điều kiện theo trạng thái hiện tại: nếu người khác đã đổi trạng thái xen giữa (hai tab, hai quản trị viên cùng bấm)
  // thì không ghi đè mà báo xung đột. Nhờ vậy một cảnh báo không bị duyệt / phát hành hai lần
  private async doiTrangThai(id: number, tu: string, fields: Record<string, unknown>) {
    const res = await this.repo.update({ id, trangThai: tu }, fields as never)
    if (!res.affected) throw new ConflictException(XUNG_DOT)
    return this.get(id)
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
    const nhatKy = [...a.nhatKy, log(user, a.trangThai === 'tu_choi' ? 'Sửa lại sau khi bị từ chối' : 'Sửa bản nháp')]
    return this.doiTrangThai(id, a.trangThai, { ...this.normalize(dto), nhatKy, trangThai: 'nhap' })
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
    return this.doiTrangThai(id, a.trangThai, { trangThai: 'cho_duyet', ghiChuDuyet: null, nhatKy: [...a.nhatKy, log(user, 'Gửi duyệt')] })
  }

  // Duyệt / từ chối: chỉ quản trị viên và không được tự duyệt cảnh báo do chính mình soạn (hai người cùng xác nhận)
  private async review(id: number, user: AuthUser) {
    const a = await this.get(id)
    if (a.trangThai !== 'cho_duyet') throw new BadRequestException('Cảnh báo không ở trạng thái chờ duyệt')
    // Người soạn, người đã sửa nội dung hoặc người đã bấm gửi duyệt đều không được tự duyệt / từ chối (nguyên tắc hai người xác nhận).
    // Trước đây chỉ kiểm tra người soạn gốc, nên một quản trị viên sửa bản nháp của người khác, gửi duyệt rồi tự duyệt vẫn qua được
    if (a.nguoiSoanId === user.id || daThamGiaSoan(a, user.id)) throw new ForbiddenException('Bạn không thể tự duyệt cảnh báo do chính mình soạn, sửa hoặc gửi duyệt. Hãy nhờ quản trị viên khác')
    return a
  }

  async approve(id: number, ghiChu: string | undefined, user: AuthUser) {
    const a = await this.review(id, user)
    return this.doiTrangThai(id, 'cho_duyet', {
      trangThai: 'da_duyet', nguoiDuyetId: user.id, nguoiDuyet: user.hoTen, ghiChuDuyet: ghiChu || null,
      nhatKy: [...a.nhatKy, log(user, ghiChu ? `Duyệt. Ghi chú: ${ghiChu}` : 'Duyệt')],
    })
  }

  async reject(id: number, ghiChu: string | undefined, user: AuthUser) {
    if (!ghiChu) throw new BadRequestException('Vui lòng ghi rõ lý do từ chối')
    const a = await this.review(id, user)
    return this.doiTrangThai(id, 'cho_duyet', {
      trangThai: 'tu_choi', nguoiDuyetId: user.id, nguoiDuyet: user.hoTen, ghiChuDuyet: ghiChu,
      nhatKy: [...a.nhatKy, log(user, `Từ chối. Lý do: ${ghiChu}`)],
    })
  }

  // Phát hành: chỉ cảnh báo đã duyệt. Website đăng ngay; kênh khác xếp hàng chờ gửi
  async publish(id: number, user: AuthUser) {
    const a = await this.get(id)
    if (a.trangThai !== 'da_duyet') throw new BadRequestException('Chỉ phát hành được cảnh báo đã duyệt')
    // Giành quyền phát hành trước (da_duyet -> da_phat_hanh): hai người cùng bấm thì chỉ một người qua được, kênh không bị gửi hai lần
    await this.doiTrangThai(id, 'da_duyet', { trangThai: 'da_phat_hanh', phatHanhLuc: new Date() })
    const ketQuaKenh = await Promise.all(a.kenh.map((k) => this.dispatch(a, k)))
    const nhatKy = [...a.nhatKy, log(user, `Phát hành qua: ${a.kenh.map((k) => KENH_LABEL[k]).join(', ')}`)]
    await this.repo.update(id, { ketQuaKenh, nhatKy } as never)
    return this.get(id)
  }

  // ĐIỂM NỐI NHÀ CUNG CẤP: thay các nhánh dưới bằng lời gọi cổng SMS Brandname, dịch vụ push (FCM/APNs) và API mạng xã hội.
  // Hiện chỉ ghi nhận "cho_gui" để bộ phận kỹ thuật lấy từ cột ketQuaKenh mà gửi; hệ thống KHÔNG tự gửi tin ra ngoài.
  private async dispatch(a: Alert, kenh: string): Promise<KetQuaKenh> {
    if (kenh === 'website') return { kenh, trangThai: 'da_dang', ghiChu: 'Đã đăng trên website (API công khai /api/public/alerts)' }
    this.logger.log(`Cảnh báo #${a.id}: kênh ${kenh} đã xếp hàng chờ gửi (chưa tích hợp nhà cung cấp)`)
    return { kenh, trangThai: 'cho_gui', ghiChu: 'Đã xếp hàng chờ gửi, chưa tích hợp nhà cung cấp' }
  }

  async withdraw(id: number, ghiChu: string | undefined, user: AuthUser) {
    // Thu hồi cảnh báo đã công khai phải có lý do để truy vết (như khi từ chối)
    if (!ghiChu) throw new BadRequestException('Vui lòng ghi rõ lý do thu hồi cảnh báo')
    const a = await this.get(id)
    if (a.trangThai !== 'da_phat_hanh') throw new BadRequestException('Cảnh báo chưa được phát hành')
    return this.doiTrangThai(id, 'da_phat_hanh', {
      trangThai: 'da_thu_hoi',
      nhatKy: [...a.nhatKy, log(user, `Thu hồi khỏi website. Lý do: ${ghiChu}`)],
    })
  }

  async remove(id: number, user: AuthUser) {
    const a = await this.get(id)
    this.assertEditable(a, user)
    // Chỉ xóa khi vẫn còn là bản nháp / bị từ chối (nếu vừa được gửi duyệt thì không xóa)
    const res = await this.repo.delete({ id, trangThai: In(['nhap', 'tu_choi']) })
    if (!res.affected) throw new ConflictException(XUNG_DOT)
    return { deleted: true }
  }

  // Danh sách cho website công khai: chỉ cảnh báo đã phát hành có kênh website, không lộ người soạn / người duyệt
  async publicList(province?: string) {
    // Lọc kênh website / địa bàn rồi mới giới hạn 50: nếu giới hạn trước, 50 cảnh báo mới nhất toàn là SMS hay tỉnh khác
    // thì trang công khai sẽ trống dù vẫn còn cảnh báo phù hợp ở phía sau. Đọc từng đợt cho tới khi đủ 50 hoặc hết dữ liệu
    const MAX = 50
    const BATCH = 100
    const out: ReturnType<typeof this.toPublic>[] = []
    for (let skip = 0; out.length < MAX; skip += BATCH) {
      const rows = await this.repo.find({ where: { trangThai: 'da_phat_hanh' }, order: { phatHanhLuc: 'DESC', id: 'DESC' }, skip, take: BATCH })
      for (const a of rows) {
        if (a.kenh.includes('website') && (a.phamVi === 'toan_quoc' || !province || a.tinhThanh.includes(province))) out.push(this.toPublic(a))
        if (out.length >= MAX) break
      }
      if (rows.length < BATCH) break
    }
    return out
  }

  private toPublic(a: Alert) {
    return { id: a.id, tieuDe: a.tieuDe, mucDo: a.mucDo, noiDung: a.noiDung, phamVi: a.phamVi, tinhThanh: a.tinhThanh, phatHanhLuc: a.phatHanhLuc }
  }
}
