import { SLA_GIO, SLA_SAP_QUA_HAN } from '../constants.js'

const HOUR = 3600 * 1000

// Thông tin SLA của một hồ sơ tại thời điểm now (ms)
export function slaOf(r, now) {
  const tong = (SLA_GIO[r.uuTien] ?? SLA_GIO.thap) * HOUR
  const han = new Date(r.ngayTao).getTime() + tong
  const conLai = han - now
  const daDung = Math.min(1, Math.max(0, (tong - conLai) / tong))
  return {
    tong, han, conLai, daDung,
    quaHan: conLai <= 0,
    sapQuaHan: conLai <= tong * SLA_SAP_QUA_HAN,
    mau: conLai <= 0 ? 'bad' : conLai <= tong * SLA_SAP_QUA_HAN ? 'warn' : 'ok',
  }
}

// 05:12:09 hoặc "Quá hạn 02:10:00"
export function formatCountdown(ms) {
  const abs = Math.abs(ms)
  const h = Math.floor(abs / HOUR)
  const m = Math.floor((abs % HOUR) / 60000)
  const s = Math.floor((abs % 60000) / 1000)
  const t = h >= 48 ? `${Math.floor(h / 24)} ngày ${h % 24} giờ` : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return ms < 0 ? `Quá hạn ${t}` : t
}

// Khẩn cấp nhất lên đầu: quá hạn trước, rồi theo thời gian còn lại ít nhất, cuối cùng theo mức ưu tiên
export const byUrgency = (now) => (a, b) => slaOf(a, now).conLai - slaOf(b, now).conLai
