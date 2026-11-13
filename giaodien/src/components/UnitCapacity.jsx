import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { computeCapacity } from '../utils/capacity.js'
import { DON_VI, MUC_TAI } from '../constants.js'
import Modal from './Modal.jsx'

// Vòng công suất tổng hợp vẽ bằng SVG, màu đổi theo mức tải
function CapacityRing({ percent, color, size = 132 }) {
  const r = 52
  const c = 2 * Math.PI * r
  const shown = Math.min(100, percent)
  return (
    <svg className="cap-ring" width={size} height={size} viewBox="0 0 128 128" role="img" aria-label={`Công suất đang dùng ${percent}%`}>
      <circle cx="64" cy="64" r={r} className="cap-ring-bg" />
      <circle cx="64" cy="64" r={r} className="cap-ring-fg" stroke={color} strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} transform="rotate(-90 64 64)" />
      <text x="64" y="64" textAnchor="middle" className="cap-ring-num">{percent}%</text>
      <text x="64" y="84" textAnchor="middle" className="cap-ring-sub">công suất</text>
    </svg>
  )
}

function ResourceModal({ cap, overrides, setOverrides, onClose, onToast }) {
  const [draft, setDraft] = useState(() => Object.fromEntries(cap.units.map((u) => [u.key, String(u.congSuat)])))
  const preview = useMemo(() => {
    const o = Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, Math.max(1, Number(v) || 1)]))
    return o
  }, [draft])
  const save = () => {
    setOverrides(preview)
    onToast('Đã cập nhật công suất định mức cho phiên làm việc này.')
    onClose()
  }
  return (
    <Modal title="Bảng điều phối nguồn lực" onClose={onClose} wide>
      <p className="muted">Điều chỉnh công suất định mức (số hồ sơ xử lý song song) để xem mức tải thay đổi. Thay đổi chỉ áp dụng trên máy này; muốn lưu cố định hãy sửa <code>DON_VI</code> trong <code>constants.js</code>.</p>
      <ul className="res-list">
        {cap.units.map((u) => {
          const cs = preview[u.key]
          const pct = Math.round((u.tai / cs) * 100)
          const m = MUC_TAI.find((x) => pct < x.max)
          return (
            <li key={u.key}>
              <div className="res-info">
                <b>{u.ten}</b>
                <small>{u.phamVi}</small>
              </div>
              <label className="res-input">
                <span className="sr-only">Công suất định mức {u.ten}</span>
                <input className="field-input" type="number" min="1" max="999" value={draft[u.key]} onChange={(e) => setDraft({ ...draft, [u.key]: e.target.value })} />
              </label>
              <div className="res-result">
                <span className="cap-tag" style={{ '--c': m.color }}>{pct}% · {m.label}</span>
                <small>{u.tai} đang xử lý / còn nhận {Math.max(0, cs - u.tai)}</small>
              </div>
            </li>
          )
        })}
      </ul>
      <div className="form-actions">
        <button type="button" className="btn btn-primary" onClick={save}>Áp dụng</button>
        <button type="button" className="btn btn-secondary" onClick={() => { setOverrides({}); onToast('Đã khôi phục công suất mặc định.'); onClose() }}>Khôi phục mặc định</button>
        <Link to="/reports?status=cho_xu_ly" className="btn btn-secondary">Mở hồ sơ tồn đọng</Link>
      </div>
    </Modal>
  )
}

export default function UnitCapacity({ reports, offline, onToast }) {
  const [overrides, setOverrides] = useState({})
  const [open, setOpen] = useState(false)
  const cap = useMemo(() => (reports ? computeCapacity(reports, overrides) : null), [reports, overrides])

  return (
    <section className="card cap" aria-label="Năng lực xử lý đơn vị">
      <div className="card-head">
        <div>
          <h3>Năng lực xử lý đơn vị <span className={`live-tag ${offline ? 'off' : ''}`}>{offline ? 'Mất kết nối' : 'Thời gian thực'}</span></h3>
          <p className="sub">Tải = số hồ sơ đang mở / công suất định mức</p>
        </div>
      </div>

      {!cap ? (
        <><div className="skeleton" /><div className="skeleton" style={{ width: '70%' }} /></>
      ) : (
        <>
          <div className="cap-summary">
            <CapacityRing percent={cap.percent} color={cap.muc.color} />
            <div className="cap-facts">
              <span className="cap-tag" style={{ '--c': cap.muc.color }}>{cap.muc.label}</span>
              <p className="cap-remain"><b>{cap.conTrong}</b> hồ sơ có thể tiếp nhận thêm</p>
              <small>{cap.tongTai}/{cap.tongCS} suất đang dùng{cap.quaTai > 0 ? ` · ${cap.quaTai} đơn vị tải cao` : ''}</small>
            </div>
          </div>

          <ul className="cap-units">
            {cap.units.map((u) => (
              <li key={u.key} title={u.phamVi}>
                <div className="cap-unit-top">
                  <span>{u.ten}</span>
                  <b style={{ color: u.muc.color }}>{u.percent}%</b>
                </div>
                <div className="cap-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, u.percent)} aria-label={`Mức tải ${u.ten}`}>
                  <i style={{ width: `${Math.min(100, u.percent)}%`, background: u.muc.color }} />
                </div>
                <small>{u.tai}/{u.congSuat} hồ sơ · còn nhận {u.conTrong} · {u.muc.label}</small>
              </li>
            ))}
          </ul>

          <ul className="map-legend">
            {MUC_TAI.map((m) => <li key={m.key}><i style={{ background: m.color }} />{m.label}</li>)}
          </ul>
          <button type="button" className="btn btn-primary btn-block mt-1" onClick={() => setOpen(true)}>Mở bảng điều phối nguồn lực</button>
        </>
      )}
      {open && cap && <ResourceModal cap={cap} overrides={overrides} setOverrides={setOverrides} onClose={() => setOpen(false)} onToast={onToast} />}
    </section>
  )
}
