import { useState } from 'react'
import { createAlert, updateAlert } from '../services/alertApi.js'
import { KENH_CANH_BAO, MUC_DO_CANH_BAO, TINH_THANH, KHU_VUC_NHOM } from '../constants.js'
import Modal from './Modal.jsx'

const empty = { tieuDe: '', mucDo: 'canh_bao', noiDung: '', noiDungSms: '', noiDungUngDung: '', noiDungMxh: '', kenh: ['website'], phamVi: 'toan_quoc', tinhThanh: [] }
const clip = (s, n) => (s.length <= n ? s : `${s.slice(0, n - 1).trimEnd()}…`)

// Soạn hoặc sửa cảnh báo: mỗi kênh một nội dung, có đếm ký tự và xem trước
export default function AlertEditor({ alert, onClose, onSaved }) {
  const [f, setF] = useState(alert ? { ...empty, ...alert, noiDungSms: alert.noiDungSms ?? '', noiDungUngDung: alert.noiDungUngDung ?? '', noiDungMxh: alert.noiDungMxh ?? '' } : empty)
  const [tab, setTab] = useState('website')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [q, setQ] = useState('')

  const set = (patch) => setF((p) => ({ ...p, ...patch }))
  const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const channels = KENH_CANH_BAO.filter((k) => f.kenh.includes(k.value))
  const active = KENH_CANH_BAO.find((k) => k.value === tab && f.kenh.includes(tab)) ?? channels[0]

  // Điền nhanh các kênh còn trống từ nội dung website (rút gọn đúng giới hạn từng kênh)
  const autofill = () =>
    set({
      noiDungSms: f.noiDungSms || clip(`${f.tieuDe}. ${f.noiDung}`.replace(/\s+/g, ' '), 160),
      noiDungUngDung: f.noiDungUngDung || clip(`${f.tieuDe}. ${f.noiDung}`.replace(/\s+/g, ' '), 150),
      noiDungMxh: f.noiDungMxh || clip(`${f.tieuDe}\n\n${f.noiDung}`, 600),
    })

  const save = async () => {
    if (f.tieuDe.trim().length < 5) return setError('Tiêu đề phải từ 5 ký tự.')
    if (!f.noiDung.trim()) return setError('Hãy nhập nội dung chính (dùng cho website và để rút gọn sang các kênh khác).')
    if (!f.kenh.length) return setError('Chọn ít nhất một kênh phát hành.')
    if (f.phamVi === 'dia_ban' && !f.tinhThanh.length) return setError('Chọn ít nhất một tỉnh, thành, hoặc chuyển sang phạm vi toàn quốc.')
    setError('')
    setSaving(true)
    try {
      const body = { tieuDe: f.tieuDe, mucDo: f.mucDo, noiDung: f.noiDung, noiDungSms: f.noiDungSms, noiDungUngDung: f.noiDungUngDung, noiDungMxh: f.noiDungMxh, kenh: f.kenh, phamVi: f.phamVi, tinhThanh: f.phamVi === 'dia_ban' ? f.tinhThanh : [] }
      onSaved(alert ? await updateAlert(alert.id, body) : await createAlert(body), alert ? 'Đã lưu bản nháp.' : 'Đã tạo bản nháp. Gửi duyệt khi nội dung đã đủ.')
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const shown = TINH_THANH.filter((t) => t.label.toLowerCase().includes(q.trim().toLowerCase()))

  return (
    <Modal title={alert ? `Sửa cảnh báo #${alert.id}` : 'Soạn cảnh báo mới'} onClose={onClose} wide>
      {error && <div className="field-error" role="alert">{error}</div>}
      <div className="field-row">
        <div className="field-group">
          <label className="field-label" htmlFor="al-title">Tiêu đề</label>
          <input id="al-title" className="field-input" value={f.tieuDe} maxLength={200} onChange={(e) => set({ tieuDe: e.target.value })} />
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="al-level">Mức độ</label>
          <select id="al-level" className="field-select" value={f.mucDo} onChange={(e) => set({ mucDo: e.target.value })}>
            {Object.entries(MUC_DO_CANH_BAO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <fieldset className="al-fieldset">
        <legend className="field-label">Kênh phát hành</legend>
        <div className="al-checks">
          {KENH_CANH_BAO.map((k) => (
            <label key={k.value} className="check-inline"><input type="checkbox" checked={f.kenh.includes(k.value)} onChange={() => { set({ kenh: toggle(f.kenh, k.value) }); setTab(k.value) }} />{k.label}</label>
          ))}
        </div>
      </fieldset>

      <fieldset className="al-fieldset">
        <legend className="field-label">Phạm vi</legend>
        <div className="segmented" role="radiogroup" aria-label="Phạm vi phát hành">
          <button type="button" role="radio" aria-checked={f.phamVi === 'toan_quoc'} className={f.phamVi === 'toan_quoc' ? 'active' : ''} onClick={() => set({ phamVi: 'toan_quoc' })}>Toàn quốc</button>
          <button type="button" role="radio" aria-checked={f.phamVi === 'dia_ban'} className={f.phamVi === 'dia_ban' ? 'active' : ''} onClick={() => set({ phamVi: 'dia_ban' })}>Theo địa bàn</button>
        </div>
        {f.phamVi === 'dia_ban' && (
          <div className="al-provinces">
            <div className="al-prov-bar">
              <input className="field-input" type="search" placeholder="Tìm tỉnh, thành..." aria-label="Tìm tỉnh, thành" value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => set({ tinhThanh: TINH_THANH.map((t) => t.value) })}>Chọn hết</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => set({ tinhThanh: [] })}>Bỏ chọn</button>
              {KHU_VUC_NHOM.map((g, i) => (
                <button key={g.label} type="button" className="btn btn-secondary btn-sm" onClick={() => {
                  const ids = TINH_THANH.filter((t) => t.lat >= g.from && t.lat < (i === 0 ? 99 : KHU_VUC_NHOM[i - 1].from)).map((t) => t.value)
                  set({ tinhThanh: [...new Set([...f.tinhThanh, ...ids])] })
                }}>+ {g.label}</button>
              ))}
            </div>
            <div className="al-prov-grid">
              {shown.map((t) => (
                <label key={t.value} className="check-inline"><input type="checkbox" checked={f.tinhThanh.includes(t.value)} onChange={() => set({ tinhThanh: toggle(f.tinhThanh, t.value) })} />{t.label}</label>
              ))}
              {shown.length === 0 && <span className="muted">Không có tỉnh, thành phù hợp</span>}
            </div>
            <small className="muted">Đã chọn {f.tinhThanh.length} tỉnh, thành</small>
          </div>
        )}
      </fieldset>

      <div className="al-compose">
        <div className="al-compose-head">
          <div className="tabs al-tabs" role="tablist">
            {channels.map((k) => (
              <button key={k.value} type="button" role="tab" aria-selected={active?.value === k.value} className={active?.value === k.value ? 'active' : ''} onClick={() => setTab(k.value)}>{k.label}</button>
            ))}
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={autofill} disabled={!f.noiDung.trim()}>Điền các kênh còn trống từ nội dung website</button>
        </div>
        {active ? (
          <div className="field-group">
            <textarea className="field-textarea" rows={active.value === 'website' ? 7 : 4} aria-label={`Nội dung ${active.label}`} maxLength={active.max} value={f[active.field]} onChange={(e) => set({ [active.field]: e.target.value })} />
            <span className="field-hint al-count"><span>{active.hint}</span><b className={f[active.field].length > active.max * 0.9 ? 'bad' : ''}>{f[active.field].length}/{active.max}{active.value === 'sms' && f.noiDungSms ? ` · ${Math.ceil(f.noiDungSms.length / 70)} tin` : ''}</b></span>
          </div>
        ) : <p className="muted">Chọn ít nhất một kênh để soạn nội dung.</p>}
        {f.noiDung.trim() && active && active.value !== 'website' && !f[active.field] && <p className="muted">Kênh này chưa có nội dung riêng; cần điền trước khi gửi duyệt.</p>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu bản nháp'}</button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
      </div>
    </Modal>
  )
}
