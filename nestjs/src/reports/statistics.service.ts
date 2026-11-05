import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MoreThanOrEqual, Repository } from 'typeorm'
import { Report } from './entities/report.entity.js'
import { LOAI, TINH_THANH, TINH_THANH_LABEL, tinhUuTien } from './reports.constants.js'

const DAY = 24 * 3600 * 1000
const VN_OFFSET = 7 * 3600 * 1000 // giờ Việt Nam = UTC+7

// Dời thời điểm sang giờ Việt Nam để cắt ngày / giờ đúng với người dùng (đọc bằng các hàm getUTC*)
const vn = (d: Date) => new Date(d.getTime() + VN_OFFSET)
const dayKey = (d: Date) => vn(d).toISOString().slice(0, 10)
const monthKey = (d: Date) => vn(d).toISOString().slice(0, 7)
// Thứ Hai đầu tuần của ngày đó (dạng YYYY-MM-DD)
const weekKey = (d: Date) => {
  const t = vn(d)
  const back = (t.getUTCDay() + 6) % 7
  return new Date(t.getTime() - back * DAY).toISOString().slice(0, 10)
}

type Bucket = 'ngay' | 'tuan' | 'thang'

// Mức "nóng" của một địa bàn so với địa bàn nóng nhất (cần tối thiểu vài báo cáo để không báo động vì 1 vụ lẻ)
export const mucDiemNong = (n: number, max: number) => {
  if (n === 0 || max === 0) return 'khong'
  const ratio = n / max
  if (n >= 3 && ratio >= 0.66) return 'rat_cao'
  if (n >= 2 && ratio >= 0.33) return 'cao'
  if (ratio >= 0.12) return 'trung_binh'
  return 'thap'
}

const pct = (cur: number, prev: number) => (prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : null)

