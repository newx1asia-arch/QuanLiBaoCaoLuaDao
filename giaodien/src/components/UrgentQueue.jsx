import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { updateReport, getReportById } from '../services/reportApi.js'
import { CHUA_PHAN_CONG, SLA_GIO, formatMoney, formatDateTime, loaiNgan, reportCode, tinhLabel, MUC_UU_TIEN } from '../constants.js'
import { byUrgency, formatCountdown, slaOf } from '../utils/sla.js'
import { useNow } from '../hooks.js'
import { useAuth } from '../context/auth-context.js'
import Modal from './Modal.jsx'
import StatusBadge from './StatusBadge.jsx'
import { IconClock } from './Icons.jsx'

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'sap', label: 'Sắp quá hạn' },
  { key: 'chua', label: 'Chưa phân công' },
]

const SHOW = 6

function SlaBar({ sla }) {
  return (
    <div className={`sla-bar ${sla.mau}`} role="progressbar" aria-valuemin={0} aria-valuemax={100}
      aria-valuenow={Math.round(sla.daDung * 100)} aria-label="Tiến độ thời gian xử lý">
      <i style={{ width: `${Math.max(3, sla.daDung * 100)}%` }} />
    </div>
  )
}

function DetailModal({ r, now, onClose, onClaim, claiming, canClaim }) {
  const sla = slaOf(r, now)
  return (
    <Modal title={`Hồ sơ ${reportCode(r)}`} onClose={onClose}>
      <div className="uq-detail">
        <p className="uq-detail-title">{r.tieuDe}</p>
        <dl className="hp-list">
          <div><dt>Địa bàn</dt><dd>{tinhLabel(r.tinhThanh)}</dd></div>
          <div><dt>Hình thức</dt><dd>{loaiNgan(r.loai)}</dd></div>
          <div><dt>Đối tượng</dt><dd className="mono">{r.doiTuong}</dd></div>
          <div><dt>Thiệt hại</dt><dd>{formatMoney(r.soTienThietHai)}</dd></div>
          <div><dt>Tiếp nhận</dt><dd>{formatDateTime(r.ngayTao)}</dd></div>
          <div><dt>Trạng thái</dt><dd><StatusBadge value={r.trangThai} /></dd></div>
          <div><dt>Phụ trách</dt><dd>{r.canBo}</dd></div>
          <div><dt>SLA ({SLA_GIO[r.uuTien]} giờ)</dt><dd className={`sla-text ${sla.mau}`}>{formatCountdown(sla.conLai)}</dd></div>
        </dl>
        {r.moTa && <p className="muted uq-desc">{r.moTa.length > 280 ? `${r.moTa.slice(0, 280)}…` : r.moTa}</p>}
        <div className="form-actions">
          {canClaim && <button type="button" className="btn btn-primary" disabled={claiming} onClick={() => onClaim(r)}>{claiming ? 'Đang nhận...' : 'Nhận xử lý'}</button>}
          <Link to={`/reports/${r.id}`} className="btn btn-secondary">Mở trang đầy đủ</Link>
        </div>
      </div>
    </Modal>
  )
}

