import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMonitor } from '../services/reportApi.js'
import {
  MONITOR_REFRESH_MS, MUC_DO_NGHI_VAN, NGUY_CO, TRANG_THAI_CHIEN_DICH,
  formatDateTime, formatMoneyShort, loaiNgan, timeAgo,
} from '../constants.js'
import { IconAlert, IconChevronRight, IconShield } from './Icons.jsx'

// Vòng tròn tiến độ vẽ bằng SVG
function Ring({ percent }) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <svg className="live-ring" viewBox="0 0 64 64" role="img" aria-label={`Tiến độ ${percent}%`}>
      <defs>
        <linearGradient id="liveRingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0d062" />
          <stop offset="100%" stopColor="#c9a227" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r={r} className="live-ring-bg" />
      <circle cx="32" cy="32" r={r} className="live-ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} transform="rotate(-90 32 32)" />
      <path d="M26 32.5l4.2 4.2L38.5 28" className="live-ring-tick" />
    </svg>
  )
}

// Hồ sơ cảnh báo: dùng thẻ <dialog> như Modal chung nhưng có phần đầu màu xanh đậm
function DossierModal({ cd, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])

  const nguyCo = NGUY_CO[cd.nguyCo]
  return (
    <dialog ref={ref} className="modal modal-wide dossier" aria-labelledby="dossier-title" onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}>
      <div className="dossier-head">
        <span className="dossier-icon"><IconShield width={22} height={22} /></span>
        <div>
          <small>Hồ sơ cảnh báo {cd.ma}</small>
          <h3 id="dossier-title">Chiến dịch {loaiNgan(cd.loai).toLowerCase()}</h3>
        </div>
        <button type="button" className="dossier-close" onClick={onClose} aria-label="Đóng">✕</button>
      </div>

      <div className="dossier-body">
        <div className="dossier-tiles">
          <div className={`dossier-tile ${nguyCo.cls}`}><small>Mức cảnh báo</small><b>{nguyCo.label}</b></div>
          <div className="dossier-tile tone-scope"><small>Phạm vi ảnh hưởng</small><b>{cd.soDoiTuong} đối tượng · {cd.soNguoiBaoCao} người báo cáo</b></div>
          <div className="dossier-tile tone-state"><small>Trạng thái</small><b>{TRANG_THAI_CHIEN_DICH[cd.trangThai]}</b></div>
        </div>

        <p className="dossier-sum">
          {cd.soBaoCao} báo cáo trong {cd.cuaSoNgay} ngày qua · thiệt hại ghi nhận {formatMoneyShort(cd.thietHai)} · {cd.daKetLuan}/{cd.soBaoCao} báo cáo đã có kết luận
        </p>

        <h4 className="dossier-title">Đối tượng nổi bật</h4>
        <ul className="dossier-targets">
          {cd.doiTuongNoiBat.map((d) => (
            <li key={d.doiTuong}>
              <Link to={`/suspects?q=${encodeURIComponent(d.doiTuong)}`} className="mono">{d.doiTuong}</Link>
              <span>{d.soBaoCao} báo cáo</span>
              <span className={`badge ${MUC_DO_NGHI_VAN[d.mucDo]?.cls ?? ''}`}>{MUC_DO_NGHI_VAN[d.mucDo]?.label ?? d.mucDo}</span>
            </li>
          ))}
        </ul>

        <h4 className="dossier-title">Diễn biến xử lý</h4>
        {cd.dienBien.length === 0 ? (
          <p className="muted">Chưa có diễn biến nào.</p>
        ) : (
          <ol className="dossier-timeline">
            {cd.dienBien.map((h, i) => (
              <li key={h.id} className={i === 0 ? 'latest' : ''}>
                <time>{formatDateTime(h.time)}</time>
                <span>
                  {h.noiDung}
                  <small> · <Link to={`/reports/${h.reportId}`}>{h.tieuDe}</Link> · {h.nguoi}</small>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="dossier-foot">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
        <Link to="/suspects" className="btn btn-secondary">Xem đối tượng nghi vấn</Link>
        <Link to={`/reports?type=${cd.loai}`} className="btn btn-primary">Mở báo cáo liên quan</Link>
      </div>
    </dialog>
  )
}

// Khối "Giám sát trực tiếp" đầu Bảng điều hành: tự tải lại định kỳ, tạm dừng khi tab bị ẩn
export default function LiveMonitor() {
  const [data, setData] = useState(null)
  const [loadedAt, setLoadedAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [offline, setOffline] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let ignore = false
    const load = () =>
      getMonitor()
        .then((d) => { if (!ignore) { setData(d); setLoadedAt(Date.now()); setOffline(false) } })
        .catch(() => { if (!ignore) setOffline(true) })
    load()
    const poll = setInterval(() => { if (!document.hidden) load() }, MONITOR_REFRESH_MS)
    const tick = setInterval(() => setNow(Date.now()), 1000)
    const onVisible = () => { if (!document.hidden) load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      ignore = true
      clearInterval(poll)
      clearInterval(tick)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  if (!data) {
    return (
      <section className="live live-empty" aria-label="Giám sát trực tiếp">
        <span className={`live-pill ${offline ? 'off' : ''}`}><i />{offline ? 'Mất kết nối' : 'Đang kết nối giám sát...'}</span>
      </section>
    )
  }

  const cd = data.chienDich
  const seconds = Math.max(0, Math.round((now - loadedAt) / 1000))
  const percent = cd ? cd.tyLeXuLy : data.tiLeXuLy

  return (
    <section className="live" aria-label="Giám sát trực tiếp">
      <div className="live-main">
        <div className="live-top">
          <span className={`live-pill ${offline ? 'off' : ''}`}><i />{offline ? 'Mất kết nối' : 'Giám sát trực tiếp'}</span>
          <small>{offline ? `Dữ liệu cũ, cập nhật ${timeAgo(seconds)}` : `Cập nhật ${timeAgo(seconds)}`}</small>
        </div>

        <div className="live-alert">
          <span className="live-alert-icon"><IconAlert /></span>
          <div>
            {cd ? (
              <>
                <small>Cảnh báo chiến dịch nổi bật</small>
                <h2>Phát hiện chiến dịch {loaiNgan(cd.loai).toLowerCase()}: {cd.soBaoCao} báo cáo trong {cd.cuaSoNgay} ngày</h2>
                <p>
                  Hệ thống ghi nhận {cd.soBaoCao} báo cáo từ {cd.soNguoiBaoCao} người, liên quan {cd.soDoiTuong} đối tượng,
                  thiệt hại {formatMoneyShort(cd.thietHai)}. {cd.dangXuLy > 0 ? `Còn ${cd.dangXuLy} báo cáo đang xử lý.` : 'Tất cả báo cáo đã có kết luận.'}
                </p>
              </>
            ) : (
              <>
                <small>Trạng thái giám sát</small>
                <h2>Chưa phát hiện chiến dịch lừa đảo nổi bật</h2>
                <p>Cảnh báo sẽ xuất hiện khi một hình thức lừa đảo có từ 2 báo cáo trở lên trong 30 ngày qua.</p>
              </>
            )}
          </div>
        </div>

        <div className="live-chips">
          {cd ? (
            <>
              <Link to={`/reports?type=${cd.loai}`}><b>{cd.soBaoCao}</b> báo cáo liên quan</Link>
              <Link to="/suspects"><b>{cd.soDoiTuong}</b> đối tượng nghi vấn</Link>
              <span><b>{cd.soNguoiBaoCao}</b> người báo cáo</span>
            </>
          ) : (
            <>
              <span><b>{data.baoCaoMoi24h}</b> báo cáo mới trong 24 giờ</span>
              <Link to="/suspects"><b>{data.soDoiTuongNghiVan}</b> đối tượng nghi vấn</Link>
              <Link to="/suspects?level=nguy_hiem"><b>{data.soDoiTuongNguyHiem}</b> đối tượng nguy hiểm</Link>
            </>
          )}
        </div>

        <div className="live-flow" aria-label="Quy trình xử lý đang giám sát">
          <small>Quy trình đang giám sát</small>
          <ol>
            {data.quyTrinh.map((s, i) => (
              <li key={s.trangThai} className={s.soLuong > 0 ? 'has' : ''}>
                <Link to={`/reports?status=${s.trangThai}`}>
                  <b>{s.soLuong}</b>
                  <span>{s.nhan}</span>
                </Link>
                {i < data.quyTrinh.length - 1 && <IconChevronRight />}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <aside className="live-side">
        <small>Tiến độ ứng phó</small>
        <div className="live-percent">
          <div>
            <b>{percent}%</b>
            {cd && <em>{cd.ketLuan2Gio > 0 ? `${cd.ketLuan2Gio} kết luận trong 2 giờ qua` : 'Chưa có kết luận mới trong 2 giờ'}</em>}
            {!cd && <em>Báo cáo đã có kết luận</em>}
          </div>
          <Ring percent={percent} />
        </div>
        <div className="live-bar"><i style={{ width: `${percent}%` }} /></div>
        {cd ? (
          <div className="live-stats">
            <div><small>Đã kết luận</small><b>{cd.daKetLuan}/{cd.soBaoCao} báo cáo</b></div>
            <div><small>Cán bộ phụ trách</small><b>{cd.soCanBo} người</b></div>
          </div>
        ) : (
          <div className="live-stats">
            <div><small>Đang xử lý</small><b>{data.quyTrinh[0].soLuong + data.quyTrinh[1].soLuong} báo cáo</b></div>
            <div><small>Đối tượng nghi vấn</small><b>{data.soDoiTuongNghiVan}</b></div>
          </div>
        )}
        {cd ? (
          <button type="button" className="live-open" onClick={() => setOpen(true)}>Mở hồ sơ cảnh báo <IconChevronRight /></button>
        ) : (
          <Link to="/suspects" className="live-open">Xem đối tượng nghi vấn <IconChevronRight /></Link>
        )}
      </aside>

      {open && cd && <DossierModal cd={cd} onClose={() => setOpen(false)} />}
    </section>
  )
}
