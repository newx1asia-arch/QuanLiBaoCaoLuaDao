import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, MoreThanOrEqual, Not, Repository } from 'typeorm'
import { Report } from './entities/report.entity.js'
import { ReportHistory } from './entities/report-history.entity.js'
import { QuerySuspectDto } from './dto/query-suspect.dto.js'
import { escapeLike } from '../common/sql.util.js'
import { kieuDoiTuong, mucDoDoiTuong, NGUONG_NGUOI_BAO_CAO, normalizeTarget, TRANG_THAI } from './reports.constants.js'
import { CUA_SO_CHIEN_DICH_MS, DA_KET_LUAN, gomDoiTuong, sapXepNghiVan, timChienDich, type ReportLite } from './monitor.logic.js'

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

  // Danh sách đối tượng nghi vấn: gom các báo cáo theo SĐT / số tài khoản / link (báo cáo bị từ chối không tính).
  // MySQL gom nhóm và tính số liệu; chỉ mỗi đối tượng một dòng nhẹ được xử lý tiếp (lọc, sắp xếp, phân trang),
  // còn tên hiển thị và cơ cấu loại chỉ lấy cho các đối tượng nằm trong trang hiện tại
  async suspects(q: QuerySuspectDto) {
    const { page = 1, pageSize = 10 } = q
    const num = (v: unknown) => Number(v) || 0

    const qb = this.repo
      .createQueryBuilder('r')
      .select('r.doiTuongKey', 'key')
      .addSelect('COUNT(*)', 'soBaoCao')
      .addSelect('COUNT(DISTINCT LOWER(TRIM(r.nguoiBaoCao)))', 'soNguoi')
      .addSelect("SUM(r.trangThai = 'da_xac_nhan')", 'daXacNhan')
      .addSelect("SUM(r.trangThai IN ('cho_xu_ly', 'dang_xac_minh'))", 'dangXuLy')
      .addSelect('COALESCE(SUM(r.soTienThietHai), 0)', 'thietHai')
      .addSelect("DATE_FORMAT(MAX(r.ngayXayRa), '%Y-%m-%d')", 'ganNhat') // định dạng ngay trong SQL để không bị lệch ngày do múi giờ
      .addSelect('MIN(r.ngayTao)', 'lanDau')
      .addSelect('MAX(r.id)', 'moiNhatId')
      .where("r.trangThai <> 'tu_choi'")
      .groupBy('r.doiTuongKey')
    if (q.keyword?.trim()) {
      const kw = q.keyword.trim().toLowerCase()
      // Từ khóa chỉ gồm dấu câu (vd "-") có khóa chuẩn hóa rỗng, LIKE '%%' sẽ khớp mọi đối tượng: khi đó chỉ so theo tên hiển thị
      const key = normalizeTarget(kw)
      qb.having(key ? 'MAX(r.doiTuongKey LIKE :key) = 1 OR MAX(r.doiTuong LIKE :kw) = 1' : 'MAX(r.doiTuong LIKE :kw) = 1', {
        key: `%${escapeLike(key)}%`,
        kw: `%${escapeLike(kw)}%`,
      })
    }
    const raw = await qb.getRawMany()

    let list = raw.map((x) => {
      const soBaoCao = num(x.soBaoCao)
      const daXacNhan = num(x.daXacNhan)
      return {
        key: String(x.key),
        kieu: kieuDoiTuong(String(x.key)),
        mucDo: mucDoDoiTuong(soBaoCao, daXacNhan, num(x.soNguoi)),
        soBaoCao,
        soNguoiBaoCao: num(x.soNguoi),
        daXacNhan,
        dangXuLy: num(x.dangXuLy),
        thietHai: num(x.thietHai),
        baoCaoGanNhat: x.ganNhat ? String(x.ganNhat) : null,
        lanDau: x.lanDau instanceof Date ? x.lanDau : new Date(x.lanDau),
        moiNhatId: num(x.moiNhatId),
      }
    })
    if (q.kind) list = list.filter((d) => d.kieu === q.kind)

    // Số lượng theo mức độ (áp dụng các bộ lọc khác, trừ mức độ) để hiển thị trên tab
    const counts = {
      all: list.length,
      nguy_hiem: list.filter((d) => d.mucDo === 'nguy_hiem').length,
      can_than: list.filter((d) => d.mucDo === 'can_than').length,
    }
    if (q.level) list = list.filter((d) => d.mucDo === q.level)

    list.sort((a, b) => sapXepNghiVan(a, b) || b.moiNhatId - a.moiNhatId)
    const trang = list.slice((page - 1) * pageSize, page * pageSize)

    // Tên hiển thị (theo báo cáo mới nhất) và cơ cấu loại của các đối tượng trong trang
    const tenTheoId = new Map<number, string>()
    const loaiTheoKey = new Map<string, { loai: string; soLan: number }[]>()
    if (trang.length) {
      const tens = await this.repo.find({ select: { id: true, doiTuong: true }, where: { id: In(trang.map((d) => d.moiNhatId)) } })
      tens.forEach((r) => tenTheoId.set(r.id, r.doiTuong))
      const loai = await this.repo
        .createQueryBuilder('r')
        .select('r.doiTuongKey', 'key').addSelect('r.loai', 'loai').addSelect('COUNT(*)', 'soLan')
        .where("r.trangThai <> 'tu_choi'").andWhere('r.doiTuongKey IN (:...keys)', { keys: trang.map((d) => d.key) })
        .groupBy('r.doiTuongKey').addGroupBy('r.loai')
        .getRawMany()
      loai.forEach((x) => loaiTheoKey.set(x.key, [...(loaiTheoKey.get(x.key) ?? []), { loai: x.loai, soLan: num(x.soLan) }]))
    }

    const items = trang.map(({ moiNhatId, lanDau, ...d }) => ({
      ...d,
      doiTuong: tenTheoId.get(moiNhatId) ?? d.key,
      loai: (loaiTheoKey.get(d.key) ?? []).sort((a, b) => b.soLan - a.soLan),
      lanDau: lanDau.toISOString(),
    }))
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

  // Dữ liệu cho khối "Giám sát trực tiếp" trên Bảng điều hành. Web gọi lại mỗi 15 giây nên các con số được tính bằng truy vấn
  // tổng hợp trong MySQL; chỉ báo cáo trong 30 ngày gần nhất (cửa sổ tìm chiến dịch) mới được tải về
  async monitor() {
    const now = Date.now()
    const num = (v: unknown) => Number(v) || 0
    const base = () => this.repo.createQueryBuilder('r')

    const theoTrangThai = await base().select('r.trangThai', 's').addSelect('COUNT(*)', 'n').groupBy('r.trangThai').getRawMany()
    const dem: Record<string, number> = {}
    theoTrangThai.forEach((x) => (dem[x.s] = num(x.n)))
    const quyTrinh = TRANG_THAI.map((trangThai) => ({ trangThai, nhan: NHAN_QUY_TRINH[trangThai], soLuong: dem[trangThai] ?? 0 }))
    const tong = Object.values(dem).reduce((a, b) => a + b, 0)
    const daKetLuan = DA_KET_LUAN.reduce((a, t) => a + (dem[t] ?? 0), 0)

    const theoLoai = await base()
      .select('r.loai', 'loai').addSelect('COUNT(*)', 'soLan').where("r.trangThai <> 'tu_choi'").groupBy('r.loai').getRawMany()
    const baoCaoMoi24h = await base().where("r.trangThai <> 'tu_choi'").andWhere('r.ngayTao >= :t', { t: new Date(now - MOT_NGAY_MS) }).getCount()

    // Đối tượng nghi vấn / nguy hiểm: cùng quy tắc với mucDoDoiTuong (đã xác nhận, hoặc đủ số người báo cáo khác nhau)
    const soDoiTuongNghiVan = num((await base().select('COUNT(DISTINCT r.doiTuongKey)', 'n').where("r.trangThai <> 'tu_choi'").getRawOne())?.n)
    const nguyHiem = await this.repo.query(
      `SELECT COUNT(*) AS n FROM (
         SELECT doiTuongKey FROM reports WHERE xoaLuc IS NULL AND trangThai <> 'tu_choi' GROUP BY doiTuongKey
         HAVING SUM(trangThai = 'da_xac_nhan') > 0 OR COUNT(DISTINCT LOWER(TRIM(nguoiBaoCao))) >= ?
       ) t`,
      [NGUONG_NGUOI_BAO_CAO],
    )

    // Chiến dịch nổi bật + dòng thời gian diễn biến xử lý của các báo cáo thuộc chiến dịch đó
    const trongKy = (await this.repo.find({
      select: {
        id: true, tieuDe: true, loai: true, doiTuong: true, doiTuongKey: true, soTienThietHai: true, ngayXayRa: true,
        ngayTao: true, nguoiBaoCao: true, trangThai: true, canBo: true, canBoId: true,
      },
      where: { ngayTao: MoreThanOrEqual(new Date(now - CUA_SO_CHIEN_DICH_MS)), trangThai: Not('tu_choi') },
      order: { id: 'DESC' },
    })) as ReportLite[]
    const cum = timChienDich(trongKy, now)
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
      baoCaoMoi24h,
      soDoiTuongNghiVan,
      soDoiTuongNguyHiem: num(nguyHiem?.[0]?.n),
      quyTrinh,
      chienDich,
      theoLoai: theoLoai.map((x) => ({ loai: x.loai as string, soLan: num(x.soLan) })).sort((a, b) => b.soLan - a.soLan),
    }
  }
}
