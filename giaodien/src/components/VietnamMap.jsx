import { CAP_DO_NONG, TINH_THANH, formatNumber } from '../constants.js'

// Bản đồ điểm nóng vẽ bằng SVG, không cần thư viện hay kết nối mạng.
// LƯU Ý: đường viền dưới đây là hình giản lược dùng để minh họa, KHÔNG phải ranh giới hành chính chính thức.
// Khi triển khai chính thức, hãy thay VIEN_VN bằng dữ liệu bản đồ do cơ quan có thẩm quyền cung cấp.

const LON0 = 101.8, LAT0 = 23.6, KX = 33.5, KY = 36
const W = 470, H = 560
export const project = (lat, lon) => [(lon - LON0) * KX, (LAT0 - lat) * KY]

// [kinh độ, vĩ độ] đi vòng quanh lãnh thổ đất liền, bắt đầu từ Tây Bắc, theo chiều kim đồng hồ
const VIEN_VN = [
  [102.1, 22.4], [102.5, 22.8], [103.0, 22.45], [103.9, 22.5], [104.4, 22.8], [105.0, 23.2], [105.6, 23.1], [106.0, 22.95],
  [106.7, 22.85], [107.4, 22.0], [108.0, 21.55], [107.4, 21.25], [106.8, 20.7], [106.6, 20.2], [106.1, 19.95], [105.9, 19.4],
  [105.7, 18.9], [105.9, 18.4], [106.4, 17.9], [106.9, 17.2], [107.3, 16.6], [108.2, 16.1], [108.8, 15.4], [109.1, 14.6],
  [109.3, 13.8], [109.3, 13.0], [109.2, 12.2], [109.2, 11.6], [108.9, 11.2], [108.3, 10.8], [107.8, 10.5], [107.1, 10.35],
  [106.8, 10.3], [106.8, 9.9], [106.5, 9.6], [106.2, 9.35], [105.9, 9.1], [105.4, 8.7], [104.85, 8.6], [104.8, 8.85],
  [105.0, 9.5], [105.1, 10.0], [104.85, 10.35], [104.5, 10.45], [105.0, 10.9], [105.2, 11.0], [105.8, 11.6], [106.4, 11.7],
  [106.7, 11.95], [107.0, 12.3], [107.5, 12.35], [107.5, 13.0], [107.55, 14.2], [107.2, 14.45], [107.4, 15.1], [107.6, 15.6],
  [107.2, 16.2], [106.7, 17.0], [105.8, 17.7], [105.2, 18.4], [104.6, 18.9], [104.0, 19.3], [104.1, 19.7], [104.4, 20.3],
  [104.0, 20.9], [103.5, 21.2], [103.1, 21.6], [102.8, 22.0],
]
const toPath = (pts) => `M${pts.map(([lon, lat]) => project(lat, lon).map((v) => v.toFixed(1)).join(',')).join(' L')} Z`
const LAND = toPath(VIEN_VN)
// Phú Quốc, Côn Đảo: đảo lớn gần bờ
const PHU_QUOC = toPath([[103.85, 10.35], [104.05, 10.4], [104.05, 10.0], [103.95, 9.95], [103.85, 10.1]])
const CON_DAO = toPath([[106.55, 8.72], [106.65, 8.72], [106.65, 8.66], [106.55, 8.66]])

// Quần đảo Hoàng Sa (thuộc Đà Nẵng) và Trường Sa (thuộc Khánh Hòa): luôn thể hiện trên bản đồ
const HOANG_SA = [[16.55, 111.6], [16.5, 112.0], [16.45, 112.3], [16.1, 111.9]]
const TRUONG_SA = [[10.4, 114.3], [9.9, 114.0], [9.7, 113.6], [8.9, 113.2], [8.7, 112.9], [10.0, 114.5], [9.3, 113.8], [8.5, 112.6]]

const GRID_LAT = [10, 12, 14, 16, 18, 20, 22]
const GRID_LON = [104, 106, 108, 110, 112, 114]

