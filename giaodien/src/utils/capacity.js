import { DON_VI, TINH_THANH, VI_DO_BAC, mucTai } from '../constants.js'

const lat = Object.fromEntries(TINH_THANH.map((t) => [t.value, t.lat]))

// Báo cáo chưa ghi tỉnh được tính cho PA05 Hà Nội (đơn vị tiếp nhận mặc định) để không bị bỏ sót
const mienBac = (r) => (r.tinhThanh ? (lat[r.tinhThanh] ?? 0) >= VI_DO_BAC : true)

// Tải của từng đơn vị = số hồ sơ đang mở thuộc phạm vi của đơn vị đó
const RULES = {
  pa05_hn: (r) => mienBac(r),
  pa05_hcm: (r) => !mienBac(r),
  tt_giam_sat: (r) => r.trangThai === 'cho_xu_ly',
  to_xac_minh: (r) => r.trangThai === 'dang_xac_minh',
}

export function computeCapacity(openReports, congSuatOverride = {}) {
  const units = DON_VI.map((u) => {
    const congSuat = congSuatOverride[u.key] ?? u.congSuat
    const tai = openReports.filter(RULES[u.key]).length
    const percent = Math.round((tai / congSuat) * 100)
    return { ...u, congSuat, tai, percent, conTrong: Math.max(0, congSuat - tai), muc: mucTai(percent) }
  })
  const tongCS = units.reduce((s, u) => s + u.congSuat, 0)
  const tongTai = units.reduce((s, u) => s + u.tai, 0)
  const percent = Math.round((tongTai / tongCS) * 100)
  return {
    units, tongCS, tongTai, percent, muc: mucTai(percent),
    conTrong: units.reduce((s, u) => s + u.conTrong, 0),
    quaTai: units.filter((u) => u.percent >= 85).length,
  }
}
