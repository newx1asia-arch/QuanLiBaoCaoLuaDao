import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReports } from '../services/reportApi.js'
import { LOAI_LUA_DAO, TRANG_THAI, MUC_UU_TIEN, loaiLabel, formatMoney, formatDate, isStaff } from '../constants.js'
import { useAuth } from '../context/auth-context.js'
import StatusBadge from '../components/StatusBadge.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import { LoadingBlock, ErrorBlock } from '../components/PageState.jsx'

const PAGE_SIZE = 8

export default function ReportList() {
  const { user } = useAuth()
  const [data, setData] = useState({ items: [], total: 0, counts: { all: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [f, setF] = useState({ keyword: '', status: '', type: '', priority: '', mine: '', sort: 'id', dir: 'desc', page: 1 })

  const set = (patch) => setF((p) => ({ ...p, page: 1, ...patch }))
  const sortBy = (col) => set({ sort: col, dir: f.sort === col && f.dir === 'desc' ? 'asc' : 'desc' })
  const arrow = (col) => (f.sort === col ? (f.dir === 'asc' ? ' ▲' : ' ▼') : '')

  useEffect(() => {
    let ignore = false // bỏ qua kết quả của lần gọi cũ nếu bộ lọc đã đổi
    setLoading(true)
    getReports({ ...f, pageSize: PAGE_SIZE })
      .then((d) => { if (!ignore) { setData(d); setError(false); setLoading(false) } })
      .catch(() => { if (!ignore) { setError(true); setLoading(false) } })
    return () => { ignore = true }
  }, [f, retry])

  const exportCsv = async () => {
    const { items } = await getReports({ ...f, page: 1, pageSize: 100000 })
    const head = ['ID', 'Tiêu đề', 'Loại', 'Đối tượng', 'Thiệt hại', 'Ngày xảy ra', 'Người báo cáo', 'Trạng thái', 'Ưu tiên', 'Cán bộ']
    const rows = items.map((r) => [r.id, r.tieuDe, loaiLabel(r.loai), r.doiTuong, r.soTienThietHai,
      r.ngayXayRa, r.nguoiBaoCao, TRANG_THAI[r.trangThai].label, MUC_UU_TIEN[r.uuTien].label, r.canBo])
    // Ô bắt đầu bằng = + - @ sẽ bị Excel hiểu là công thức; dữ liệu do người dùng nhập nên thêm dấu ' phía trước
    const cell = (c) => {
      const t = String(c ?? '')
      return `"${(/^[=+\-@\t\r]/.test(t) ? "'" + t : t).replaceAll('"', '""')}"`
    }
    const csv = [head, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: 'bao-cao-lua-dao.csv' })
    a.click()
    URL.revokeObjectURL(url)
  }

  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))
  const hasFilter = f.keyword || f.type || f.priority || f.status || f.mine

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{isStaff(user) ? 'Danh sách báo cáo' : 'Báo cáo của tôi'}</h1>
          <p>{isStaff(user) ? 'Tìm kiếm, lọc, sắp xếp và xuất dữ liệu' : 'Theo dõi tiến độ xử lý các báo cáo bạn đã gửi'}</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-secondary" onClick={exportCsv}>Xuất CSV</button>
          <Link to="/reports/new" className="btn btn-primary">+ Tạo báo cáo</Link>
        </div>
      </div>

      <div className="card flush">
        <div className="tabs">
          <button className={!f.status ? 'active' : ''} onClick={() => set({ status: '' })}>Tất cả <b>{data.counts.all}</b></button>
          {Object.entries(TRANG_THAI).map(([k, v]) => (
            <button key={k} className={f.status === k ? 'active' : ''} onClick={() => set({ status: k })}>
              {v.label} <b>{data.counts[k] || 0}</b>
            </button>
          ))}
        </div>

        <div className="toolbar">
          <input className="field-input grow" placeholder="Tìm theo tiêu đề, SĐT/STK/link, người báo cáo..."
            value={f.keyword} onChange={(e) => set({ keyword: e.target.value })} />
          <select className="field-select" value={f.priority} onChange={(e) => set({ priority: e.target.value })}>
            <option value="">Mọi mức ưu tiên</option>
            {Object.entries(MUC_UU_TIEN).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="field-select" value={f.type} onChange={(e) => set({ type: e.target.value })}>
            <option value="">Mọi loại</option>
            {LOAI_LUA_DAO.map((l) => <option key={l.value} value={l.value}>{l.label.split(' (')[0]}</option>)}
          </select>
          {isStaff(user) && (
            <label className="check-inline">
              <input type="checkbox" checked={f.mine === '1'} onChange={(e) => set({ mine: e.target.checked ? '1' : '' })} />
              Giao cho tôi
            </label>
          )}
          {hasFilter && (
            <button className="btn btn-secondary btn-sm"
              onClick={() => set({ keyword: '', type: '', priority: '', status: '', mine: '' })}>Xóa lọc</button>
          )}
        </div>

        {loading ? (
          <LoadingBlock rows={5} />
        ) : error ? (
          <ErrorBlock onRetry={() => setRetry((n) => n + 1)} />
        ) : data.items.length === 0 ? (
          <div className="empty-state">Không có báo cáo nào phù hợp</div>
        ) : (
          <div className="table-wrap">
            <table className="stack">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => sortBy('id')}>#{arrow('id')}</th>
                  <th>Tiêu đề</th><th>Loại</th><th>Đối tượng</th>
                  <th className="num sortable" onClick={() => sortBy('soTienThietHai')}>Thiệt hại{arrow('soTienThietHai')}</th>
                  <th className="sortable" onClick={() => sortBy('ngayXayRa')}>Ngày xảy ra{arrow('ngayXayRa')}</th>
                  <th>Ưu tiên</th><th>Phụ trách</th><th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id} data-pri={r.uuTien}>
                    <td className="mono" data-label="Mã">#{r.id}</td>
                    <td className="cell-title"><Link to={`/reports/${r.id}`}>{r.tieuDe}</Link></td>
                    <td data-label="Loại">{loaiLabel(r.loai).split(' (')[0]}</td>
                    <td className="mono" data-label="Đối tượng">{r.doiTuong}</td>
                    <td className="num" data-label="Thiệt hại">{formatMoney(r.soTienThietHai)}</td>
                    <td className="nowrap" data-label="Ngày xảy ra">{formatDate(r.ngayXayRa)}</td>
                    <td data-label="Ưu tiên"><PriorityBadge value={r.uuTien} /></td>
                    <td className={r.canBo === 'Chưa phân công' ? 'muted nowrap' : 'nowrap'} data-label="Phụ trách">{r.canBo}</td>
                    <td data-label="Trạng thái"><StatusBadge value={r.trangThai} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pager">
          <span className="muted">{data.total} báo cáo</span>
          <div>
            <button className="btn btn-secondary btn-sm" disabled={f.page <= 1} onClick={() => setF({ ...f, page: f.page - 1 })}>← Trước</button>
            <span className="pager-info">Trang {f.page}/{pages}</span>
            <button className="btn btn-secondary btn-sm" disabled={f.page >= pages} onClick={() => setF({ ...f, page: f.page + 1 })}>Sau →</button>
          </div>
        </div>
      </div>
    </>
  )
}