// data: mảng theoTinh từ API (/stats/overview). selected: mã địa bàn đang chọn. onSelect(ma)
export default function VietnamMap({ data, selected, onSelect, labelCount = 6 }) {
  const byMa = Object.fromEntries((data ?? []).map((d) => [d.ma, d]))
  const rows = TINH_THANH.map((t) => ({ ...t, ...(byMa[t.value] ?? { soBaoCao: 0, capDo: 'khong' }) }))
  // Vẽ điểm nhỏ trước, điểm lớn sau; điểm đang chọn vẽ cuối cùng để không bị che
  const order = [...rows].sort((a, b) => (a.value === selected) - (b.value === selected) || a.soBaoCao - b.soBaoCao)

  // Đặt nhãn: ưu tiên địa bàn đang chọn rồi tới các địa bàn nhiều báo cáo nhất; nhãn nào đè lên nhãn hoặc điểm khác thì bỏ qua
  const pts = rows.map((r) => ({ r, c: project(r.lat, r.lon), rad: (CAP_DO_NONG[r.capDo] ?? CAP_DO_NONG.khong).r }))
  const boxes = pts.filter((p) => p.r.soBaoCao > 0).map((p) => [p.c[0] - p.rad - 1, p.c[1] - p.rad - 1, p.c[0] + p.rad + 1, p.c[1] + p.rad + 1, p.r.value])
  const placed = []
  const labels = {}
  const cands = [...pts].filter((p) => p.r.value === selected || p.r.soBaoCao > 0).sort((a, b) => (b.r.value === selected) - (a.r.value === selected) || b.r.soBaoCao - a.r.soBaoCao)
  for (const p of cands) {
    const on = p.r.value === selected
    if (!on && placed.length >= labelCount) break
    const w = p.r.label.length * (on ? 7.2 : 6.5)
    const west = p.r.lon < 105.3
    for (const side of west ? ['l', 'r'] : ['r', 'l']) {
      const x0 = side === 'r' ? p.c[0] + p.rad + 6 : p.c[0] - p.rad - 6 - w
      const box = [x0, p.c[1] - 9, x0 + w, p.c[1] + 5]
      const hit = (b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]
      const free = box[0] >= 0 && box[2] <= W && !placed.some(hit) && !boxes.some((b) => b[4] !== p.r.value && hit(b))
      if (free || on) {
        placed.push(box)
        labels[p.r.value] = side === 'l'
        break
      }
    }
  }

  return (
    <svg className="vnmap" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Bản đồ điểm nóng lừa đảo toàn quốc">
      <rect width={W} height={H} className="vnmap-sea" />
      {GRID_LAT.map((v) => <line key={`a${v}`} x1="0" x2={W} y1={project(v, 0)[1]} y2={project(v, 0)[1]} className="vnmap-grid" />)}
      {GRID_LON.map((v) => <line key={`o${v}`} y1="0" y2={H} x1={project(0, v)[0]} x2={project(0, v)[0]} className="vnmap-grid" />)}
      <text x={388} y={330} textAnchor="middle" className="vnmap-sea-text">Biển Đông</text>

      <path d={LAND} className="vnmap-land" />
      <path d={PHU_QUOC} className="vnmap-land" />
      <path d={CON_DAO} className="vnmap-land" />

      <g aria-label="Quần đảo Hoàng Sa">
        {HOANG_SA.map(([la, lo], i) => <circle key={i} cx={project(la, lo)[0]} cy={project(la, lo)[1]} r="2.4" className="vnmap-island" />)}
        <text x={project(16.75, 111.6)[0]} y={project(16.75, 111.6)[1]} className="vnmap-island-text">Quần đảo Hoàng Sa</text>
        <text x={project(16.75, 111.6)[0]} y={project(16.75, 111.6)[1] + 11} className="vnmap-island-sub">(Đà Nẵng)</text>
      </g>
      <g aria-label="Quần đảo Trường Sa">
        {TRUONG_SA.map(([la, lo], i) => <circle key={i} cx={project(la, lo)[0]} cy={project(la, lo)[1]} r="2.4" className="vnmap-island" />)}
        <text x={W - 28} y={project(11.0, 0)[1]} textAnchor="end" className="vnmap-island-text">Quần đảo Trường Sa</text>
        <text x={W - 28} y={project(11.0, 0)[1] + 11} textAnchor="end" className="vnmap-island-sub">(Khánh Hòa)</text>
      </g>

      {order.map((r) => {
        const [cx, cy] = project(r.lat, r.lon)
        const cap = CAP_DO_NONG[r.capDo] ?? CAP_DO_NONG.khong
        const on = r.value === selected
        const showLabel = r.value in labels
        const west = labels[r.value]
        const pick = () => onSelect?.(r.value)
        return (
          <g key={r.value} className={`vnmap-pt ${on ? 'on' : ''}`} role="button" tabIndex={0}
            aria-label={`${r.label}: ${r.soBaoCao} báo cáo, mức ${cap.label}`} aria-pressed={on}
            onClick={pick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick() } }}>
            <title>{`${r.label}: ${formatNumber(r.soBaoCao)} báo cáo · ${cap.label}`}</title>
            {r.capDo === 'rat_cao' && <circle cx={cx} cy={cy} r={cap.r + 4} fill={cap.color} className="vnmap-pulse" />}
            {r.soBaoCao > 0 && <circle cx={cx} cy={cy} r={cap.r + 9} fill={cap.color} opacity=".13" />}
            <circle cx={cx} cy={cy} r={cap.r} fill={cap.color} className="vnmap-dot" />
            {on && <circle cx={cx} cy={cy} r={cap.r + 5} fill="none" className="vnmap-ring" />}
            {showLabel && (
              <g transform={`translate(${west ? cx - cap.r - 6 : cx + cap.r + 6} ${cy + 4})`} className={on ? 'vnmap-tag on' : 'vnmap-tag'}>
                <text textAnchor={west ? 'end' : 'start'} className="vnmap-label">{r.label}</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// Chú giải mức độ, dùng chung cho các trang
export function MapLegend() {
  return (
    <ul className="map-legend" aria-label="Chú giải mức độ">
      {['rat_cao', 'cao', 'trung_binh', 'thap'].map((k) => (
        <li key={k}><i style={{ background: CAP_DO_NONG[k].color }} />{CAP_DO_NONG[k].label}</li>
      ))}
    </ul>
  )
}
