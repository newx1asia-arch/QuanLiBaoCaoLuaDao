import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOverview } from '../services/reportApi.js'
import { CAP_DO_NONG, formatMoneyShort, formatNumber, formatPercent, loaiNgan } from '../constants.js'
import VietnamMap, { MapLegend } from './VietnamMap.jsx'
import { IconChevronRight } from './Icons.jsx'
import { LoadingBlock, ErrorBlock } from './PageState.jsx'

const REFRESH_MS = 60000

// Địa bàn nóng nhất làm lựa chọn mặc định
export const hottest = (theoTinh) => [...(theoTinh ?? [])].sort((a, b) => b.soBaoCao - a.soBaoCao)[0]?.ma ?? null

// Khung thông tin bên phải bản đồ: số liệu của địa bàn đang chọn
export function HotspotPanel({ tinh, days }) {
  if (!tinh) return <div className="empty-state">Chọn một địa bàn trên bản đồ để xem chi tiết</div>
  const cap = CAP_DO_NONG[tinh.capDo] ?? CAP_DO_NONG.khong
  const chenh = tinh.truoc24h > 0 ? Math.round(((tinh.trong24h - tinh.truoc24h) / tinh.truoc24h) * 100) : null
  return (
    <div className="hp">
      <small className="hp-kicker">Địa bàn đang chọn</small>
      <div className="hp-title">
        <h3>{tinh.ten}</h3>
        <span className="hp-level" style={{ '--c': cap.color }}>{cap.label}</span>
      </div>
      <div className="hp-tiles">
        <div className="hp-tile"><small>Báo cáo / 24 giờ</small><b>{formatNumber(tinh.trong24h)}</b></div>
        <div className="hp-tile"><small>So với hôm qua</small><b className={chenh == null ? '' : chenh > 0 ? 'bad' : 'good'}>{chenh == null ? '—' : formatPercent(chenh)}</b></div>
        <div className="hp-tile"><small>Báo cáo / {days} ngày</small><b>{formatNumber(tinh.soBaoCao)}</b></div>
        <div className="hp-tile"><small>Đang xử lý</small><b>{formatNumber(tinh.dangXuLy)}</b></div>
      </div>
      <dl className="hp-list">
        <div><dt>Thiệt hại ghi nhận</dt><dd>{formatMoneyShort(tinh.thietHai)}</dd></div>
        <div><dt>Đã xác nhận</dt><dd>{formatNumber(tinh.daXacNhan)} báo cáo</dd></div>
        <div><dt>Hình thức phổ biến</dt><dd>{tinh.hinhThucPhoBien ? loaiNgan(tinh.hinhThucPhoBien) : 'Chưa có'}</dd></div>
        <div><dt>So với kỳ trước</dt><dd>{tinh.tangTruong == null ? 'Chưa có số liệu' : formatPercent(tinh.tangTruong)}</dd></div>
      </dl>
      <Link to={`/reports?province=${tinh.ma}`} className="hp-link">Xem báo cáo địa bàn <IconChevronRight /></Link>
    </div>
  )
}

// Bản đồ + khung chi tiết (dùng ở Bảng điều hành và trang Bản đồ điểm nóng)
export function HotspotBoard({ overview, selected, onSelect }) {
  const tinh = overview.theoTinh.find((t) => t.ma === selected)
  const coDiaBan = overview.theoTinh.some((t) => t.soBaoCao > 0)
  return (
    <div className="hotspot">
      <div className="hotspot-map">
        <VietnamMap data={overview.theoTinh} selected={selected} onSelect={onSelect} />
        <MapLegend />
      </div>
      <div className="hotspot-side">
        {coDiaBan || overview.chuaRoDiaBan.soBaoCao === 0
          ? <HotspotPanel tinh={tinh} days={overview.days} />
          : <div className="empty-state">Các báo cáo trong kỳ chưa ghi tỉnh, thành.<small>Hãy chọn địa bàn khi tạo báo cáo mới.</small></div>}
        {overview.chuaRoDiaBan.soBaoCao > 0 && (
          <p className="hp-note">
            {formatNumber(overview.chuaRoDiaBan.soBaoCao)} báo cáo trong kỳ chưa ghi địa bàn.{' '}
            <Link to="/reports?province=chua_ro">Xem danh sách</Link>
          </p>
        )}
      </div>
    </div>
  )
}

// Thẻ bản đồ trên Bảng điều hành: tự tải số liệu 30 ngày và làm mới mỗi phút (tạm dừng khi tab bị ẩn)
export default function HotspotMapCard() {
  const [overview, setOverview] = useState(null)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(false)
  const [live, setLive] = useState(true)

  useEffect(() => {
    let ignore = false
    const load = () => {
      if (document.hidden) return
      getOverview({ days: 30 })
        .then((o) => { if (ignore) return; setOverview(o); setLive(true); setError(false); setSelected((s) => s ?? hottest(o.theoTinh)) })
        .catch(() => { if (!ignore) { setLive(false); setError(true) } })
    }
    load()
    const t = setInterval(load, REFRESH_MS)
    return () => { ignore = true; clearInterval(t) }
  }, [])

  return (
    <section className="card hotspot-card" aria-labelledby="hotspot-title">
      <div className="card-head">
        <div>
          <h3 id="hotspot-title">Bản đồ điểm nóng toàn quốc <span className={`live-tag ${live ? '' : 'off'}`}>{live ? 'Trực tiếp' : 'Mất kết nối'}</span></h3>
          <p className="sub">Mật độ báo cáo và nguy cơ theo địa bàn trong 30 ngày qua</p>
        </div>
        <Link to="/hotspots" className="btn btn-secondary btn-sm">Mở toàn màn hình</Link>
      </div>
      {error && !overview ? <ErrorBlock onRetry={() => { setError(false); getOverview({ days: 30 }).then((o) => { setOverview(o); setSelected(hottest(o.theoTinh)) }).catch(() => setError(true)) }} />
        : !overview ? <LoadingBlock rows={4} />
        : <HotspotBoard overview={overview} selected={selected} onSelect={setSelected} />}
    </section>
  )
}
