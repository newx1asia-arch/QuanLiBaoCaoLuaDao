import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { submitPublicReport } from '../services/reportApi.js'
import { APP_KICKER, APP_NAME, APP_VERSION, HOTLINE, KHU_VUC_NHOM, LOAI_LUA_DAO, TINH_THANH, formatMoneyShort, formatNumber, formatThousands, caretAfterDigits, reportCode, todayISO } from '../constants.js'
import { useAuth } from '../context/auth-context.js'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { BronzeDrum, CornerFrame, LotusGold, VietnamFlag } from '../components/VietnamMotifs.jsx'
import { IconBell, IconFile, IconPhone, IconShield, IconUserCheck } from '../components/Icons.jsx'
import '../public-report.css'

// Nhóm tỉnh, thành theo vùng (từ Bắc vào Nam) để người dân dễ tìm
const NHOM_TINH = KHU_VUC_NHOM.map((g, i) => ({
  label: g.label,
  items: TINH_THANH.filter((t) => t.lat < (i === 0 ? 99 : KHU_VUC_NHOM[i - 1].from) && t.lat >= g.from),
}))

const STEPS = [
  'Bạn điền thông tin vụ việc và gửi đi, không cần đăng nhập hay tạo tài khoản.',
  'Cán bộ tiếp nhận kiểm tra, xác minh thông tin và có thể liên hệ lại nếu bạn để lại số điện thoại hoặc email.',
  'Thông tin về đối tượng lừa đảo được dùng để cảnh báo, ngăn chặn và hỗ trợ điều tra.',
]

const TIPS = [
  'Chụp lại tin nhắn, cuộc gọi, biên lai chuyển tiền và giữ nguyên, chưa xóa.',
  'Nếu vừa chuyển tiền, hãy gọi ngay cho ngân hàng để được hỗ trợ phong tỏa giao dịch.',
  'Không chuyển thêm tiền "để lấy lại tiền" cho bất kỳ ai.',
]

const empty = {
  tieuDe: '', loai: 'gia_danh', doiTuong: '', soTienThietHai: '', ngayXayRa: '',
  tinhThanh: '', moTa: '', nguoiBaoCao: '', lienHe: '', website: '', // website: ô bẫy chống tool tự động, người thật không thấy
}

const MAX_TIEN = 1_000_000_000_000 // khớp backend

// Trả về { tên trường: thông báo lỗi }; rỗng là hợp lệ. Quy tắc khớp create-report.dto.ts ở backend
function validate(f, agree) {
  const e = {}
  const tieuDe = f.tieuDe.trim()
  const doiTuong = f.doiTuong.trim()
  const ten = f.nguoiBaoCao.trim()
  if (!tieuDe) e.tieuDe = 'Vui lòng tóm tắt vụ việc.'
  else if (tieuDe.length < 5) e.tieuDe = 'Phần tóm tắt phải từ 5 ký tự.'
  if (!f.ngayXayRa) e.ngayXayRa = 'Vui lòng chọn ngày xảy ra.'
  else if (f.ngayXayRa > todayISO()) e.ngayXayRa = 'Ngày xảy ra không được ở tương lai.'
  else if (f.ngayXayRa < '2000-01-01') e.ngayXayRa = 'Ngày xảy ra quá xa, vui lòng kiểm tra lại.'
  if (!doiTuong) e.doiTuong = 'Vui lòng nhập thông tin đối tượng lừa đảo.'
  else if (doiTuong.length < 3) e.doiTuong = 'Thông tin đối tượng phải từ 3 ký tự.'
  if (f.soTienThietHai !== '' && Number(f.soTienThietHai) > MAX_TIEN) e.soTienThietHai = 'Số tiền quá lớn, vui lòng kiểm tra lại.'
  if (!ten) e.nguoiBaoCao = 'Vui lòng nhập họ và tên.'
  else if (ten.length < 2) e.nguoiBaoCao = 'Họ và tên phải từ 2 ký tự.'
  if (!agree) e.agree = 'Vui lòng xác nhận thông tin bạn cung cấp là đúng sự thật.'
  return e
}
const THU_TU_LOI = ['tieuDe', 'ngayXayRa', 'doiTuong', 'soTienThietHai', 'nguoiBaoCao', 'agree']

