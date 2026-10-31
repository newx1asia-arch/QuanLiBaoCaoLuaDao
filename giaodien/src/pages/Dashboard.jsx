import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStats } from '../services/reportApi.js'
import { loaiLabel, formatMoney, formatDate } from '../constants.js'
import StatusBadge from '../components/StatusBadge.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import { LoadingBlock, ErrorBlock } from '../components/PageState.jsx'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(false)

  const load = () => getStats().then(setStats).catch(() => setError(true))
  useEffect(() => { load() }, [])
  const retry = () => { setError(false); load() }

  if (error) return <ErrorBlock onRetry={retry} />
  if (!stats) return <LoadingBlock rows={5} />

  const maxType = Math.max(1, ...Object.values(stats.byType))
  const maxMonth = Math.max(1, ...stats.byMonth.map(([, n]) => n))

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Tổng quan</h1>
          <p>Việc cần làm và thống kê các báo cáo đã tiếp nhận</p>
        </div>
      </div>

      <div className="stat-grid">
        <Link to="/reports" className="stat"><div className="stat-label">Tổng báo cáo</div><div className="stat-value">{stats.tong}</div></Link>
        <div className="stat warn"><div className="stat-label">Chờ xử lý</div><div className="stat-value">{stats.choXuLy}</div></div>
        <div className="stat ok"><div className="stat-label">Đã xác nhận</div><div className="stat-value">{stats.daXacNhan}</div></div>
        <div className="stat danger"><div className="stat-label">Tổng thiệt hại</div><div className="stat-value money">{formatMoney(stats.tongThietHai)}</div></div>
      </div>

      <div className="card flush mb-1">
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

      <div className="dash-grid">
        <div className="card flush">
          <div className="card-head"><h3>Báo cáo mới nhất</h3><Link to="/reports" className="btn btn-secondary btn-sm">Xem tất cả</Link></div>
          <div className="table-wrap">
            <table className="stack">
              <thead><tr><th>Tiêu đề</th><th>Ngày tạo</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {stats.moiNhat.map((r) => (
                  <tr key={r.id} data-pri={r.uuTien}>
                    <td className="cell-title"><Link to={`/reports/${r.id}`}>{r.tieuDe}</Link></td>
                    <td className="nowrap" data-label="Ngày tạo">{formatDate(r.ngayTao)}</td>
                    <td data-label="Trạng thái"><StatusBadge value={r.trangThai} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Theo loại lừa đảo</h3></div>
          <ul className="progress-list">
            {Object.entries(stats.byType).map(([loai, count]) => (
              <li key={loai}>
                <div className="progress-top"><span>{loaiLabel(loai).split(' (')[0]}</span><b>{count}</b></div>
                <div className="progress-track"><i style={{ width: `${(count / maxType) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="dash-grid mt-1">
        <div className="card">
          <div className="card-head"><h3>Đối tượng bị báo cáo nhiều lần</h3></div>
          {stats.lapLai.length === 0 ? (
            <p className="muted">Chưa phát hiện đối tượng nào bị báo cáo từ 2 lần trở lên.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Đối tượng</th><th className="num">Số lần</th><th className="num">Tổng thiệt hại</th></tr></thead>
                <tbody>
                  {stats.lapLai.map((t) => (
                    <tr key={t.doiTuong}><td className="mono">{t.doiTuong}</td><td className="num">{t.soLan}</td><td className="num">{formatMoney(t.thietHai)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head"><h3>Báo cáo theo tháng</h3></div>
          <div className="bars">
            {stats.byMonth.map(([m, n]) => (
              <div key={m} className="bar-col">
                <b>{n}</b>
                <i style={{ height: `${(n / maxMonth) * 100}px` }} />
                <span>{m.slice(5)}/{m.slice(2, 4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
