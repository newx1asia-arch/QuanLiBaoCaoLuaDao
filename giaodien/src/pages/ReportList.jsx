import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getReports } from '../services/reportApi.js'
import { exportReportsCsv } from '../services/exportCsv.js'
import { KHOANG_THOI_GIAN, LOAI_LUA_DAO, TINH_THANH, CHUA_RO_DIA_BAN, TRANG_THAI, MUC_UU_TIEN, CHUA_PHAN_CONG, loaiLabel, tinhLabel, formatMoney, formatDate } from '../constants.js'
import StatusBadge from '../components/StatusBadge.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import { LoadingBlock, ErrorBlock } from '../components/PageState.jsx'

const PAGE_SIZE = 8

// Nhận bộ lọc ban đầu từ địa chỉ (?q=...&status=...&priority=...&type=...&province=...) để thanh tìm kiếm và menu bên trái dẫn thẳng tới kết quả
export default function ReportList() {
  const [sp] = useSearchParams()
  return <ReportListInner key={sp.toString()} initial={{ keyword: sp.get('q') || '', status: sp.get('status') || '', priority: sp.get('priority') || '', type: sp.get('type') || '', province: sp.get('province') || '', days: KHOANG_THOI_GIAN.some((k) => String(k.value) === sp.get('days')) ? sp.get('days') : '' }} />
}

