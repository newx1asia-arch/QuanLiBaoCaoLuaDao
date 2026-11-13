import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { lookupTarget } from '../services/reportApi.js'
import { HOTLINE, MUC_DO_TRA_CUU, formatDate, formatMoney, loaiLabel } from '../constants.js'
import { BronzeDrum, CornerFrame, LotusGold, VietnamFlag } from '../components/VietnamMotifs.jsx'
import { IconBell, IconPhone, IconSearch, IconShield, IconUserCheck } from '../components/Icons.jsx'
import '../report-form.css'

// Cách đọc kết quả (ngưỡng "3 người" khớp NGUONG_NGUOI_BAO_CAO ở backend)
const CACH_DOC = [
  { cls: 'bad', ten: 'Nguy hiểm', mota: 'Đã được cán bộ xác nhận, hoặc từ 3 người khác nhau cùng báo cáo.' },
  { cls: 'warn', ten: 'Cần thận trọng', mota: 'Có báo cáo nhưng chưa đủ cơ sở để xác nhận.' },
  { cls: 'ok', ten: 'Chưa có báo cáo', mota: 'Chưa có nghĩa là an toàn, hãy tiếp tục xác minh.' },
]
// Ba kiểu thông tin tra được (ví dụ chỉ để minh họa định dạng)
const KIEU_TRA = [
  { ten: 'Số điện thoại', vd: '0912 345 678', mota: 'Nhận cả dạng +84 và có dấu cách, dấu chấm' },
  { ten: 'Số tài khoản', vd: '1234 5678 9012', mota: 'Số tài khoản ngân hàng hoặc ví điện tử' },
  { ten: 'Đường link', vd: 'example.com/dau-tu', mota: 'Bỏ qua http://, www. và dấu / ở cuối' },
]
const GAN_DAY_KEY = 'lookup_recent'
const GAN_DAY_MAX = 5
// Lịch sử tra cứu chỉ giữ trong tab đang mở (sessionStorage): đóng tab là mất, không lưu lâu dài trên máy dùng chung
const docGanDay = () => {
  try { return JSON.parse(sessionStorage.getItem(GAN_DAY_KEY) ?? '[]').filter((x) => typeof x === 'string').slice(0, GAN_DAY_MAX) } catch { return [] }
}
const ghiGanDay = (list) => {
  try { sessionStorage.setItem(GAN_DAY_KEY, JSON.stringify(list)) } catch { /* trình duyệt chặn lưu trữ: bỏ qua */ }
}

const LUU_Y = [
  'Khoảng trắng, dấu chấm, dấu gạch ngang và đầu số +84 được bỏ qua khi so khớp.',
  'Báo cáo bị cán bộ từ chối (không đúng sự thật) không được tính.',
  'Kết quả chỉ gồm số liệu tổng hợp, không hiển thị tên người báo cáo.',
  'Mỗi tài khoản tra tối đa 30 lượt mỗi phút.',
]

