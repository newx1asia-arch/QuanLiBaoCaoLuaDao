import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth-context.js'
import { getAlerts, submitAlert, approveAlert, rejectAlert, publishAlert, withdrawAlert, deleteAlert } from '../services/alertApi.js'
import { KENH_CANH_BAO, MUC_DO_CANH_BAO, TRANG_THAI_CANH_BAO, TRANG_THAI_KENH, formatDateTime, phamViLabel, tinhLabel } from '../constants.js'
import AlertEditor from '../components/AlertEditor.jsx'
import Modal from '../components/Modal.jsx'
import Toast from '../components/Toast.jsx'
import { LoadingBlock, ErrorBlock } from '../components/PageState.jsx'
import { IconPlus } from '../components/Icons.jsx'

const TABS = [['', 'Tất cả'], ['cho_duyet', 'Chờ duyệt'], ['nhap', 'Bản nháp'], ['tu_choi', 'Bị từ chối'], ['da_duyet', 'Đã duyệt'], ['da_phat_hanh', 'Đã phát hành'], ['da_thu_hoi', 'Đã thu hồi']]

const Badge = ({ map, value }) => <span className={`badge ${map[value]?.cls ?? ''}`}>{map[value]?.label ?? value}</span>

// Hộp thoại xem, duyệt, phát hành. Nút hiện ra theo trạng thái và quyền của người dùng
function AlertView({ a, me, admin, busy, onAct, onEdit, onClose }) {
  const [note, setNote] = useState('')
  const owner = a.nguoiSoanId === me.id
  const canEdit = (owner || admin) && ['nhap', 'tu_choi'].includes(a.trangThai)
  const own = a.trangThai === 'cho_duyet' && owner
  return (
    <Modal title={`Cảnh báo #${a.id}`} onClose={onClose} wide>
      <div className="al-view-head">
        <h4>{a.tieuDe}</h4>
        <div><Badge map={MUC_DO_CANH_BAO} value={a.mucDo} /> <Badge map={TRANG_THAI_CANH_BAO} value={a.trangThai} /></div>
      </div>
      <dl className="hp-list">
        <div><dt>Phạm vi</dt><dd>{a.phamVi === 'toan_quoc' ? 'Toàn quốc' : a.tinhThanh.map(tinhLabel).join(', ')}</dd></div>
        <div><dt>Người soạn</dt><dd>{a.nguoiSoan}</dd></div>
        {a.nguoiDuyet && <div><dt>Người duyệt</dt><dd>{a.nguoiDuyet}</dd></div>}
        {a.phatHanhLuc && <div><dt>Phát hành lúc</dt><dd>{formatDateTime(a.phatHanhLuc)}</dd></div>}
      </dl>
      {a.trangThai === 'tu_choi' && a.ghiChuDuyet && <div className="field-error">Lý do từ chối: {a.ghiChuDuyet}</div>}

      <div className="al-contents">
        {KENH_CANH_BAO.filter((k) => a.kenh.includes(k.value)).map((k) => {
          const kq = a.ketQuaKenh?.find((x) => x.kenh === k.value)
          return (
            <section key={k.value} className="al-content">
              <div className="al-content-top"><b>{k.label}</b>{kq && <span className={`badge ${kq.trangThai === 'da_dang' ? 'status-xong' : 'status-cho'}`} title={kq.ghiChu}>{TRANG_THAI_KENH[kq.trangThai]}</span>}</div>
              <p>{a[k.field] || <em className="muted">Chưa có nội dung</em>}</p>
            </section>
          )
        })}
      </div>

      {a.ketQuaKenh?.some((k) => k.trangThai === 'cho_gui') && (
        <div className="field-warn">Các kênh SMS, ứng dụng, mạng xã hội đang ở trạng thái "Chờ gửi": hệ thống chưa nối nhà cung cấp nên chưa tự gửi ra ngoài.</div>
      )}

      <h4 className="dossier-title">Nhật ký</h4>
      <ol className="dossier-timeline">
        {[...a.nhatKy].reverse().map((h, i) => (
          <li key={h.time + i} className={i === 0 ? 'latest' : ''}><time>{formatDateTime(h.time)}</time><span>{h.noiDung}<small> · {h.nguoi}</small></span></li>
        ))}
      </ol>

      {a.trangThai === 'cho_duyet' && admin && !owner && (
        <div className="field-group"><label className="field-label" htmlFor="al-note">Ghi chú (bắt buộc khi từ chối)</label><input id="al-note" className="field-input" value={note} onChange={(e) => setNote(e.target.value)} /></div>
      )}
      {own && <div className="field-warn">Cảnh báo đang chờ quản trị viên khác duyệt. Bạn không thể tự duyệt cảnh báo do mình soạn.</div>}

      <div className="form-actions al-actions">
        {canEdit && <button type="button" className="btn btn-secondary" onClick={() => onEdit(a)}>Sửa</button>}
        {canEdit && <button type="button" className="btn btn-primary" disabled={busy} onClick={() => onAct('submit', a)}>Gửi duyệt</button>}
        {a.trangThai === 'cho_duyet' && admin && !owner && <>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => onAct('approve', a, note)}>Duyệt</button>
          <button type="button" className="btn btn-danger-outline btn-secondary" disabled={busy} onClick={() => onAct('reject', a, note)}>Từ chối</button>
        </>}
        {a.trangThai === 'da_duyet' && admin && <button type="button" className="btn btn-primary" disabled={busy} onClick={() => onAct('publish', a)}>Phát hành</button>}
        {a.trangThai === 'da_phat_hanh' && admin && <button type="button" className="btn btn-danger-outline btn-secondary" disabled={busy} onClick={() => onAct('withdraw', a, note)}>Thu hồi khỏi website</button>}
        {canEdit && <button type="button" className="btn btn-danger-outline btn-secondary" disabled={busy} onClick={() => onAct('delete', a)}>Xóa</button>}
      </div>
    </Modal>
  )
}

