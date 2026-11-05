import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Report } from './entities/report.entity.js'
import { ReportHistory } from './entities/report-history.entity.js'
import { QuerySuspectDto } from './dto/query-suspect.dto.js'
import { normalizeTarget, TRANG_THAI } from './reports.constants.js'
import { DA_KET_LUAN, demTheoLoai, gomDoiTuong, sapXepNghiVan, timChienDich } from './monitor.logic.js'

const HAI_GIO_MS = 2 * 3600 * 1000
const MOT_NGAY_MS = 24 * 3600 * 1000
const NHAN_QUY_TRINH: Record<string, string> = {
  cho_xu_ly: 'Chờ tiếp nhận',
  dang_xac_minh: 'Đang xác minh',
  da_xac_nhan: 'Đã xác nhận',
  tu_choi: 'Từ chối',
}

@Injectable()
export class MonitorService {
  constructor(
    @InjectRepository(Report) private repo: Repository<Report>,
    @InjectRepository(ReportHistory) private hist: Repository<ReportHistory>,
  ) {}

  // Danh sách đối tượng nghi vấn: gom các báo cáo theo SĐT / số tài khoản / link (báo cáo bị từ chối không tính)
  async suspects(q: QuerySuspectDto) {
    const { page = 1, pageSize = 10 } = q
    const rows = await this.repo.find({ order: { id: 'DESC' } })
    let list = gomDoiTuong(rows)

    if (q.keyword?.trim()) {
      const kw = q.keyword.trim().toLowerCase()
      const key = normalizeTarget(kw)
      list = list.filter((d) => d.key.includes(key) || d.doiTuong.toLowerCase().includes(kw))
    }
    if (q.kind) list = list.filter((d) => d.kieu === q.kind)

    // Số lượng theo mức độ (áp dụng các bộ lọc khác, trừ mức độ) để hiển thị trên tab
    const counts = {
      all: list.length,
      nguy_hiem: list.filter((d) => d.mucDo === 'nguy_hiem').length,
      can_than: list.filter((d) => d.mucDo === 'can_than').length,
    }
    if (q.level) list = list.filter((d) => d.mucDo === q.level)

    list.sort(sapXepNghiVan)
    const items = list.slice((page - 1) * pageSize, page * pageSize).map(({ lanDau, ...d }) => ({ ...d, lanDau: new Date(lanDau).toISOString() }))
    return {
      items,
      total: list.length,
      counts,
      tongThietHai: list.reduce((s, d) => s + d.thietHai, 0),
    }
  }

  // Hồ sơ một đối tượng: số liệu tổng hợp + các báo cáo liên quan (kể cả báo cáo đã bị từ chối, kèm trạng thái)
  async suspectDetail(raw: string) {
    const key = normalizeTarget(raw)
    if (key.length < 3) throw new BadRequestException('Đối tượng không hợp lệ')
    const rows = await this.repo.find({ where: { doiTuongKey: key }, order: { id: 'DESC' } })
    const tongHop = gomDoiTuong(rows)[0] ?? null
    return {
      key,
      doiTuong: rows[0]?.doiTuong ?? raw,
      tongHop: tongHop && { ...tongHop, lanDau: new Date(tongHop.lanDau).toISOString() },
      baoCao: rows.map((r) => ({
        id: r.id,
        tieuDe: r.tieuDe,
        loai: r.loai,
        trangThai: r.trangThai,
        soTienThietHai: r.soTienThietHai,
        ngayXayRa: r.ngayXayRa,
        ngayTao: r.ngayTao,
        canBo: r.canBo,
      })),
    }
  }

  // Dữ liệu cho khối "Giám sát trực tiếp" trên Bảng điều hành. Web gọi lại định kỳ để cập nhật.
  async monitor() {
    const now = Date.now()
    const rows = await this.repo.find({ order: { id: 'DESC' } })

    const quyTrinh = TRANG_THAI.map((trangThai) => ({
      trangThai,
      nhan: NHAN_QUY_TRINH[trangThai],
      soLuong: rows.filter((r) => r.trangThai === trangThai).length,
    }))
    const tong = rows.length
    const daKetLuan = rows.filter((r) => DA_KET_LUAN.includes(r.trangThai)).length
    const hopLe = rows.filter((r) => r.trangThai !== 'tu_choi')
    const nghiVan = gomDoiTuong(rows)

    // Chiến dịch nổi bật + dòng thời gian diễn biến xử lý của các báo cáo thuộc chiến dịch đó
    const cum = timChienDich(rows, now)
    let chienDich = null
    if (cum) {
      const { baoCaoIds, ...thongTin } = cum
      const lichSu = await this.hist.find({
        where: { report: { id: In(baoCaoIds) } },
        relations: { report: true },
        order: { id: 'DESC' },
        take: 200,
      })
      const dienBien = lichSu.slice(0, 8).map((h) => ({ id: h.id, time: h.time, noiDung: h.noiDung, nguoi: h.nguoi, reportId: h.report.id, tieuDe: h.report.tieuDe }))
      // Số lần kết luận (xác nhận / từ chối) trong 2 giờ qua
      const ketLuan2Gio = lichSu.filter((h) => now - h.time.getTime() <= HAI_GIO_MS && /→ (Đã xác nhận|Từ chối)/.test(h.noiDung)).length
      chienDich = { ...thongTin, ketLuan2Gio, dienBien }
    }

    return {
      capNhat: new Date(now).toISOString(),
      tiLeXuLy: tong ? Math.round((daKetLuan / tong) * 100) : 0,
      baoCaoMoi24h: hopLe.filter((r) => now - r.ngayTao.getTime() <= MOT_NGAY_MS).length,
      soDoiTuongNghiVan: nghiVan.length,
      soDoiTuongNguyHiem: nghiVan.filter((d) => d.mucDo === 'nguy_hiem').length,
      quyTrinh,
      chienDich,
      theoLoai: demTheoLoai(hopLe),
    }
  }
}
