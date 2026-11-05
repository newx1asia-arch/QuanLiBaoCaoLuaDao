import { formatNumber } from '../constants.js'

// Bộ biểu đồ vẽ bằng SVG thuần (không thêm thư viện). Màu lấy từ biến CSS nên tự đổi theo giao diện sáng / tối.

// Chọn số tick "đẹp" cho trục tung: 0..max chia 4 khoảng
function niceScale(maxValue) {
  const step = Math.max(1, Math.ceil(Math.max(1, maxValue) / 4))
  const mag = 10 ** Math.floor(Math.log10(step))
  const nice = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((v) => v >= step) ?? step
  return { step: nice, max: nice * 4 }
}

// Chỉ hiển thị khoảng `max` nhãn trên trục ngang để không bị đè chữ
const sparse = (n, max = 8) => {
  const every = Math.max(1, Math.ceil(n / max))
  return (i) => i % every === 0 || i === n - 1
}

// ---------- Biểu đồ đường / vùng (nhiều đường) ----------
// series: [{ name, color, values: number[], area?: boolean }]
export function LineChart({ labels, series, height = 260, ariaLabel = 'Biểu đồ xu hướng' }) {
  const W = 680, H = height, L = 42, R = 16, T = 14, B = 30
  if (!labels.length) return <div className="empty-state">Chưa có dữ liệu để vẽ biểu đồ</div>
  const { step, max } = niceScale(Math.max(1, ...series.flatMap((s) => s.values)))
  const x = (i) => (labels.length === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (labels.length - 1))
  const y = (n) => T + (1 - n / max) * (H - T - B)
  const show = sparse(labels.length)
  const path = (pts) =>
    pts.reduce((d, [px, py], i) => {
      if (i === 0) return `M${px},${py}`
      const [qx] = pts[i - 1]
      const cx = (qx + px) / 2
      return `${d} C${cx},${pts[i - 1][1]} ${cx},${py} ${px},${py}`
    }, '')
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
      <defs>
        {series.map((s, k) => (
          <linearGradient key={k} id={`lc-fill-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity=".26" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <line x1={L} x2={W - R} y1={y(k * step)} y2={y(k * step)} className="chart-grid" />
          <text x={L - 8} y={y(k * step) + 4} textAnchor="end" className="chart-tick">{formatNumber(k * step)}</text>
        </g>
      ))}
      {series.map((s, k) => {
        const pts = s.values.map((v, i) => [x(i), y(v)])
        const d = path(pts)
        return (
          <g key={s.name}>
            {s.area && pts.length > 1 && <path d={`${d} L${pts.at(-1)[0]},${H - B} L${pts[0][0]},${H - B} Z`} fill={`url(#lc-fill-${k})`} />}
            {pts.length > 1 && <path d={d} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" />}
            {labels.length <= 40 && pts.map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r="3.6" fill="var(--surface)" stroke={s.color} strokeWidth="2">
                <title>{`${labels[i]} · ${s.name}: ${formatNumber(s.values[i])}`}</title>
              </circle>
            ))}
          </g>
        )
      })}
      {labels.map((lb, i) => show(i) && <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="chart-tick">{lb}</text>)}
    </svg>
  )
}

// ---------- Cột chồng (mỗi cột là một mốc thời gian, mỗi màu là một nhóm) ----------
// stacks: [{ key, name, color, values: number[] }]
export function StackedColumns({ labels, stacks, height = 260, ariaLabel = 'Biểu đồ cột chồng' }) {
  const W = 680, H = height, L = 42, R = 12, T = 14, B = 30
  if (!labels.length) return <div className="empty-state">Chưa có dữ liệu để vẽ biểu đồ</div>
  const totals = labels.map((_, i) => stacks.reduce((s, st) => s + st.values[i], 0))
  const { step, max } = niceScale(Math.max(1, ...totals))
  const slot = (W - L - R) / labels.length
  const bw = Math.min(34, slot * 0.68)
  const y = (n) => T + (1 - n / max) * (H - T - B)
  const show = sparse(labels.length)
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <line x1={L} x2={W - R} y1={y(k * step)} y2={y(k * step)} className="chart-grid" />
          <text x={L - 8} y={y(k * step) + 4} textAnchor="end" className="chart-tick">{formatNumber(k * step)}</text>
        </g>
      ))}
      {labels.map((lb, i) => {
        let acc = 0
        const cx = L + slot * i + slot / 2
        return (
          <g key={i}>
            {stacks.map((st) => {
              const v = st.values[i]
              if (!v) return null
              const y1 = y(acc + v)
              const h = y(acc) - y1
              acc += v
              return (
                <rect key={st.key} x={cx - bw / 2} y={y1} width={bw} height={Math.max(0, h - 0.6)} rx="1.5" fill={st.color}>
                  <title>{`${lb} · ${st.name}: ${formatNumber(v)}`}</title>
                </rect>
              )
            })}
            {show(i) && <text x={cx} y={H - 8} textAnchor="middle" className="chart-tick">{lb}</text>}
          </g>
        )
      })}
    </svg>
  )
}