export default function Alerts() {
  const { user } = useAuth()
  const admin = user.vaiTro === 'admin'
  const [status, setStatus] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const [editor, setEditor] = useState(null) // null | 'new' | alert
  const [viewId, setViewId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const closeToast = useCallback(() => setToast(null), [])
  const say = (text, err = false) => setToast({ text, error: err })

  const load = useCallback(() => getAlerts(status).then((d) => { setData(d); setError(false) }).catch(() => setError(true)), [status])
  useEffect(() => { load() }, [load])

  const viewing = data?.items.find((x) => x.id === viewId)

  const onAct = async (action, a, note) => {
    if (action === 'reject' && !note?.trim()) return say('Vui lòng ghi rõ lý do từ chối.', true)
    if (action === 'delete' && !window.confirm('Xóa bản nháp này?')) return
    setBusy(true)
    try {
      const run = { submit: () => submitAlert(a.id), approve: () => approveAlert(a.id, note?.trim()), reject: () => rejectAlert(a.id, note.trim()), publish: () => publishAlert(a.id), withdraw: () => withdrawAlert(a.id, note?.trim()), delete: () => deleteAlert(a.id) }
      await run[action]()
      const ok = { submit: 'Đã gửi duyệt.', approve: 'Đã duyệt. Quản trị viên có thể phát hành.', reject: 'Đã từ chối và trả về người soạn.', publish: 'Đã phát hành cảnh báo.', withdraw: 'Đã thu hồi cảnh báo khỏi website.', delete: 'Đã xóa bản nháp.' }
      say(ok[action])
      if (action === 'delete') setViewId(null)
      await load()
    } catch (err) {
      say(err.message, true)
    }
    setBusy(false)
  }

  return (
    <>
      <div className="page-head">
        <div><h1>Cảnh báo phát hành</h1><p>Soạn, duyệt rồi phát hành cảnh báo lừa đảo qua website, SMS, ứng dụng và mạng xã hội</p></div>
        <div className="head-actions"><Link to="/canh-bao" target="_blank" rel="noreferrer" className="btn btn-secondary">Xem trang công khai</Link><button type="button" className="btn btn-primary" onClick={() => setEditor('new')}><IconPlus />Soạn cảnh báo</button></div>
      </div>

      <div className="card flush">
        <div className="tabs" role="tablist">
          {TABS.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={status === k} className={status === k ? 'active' : ''} onClick={() => setStatus(k)}>
              {label}{data && <b>{k ? (data.counts[k] ?? 0) : data.counts.all}</b>}
            </button>
          ))}
        </div>
        {error ? <ErrorBlock onRetry={load} /> : !data ? <div className="uq-pad"><LoadingBlock rows={4} /></div> : data.items.length === 0 ? (
          <div className="empty-state">Chưa có cảnh báo nào{status ? ' ở trạng thái này' : ''}<small>Bấm "Soạn cảnh báo" để tạo bản nháp đầu tiên.</small></div>
        ) : (
          <div className="table-wrap">
            <table className="stack">
              <thead><tr><th>Cảnh báo</th><th>Mức độ</th><th>Kênh</th><th>Phạm vi</th><th>Trạng thái</th><th>Cập nhật</th><th /></tr></thead>
              <tbody>
                {data.items.map((a) => (
                  <tr key={a.id}>
                    <td className="cell-title"><button type="button" className="link-btn" onClick={() => setViewId(a.id)}>{a.tieuDe}</button><small>#{a.id} · {a.nguoiSoan}</small></td>
                    <td data-label="Mức độ"><Badge map={MUC_DO_CANH_BAO} value={a.mucDo} /></td>
                    <td data-label="Kênh">{a.kenh.map((k) => KENH_CANH_BAO.find((x) => x.value === k)?.label).join(', ')}</td>
                    <td data-label="Phạm vi">{phamViLabel(a)}</td>
                    <td data-label="Trạng thái"><Badge map={TRANG_THAI_CANH_BAO} value={a.trangThai} /></td>
                    <td className="nowrap" data-label="Cập nhật">{formatDateTime(a.capNhat)}</td>
                    <td className="row-actions"><button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewId(a.id)}>{a.trangThai === 'cho_duyet' && admin ? 'Duyệt' : 'Xem'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing && !editor && <AlertView a={viewing} me={user} admin={admin} busy={busy} onAct={onAct} onEdit={(a) => setEditor(a)} onClose={() => setViewId(null)} />}
      {editor && <AlertEditor alert={editor === 'new' ? null : editor} onClose={() => setEditor(null)} onSaved={(a, msg) => { setEditor(null); setViewId(a.id); say(msg); load() }} />}
      <Toast toast={toast} onClose={closeToast} />
    </>
  )
}
