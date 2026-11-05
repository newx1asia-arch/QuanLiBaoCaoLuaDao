import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '../services/reportApi.js'
import { exportReportsCsv } from '../services/exportCsv.js'
import {
  HERO_BADGES, MUC_UU_TIEN, loaiLabel, formatMoney, formatMoneyShort, formatDateTime, reportCode,
} from '../constants.js'
import StatusBadge from '../components/StatusBadge.jsx'
import LiveMonitor from '../components/LiveMonitor.jsx'
import HotspotMapCard from '../components/HotspotMapCard.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import UrgentQueue from '../components/UrgentQueue.jsx'
import UnitCapacity from '../components/UnitCapacity.jsx'
import Toast from '../components/Toast.jsx'
import { BronzeDrum, CornerFrame, VietnamFlag } from '../components/VietnamMotifs.jsx'
import { useOpenReports } from '../hooks.js'
import { LoadingBlock, ErrorBlock } from '../components/PageState.jsx'
import {
  IconBolt, IconBriefcase, IconCart, IconChevronRight, IconClock, IconDots, IconDownload, IconEye, IconFile, IconGlobe,
  IconHeart, IconPlus, IconShield, IconTarget, IconTrendUp, IconUserCheck, IconWallet,
} from '../components/Icons.jsx'

// 6 tháng liên tiếp tính tới tháng hiện tại. Backend chỉ trả các tháng có báo cáo nên tháng trống được điền 0:
// nếu không, biểu đồ nối thẳng tháng 1 với tháng 4 và "so với tháng trước" so nhầm với một tháng cách xa
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
const lastMonths = (byMonth, n = 6) => {
  const have = Object.fromEntries(byMonth)
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const k = monthKey(new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1))
    return [k, have[k] ?? 0]
  })
}

const TYPE_COLORS = ['#9b111e', '#d97706', '#1f5a96', '#b7791f', '#1b7342', '#6b7280']

// Mỗi hình thức lừa đảo có một biểu tượng riêng
const TYPE_ICONS = {
  gia_danh: IconUserCheck, dau_tu: IconWallet, viec_lam: IconBriefcase, mua_ban: IconCart, tinh_cam: IconHeart, khac: IconDots,
}
const HERO_ICONS = { shield: IconShield, globe: IconGlobe, bolt: IconBolt }

// Đường xu hướng thu nhỏ trong thẻ KPI
function Spark({ data }) {
  const W = 120, H = 38, P = 4
  const max = Math.max(1, ...data)
  const pts = data.map((n, i) => [P + (i * (W - 2 * P)) / Math.max(1, data.length - 1), H - P - (n / max) * (H - 2 * P)])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lx, ly] = pts[pts.length - 1]
  return (
    <svg className="kpi-spark" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <path d={`${line} L${W - P},${H} L${P},${H} Z`} className="spark-area" />
      <path d={line} className="spark-line" />
      <circle cx={lx} cy={ly} r="3.4" className="spark-dot" />
    </svg>
  )
}

// Vòng phần trăm thu nhỏ trong thẻ KPI
function MiniRing({ percent }) {
  const r = 22, c = 2 * Math.PI * r
  const shown = Math.max(0, Math.min(100, percent))
  return (
    <svg className="kpi-ring" viewBox="0 0 56 56" role="img" aria-label={`${percent}%`}>
      <circle cx="28" cy="28" r={r} className="kpi-ring-bg" />
      <circle cx="28" cy="28" r={r} className="kpi-ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} transform="rotate(-90 28 28)" />
      <text x="28" y="33" textAnchor="middle" className="kpi-ring-txt">{percent}%</text>
    </svg>
  )
}

