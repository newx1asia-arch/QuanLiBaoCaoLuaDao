import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicAlerts } from '../services/alertApi.js'
import { APP_KICKER, APP_NAME, APP_VERSION, HOTLINE, MUC_DO_CANH_BAO, TINH_THANH, formatDateTime, phamViLabel } from '../constants.js'
import { useAuth } from '../context/auth-context.js'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { BronzeDrum, CornerFrame, LotusGold, VietnamFlag } from '../components/VietnamMotifs.jsx'
import { IconAlert, IconBell, IconClock, IconPhone, IconSearch, IconShield } from '../components/Icons.jsx'
import '../public-alerts.css'

const REFRESH_MS = 60000 // tự tải lại mỗi phút, tạm dừng khi tab bị ẩn
const LONG = 320 // nội dung dài hơn mức này được thu gọn
const LEVELS = [['', 'Tất cả'], ['khan_cap', 'Khẩn cấp'], ['canh_bao', 'Cảnh báo'], ['thong_tin', 'Thông tin']]

const TIPS = [
  'Không cung cấp mã OTP, mật khẩu hay số thẻ cho bất kỳ ai, kể cả người xưng là công an hoặc nhân viên ngân hàng.',
  'Không chuyển tiền cho người chưa gặp mặt, dù được hứa hoàn tiền hay hoa hồng cao.',
  'Không bấm vào đường dẫn lạ gửi qua tin nhắn, email hoặc mạng xã hội.',
  'Gặp trường hợp nghi ngờ, hãy dừng lại và gọi đường dây nóng để được hướng dẫn.',
]

