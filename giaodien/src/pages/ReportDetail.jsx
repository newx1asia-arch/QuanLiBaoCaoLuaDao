import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteReport, getReportById, updateReport } from '../services/reportApi.js'
import { getStaff } from '../services/userApi.js'
import { TRANG_THAI, CHUA_PHAN_CONG, isStaff, loaiLabel, formatMoney, formatDate, formatDateTime } from '../constants.js'
import { useAuth } from '../context/auth-context.js'
import StatusBadge from '../components/StatusBadge.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import { LoadingBlock } from '../components/PageState.jsx'

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const staff = isStaff(user)
  const admin = user.vaiTro === 'admin'

  const [report, setReport] = useState(undefined) // undefined = đang tải, null = không có
  const [staffNames, setStaffNames] = useState([])
  const [newStatus, setNewStatus] = useState('')
  const [canBo, setCanBo] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const apply = (r) => { setReport(r); setNewStatus(r.trangThai); setCanBo(r.canBo) }

  useEffect(() => {
    getReportById(id)
      .then((r) => (r ? apply(r) : setReport(null)))
      .catch(() => setReport(null))
  }, [id])

  // Danh sách cán bộ để phân công (chỉ cán bộ/admin mới cần)
  useEffect(() => {
    if (staff) getStaff().then((names) => setStaffNames(names ?? [])).catch(() => {})
  }, [staff])

  if (report === undefined) return <LoadingBlock rows={5} />
  if (report === null) {
    return (
      <div className="card empty-state">
        Không tìm thấy báo cáo
        <small><Link to="/reports">Quay lại danh sách</Link></small>
      </div>
    )
  }

  // Giữ cả cán bộ đang được phân công dù tài khoản đó đã bị khóa/đổi tên
  const canBoOptions = [...new Set([CHUA_PHAN_CONG, ...staffNames, report.canBo])]
  const changed = newStatus !== report.trangThai || canBo !== report.canBo || ghiChu.trim()

  const flash = (text) => { setMessage(text); setTimeout(() => setMessage(''), 2500) }

  const onUpdate = async () => {
    if (newStatus === 'tu_choi' && report.trangThai !== 'tu_choi' && !ghiChu.trim()) {
      setError('Vui lòng ghi rõ lý do khi từ chối báo cáo.')
      return
    }
    setError('')
    setSaving(true)
    try {
      apply(await updateReport(report.id, { trangThai: newStatus, canBo, ghiChu: ghiChu.trim() }))
      setGhiChu('')
      flash('Đã lưu thay đổi')
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  const onDelete = async () => {
    try {
      await deleteReport(report.id)
      navigate('/reports', { replace: true })
    } catch (err) {
      setError(err.message)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Báo cáo #{report.id}</h1>
          <p>{report.tieuDe}</p>
        </div>
        <div className="head-badges"><PriorityBadge value={report.uuTien} /><StatusBadge value={report.trangThai} /></div>
      </div>

      {message && <div className="toast" role="status">{message}</div>}

      {report.soBaoCaoCungDoiTuong > 1 && (
        <div className="field-warn">
          <b>Đối tượng này đã bị báo cáo {report.soBaoCaoCungDoiTuong} lần.</b>
          {report.lienQuan.length > 0 && (
            <> Các báo cáo khác:{' '}
              {report.lienQuan.map((x, i) => (
                <span key={x.id}>{i > 0 && ', '}<Link to={`/reports/${x.id}`}>#{x.id}</Link></span>
              ))}
            </>
          )}
        </div>
      )}

      <div className="dash-grid">
        <div>
          <div className="card">
            <div className="card-head"><h3>Thông tin</h3></div>
            <table>
              <tbody>
                <tr><th>Loại lừa đảo</th><td>{loaiLabel(report.loai)}</td></tr>
                <tr><th>Đối tượng</th><td className="mono">{report.doiTuong}</td></tr>
                <tr><th>Thiệt hại</th><td>{formatMoney(report.soTienThietHai)}</td></tr>
                <tr><th>Ngày xảy ra</th><td>{formatDate(report.ngayXayRa)}</td></tr>
                <tr><th>Người báo cáo</th><td>{report.nguoiBaoCao}</td></tr>
                <tr><th>Ngày tạo</th><td>{formatDate(report.ngayTao)}</td></tr>
              </tbody>
            </table>
            <h3 className="mt-1">Mô tả</h3>
            <p>{report.moTa || <span className="muted">Không có mô tả</span>}</p>
          </div>

          <div className="card mt-1">
            <div className="card-head"><h3>Lịch sử xử lý</h3></div>
            <ol className="timeline">
              {[...report.lichSu].reverse().map((h, i) => (
                <li key={i}>
                  <div>{h.noiDung}</div>
                  <small>{formatDateTime(h.time)} · {h.nguoi}</small>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {staff ? (
          <div className="card side-card">
            <div className="card-head"><h3>Xử lý</h3></div>
            {error && <div className="field-error" role="alert">{error}</div>}
            <div className="field-group">
              <label className="field-label" htmlFor="canBo">Cán bộ phụ trách</label>
              <select className="field-select" id="canBo" value={canBo} onChange={(e) => setCanBo(e.target.value)}>
                {canBoOptions.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="status">Trạng thái</label>
              <select className="field-select" id="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {Object.entries(TRANG_THAI).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="ghiChu">Ghi chú / lý do</label>
              <textarea className="field-textarea" id="ghiChu" rows="3" value={ghiChu}
                placeholder="Bắt buộc khi từ chối báo cáo" onChange={(e) => setGhiChu(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" onClick={onUpdate} disabled={!changed || saving}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>

            {admin && (
              <div className="danger-zone">
                {confirmDelete ? (
                  <>
                    <p>Xóa vĩnh viễn báo cáo này cùng toàn bộ lịch sử xử lý? Không thể hoàn tác.</p>
                    <div className="form-actions">
                      <button className="btn btn-danger" onClick={onDelete}>Xóa báo cáo</button>
                      <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Hủy</button>
                    </div>
                  </>
                ) : (
                  <button className="btn btn-secondary btn-block btn-danger-outline" onClick={() => setConfirmDelete(true)}>Xóa báo cáo</button>
                )}
              </div>
            )}
            <Link to="/reports" className="back-link">← Quay lại danh sách</Link>
          </div>
        ) : (
          <div className="card side-card">
            <div className="card-head"><h3>Tiến độ xử lý</h3></div>
            <div className="field-group">
              <div className="field-label">Trạng thái</div>
              <StatusBadge value={report.trangThai} />
            </div>
            <div className="field-group">
              <div className="field-label">Cán bộ phụ trách</div>
              <div className={report.canBo === CHUA_PHAN_CONG ? 'muted' : ''}>{report.canBo}</div>
            </div>
            <Link to="/reports" className="back-link">← Quay lại danh sách</Link>
          </div>
        )}
      </div>
    </>
  )
}
