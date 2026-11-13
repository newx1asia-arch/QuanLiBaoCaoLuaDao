import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOverview } from '../services/reportApi.js'
import { downloadCsv } from '../services/exportCsv.js'
import {
  CAP_DO_NONG, KHOANG_THOI_GIAN, LOAI_LUA_DAO, MAU_LOAI,
  formatMoneyShort, formatNumber, formatPercent, loaiNgan,
} from '../constants.js'
import { HotspotBoard, hottest } from '../components/HotspotMapCard.jsx'
import { HBars } from '../components/Charts.jsx'
import { LoadingBlock, ErrorBlock } from '../components/PageState.jsx'
import { IconDownload } from '../components/Icons.jsx'

export default function Hotspots() {
  const [days, setDays] = useState(30)
  const [type, setType] = useState('')
  const [data, setData] = useState(null)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [all, setAll] = useState(false)

  useEffect(() => {
    let ignore = false
    setError(false)
    getOverview({ days, type })
      .then((d) => {
        if (ignore) return
        setData(d)
        // Giữ địa bàn đang chọn nếu vẫn còn báo cáo, nếu không thì chọn địa bàn nóng nhất
        setSelected((s) => (s && d.theoTinh.find((t) => t.ma === s)?.soBaoCao ? s : hottest(d.theoTinh)))
      })
      .catch(() => { if (!ignore) setError(true) })
    return () => { ignore = true }
  }, [days, type, retry])

  if (error) return <ErrorBlock onRetry={() => setRetry((n) => n + 1)} />
  if (!data) return <LoadingBlock rows={6} />

  const sorted = [...data.theoTinh].sort((a, b) => b.soBaoCao - a.soBaoCao || b.thietHai - a.thietHai)
  const rows = all ? sorted : sorted.filter((t) => t.soBaoCao > 0)
  const nong = sorted.filter((t) => t.capDo === 'rat_cao' || t.capDo === 'cao')
  const top = sorted.filter((t) => t.soBaoCao > 0).slice(0, 8)

  const exportCsv = () => downloadCsv(
    `diem-nong-${days}-ngay.csv`,
    ['Địa bàn', 'Mức độ', 'Số báo cáo', 'Kỳ trước', 'Tăng / giảm (%)', 'Thiệt hại (đ)', 'Đang xử lý', 'Đã xác nhận', 'Hình thức phổ biến'],
    sorted.map((t) => [t.ten, CAP_DO_NONG[t.capDo]?.label, t.soBaoCao, t.soBaoCaoKyTruoc, t.tangTruong ?? '', t.thietHai, t.dangXuLy, t.daXacNhan, t.hinhThucPhoBien ? loaiNgan(t.hinhThucPhoBien) : '']),
  )

  return (
    <>
      <nav className="crumbs" aria-label="Đường dẫn"><span>Trang chủ</span><i>›</i><b>Bản đồ điểm nóng</b></nav>
      <div className="page-head">
        <div>
          <h1 className="display">Bản đồ điểm nóng toàn quốc</h1>
          <p>
            {nong.length > 0
              ? <>Có <b>{nong.length}</b> địa bàn ở mức cao hoặc rất cao trong {days} ngày gần nhất</>
              : <>Chưa có địa bàn nào ở mức cao trong {days} ngày gần nhất</>}
          </p>
        </div>
        <div className="head-actions no-print">
          <button type="button" className="btn btn-secondary" onClick={exportCsv}><IconDownload />Xuất CSV</button>
          <Link to="/statistics" className="btn btn-primary">Báo cáo thống kê</Link>
        </div>
      </div>

      <div className="filter-bar no-print">
        <div className="segmented" role="group" aria-label="Khoảng thời gian">
          {KHOANG_THOI_GIAN.map((k) => (
            <button key={k.value} type="button" className={days === k.value ? 'active' : ''} aria-pressed={days === k.value} onClick={() => setDays(k.value)}>{k.label}</button>
          ))}
        </div>
        <select className="field-select" value={type} onChange={(e) => setType(e.target.value)} aria-label="Hình thức lừa đảo">
          <option value="">Mọi hình thức</option>
          {LOAI_LUA_DAO.map((l) => <option key={l.value} value={l.value}>{loaiNgan(l.value)}</option>)}
        </select>
      </div>

      <section className="card hotspot-card mb-1" aria-label="Bản đồ">
        <HotspotBoard overview={data} selected={selected} onSelect={setSelected} />
      </section>

      <div className="dash-grid even">
        <div className="card">
          <div className="card-head"><div><h3>Xếp hạng địa bàn</h3><p className="sub">Số báo cáo trong {days} ngày, bấm tên để xem trên bản đồ</p></div></div>
          <HBars items={top.map((t) => ({ key: t.ma, label: t.ten, value: t.soBaoCao, color: CAP_DO_NONG[t.capDo].color, note: t.tangTruong == null ? '' : ` ${formatPercent(t.tangTruong)}` }))}
            onPick={(it) => { setSelected(it.key); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
        </div>
        <div className="card">
          <div className="card-head"><div><h3>Hình thức nổi bật theo địa bàn</h3><p className="sub">Hình thức bị báo cáo nhiều nhất ở các địa bàn nóng</p></div></div>
          {nong.length === 0 ? <div className="empty-state">Chưa có địa bàn nào ở mức cao.</div> : (
            <ul className="hot-list">
              {nong.slice(0, 8).map((t) => (
                <li key={t.ma}>
                  <i style={{ background: CAP_DO_NONG[t.capDo].color }} />
                  <button type="button" className="link-btn" onClick={() => { setSelected(t.ma); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>{t.ten}</button>
                  <span className="tag" style={{ '--c': MAU_LOAI[t.hinhThucPhoBien] ?? '#6b7280' }}>{t.hinhThucPhoBien ? loaiNgan(t.hinhThucPhoBien) : '—'}</span>
                  <b>{formatNumber(t.soBaoCao)}</b>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card flush mb-1">
        <div className="card-head">
          <div><h3>Số liệu chi tiết theo địa bàn</h3><p className="sub">{rows.length} địa bàn{!all && ' có báo cáo'}</p></div>
          <label className="check-inline no-print"><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} />Hiện cả địa bàn chưa có báo cáo</label>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Địa bàn</th><th>Mức độ</th><th className="num">Báo cáo</th><th className="num">So kỳ trước</th><th className="num">Thiệt hại</th><th className="num">Đang xử lý</th><th>Hình thức phổ biến</th><th /></tr></thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.ma} className={t.ma === selected ? 'row-on' : ''}>
                  <td><button type="button" className="link-btn" onClick={() => { setSelected(t.ma); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>{t.ten}</button></td>
                  <td><span className="level-dot"><i style={{ background: CAP_DO_NONG[t.capDo].color }} />{CAP_DO_NONG[t.capDo].label}</span></td>
                  <td className="num">{formatNumber(t.soBaoCao)}</td>
                  <td className="num">{t.tangTruong == null ? '—' : formatPercent(t.tangTruong)}</td>
                  <td className="num">{formatMoneyShort(t.thietHai)}</td>
                  <td className="num">{formatNumber(t.dangXuLy)}</td>
                  <td>{t.hinhThucPhoBien ? loaiNgan(t.hinhThucPhoBien) : '—'}</td>
                  <td className="row-actions">{t.soBaoCao > 0 && <Link to={`/reports?province=${t.ma}`} className="btn btn-secondary btn-sm">Xem báo cáo</Link>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