// Kiểm tra nhanh một SĐT / số tài khoản / link đã bị báo cáo lừa đảo chưa, trước khi chuyển tiền
export default function Lookup() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState((params.get('q') ?? '').slice(0, 255)) // từ liên kết ?q=... (vd cảnh báo trùng ở form tạo báo cáo)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const latest = useRef(0) // chỉ nhận kết quả của lần tra cứu mới nhất
  const autoRan = useRef(false)
  const [recent, setRecent] = useState(docGanDay)

  const search = async (raw) => {
    const text = raw.trim()
    if (text.length < 3) {
      setError('Nhập ít nhất 3 ký tự để tra cứu.')
      return
    }
    const id = ++latest.current
    setError('')
    setLoading(true)
    setParams({ q: text }, { replace: true }) // giữ từ khóa trên địa chỉ: F5 hoặc gửi liên kết vẫn ra đúng kết quả
    try {
      const data = await lookupTarget(text)
      if (id === latest.current) {
        setResult(data)
        setRecent((r) => { const next = [text, ...r.filter((x) => x !== text)].slice(0, GAN_DAY_MAX); ghiGanDay(next); return next })
      }
    } catch (err) {
      if (id === latest.current) { setResult(null); setError(err.message) }
    } finally {
      if (id === latest.current) setLoading(false)
    }
  }

  // Mở trang bằng ?q=... thì tra ngay một lần
  useEffect(() => {
    if (autoRan.current) return
    autoRan.current = true
    if (q.trim().length >= 3) search(q)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const xoaGanDay = () => { setRecent([]); ghiGanDay([]) }

  const onSubmit = (e) => {
    e.preventDefault()
    search(q)
  }

  const level = result && MUC_DO_TRA_CUU[result.mucDo]

  return (
    <>
      <section className="hero rf-hero" aria-labelledby="lk-title">
        <span className="hero-drum" aria-hidden="true"><BronzeDrum /></span>
        <CornerFrame />
        <span className="hero-flag"><VietnamFlag /></span>
        <div className="hero-body">
          <span className="hero-eyebrow"><IconSearch width={14} height={14} />Nghiệp vụ tra cứu</span>
          <h1 id="lk-title" className="display">Tra cứu đối tượng</h1>
          <p>Kiểm tra số điện thoại, số tài khoản hoặc đường link đã bị báo cáo lừa đảo chưa, trước khi người dân chuyển tiền.</p>
          <ul className="hero-badges">
            <li><IconShield width={16} height={16} />Không tính báo cáo bị từ chối</li>
            <li><IconUserCheck width={16} height={16} />Không lộ tên người báo cáo</li>
          </ul>
        </div>
      </section>

      <div className="rf-layout">
        <div className="rf-main">
          <form className="card rf-form" onSubmit={onSubmit} noValidate>
            {error && <div className="field-error" role="alert">{error}</div>}
            <label className="field-label" htmlFor="q">SĐT, số tài khoản hoặc link</label>
            <div className="search-row">
              <input className="field-input" id="q" value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Ví dụ: 0912 345 678" autoFocus />
              <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Đang tra...' : 'Tra cứu'}</button>
            </div>
            <span className="field-hint">Khoảng trắng, dấu chấm và dấu gạch ngang được bỏ qua khi so khớp.</span>
          </form>

          {recent.length > 0 && (
            <div className="card rf-form lk-recent">
              <div className="card-head"><h3>Tra cứu gần đây</h3><button type="button" className="link-btn" onClick={xoaGanDay}>Xóa</button></div>
              <div className="lk-chips">
                {recent.map((t) => (
                  <button key={t} type="button" className="lk-chip" onClick={() => { setQ(t); search(t) }}><IconSearch width={14} height={14} />{t}</button>
                ))}
              </div>
            </div>
          )}

          {!result && (
            <div className="card rf-form lk-empty">
              <span className="lk-empty-icon" aria-hidden="true"><IconShield width={30} height={30} /></span>
              <h3>Nhập thông tin cần kiểm tra</h3>
              <p>Hệ thống đối chiếu với các báo cáo đã tiếp nhận (không tính báo cáo bị từ chối) và cho biết đối tượng đã bị báo cáo bao nhiêu lần.</p>
              <ul className="lk-kinds">
                {KIEU_TRA.map((k) => (
                  <li key={k.ten}><b>{k.ten}</b><code>{k.vd}</code><span>{k.mota}</span></li>
                ))}
              </ul>
            </div>
          )}

          {result && (
            <div className="card rf-form" aria-live="polite">
              <div className={level.cls}>
                <b>{level.title}</b>
                <div>{level.hint}</div>
              </div>

              {result.soBaoCao > 0 && (
                <>
                  <div className="stat-grid lookup-stats">
                    <div className="stat"><div className="stat-label">Số báo cáo</div><div className="stat-value">{result.soBaoCao}</div></div>
                    <div className="stat ok"><div className="stat-label">Đã xác nhận</div><div className="stat-value">{result.daXacNhan}</div></div>
                    <div className="stat danger"><div className="stat-label">Tổng thiệt hại</div><div className="stat-value money">{formatMoney(result.tongThietHai)}</div></div>
                  </div>
                  <h3>Hình thức lừa đảo được báo cáo</h3>
                  <ul className="progress-list">
                    {result.loai.map((l) => (
                      <li key={l.loai}>
                        <div className="progress-top"><span>{loaiLabel(l.loai).split(' (')[0]}</span><b>{l.soLan}</b></div>
                        <div className="progress-track"><i style={{ width: `${(l.soLan / result.soBaoCao) * 100}%` }} /></div>
                      </li>
                    ))}
                  </ul>
                  <p className="muted">Báo cáo gần nhất xảy ra ngày {formatDate(result.baoCaoGanNhat)}.</p>
                </>
              )}

              <Link to={`/reports/new?doiTuong=${encodeURIComponent(result.q)}`} className="btn btn-secondary">
                Gửi báo cáo về đối tượng này
              </Link>
            </div>
          )}
        </div>

        <aside className="rf-aside" aria-label="Hướng dẫn tra cứu">
          <div className="card rf-progress">
            <CornerFrame />
            <div className="card-head"><h3>Cách đọc kết quả</h3></div>
            <ul className="lk-legend">
              {CACH_DOC.map((c) => (
                <li key={c.cls}>
                  <i className={`lk-dot ${c.cls}`} aria-hidden="true" />
                  <div><b>{c.ten}</b><span>{c.mota}</span></div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card rf-tips">
            <span className="rf-lotus" aria-hidden="true"><LotusGold /></span>
            <div className="card-head"><h3><IconBell width={16} height={16} /> Lưu ý khi tra cứu</h3></div>
            <ol>{LUU_Y.map((t) => <li key={t}>{t}</li>)}</ol>
          </div>

          <div className="card rf-hotline">
            <span className="rf-hotline-drum" aria-hidden="true"><BronzeDrum /></span>
            <span className="rf-hotline-icon"><IconPhone width={22} height={22} /></span>
            <div>
              <small>{HOTLINE.label}</small>
              <strong>{HOTLINE.value}</strong>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