// ---------- Biểu đồ tròn rỗng giữa (donut) ----------
// slices: [{ label, value, color }]
export function Donut({ slices, centerValue, centerLabel, size = 190 }) {
  const total = slices.reduce((s, x) => s + x.value, 0)
  const r = 70, c = 2 * Math.PI * r
  let offset = 0
  return (
    <svg className="donut" viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={`Biểu đồ tròn, tổng ${total}`}>
      <circle cx="100" cy="100" r={r} fill="none" stroke="var(--neutral-soft)" strokeWidth="26" />
      {total > 0 && slices.filter((s) => s.value > 0).map((s) => {
        const len = (s.value / total) * c
        const el = (
          <circle key={s.label} cx="100" cy="100" r={r} fill="none" stroke={s.color} strokeWidth="26"
            strokeDasharray={`${Math.max(0, len - 1.5)} ${c - Math.max(0, len - 1.5)}`} strokeDashoffset={-offset} transform="rotate(-90 100 100)">
            <title>{`${s.label}: ${formatNumber(s.value)} (${Math.round((s.value / total) * 100)}%)`}</title>
          </circle>
        )
        offset += len
        return el
      })}
      <text x="100" y="98" textAnchor="middle" className="donut-value">{centerValue}</text>
      <text x="100" y="120" textAnchor="middle" className="donut-label">{centerLabel}</text>
    </svg>
  )
}

// Chú thích đi kèm biểu đồ tròn
export function Legend({ items, total }) {
  return (
    <ul className="legend">
      {items.map((s) => (
        <li key={s.label}>
          <i style={{ background: s.color }} />
          <span>{s.label}</span>
          <b>{formatNumber(s.value)}</b>
          {total > 0 && <small>{Math.round((s.value / total) * 100)}%</small>}
        </li>
      ))}
    </ul>
  )
}

// ---------- Cột ngang xếp hạng ----------
// items: [{ key, label, value, color?, note? }]
export function HBars({ items, format = formatNumber, color = 'var(--primary)', onPick }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  if (!items.length) return <div className="empty-state">Chưa có dữ liệu</div>
  return (
    <ul className="hbars">
      {items.map((it, idx) => (
        <li key={it.key ?? it.label}>
          <div className="hbars-top">
            <span>
              <em>{idx + 1}</em>
              {onPick ? <button type="button" className="link-btn" onClick={() => onPick(it)}>{it.label}</button> : it.label}
            </span>
            <b>{format(it.value)}{it.note && <small>{it.note}</small>}</b>
          </div>
          <div className="progress-track"><i style={{ width: `${(it.value / max) * 100}%`, background: it.color ?? color }} /></div>
        </li>
      ))}
    </ul>
  )
}

// ---------- Bản đồ nhiệt: thứ trong tuần x giờ trong ngày ----------
const THU = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
export function Heatmap({ matrix }) {
  const max = Math.max(1, ...matrix.flat())
  const cw = 24, ch = 22, L = 28, T = 4
  return (
    <svg className="chart" viewBox={`0 0 ${L + cw * 24} ${T + ch * 7 + 22}`} role="img" aria-label="Khung giờ tiếp nhận báo cáo theo thứ trong tuần">
      {matrix.map((row, d) => (
        <g key={d}>
          <text x={L - 6} y={T + d * ch + ch / 2 + 4} textAnchor="end" className="chart-tick">{THU[d]}</text>
          {row.map((v, h) => (
            <rect key={h} x={L + h * cw + 1} y={T + d * ch + 1} width={cw - 2} height={ch - 2} rx="3"
              fill={v ? 'var(--primary)' : 'var(--neutral-soft)'} fillOpacity={v ? 0.18 + 0.82 * (v / max) : 1}>
              <title>{`${THU[d]}, ${h}h: ${v} báo cáo`}</title>
            </rect>
          ))}
        </g>
      ))}
      {[0, 6, 12, 18, 23].map((h) => <text key={h} x={L + h * cw + cw / 2} y={T + ch * 7 + 15} textAnchor="middle" className="chart-tick">{h}h</text>)}
    </svg>
  )
}