// "5 phút trước" trong 24 giờ đầu, sau đó hiện ngày giờ đầy đủ
const whenLabel = (iso, now) => {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'Vừa xong'
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`
  return formatDateTime(iso)
}

function AlertCard({ a, now }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const level = MUC_DO_CANH_BAO[a.mucDo] ?? MUC_DO_CANH_BAO.thong_tin
  const long = a.noiDung.length > LONG
  const text = open || !long ? a.noiDung : `${a.noiDung.slice(0, LONG).trimEnd()}…`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${a.tieuDe}\n\n${a.noiDung}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* trình duyệt chặn clipboard: bỏ qua */ }
  }

  return (
    <article className={`pub-card lv-${a.mucDo}`} aria-labelledby={`pub-alert-${a.id}`}>
      <div className="pub-card-top">
        <span className="pub-level"><i />{level.label}</span>
        <time dateTime={a.phatHanhLuc} title={formatDateTime(a.phatHanhLuc)}><IconClock width={14} height={14} />{whenLabel(a.phatHanhLuc, now)}</time>
        <span className="pub-scope">{phamViLabel(a)}</span>
      </div>
      <h2 id={`pub-alert-${a.id}`}>{a.tieuDe}</h2>
      <p className="pub-body">{text}</p>
      <div className="pub-card-foot">
        {long && <button type="button" className="link-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>{open ? 'Thu gọn' : 'Xem thêm'}</button>}
        <button type="button" className="btn btn-secondary btn-sm" onClick={copy}>{copied ? 'Đã sao chép' : 'Sao chép nội dung'}</button>
      </div>
    </article>
  )
}

export default function PublicAlerts() {
  const { user } = useAuth()
  const [items, setItems] = useState(null)
  const [offline, setOffline] = useState(false)
  const [province, setProvince] = useState('')
  const [level, setLevel] = useState('')
  const [q, setQ] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [updated, setUpdated] = useState(null)

  useEffect(() => {
    document.title = `Cảnh báo lừa đảo mới nhất - ${APP_NAME}`
  }, [])

  useEffect(() => {
    let ignore = false
    const load = () => {
      getPublicAlerts(province)
        .then((rows) => { if (!ignore) { setItems(rows); setOffline(false); setUpdated(new Date()); setNow(Date.now()) } })
        .catch(() => { if (!ignore) setOffline(true) })
    }
    load()
    const poll = setInterval(() => { if (!document.hidden) load() }, REFRESH_MS)
    const tick = setInterval(() => setNow(Date.now()), 30000)
    return () => { ignore = true; clearInterval(poll); clearInterval(tick) }
  }, [province])

  const counts = useMemo(() => {
    const c = { '': items?.length ?? 0, khan_cap: 0, canh_bao: 0, thong_tin: 0 }
    ;(items ?? []).forEach((a) => { if (c[a.mucDo] !== undefined) c[a.mucDo] += 1 })
    return c
  }, [items])

  const shown = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return (items ?? []).filter((a) => (!level || a.mucDo === level) && (!kw || `${a.tieuDe} ${a.noiDung}`.toLowerCase().includes(kw)))
  }, [items, level, q])

  const retry = () => {
    setOffline(false)
    getPublicAlerts(province).then((r) => { setItems(r); setUpdated(new Date()) }).catch(() => setOffline(true))
  }

  return (
    <div className="pub-page">
      <header className="gov-header">
        <Link to="/canh-bao" className="gov-brand">
          <span className="gov-emblem"><IconShield width={26} height={26} /></span>
          <span className="gov-brand-text">
            <small>{APP_KICKER}</small>
            <strong>{APP_NAME}</strong>
          </span>
        </Link>
        <div className="gov-actions" style={{ marginLeft: 'auto' }}>
          <Link to="/bao-cao" className="btn btn-primary btn-sm pub-cta">Gửi báo cáo lừa đảo</Link>
          <span className="gov-flag"><VietnamFlag /></span>
          <ThemeToggle />
        </div>
      </header>

      <main className="pub-main">
        <section className="hero pub-hero" aria-labelledby="pub-title">
          <span className="hero-drum" aria-hidden="true"><BronzeDrum /></span>
          <CornerFrame />
          <span className="hero-flag"><VietnamFlag /></span>
          <div className="hero-body">
            <span className="hero-eyebrow"><IconBell width={14} height={14} />Cảnh báo công khai</span>
            <h1 id="pub-title" className="display">Cảnh báo lừa đảo mới nhất</h1>
            <p>Các cảnh báo chính thức về thủ đoạn lừa đảo trên không gian mạng, do cơ quan chức năng phát hành để người dân kịp thời nhận biết và phòng tránh.</p>
            <ul className="hero-badges">
              <li><IconPhone width={16} height={16} />{HOTLINE.label}: {HOTLINE.value}</li>
              {items && <li><IconAlert width={16} height={16} />{items.length} cảnh báo đang hiệu lực</li>}
            </ul>
            <Link to="/bao-cao" className="btn btn-primary mt-1 pub-hero-cta">Bạn vừa bị lừa đảo? Gửi báo cáo ngay</Link>
            {updated && <small className="hero-updated">Cập nhật lúc {updated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}, {updated.toLocaleDateString('vi-VN')}{offline ? ' · Mất kết nối, dữ liệu có thể cũ' : ''}</small>}
          </div>
        </section>

        <div className="pub-layout">
          <div className="pub-col">
            <div className="card pub-toolbar">
              <label className="pub-search">
                <IconSearch width={18} height={18} />
                <span className="sr-only">Tìm cảnh báo</span>
                <input className="field-input" type="search" placeholder="Tìm theo từ khóa..." value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
              <label className="pub-province">
                <span className="sr-only">Địa bàn</span>
                <select className="field-select" value={province} onChange={(e) => { setProvince(e.target.value); setItems(null) }}>
                  <option value="">Tất cả địa bàn</option>
                  {TINH_THANH.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <div className="segmented pub-levels" role="tablist" aria-label="Lọc theo mức độ">
                {LEVELS.map(([k, label]) => (
                  <button key={k} type="button" role="tab" aria-selected={level === k} className={level === k ? 'active' : ''} onClick={() => setLevel(k)}>
                    {label} <b className="seg-n">{counts[k]}</b>
                  </button>
                ))}
              </div>
            </div>

            {offline && !items ? (
              <div className="card empty-state" role="alert">
                Không tải được cảnh báo
                <small>Máy chủ chưa phản hồi. Vui lòng thử lại sau ít phút.</small>
                <button type="button" className="btn btn-secondary btn-sm mt-1" onClick={retry}>Thử lại</button>
              </div>
            ) : items === null ? (
              <div className="card" role="status" aria-label="Đang tải cảnh báo"><div className="skeleton" /><div className="skeleton" style={{ width: '80%' }} /><div className="skeleton" style={{ width: '60%' }} /></div>
            ) : shown.length === 0 ? (
              <div className="card empty-state">
                {items.length === 0 ? 'Hiện chưa có cảnh báo nào được phát hành' : 'Không có cảnh báo nào khớp bộ lọc'}
                {items.length > 0 && <small>Hãy thử bỏ bớt từ khóa hoặc đổi mức độ.</small>}
              </div>
            ) : (
              <div className="pub-list">{shown.map((a) => <AlertCard key={a.id} a={a} now={now} />)}</div>
            )}
          </div>

          <aside className="pub-aside">
            <div className="card pub-hotline">
              <span className="pub-hotline-icon"><IconPhone width={24} height={24} /></span>
              <div>
                <small>{HOTLINE.label}</small>
                <strong>{HOTLINE.value}</strong>
              </div>
            </div>
            <div className="card pub-tips">
              <div className="card-head"><h3>Khuyến cáo chung</h3></div>
              <ol>{TIPS.map((t) => <li key={t}>{t}</li>)}</ol>
            </div>
          </aside>
        </div>
      </main>

      <footer className="pub-footer">
        <span className="footer-brand"><VietnamFlag className="flag-sm" />© {new Date().getFullYear()} {APP_NAME}<LotusGold className="lotus-sm" /></span>
        <span className="pub-staff"><Link to={user ? '/' : '/login'}>{user ? 'Vào hệ thống quản trị' : 'Dành cho cán bộ'}</Link> · Phiên bản {APP_VERSION}</span>
      </footer>
    </div>
  )
}