function ReportListInner({ initial }) {
  const [data, setData] = useState({ items: [], total: 0, counts: { all: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [f, setF] = useState({ keyword: initial.keyword, status: initial.status, type: initial.type, priority: initial.priority, province: initial.province, days: initial.days, mine: '', kenh: '', sort: 'id', dir: 'desc', page: 1 })
  const [kw, setKw] = useState(initial.keyword) // nội dung đang gõ; chỉ gửi lên server khi ngừng gõ một chút

  const set = (patch) => setF((p) => ({ ...p, page: 1, ...patch }))
  const sortBy = (col) => set({ sort: col, dir: f.sort === col && f.dir === 'desc' ? 'asc' : 'desc' })
  const arrow = (col) => (f.sort === col ? (f.dir === 'asc' ? ' ▲' : ' ▼') : '')

  useEffect(() => {
    if (kw.trim() === f.keyword.trim()) return
    const t = setTimeout(() => setF((p) => ({ ...p, keyword: kw, page: 1 })), 350)
    return () => clearTimeout(t)
  }, [kw, f.keyword])

  useEffect(() => {
    let ignore = false // bỏ qua kết quả của lần gọi cũ nếu bộ lọc đã đổi
    setLoading(true)
    getReports({ ...f, pageSize: PAGE_SIZE })
      .then((d) => { if (!ignore) { setData(d); setError(false); setLoading(false) } })
      .catch(() => { if (!ignore) { setError(true); setLoading(false) } })
    return () => { ignore = true }
  }, [f, retry])

  const exportCsv = async () => {
    setExporting(true)
    try {
      // Dùng nội dung đang gõ trong ô tìm kiếm (kw), không dùng f.keyword: bộ lọc chỉ cập nhật sau 350 ms ngừng gõ,
      // bấm xuất ngay sau khi gõ sẽ ra file của từ khóa cũ trong khi màn hình đang hiện từ khóa mới
      await exportReportsCsv({ ...f, keyword: kw })
    } catch (err) {
      window.alert(`Không xuất được file: ${err.message}`)
    }
    setExporting(false)
  }

  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))
  const hasFilter = f.keyword || f.type || f.priority || f.status || f.mine || f.province || f.kenh || f.days

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Danh sách báo cáo</h1>
          <p>Tìm kiếm, lọc, sắp xếp và xuất dữ liệu</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-secondary" onClick={exportCsv} disabled={exporting}>{exporting ? 'Đang xuất...' : 'Xuất CSV'}</button>
          <Link to="/reports/new" className="btn btn-primary">+ Tạo báo cáo</Link>
        </div>
      </div>

      <div className="card flush">
        <div className="tabs">
          <button className={!f.status ? 'active' : ''} onClick={() => set({ status: '' })}>Tất cả <b>{data.counts.all}</b></button>
          <button className={f.status === 'dang_xu_ly' ? 'active' : ''} onClick={() => set({ status: 'dang_xu_ly' })}>
            Đang xử lý <b>{(data.counts.cho_xu_ly || 0) + (data.counts.dang_xac_minh || 0)}</b>
          </button>
          {Object.entries(TRANG_THAI).map(([k, v]) => (
            <button key={k} className={f.status === k ? 'active' : ''} onClick={() => set({ status: k })}>
              {v.label} <b>{data.counts[k] || 0}</b>
            </button>
          ))}
        </div>

        <div className="toolbar">
          <input className="field-input grow" placeholder="Tìm theo tiêu đề, SĐT/STK/link, người báo cáo..."
            value={kw} onChange={(e) => setKw(e.target.value)} />
          <select className="field-select" value={f.priority} onChange={(e) => set({ priority: e.target.value })}>
            <option value="">Mọi mức ưu tiên</option>
            {Object.entries(MUC_UU_TIEN).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="field-select" value={f.type} onChange={(e) => set({ type: e.target.value })}>
            <option value="">Mọi loại</option>
            {LOAI_LUA_DAO.map((l) => <option key={l.value} value={l.value}>{l.label.split(' (')[0]}</option>)}
          </select>
          <select className="field-select" value={f.province} onChange={(e) => set({ province: e.target.value })} aria-label="Tỉnh, thành">
            <option value="">Mọi địa bàn</option>
            {TINH_THANH.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            <option value={CHUA_RO_DIA_BAN}>Chưa xác định</option>
          </select>
          <label className="check-inline">
            <input type="checkbox" checked={f.mine === '1'} onChange={(e) => set({ mine: e.target.checked ? '1' : '' })} />
            Giao cho tôi
          </label>
          <label className="check-inline">
            <input type="checkbox" checked={f.kenh === 'nguoi_dan'} onChange={(e) => set({ kenh: e.target.checked ? 'nguoi_dan' : '' })} />
            Người dân gửi
          </label>
          {f.days && <span className="badge" title="Theo ngày tiếp nhận">{f.days} ngày gần nhất</span>}
          {hasFilter && (
            <button className="btn btn-secondary btn-sm"
              onClick={() => { setKw(''); set({ keyword: '', type: '', priority: '', status: '', mine: '', province: '', kenh: '', days: '' }) }}>Xóa lọc</button>
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
                  <th>Tiêu đề</th><th>Loại</th><th>Địa bàn</th><th>Đối tượng</th>
                  <th className="num sortable" onClick={() => sortBy('soTienThietHai')}>Thiệt hại{arrow('soTienThietHai')}</th>
                  <th className="sortable" onClick={() => sortBy('ngayXayRa')}>Ngày xảy ra{arrow('ngayXayRa')}</th>
                  <th>Ưu tiên</th><th>Phụ trách</th><th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id} data-pri={r.uuTien}>
                    <td className="mono" data-label="Mã">#{r.id}</td>
                    <td className="cell-title"><Link to={`/reports/${r.id}`}>{r.tieuDe}</Link>{r.kenh === 'nguoi_dan' && <span className="src-badge" title="Báo cáo do người dân tự gửi qua trang công khai">Người dân gửi</span>}</td>
                    <td data-label="Loại">{loaiLabel(r.loai).split(' (')[0]}</td>
                    <td className={r.tinhThanh ? 'nowrap' : 'muted nowrap'} data-label="Địa bàn">{tinhLabel(r.tinhThanh)}</td>
                    <td className="mono" data-label="Đối tượng">{r.doiTuong}</td>
                    <td className="num" data-label="Thiệt hại">{formatMoney(r.soTienThietHai)}</td>
                    <td className="nowrap" data-label="Ngày xảy ra">{formatDate(r.ngayXayRa)}</td>
                    <td data-label="Ưu tiên"><PriorityBadge value={r.uuTien} /></td>
                    <td className={r.canBo === CHUA_PHAN_CONG ? 'muted nowrap' : 'nowrap'} data-label="Phụ trách">{r.canBo}</td>
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
            <button className="btn btn-secondary btn-sm" disabled={f.page <= 1} onClick={() => setF((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}>← Trước</button>
            <span className="pager-info">Trang {f.page}/{pages}</span>
            <button className="btn btn-secondary btn-sm" disabled={f.page >= pages} onClick={() => setF((p) => ({ ...p, page: Math.min(pages, p.page + 1) }))}>Sau →</button>
          </div>
        </div>
      </div>
    </>
  )
}
