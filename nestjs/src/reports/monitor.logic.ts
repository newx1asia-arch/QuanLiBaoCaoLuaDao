import { kieuDoiTuong, mucDoDoiTuong, tinhNguyCo } from './reports.constants.js'

// Phần tính toán thuần (không đụng CSDL) của trang "Đối tượng nghi vấn" và khối "Giám sát trực tiếp"

export type ReportLite = {
  id: number
  tieuDe: string
  loai: string
  doiTuong: string
  doiTuongKey: string
  soTienThietHai: number
  ngayXayRa: string
  ngayTao: Date
  nguoiBaoCao: string
  trangThai: string
  canBo: string
  canBoId: number | null
}

export const DA_KET_LUAN = ['da_xac_nhan', 'tu_choi']
export const CUA_SO_NGAY = 30 // cụm báo cáo được xét trong 30 ngày gần nhất
export const CUA_SO_CHIEN_DICH_MS = CUA_SO_NGAY * 24 * 3600 * 1000

const soNguoi = (rows: ReportLite[]) => new Set(rows.map((r) => r.nguoiBaoCao.trim().toLowerCase())).size

export function demTheoLoai(rows: ReportLite[]) {
  const m: Record<string, number> = {}
  rows.forEach((r) => (m[r.loai] = (m[r.loai] || 0) + 1))
  return Object.entries(m).map(([loai, soLan]) => ({ loai, soLan })).sort((a, b) => b.soLan - a.soLan)
}

// Gom báo cáo theo đối tượng (khóa đã chuẩn hóa). Báo cáo bị từ chối không được tính.
// `rows` nên được sắp xếp mới nhất trước để tên hiển thị lấy theo báo cáo mới nhất.
export function gomDoiTuong(rows: ReportLite[]) {
  const nhom = new Map<string, ReportLite[]>()
  for (const r of rows) {
    if (r.trangThai === 'tu_choi') continue
    const g = nhom.get(r.doiTuongKey)
    if (g) g.push(r)
    else nhom.set(r.doiTuongKey, [r])
  }
  return [...nhom.entries()].map(([key, g]) => {
    const daXacNhan = g.filter((r) => r.trangThai === 'da_xac_nhan').length
    const nguoi = soNguoi(g)
    return {
      key,
      doiTuong: g[0].doiTuong,
      kieu: kieuDoiTuong(key),
      mucDo: mucDoDoiTuong(g.length, daXacNhan, nguoi),
      soBaoCao: g.length,
      soNguoiBaoCao: nguoi,
      daXacNhan,
      dangXuLy: g.filter((r) => !DA_KET_LUAN.includes(r.trangThai)).length,
      thietHai: g.reduce((s, r) => s + r.soTienThietHai, 0),
      loai: demTheoLoai(g),
      baoCaoGanNhat: g.map((r) => r.ngayXayRa).sort().at(-1) ?? null,
      lanDau: g.map((r) => r.ngayTao.getTime()).reduce((a, b) => Math.min(a, b), Infinity),
    }
  })
}

export type DoiTuongNghiVan = ReturnType<typeof gomDoiTuong>[number]

// Nguy hiểm trước, rồi tới số báo cáo, rồi tới thiệt hại
export const sapXepNghiVan = (a: DoiTuongNghiVan, b: DoiTuongNghiVan) =>
  Number(b.mucDo === 'nguy_hiem') - Number(a.mucDo === 'nguy_hiem') || b.soBaoCao - a.soBaoCao || b.thietHai - a.thietHai

// Chiến dịch nổi bật = hình thức lừa đảo có nhiều báo cáo nhất trong cửa sổ thời gian (tối thiểu 2 báo cáo).
// Trả về null nếu chưa có cụm nào đủ lớn.
export function timChienDich(rows: ReportLite[], now: number) {
  const trongKy = rows.filter((r) => r.trangThai !== 'tu_choi' && now - r.ngayTao.getTime() <= CUA_SO_CHIEN_DICH_MS)
  const theoLoai = new Map<string, ReportLite[]>()
  for (const r of trongKy) theoLoai.set(r.loai, [...(theoLoai.get(r.loai) ?? []), r])
  const top = [...theoLoai.entries()]
    .map(([loai, g]) => ({ loai, g, thietHai: g.reduce((s, r) => s + r.soTienThietHai, 0) }))
    .filter((x) => x.g.length >= 2)
    .sort((a, b) => b.g.length - a.g.length || b.thietHai - a.thietHai)[0]
  if (!top) return null

  const { loai, g, thietHai } = top
  const nguoi = soNguoi(g)
  const daKetLuan = g.filter((r) => DA_KET_LUAN.includes(r.trangThai)).length
  const doiTuong = gomDoiTuong(g).sort(sapXepNghiVan)
  const ngayDau = new Date(g.map((r) => r.ngayTao.getTime()).reduce((a, b) => Math.min(a, b), Infinity))
  const yymm = `${String(ngayDau.getUTCFullYear()).slice(2)}${String(ngayDau.getUTCMonth() + 1).padStart(2, '0')}`
  return {
    ma: `CD-${yymm}-${loai.replace(/_/g, '').toUpperCase()}`,
    loai,
    nguyCo: tinhNguyCo(thietHai, nguoi),
    soBaoCao: g.length,
    soDoiTuong: doiTuong.length,
    soNguoiBaoCao: nguoi,
    thietHai,
    daKetLuan,
    dangXuLy: g.length - daKetLuan,
    tyLeXuLy: Math.round((daKetLuan / g.length) * 100),
    soCanBo: new Set(g.map((r) => r.canBoId).filter((x) => x != null)).size,
    trangThai: daKetLuan === g.length ? 'da_xu_ly' : 'dang_xu_ly',
    tuNgay: ngayDau.toISOString(),
    cuaSoNgay: CUA_SO_NGAY,
    doiTuongNoiBat: doiTuong.slice(0, 5).map((d) => ({ doiTuong: d.doiTuong, soBaoCao: d.soBaoCao, mucDo: d.mucDo })),
    baoCaoIds: g.map((r) => r.id),
  }
}