// Biểu đồ tròn phân loại hình thức lừa đảo
function TypeDonut({ types, total }) {
  const r = 54, c = 2 * Math.PI * r
  let acc = 0
  return (
    <svg className="type-donut" viewBox="0 0 140 140" role="img" aria-label="Tỷ lệ các hình thức lừa đảo">
      <circle cx="70" cy="70" r={r} className="tdonut-bg" />
      {types.map(([loai, count], i) => {
        const len = (count / total) * c
        const seg = Math.max(0, len - (types.length > 1 ? 3 : 0))
        const el = (
          <circle key={loai} cx="70" cy="70" r={r} className="tdonut-seg" stroke={TYPE_COLORS[i % TYPE_COLORS.length]}
            strokeDasharray={`${seg} ${c - seg}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)">
            <title>{`${loaiLabel(loai).split(' (')[0]}: ${count} báo cáo`}</title>
          </circle>
        )
        acc += len
        return el
      })}
      <text x="70" y="70" textAnchor="middle" className="tdonut-num">{total.toLocaleString('vi-VN')}</text>
      <text x="70" y="88" textAnchor="middle" className="tdonut-cap">báo cáo</text>
    </svg>
  )
}

// Biểu đồ vùng theo tháng, vẽ bằng SVG để không phải thêm thư viện
function TrendChart({ data }) {
  const W = 640, H = 250, L = 38, R = 16, T = 14, B = 30
  if (data.length === 0) return <div className="empty-state">Chưa có dữ liệu để vẽ biểu đồ</div>
  const rawMax = Math.max(1, ...data.map(([, n]) => n))
  const step = Math.max(1, Math.ceil(rawMax / 4))
  const max = step * 4
  const x = (i) => (data.length === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (data.length - 1))
  const y = (n) => T + (1 - n / max) * (H - T - B)
  const pts = data.map(([, n], i) => [x(i), y(n)])
  // Đường cong mượt đi qua các điểm
  const line = pts.reduce((d, [px, py], i) => {
    if (i === 0) return `M${px},${py}`
    const [qx, qy] = pts[i - 1]
    const cx = (qx + px) / 2
    return `${d} C${cx},${qy} ${cx},${py} ${px},${py}`
  }, '')
  const area = `${line} L${pts[pts.length - 1][0]},${H - B} L${pts[0][0]},${H - B} Z`
  return (
    <svg className="trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Biểu đồ số báo cáo theo tháng">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity=".28" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <line x1={L} x2={W - R} y1={y(k * step)} y2={y(k * step)} className="trend-grid" />
          <text x={L - 8} y={y(k * step) + 4} textAnchor="end" className="trend-tick">{k * step}</text>
        </g>
      ))}
      {data.length > 1 && <path d={area} fill="url(#trendFill)" />}
      {data.length > 1 && <path d={line} className="trend-line" />}
      {pts.map(([px, py], i) => (
        <g key={data[i][0]}>
          {i === pts.length - 1 && <circle cx={px} cy={py} r="11" className="trend-halo" />}
          {data[i][1] > 0 && <text x={px} y={py - 12} textAnchor="middle" className="trend-val">{data[i][1]}</text>}
          <circle cx={px} cy={py} r={i === pts.length - 1 ? 5.5 : 4.5} className={`trend-dot${i === pts.length - 1 ? ' last' : ''}`}><title>{`${data[i][0].slice(5)}/${data[i][0].slice(0, 4)}: ${data[i][1]} báo cáo`}</title></circle>
          <text x={px} y={H - 8} textAnchor="middle" className="trend-tick">{data[i][0].slice(5)}/{data[i][0].slice(2, 4)}</text>
        </g>
      ))}
    </svg>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [updated, setUpdated] = useState(null)
  const [error, setError] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState(null)
  const [range, setRange] = useState(6) // số tháng hiển thị trên biểu đồ xu hướng
  const open = useOpenReports()
  const showToast = (text, error = false) => setToast({ text, error })
  const closeToast = useCallback(() => setToast(null), [])

  const load = () => getStats().then((s) => { setStats(s); setUpdated(new Date()) }).catch(() => setError(true))
  useEffect(() => { load() }, [])
  const retry = () => { setError(false); load() }

  const onExport = async () => {
    setExporting(true)
    try {
      await exportReportsCsv()
    } catch (err) {
      window.alert(`Không xuất được file: ${err.message}`)
    } finally {
      setExporting(false)
    }
  }

  if (error) return <ErrorBlock onRetry={retry} />
  if (!stats) return <LoadingBlock rows={5} />

  const dangXuLy = stats.choXuLy + stats.dangXacMinh
  const tiLe = stats.tong ? Math.round((stats.daXacNhan / stats.tong) * 100) : 0
  const months = lastMonths(stats.byMonth)
  const trend = lastMonths(stats.byMonth, range)
  const last = months.at(-1)[1]
  const prev = months.at(-2)[1]
  const delta = prev ? Math.round(((last - prev) / prev) * 1000) / 10 : null
  const types = Object.entries(stats.byType).sort((a, b) => b[1] - a[1])
  const trendTotal = trend.reduce((sum, [, n]) => sum + n, 0)
  const trendPeak = trend.reduce((best, cur) => (cur[1] > best[1] ? cur : best), trend[0])
  const trendAvg = Math.round((trendTotal / trend.length) * 10) / 10
  const dangPct = stats.tong ? Math.round((dangXuLy / stats.tong) * 100) : 0
  const tbThietHai = stats.tong ? stats.tongThietHai / stats.tong : 0

  return (
    <>
      <nav className="crumbs" aria-label="Đường dẫn"><span>Trang chủ</span><i>›</i><b>Bảng điều hành</b></nav>
      <section className="hero" aria-labelledby="hero-title">
        <span className="hero-drum" aria-hidden="true"><BronzeDrum /></span>
        <CornerFrame />
        <span className="hero-flag"><VietnamFlag /></span>
        <div className="hero-body">
          <span className="hero-eyebrow"><IconTarget width={14} height={14} />Trung tâm điều hành</span>
          <h1 id="hero-title" className="display">Bảng điều hành tổng quan</h1>
          <p>Theo dõi, tiếp nhận và phối hợp xử lý các báo cáo lừa đảo trên toàn quốc.</p>
          <ul className="hero-badges">
            {HERO_BADGES.map((b) => {
              const Icon = HERO_ICONS[b.icon] ?? IconShield
              return <li key={b.text}><Icon width={16} height={16} />{b.text}</li>
            })}
          </ul>
          <small className="hero-updated">Dữ liệu được cập nhật lúc {updated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}, {updated.toLocaleDateString('vi-VN')}</small>
        </div>
        <div className="hero-actions">
          <button type="button" className="btn btn-ghost" onClick={onExport} disabled={exporting}>
            <IconDownload />{exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
          </button>
          <Link to="/reports/new" className="btn btn-gold"><IconPlus />Tiếp nhận báo cáo</Link>
        </div>
      </section>

      <div className="dash-section"><i /><h2>Giám sát và điều phối</h2></div>
      <LiveMonitor />

      <div className="ops-grid">
        <UrgentQueue reports={open.items} offline={open.offline} onChange={(id, fn) => { open.patch(id, fn); load() }} onToast={showToast} />
        <UnitCapacity reports={open.items} offline={open.offline} onToast={showToast} />
      </div>

      <div className="dash-section"><i /><h2>Chỉ số tổng hợp</h2></div>
      <div className="kpi-grid">
        <Link to="/reports" className="kpi kpi-red">
          <div className="kpi-top"><span>Tổng báo cáo</span><i className="kpi-icon"><IconFile width={24} height={24} /></i></div>
          <div className="kpi-mid">
            <div className="kpi-value">{stats.tong.toLocaleString("vi-VN")}</div>
            <Spark data={months.map(([, n]) => n)} />
          </div>
          <div className="kpi-foot">
            {delta !== null
              ? <><b className={delta >= 0 ? 'up' : 'down'}><IconTrendUp />{delta >= 0 ? '+' : ''}{delta}%</b> so với tháng trước</>
              : <>{last} báo cáo trong tháng này</>}
          </div>
        </Link>
        <Link to="/reports?status=cho_xu_ly" className="kpi kpi-orange">
          <div className="kpi-top"><span>Đang xử lý</span><i className="kpi-icon"><IconClock width={24} height={24} /></i></div>
          <div className="kpi-mid">
            <div className="kpi-value">{dangXuLy.toLocaleString("vi-VN")}</div>
            <MiniRing percent={dangPct} />
          </div>
          <div className="kpi-foot"><b>{stats.choXuLy}</b> chờ tiếp nhận · <b>{stats.dangXacMinh}</b> đang xác minh</div>
        </Link>
        <div className="kpi kpi-blue">
          <div className="kpi-top"><span>Đã xác minh</span><i className="kpi-icon"><IconShield width={24} height={24} /></i></div>
          <div className="kpi-mid">
            <div className="kpi-value">{stats.daXacNhan.toLocaleString("vi-VN")}</div>
            <MiniRing percent={tiLe} />
          </div>
          <div className="kpi-foot"><b className="up"><IconTrendUp />{tiLe}%</b> tỷ lệ xác minh</div>
        </div>
        <div className="kpi kpi-gold" title={formatMoney(stats.tongThietHai)}>
          <div className="kpi-top"><span>Thiệt hại ghi nhận</span><i className="kpi-icon"><IconWallet width={24} height={24} /></i></div>
          <div className="kpi-mid"><div className="kpi-value">{formatMoneyShort(stats.tongThietHai)}</div></div>
          <div className="kpi-foot">{stats.tong > 0 ? <>Trung bình <b>{formatMoneyShort(tbThietHai)}</b> mỗi báo cáo</> : 'Tổng số tiền từ các báo cáo'}</div>
        </div>
      </div>

      <div className="dash-section"><i /><h2>Phân bố địa bàn và xu hướng</h2></div>
      <HotspotMapCard />

      <div className="dash-grid">
        <div className="card">
          <div className="card-head">
            <div><h3>Xu hướng tiếp nhận báo cáo</h3><p className="sub">Số lượng báo cáo tiếp nhận trong {range} tháng gần nhất</p></div>
            <select className="field-select select-sm" value={range} onChange={(e) => setRange(Number(e.target.value))} aria-label="Khoảng thời gian">
              <option value={3}>3 tháng</option>
              <option value={6}>6 tháng</option>
              <option value={12}>12 tháng</option>
            </select>
          </div>
          <div className="trend-summary">
            <span><b>{trendTotal.toLocaleString('vi-VN')}</b> báo cáo</span>
            <span>Trung bình <b>{trendAvg}</b>/tháng</span>
            {trendPeak[1] > 0 && <span>Cao nhất <b>{trendPeak[1]}</b> ({trendPeak[0].slice(5)}/{trendPeak[0].slice(2, 4)})</span>}
          </div>
          <TrendChart data={trend} />
        </div>

        <div className="card">
          <div className="card-head">
            <div><h3>Phân loại hình thức lừa đảo</h3><p className="sub">Tỷ lệ trên tổng số báo cáo</p></div>
            <Link to="/statistics" className="head-link">Chi tiết<IconChevronRight /></Link>
          </div>
          {types.length === 0 ? <p className="muted">Chưa có báo cáo nào.</p> : (
            <div className="type-wrap">
            <TypeDonut types={types} total={stats.tong || 1} />
            <ul className="progress-list">
              {types.map(([loai, count], i) => {
                const Icon = TYPE_ICONS[loai] ?? IconDots
                const color = TYPE_COLORS[i % TYPE_COLORS.length]
                return (
                  <li key={loai} className="type-row" style={{ '--c': color }}>
                    <i className="type-icon"><Icon width={18} height={18} /></i>
                    <div className="type-main">
                      <div className="progress-top"><span>{loaiLabel(loai).split(' (')[0]}</span><b>{count} <small>({Math.round((count / stats.tong) * 100)}%)</small></b></div>
                      <div className="progress-track"><i style={{ width: `${(count / stats.tong) * 100}%`, background: color }} /></div>
                    </div>
                  </li>
                )
              })}
            </ul>
            </div>
          )}
        </div>
      </div>

      <div className="dash-section"><i /><h2>Hồ sơ và đối tượng</h2></div>
      <div className="card flush mb-1">
        <div className="card-head">
          <div>
            <h3>Báo cáo mới tiếp nhận {stats.choXuLy > 0 && <span className="pill">{stats.choXuLy} chờ xử lý</span>}</h3>
            <p className="sub">Danh sách báo cáo cần ưu tiên xác minh và xử lý</p>
          </div>
          <Link to="/reports" className="btn btn-secondary btn-sm">Xem tất cả</Link>
        </div>
        {stats.moiNhat.length === 0 ? (
          <div className="empty-state">Chưa có báo cáo nào</div>
        ) : (
          <div className="table-wrap">
            <table className="stack">
              <thead>
                <tr><th>Mã báo cáo</th><th>Nội dung báo cáo</th><th>Hình thức</th><th>Thời gian tiếp nhận</th><th>Mức độ</th><th>Trạng thái</th><th className="num">Thao tác</th></tr>
              </thead>
              <tbody>
                {stats.moiNhat.map((r) => (
                  <tr key={r.id} data-pri={r.uuTien}>
                    <td className="code" data-label="Mã"><Link to={`/reports/${r.id}`}>{reportCode(r)}</Link></td>
                    <td className="cell-title"><Link to={`/reports/${r.id}`}>{r.tieuDe}</Link><small className="mono">{r.doiTuong}</small></td>
                    <td data-label="Hình thức">{loaiLabel(r.loai).split(' (')[0]}</td>
                    <td className="nowrap" data-label="Tiếp nhận">{formatDateTime(r.ngayTao)}</td>
                    <td data-label="Mức độ"><span className="pri"><i />{MUC_UU_TIEN[r.uuTien]?.label ?? r.uuTien}</span></td>
                    <td data-label="Trạng thái"><StatusBadge value={r.trangThai} /></td>
                    <td className="row-actions"><Link to={`/reports/${r.id}`} className="icon-btn" aria-label={`Xem ${reportCode(r)}`} title="Xem chi tiết"><IconEye /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dash-grid even">
        <div className="card flush">
          <div className="card-head"><h3>Cần xử lý gấp ({stats.canXuLyGap.length})</h3></div>
          {stats.canXuLyGap.length === 0 ? (
            <div className="empty-state">Không có báo cáo ưu tiên cao nào đang tồn đọng</div>
          ) : (
            <table className="stack">
              <tbody>
                {stats.canXuLyGap.map((r) => (
                  <tr key={r.id} data-pri={r.uuTien}>
                    <td className="cell-title"><Link to={`/reports/${r.id}`}>{r.tieuDe}</Link></td>
                    <td className="num" data-label="Thiệt hại">{formatMoney(r.soTienThietHai)}</td>
                    <td data-label="Ưu tiên"><PriorityBadge value={r.uuTien} /></td>
                    <td data-label="Trạng thái"><StatusBadge value={r.trangThai} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card flush">
          <div className="card-head"><h3>Đối tượng bị báo cáo nhiều lần</h3><Link to="/suspects" className="btn btn-secondary btn-sm">Xem tất cả</Link></div>
          {stats.lapLai.length === 0 ? (
            <div className="empty-state">Chưa phát hiện đối tượng nào bị báo cáo từ 2 lần trở lên.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Đối tượng</th><th className="num">Số lần</th><th className="num">Tổng thiệt hại</th></tr></thead>
                <tbody>
                  {stats.lapLai.map((t) => (
                    <tr key={t.doiTuong}><td className="mono"><Link to={`/suspects?q=${encodeURIComponent(t.doiTuong)}`}>{t.doiTuong}</Link></td><td className="num">{t.soLan}</td><td className="num">{formatMoney(t.thietHai)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Toast toast={toast} onClose={closeToast} />
    </>
  )
}