@Injectable()
export class StatisticsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  // Số liệu cho trang Thống kê và Bản đồ điểm nóng. Tính theo thời điểm tiếp nhận (ngayTao), báo cáo đã xóa mềm không tính.
  // Lấy gấp đôi khoảng thời gian để so sánh với kỳ liền trước.
  async overview(daysIn = 30, type?: string) {
    const days = daysIn
    const now = new Date()
    const since = new Date(now.getTime() - days * DAY)
    const prevSince = new Date(now.getTime() - 2 * days * DAY)
    const rows = (await this.repo.find({ where: { ngayTao: MoreThanOrEqual(prevSince) }, order: { id: 'ASC' } }))
      .filter((r) => !type || r.loai === type)
    const cur = rows.filter((r) => r.ngayTao >= since)
    const prev = rows.filter((r) => r.ngayTao < since)

    const sum = (a: Report[]) => a.reduce((s, r) => s + r.soTienThietHai, 0)
    const count = (a: Report[], st: string) => a.filter((r) => r.trangThai === st).length

    // ---- Tổng quan + so sánh kỳ trước ----
    const tong = cur.length
    const daXacNhan = count(cur, 'da_xac_nhan')
    const daKetThuc = daXacNhan + count(cur, 'tu_choi')
    const tongQuan = {
      tong,
      tongKyTruoc: prev.length,
      tangTruong: pct(tong, prev.length),
      thietHai: sum(cur),
      thietHaiKyTruoc: sum(prev),
      thietHaiTangTruong: pct(sum(cur), sum(prev)),
      choXuLy: count(cur, 'cho_xu_ly'),
      dangXacMinh: count(cur, 'dang_xac_minh'),
      daXacNhan,
      tuChoi: count(cur, 'tu_choi'),
      tiLeXacNhan: tong ? Math.round((daXacNhan / tong) * 100) : 0, // trên tổng báo cáo
      tiLeKetThuc: tong ? Math.round((daKetThuc / tong) * 100) : 0, // báo cáo đã có kết luận (xác nhận hoặc từ chối)
      thietHaiTrungBinh: tong ? Math.round(sum(cur) / tong) : 0,
      trong24h: rows.filter((r) => r.ngayTao.getTime() >= now.getTime() - DAY).length,
      truoc24h: rows.filter((r) => r.ngayTao.getTime() >= now.getTime() - 2 * DAY && r.ngayTao.getTime() < now.getTime() - DAY).length,
    }

    // ---- Xu hướng theo thời gian (ngày / tuần / tháng tùy khoảng chọn), có đủ các mốc kể cả mốc không có báo cáo ----
    const donVi: Bucket = days <= 31 ? 'ngay' : days <= 120 ? 'tuan' : 'thang'
    const keyOf = donVi === 'ngay' ? dayKey : donVi === 'tuan' ? weekKey : monthKey
    const keys: string[] = []
    if (donVi === 'thang') {
      const s0 = vn(since)
      const e0 = vn(now)
      let y = s0.getUTCFullYear()
      let mo = s0.getUTCMonth()
      while (y < e0.getUTCFullYear() || (y === e0.getUTCFullYear() && mo <= e0.getUTCMonth())) {
        keys.push(`${y}-${String(mo + 1).padStart(2, '0')}`)
        mo += 1
        if (mo > 11) { mo = 0; y += 1 }
      }
    } else {
      const step = donVi === 'ngay' ? DAY : 7 * DAY
      const startKey = keyOf(since)
      const endKey = keyOf(now)
      for (let t = new Date(`${startKey}T00:00:00Z`).getTime(); ; t += step) {
        const k = new Date(t).toISOString().slice(0, 10)
        keys.push(k)
        if (k >= endKey) break
      }
    }
    const diem = new Map(keys.map((k) => [k, { nhan: k, tong: 0, daXacNhan: 0, thietHai: 0, theoLoai: Object.fromEntries(LOAI.map((l) => [l, 0])) as Record<string, number> }]))
    cur.forEach((r) => {
      const b = diem.get(keyOf(r.ngayTao))
      if (!b) return
      b.tong += 1
      b.thietHai += r.soTienThietHai
      if (r.trangThai === 'da_xac_nhan') b.daXacNhan += 1
      b.theoLoai[r.loai] += 1
    })

    // ---- Theo hình thức lừa đảo ----
    const theoLoai = LOAI.map((l) => {
      const a = cur.filter((r) => r.loai === l)
      const p = prev.filter((r) => r.loai === l).length
      return { loai: l, soBaoCao: a.length, thietHai: sum(a), tangTruong: pct(a.length, p) }
    }).sort((a, b) => b.soBaoCao - a.soBaoCao)

    // ---- Theo địa bàn (bản đồ điểm nóng) ----
    const maxN = Math.max(0, ...TINH_THANH.map((t) => cur.filter((r) => r.tinhThanh === t).length))
    const theoTinh = TINH_THANH.map((ma) => {
      const a = cur.filter((r) => r.tinhThanh === ma)
      const p = prev.filter((r) => r.tinhThanh === ma).length
      const loaiDem: Record<string, number> = {}
      a.forEach((r) => (loaiDem[r.loai] = (loaiDem[r.loai] || 0) + 1))
      const phoBien = Object.entries(loaiDem).sort((x, y) => y[1] - x[1])[0]
      return {
        ma,
        ten: TINH_THANH_LABEL[ma],
        soBaoCao: a.length,
        soBaoCaoKyTruoc: p,
        tangTruong: pct(a.length, p),
        thietHai: sum(a),
        dangXuLy: a.filter((r) => r.trangThai === 'cho_xu_ly' || r.trangThai === 'dang_xac_minh').length,
        daXacNhan: count(a, 'da_xac_nhan'),
        trong24h: a.filter((r) => r.ngayTao.getTime() >= now.getTime() - DAY).length,
        truoc24h: rows.filter((r) => r.tinhThanh === ma && r.ngayTao.getTime() >= now.getTime() - 2 * DAY && r.ngayTao.getTime() < now.getTime() - DAY).length,
        hinhThucPhoBien: phoBien ? phoBien[0] : null,
        capDo: mucDiemNong(a.length, maxN),
      }
    })
    const chuaRo = cur.filter((r) => !r.tinhThanh)

    // ---- Mức ưu tiên (theo thiệt hại) ----
    const uuTien = { cao: 0, trung_binh: 0, thap: 0 } as Record<string, number>
    cur.forEach((r) => (uuTien[tinhUuTien(r.soTienThietHai)] += 1))

    // ---- Khung giờ tiếp nhận: [thứ 0=Thứ Hai ... 6=Chủ nhật][giờ 0-23], giờ Việt Nam ----
    const nhietDo: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
    cur.forEach((r) => {
      const t = vn(r.ngayTao)
      nhietDo[(t.getUTCDay() + 6) % 7][t.getUTCHours()] += 1
    })

    // ---- Đối tượng bị báo cáo nhiều nhất trong kỳ ----
    const byTarget = new Map<string, { doiTuong: string; soBaoCao: number; thietHai: number }>()
    cur.filter((r) => r.trangThai !== 'tu_choi').forEach((r) => {
      const t = byTarget.get(r.doiTuongKey) ?? { doiTuong: r.doiTuong, soBaoCao: 0, thietHai: 0 }
      t.soBaoCao += 1
      t.thietHai += r.soTienThietHai
      byTarget.set(r.doiTuongKey, t)
    })
    const topDoiTuong = [...byTarget.values()].filter((t) => t.soBaoCao >= 2).sort((a, b) => b.soBaoCao - a.soBaoCao || b.thietHai - a.thietHai).slice(0, 8)

    return {
      days,
      type: type ?? null,
      capNhatLuc: now.toISOString(),
      tongQuan,
      xuHuong: { donVi, diem: [...diem.values()] },
      theoLoai,
      theoTinh,
      chuaRoDiaBan: { soBaoCao: chuaRo.length, thietHai: sum(chuaRo) },
      uuTien,
      nhietDo,
      topDoiTuong,
    }
  }
}