export default function UrgentQueue({ reports, offline, onChange, onToast }) {
  const now = useNow()
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(false)
  const [openId, setOpenId] = useState(null)
  const [claiming, setClaiming] = useState(null)

  const rows = useMemo(() => (reports ?? []).slice().sort(byUrgency(now)), [reports, now])
  const counts = {
    all: rows.length,
    sap: rows.filter((r) => slaOf(r, now).sapQuaHan).length,
    chua: rows.filter((r) => r.canBoId == null).length,
  }
  const filtered = rows.filter((r) => (filter === 'sap' ? slaOf(r, now).sapQuaHan : filter === 'chua' ? r.canBoId == null : true))
  const visible = expanded ? filtered : filtered.slice(0, SHOW)
  const opened = rows.find((r) => r.id === openId)

  const claim = async (r) => {
    setClaiming(r.id)
    try {
      // Gửi kèm phienBan: nếu người khác vừa nhận trước, máy chủ trả 409 thay vì ghi đè
      const upd = await updateReport(r.id, { canBoId: user.id, trangThai: r.trangThai === 'cho_xu_ly' ? 'dang_xac_minh' : undefined, phienBan: r.phienBan })
      onChange(r.id, () => ({ ...r, trangThai: upd.trangThai, canBo: upd.canBo, canBoId: upd.canBoId, phienBan: upd.phienBan }))
      onToast(`Đã nhận xử lý ${reportCode(r)}. Hồ sơ chuyển sang "Đang xác minh".`)
    } catch (err) {
      onToast(err.status === 409 ? `${reportCode(r)} vừa được người khác cập nhật, đã tải lại danh sách.` : err.message, true)
      if (err.status === 409) getReportById(r.id).then((n) => n && onChange(r.id, () => n)).catch(() => {})
    } finally {
      setClaiming(null)
    }
  }

  return (
    <section className="card flush uq" aria-label="Hồ sơ theo mức độ khẩn cấp">
      <div className="card-head">
        <div>
          <h3>Hồ sơ theo mức độ khẩn cấp {counts.sap > 0 && <span className="pill">{counts.sap} sắp quá hạn</span>}</h3>
          <p className="sub">Sắp xếp theo thời gian SLA còn lại · {offline ? 'Mất kết nối, dữ liệu có thể cũ' : 'Tự cập nhật mỗi 15 giây'}</p>
        </div>
        <div className="segmented" role="tablist" aria-label="Bộ lọc hồ sơ">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} className={filter === f.key ? 'active' : ''}
              onClick={() => { setFilter(f.key); setExpanded(false) }}>{f.label} <b className="seg-n">{counts[f.key]}</b></button>
          ))}
        </div>
      </div>

      {reports === null ? (
        <div className="uq-pad"><div className="skeleton" /><div className="skeleton" style={{ width: '80%' }} /><div className="skeleton" style={{ width: '60%' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">{filter === 'all' ? 'Không có hồ sơ nào đang chờ xử lý' : 'Không có hồ sơ nào thuộc bộ lọc này'}</div>
      ) : (
        <ul className="uq-list">
          {visible.map((r) => {
            const sla = slaOf(r, now)
            const chua = r.canBoId == null
            const mine = r.canBoId === user.id
            return (
              <li key={r.id} className={`uq-item ${sla.mau}`} data-pri={r.uuTien}>
                <div className="uq-main">
                  <div className="uq-top">
                    <Link to={`/reports/${r.id}`} className="uq-code mono">{reportCode(r)}</Link>
                    <span className="uq-place">{tinhLabel(r.tinhThanh)}</span>
                    <span className={`uq-pri pri-${r.uuTien}`}>{MUC_UU_TIEN[r.uuTien]?.label ?? r.uuTien}</span>
                    {chua ? <span className="uq-flag">{CHUA_PHAN_CONG}</span> : <span className="uq-owner">{mine ? 'Bạn phụ trách' : r.canBo}</span>}
                  </div>
                  <p className="uq-title">{r.tieuDe}</p>
                  <SlaBar sla={sla} />
                </div>
                <div className="uq-side">
                  <div className={`uq-clock ${sla.mau}`} title={`Hạn xử lý: ${formatDateTime(sla.han)}`}>
                    <IconClock />
                    <span><small>SLA còn lại</small><b>{formatCountdown(sla.conLai)}</b></span>
                  </div>
                  <div className="uq-actions">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpenId(r.id)}>Chi tiết</button>
                    {chua && <button type="button" className="btn btn-primary btn-sm" disabled={claiming === r.id} onClick={() => claim(r)}>{claiming === r.id ? 'Đang nhận...' : 'Nhận xử lý'}</button>}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {filtered.length > SHOW && (
        <div className="uq-more">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Thu gọn' : `Xem thêm ${filtered.length - SHOW} hồ sơ`}
          </button>
          <Link to="/reports?status=cho_xu_ly" className="card-link">Mở danh sách đầy đủ ›</Link>
        </div>
      )}

      {opened && <DetailModal r={opened} now={now} onClose={() => setOpenId(null)} onClaim={claim} claiming={claiming === opened.id} canClaim={opened.canBoId == null} />}
    </section>
  )
}