export default function PublicReport() {
  const { user } = useAuth()
  const [form, setForm] = useState(empty)
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('') // lỗi từ máy chủ
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(null) // { id, ngayTao } sau khi gửi thành công

  useEffect(() => {
    document.title = `Gửi báo cáo lừa đảo - ${APP_NAME}`
  }, [])

  const dirty = !done && (JSON.stringify(form) !== JSON.stringify(empty) || agree)

  // Đóng tab / tải lại khi đang điền dở thì trình duyệt hỏi lại
  useEffect(() => {
    if (!dirty || saving) return undefined
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, saving])

  const clearError = (name) => {
    setErrors((er) => (er[name] ? { ...er, [name]: undefined } : er))
    setError('')
  }

  const onChange = (e) => {
    const { name } = e.target
    let { value } = e.target
    if (name === 'soTienThietHai') {
      const el = e.target
      const truoc = el.value.slice(0, el.selectionStart ?? el.value.length).replace(/\D/g, '').length // số chữ số đứng trước con trỏ
      value = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 13) // chỉ nhận chữ số: không còn lọt "1e3" hay số thập phân
      const hienThi = formatThousands(value)
      requestAnimationFrame(() => { const pos = caretAfterDigits(hienThi, Math.min(truoc, value.length)); el.setSelectionRange(pos, pos) })
    }
    setForm((f) => ({ ...f, [name]: value }))
    clearError(name)
  }

  // Rời ô: báo lỗi ngay nếu ô đã có nội dung nhưng sai (ô còn trống thì chờ lúc bấm Gửi)
  const onBlur = (e) => {
    const { name } = e.target
    const msg = form[name] !== '' && validate(form, agree)[name]
    if (msg) setErrors((er) => ({ ...er, [name]: msg }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    const errs = validate(form, agree)
    const first = THU_TU_LOI.find((k) => errs[k])
    if (first) {
      setErrors(errs)
      setError('')
      document.getElementById(first === 'agree' ? 'rp-agree' : first)?.focus()
      return
    }
    setErrors({})
    setError('')
    setSaving(true)
    try {
      const { tinhThanh, lienHe, ...rest } = form
      const created = await submitPublicReport({
        ...rest, tieuDe: rest.tieuDe.trim(), doiTuong: rest.doiTuong.trim(), nguoiBaoCao: rest.nguoiBaoCao.trim(), moTa: rest.moTa.trim(),
        ...(tinhThanh && { tinhThanh }), ...(lienHe.trim() && { lienHe: lienHe.trim() }),
      })
      setDone(created)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  const sendAnother = () => {
    setForm(empty)
    setAgree(false)
    setErrors({})
    setDone(null)
  }

  const fieldCls = (name) => `field-input${errors[name] ? ' invalid' : ''}`
  const errMsg = (name) => errors[name] && <span className="field-msg" id={`${name}-err`} role="alert">{errors[name]}</span>
  const aria = (name) => ({ 'aria-invalid': errors[name] ? true : undefined, 'aria-describedby': errors[name] ? `${name}-err` : undefined })
  const tien = Number(form.soTienThietHai) || 0

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
          <Link to="/canh-bao" className="btn btn-secondary btn-sm pub-cta">Xem cảnh báo</Link>
          <span className="gov-flag"><VietnamFlag /></span>
          <ThemeToggle />
        </div>
      </header>

      <main className="pub-main">
        <section className="hero pub-hero" aria-labelledby="rp-title">
          <span className="hero-drum" aria-hidden="true"><BronzeDrum /></span>
          <CornerFrame />
          <span className="hero-flag"><VietnamFlag /></span>
          <div className="hero-body">
            <span className="hero-eyebrow"><IconFile width={14} height={14} />Dành cho người dân</span>
            <h1 id="rp-title" className="display">Gửi báo cáo lừa đảo</h1>
            <p>Bạn hoặc người thân vừa gặp một vụ lừa đảo trên không gian mạng? Hãy cho chúng tôi biết. Không cần đăng nhập, không cần tài khoản, chỉ mất khoảng 3 phút.</p>
            <ul className="hero-badges">
              <li><IconPhone width={16} height={16} />{HOTLINE.label}: {HOTLINE.value}</li>
              <li><IconUserCheck width={16} height={16} />Thông tin cá nhân được bảo mật</li>
            </ul>
          </div>
        </section>

        <div className="pub-layout">
          <div className="pub-col">
            {done ? (
              <div className="card rp-done" role="status">
                <span className="rp-done-icon" aria-hidden="true">✓</span>
                <h2>Đã tiếp nhận báo cáo của bạn</h2>
                {done.id > 0 && (
                  <p className="rp-code">Mã tiếp nhận <strong>{reportCode(done)}</strong></p>
                )}
                <p>Cảm ơn bạn đã báo cáo. Cán bộ sẽ xem xét và xác minh thông tin. {done.id > 0 && 'Hãy ghi lại mã tiếp nhận phía trên phòng khi cần hỏi lại qua đường dây nóng.'}</p>
                <p className="muted">Nếu bạn vừa chuyển tiền cho đối tượng, hãy gọi ngay cho ngân hàng và đường dây nóng <b>{HOTLINE.value}</b> để được hỗ trợ kịp thời.</p>
                <div className="form-actions">
                  <button type="button" className="btn btn-primary" onClick={sendAnother}>Gửi báo cáo khác</button>
                  <Link to="/canh-bao" className="btn btn-secondary">Xem cảnh báo mới nhất</Link>
                </div>
              </div>
            ) : (
              <form className="card rp-form" onSubmit={onSubmit} noValidate>
                <div className="card-head"><h3>Thông tin vụ việc</h3></div>
                {error && <div className="field-error" role="alert">{error}</div>}

                <div className="field-group">
                  <label className="field-label" htmlFor="tieuDe">Tóm tắt vụ việc <span className="req">*</span></label>
                  <input className={fieldCls('tieuDe')} id="tieuDe" name="tieuDe" value={form.tieuDe} onChange={onChange} onBlur={onBlur} maxLength={255}
                    placeholder="Ví dụ: Giả danh nhân viên ngân hàng yêu cầu đọc mã OTP" {...aria('tieuDe')} />
                  {errMsg('tieuDe')}
                </div>

                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label" htmlFor="loai">Hình thức lừa đảo <span className="req">*</span></label>
                    <select className="field-select" id="loai" name="loai" value={form.loai} onChange={onChange}>
                      {LOAI_LUA_DAO.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="ngayXayRa">Ngày xảy ra <span className="req">*</span></label>
                    <input className={fieldCls('ngayXayRa')} id="ngayXayRa" name="ngayXayRa" type="date" min="2000-01-01" max={todayISO()} value={form.ngayXayRa} onChange={onChange} onBlur={onBlur} {...aria('ngayXayRa')} />
                    {errMsg('ngayXayRa')}
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="doiTuong">Thông tin đối tượng lừa đảo <span className="req">*</span></label>
                  <input className={fieldCls('doiTuong')} id="doiTuong" name="doiTuong" value={form.doiTuong} onChange={onChange} onBlur={onBlur} maxLength={255} autoComplete="off" {...aria('doiTuong')} />
                  {errMsg('doiTuong')}
                  <span className="field-hint">Số điện thoại, số tài khoản ngân hàng, đường link web, tên Facebook / Zalo... Có thông tin nào thì điền thông tin đó.</span>
                </div>

                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label" htmlFor="soTienThietHai">Số tiền đã mất (đồng)</label>
                    <input className={fieldCls('soTienThietHai')} id="soTienThietHai" name="soTienThietHai" inputMode="numeric" autoComplete="off" value={form.soTienThietHai === '' ? '' : formatThousands(form.soTienThietHai)} onChange={onChange} onBlur={onBlur} placeholder="0" {...aria('soTienThietHai')} />
                    {errMsg('soTienThietHai')}
                    {!errors.soTienThietHai && <span className="field-hint">{tien > 0 ? `Tương đương ${formatMoneyShort(tien)}` : 'Để trống nếu chưa mất tiền'}</span>}
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="tinhThanh">Bạn đang ở tỉnh, thành nào?</label>
                    <select className="field-select" id="tinhThanh" name="tinhThanh" value={form.tinhThanh} onChange={onChange}>
                      <option value="">Không rõ / không muốn nêu</option>
                      {NHOM_TINH.map((g) => (
                        <optgroup key={g.label} label={g.label}>
                          {g.items.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="moTa">Diễn biến sự việc</label>
                  <textarea className="field-textarea" id="moTa" name="moTa" rows="5" value={form.moTa} onChange={onChange} maxLength={5000}
                    placeholder="Đối tượng liên lạc với bạn bằng cách nào, nói gì, yêu cầu bạn làm gì, bạn đã chuyển tiền ra sao..." />
                  <span className="field-hint rp-count">{formatNumber(form.moTa.length)} / 5.000 ký tự</span>
                </div>

                <div className="card-head rp-sub"><h3>Thông tin của bạn</h3></div>
                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label" htmlFor="nguoiBaoCao">Họ và tên <span className="req">*</span></label>
                    <input className={fieldCls('nguoiBaoCao')} id="nguoiBaoCao" name="nguoiBaoCao" value={form.nguoiBaoCao} onChange={onChange} onBlur={onBlur} maxLength={100} autoComplete="name" {...aria('nguoiBaoCao')} />
                    {errMsg('nguoiBaoCao')}
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="lienHe">Số điện thoại hoặc email</label>
                    <input className="field-input" id="lienHe" name="lienHe" value={form.lienHe} onChange={onChange} maxLength={100} autoComplete="tel" />
                    <span className="field-hint">Không bắt buộc, để cán bộ liên hệ lại khi cần</span>
                  </div>
                </div>
                <p className="rp-privacy">Họ tên và thông tin liên hệ của bạn chỉ cán bộ tiếp nhận được xem, không hiển thị công khai.</p>

                {/* Ô bẫy chống tool tự động: ẩn với người thật */}
                <div className="rp-hp" aria-hidden="true">
                  <label htmlFor="website">Để trống ô này</label>
                  <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={onChange} />
                </div>

                <label className="check-inline rp-agree">
                  <input type="checkbox" id="rp-agree" checked={agree} onChange={(e) => { setAgree(e.target.checked); clearError('agree') }} {...aria('agree')} />
                  Tôi cam đoan những thông tin trên là đúng sự thật
                </label>
                {errMsg('agree')}

                <div className="form-actions">
                  <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Đang gửi...' : 'Gửi báo cáo'}</button>
                </div>
              </form>
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
              <div className="card-head"><h3>Sau khi gửi báo cáo</h3></div>
              <ol>{STEPS.map((t) => <li key={t}>{t}</li>)}</ol>
            </div>
            <div className="card pub-tips">
              <div className="card-head"><h3><IconBell width={16} height={16} /> Bạn nên làm ngay</h3></div>
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
