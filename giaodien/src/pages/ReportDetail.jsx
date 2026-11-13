import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteReport, getReportById, updateReport } from '../services/reportApi.js'
import { getStaff } from '../services/userApi.js'
import { TRANG_THAI, CHUYEN_TRANG_THAI, CHUA_PHAN_CONG, loaiLabel, tinhLabel, formatMoney, formatDate, formatDateTime } from '../constants.js'
import { useAuth } from '../context/auth-context.js'
import StatusBadge from '../components/StatusBadge.jsx'
import PriorityBadge from '../components/PriorityBadge.jsx'
import { LoadingBlock, ErrorBlock } from '../components/PageState.jsx'

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const admin = user.vaiTro === 'admin'

  const [report, setReport] = useState(undefined) // undefined = đang tải, null = không có
  const [loadError, setLoadError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [staffList, setStaffList] = useState([]) // [{ id, hoTen }]
  const [newStatus, setNewStatus] = useState('')
  const [canBoId, setCanBoId] = useState('') // '' = chưa phân công (chỉ quản trị viên đổi được ô này)
  const [ghiChu, setGhiChu] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const apply = (r) => {
    setReport(r)
    setNewStatus(r.trangThai)
    setCanBoId(r.canBoId == null ? '' : String(r.canBoId))
  }

  // Đổi sang báo cáo khác (vd bấm vào báo cáo liên quan) thì tải lại từ đầu, không giữ dữ liệu của báo cáo trước
  useEffect(() => {
    let ignore = false
    setReport(undefined)
    setLoadError(false)
    setError('')
    setGhiChu('')
    setConfirmDelete(false)
    getReportById(id)
      .then((r) => { if (!ignore) (r ? apply(r) : setReport(null)) })
      .catch(() => { if (!ignore) setLoadError(true) })
    return () => { ignore = true }
  }, [id, retry])

  // Danh sách cán bộ để quản trị viên phân công
  useEffect(() => {
    if (admin) getStaff().then((list) => setStaffList(list ?? [])).catch(() => {})
  }, [admin])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 2500)
    return () => clearTimeout(t)
  }, [message])

  if (loadError) return <ErrorBlock onRetry={() => setRetry((n) => n + 1)} />
  if (report === undefined) return <LoadingBlock rows={5} />
  if (report === null) {
    return (
      <div className="card empty-state">
        Không tìm thấy báo cáo
        <small><Link to="/reports">Quay lại danh sách</Link></small>
      </div>
    )
  }

  // --- Ai được làm gì (khớp quy tắc ở backend; backend vẫn là nơi kiểm tra cuối cùng) ---
  const chuaCoNguoi = report.canBoId == null
  const laToi = report.canBoId === user.id
  const duocXuLy = admin || chuaCoNguoi || laToi
  const daKetThuc = (CHUYEN_TRANG_THAI[report.trangThai] ?? []).length === 0
  const moLai = admin && daKetThuc // quản trị viên mở lại báo cáo đã kết thúc

  const statusOptions = [
    { value: report.trangThai, label: TRANG_THAI[report.trangThai].label },
    ...(CHUYEN_TRANG_THAI[report.trangThai] ?? []).map((k) => ({ value: k, label: TRANG_THAI[k].label })),
    ...(moLai ? [{ value: 'dang_xac_minh', label: 'Mở lại → Đang xác minh' }] : []),
  ]

  const nextCanBoId = canBoId === '' ? null : Number(canBoId)
  const doiPhanCong = admin && nextCanBoId !== report.canBoId
  const doiTrangThai = newStatus !== report.trangThai
  const canGhiLyDo = doiTrangThai && (newStatus === 'da_xac_nhan' || newStatus === 'tu_choi' || daKetThuc)
  const changed = doiTrangThai || doiPhanCong || ghiChu.trim() !== ''

  // Người phụ trách hiện tại có thể đã bị khóa nên không còn trong danh sách cán bộ: vẫn hiển thị để không mất thông tin
  const coTrongDs = staffList.some((s) => s.id === report.canBoId)

  const send = async (body, okText) => {
    setError('')
    setSaving(true)
    try {
      // phienBan: nếu trong lúc bạn xem có người khác sửa báo cáo này, server sẽ từ chối thay vì ghi đè
      apply(await updateReport(report.id, { ...body, phienBan: report.phienBan }))
      setGhiChu('')
      setMessage(okText)
    } catch (err) {
      setError(err.message)
      if (err.status === 409) getReportById(id).then((r) => r && apply(r)).catch(() => {}) // tải lại bản mới nhất
    }
    setSaving(false)
  }

  const onUpdate = () => {
    const note = ghiChu.trim()
    if (canGhiLyDo && !note) {
      setError(
        daKetThuc ? 'Vui lòng ghi rõ lý do mở lại báo cáo.'
          : newStatus === 'tu_choi' ? 'Vui lòng ghi rõ lý do từ chối báo cáo.'
          : 'Vui lòng ghi rõ căn cứ xác nhận báo cáo.',
      )
      return
    }
    const body = {}
    if (doiTrangThai) body.trangThai = newStatus
    if (doiPhanCong) body.canBoId = nextCanBoId
    if (note) body.ghiChu = note
    send(body, 'Đã lưu thay đổi')
  }

  const onClaim = () => send({ canBoId: user.id }, 'Bạn đã nhận xử lý báo cáo này')

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
                <tr><th>Tỉnh, thành</th><td>{report.tinhThanh ? tinhLabel(report.tinhThanh) : <span className="muted">Chưa xác định</span>}</td></tr>
                <tr><th>Đối tượng</th><td className="mono">{report.doiTuong}</td></tr>
                <tr><th>Thiệt hại</th><td>{formatMoney(report.soTienThietHai)}</td></tr>
                <tr><th>Ngày xảy ra</th><td>{formatDate(report.ngayXayRa)}</td></tr>
                <tr><th>Người báo cáo</th><td>{report.nguoiBaoCao}</td></tr>
                {report.kenh === 'nguoi_dan' && (
                  <>
                    <tr><th>Nguồn tiếp nhận</th><td><span className="src-badge">Người dân tự gửi trực tuyến</span></td></tr>
                    <tr><th>Liên hệ</th><td>{report.lienHe || <span className="muted">Không để lại</span>}</td></tr>
                  </>
                )}
                <tr><th>Ngày tạo</th><td>{formatDate(report.ngayTao)}</td></tr>
              </tbody>
            </table>
            <h3 className="mt-1">Mô tả</h3>
            <p>{report.moTa || <span className="muted">Không có mô tả</span>}</p>
          </div>

          <div className="card mt-1">
            <div className="card-head"><h3>Lịch sử xử lý</h3></div>
            <ol className="timeline">
              {[...report.lichSu].reverse().map((h) => (
                <li key={h.id}>
                  <div>{h.noiDung}</div>
                  <small>{formatDateTime(h.time)} · {h.nguoi}</small>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="card side-card">
          <div className="card-head"><h3>Xử lý</h3></div>
          {error && <div className="field-error" role="alert">{error}</div>}

          <div className="field-group">
            <label className="field-label" htmlFor="canBo">Cán bộ phụ trách</label>
            {admin ? (
              <select className="field-select" id="canBo" value={canBoId} onChange={(e) => setCanBoId(e.target.value)}>
                <option value="">{CHUA_PHAN_CONG}</option>
                {!chuaCoNguoi && !coTrongDs && <option value={String(report.canBoId)}>{report.canBo} (không còn hoạt động)</option>}
                {staffList.map((s) => <option key={s.id} value={String(s.id)}>{s.hoTen}</option>)}
              </select>
            ) : chuaCoNguoi ? (
              <>
                <div className="muted">{CHUA_PHAN_CONG}</div>
                <button type="button" className="btn btn-secondary btn-sm mt-1" onClick={onClaim} disabled={saving}>Nhận xử lý báo cáo này</button>
              </>
            ) : (
              <div>{report.canBo}{laToi && <span className="muted"> (bạn)</span>}</div>
            )}
          </div>

          {!duocXuLy && (
            <div className="field-warn">Báo cáo đang do {report.canBo} phụ trách. Chỉ người phụ trách hoặc quản trị viên được đổi trạng thái và ghi chú.</div>
          )}

          <div className="field-group">
            <label className="field-label" htmlFor="status">Trạng thái</label>
            <select className="field-select" id="status" value={newStatus} disabled={!duocXuLy || (statusOptions.length === 1)}
              onChange={(e) => setNewStatus(e.target.value)}>
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {daKetThuc && !admin && <span className="field-hint">Báo cáo đã kết thúc, chỉ quản trị viên được mở lại.</span>}
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="ghiChu">Ghi chú / lý do</label>
            <textarea className="field-textarea" id="ghiChu" rows="3" value={ghiChu} disabled={!duocXuLy}
              placeholder="Bắt buộc khi xác nhận, từ chối hoặc mở lại báo cáo" onChange={(e) => setGhiChu(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" onClick={onUpdate} disabled={!duocXuLy || !changed || saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>

          {admin && (
            <div className="danger-zone">
              {confirmDelete ? (
                <>
                  <p>Xóa báo cáo này? Báo cáo sẽ biến mất khỏi hệ thống nhưng dữ liệu vẫn được giữ trong cơ sở dữ liệu để truy vết.</p>
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
      </div>
    </>
  )
}
