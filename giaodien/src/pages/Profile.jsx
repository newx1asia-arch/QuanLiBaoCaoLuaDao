import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context.js'
import { HOTLINE, PASSWORD_HINT, formatDate, initials, passwordError } from '../constants.js'
import RoleBadge from '../components/RoleBadge.jsx'
import { BronzeDrum, CornerFrame, LotusGold, VietnamFlag } from '../components/VietnamMotifs.jsx'
import { IconPhone, IconShield, IconUser } from '../components/Icons.jsx'
import '../report-form.css'

// Các quy tắc mật khẩu (khớp passwordError ở constants.js và backend), hiện tick xanh ngay khi gõ
const QUY_TAC_MK = [
  { label: 'Từ 8 ký tự', ok: (p) => p.length >= 8 },
  { label: 'Có chữ cái', ok: (p) => /[A-Za-z]/.test(p) },
  { label: 'Có chữ số', ok: (p) => /\d/.test(p) },
]
const LOI_KHUYEN = [
  'Không dùng chung mật khẩu của hệ thống này cho email hay mạng xã hội.',
  'Không chia sẻ mật khẩu hoặc mã xác nhận cho bất kỳ ai, kể cả người xưng là quản trị viên.',
  'Đổi mật khẩu xong, các thiết bị khác sẽ tự đăng xuất.',
  'Dùng máy dùng chung thì nhớ bấm Đăng xuất khi xong việc.',
]

export default function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth()
  const navigate = useNavigate()
  const [hoTen, setHoTen] = useState(user.hoTen)
  const [pw, setPw] = useState({ matKhauCu: '', matKhauMoi: '', nhapLai: '' })
  const [msg, setMsg] = useState({ profile: null, password: null }) // { type: 'ok' | 'err', text }
  const [saving, setSaving] = useState('')

  const flash = (key, type, text) => setMsg((m) => ({ ...m, [key]: { type, text } }))

  const onSaveProfile = async (e) => {
    e.preventDefault()
    if (hoTen.trim().length < 2) return flash('profile', 'err', 'Họ tên phải từ 2 ký tự.')
    setSaving('profile')
    try {
      await updateProfile({ hoTen: hoTen.trim().replace(/\s+/g, ' ') })
      flash('profile', 'ok', 'Đã cập nhật họ tên.')
    } catch (err) {
      flash('profile', 'err', err.message)
    }
    setSaving('')
  }

  const onChangePassword = async (e) => {
    e.preventDefault()
    const problem = !pw.matKhauCu ? 'Vui lòng nhập mật khẩu hiện tại.'
      : passwordError(pw.matKhauMoi)
      || (pw.matKhauMoi !== pw.nhapLai ? 'Mật khẩu nhập lại không khớp.' : '')
    if (problem) return flash('password', 'err', problem)
    setSaving('password')
    try {
      await changePassword({ matKhauCu: pw.matKhauCu, matKhauMoi: pw.matKhauMoi })
      setPw({ matKhauCu: '', matKhauMoi: '', nhapLai: '' })
      flash('password', 'ok', 'Đã đổi mật khẩu. Các thiết bị khác sẽ phải đăng nhập lại.')
    } catch (err) {
      flash('password', 'err', err.message)
    }
    setSaving('')
  }

  const onPw = (e) => setPw({ ...pw, [e.target.name]: e.target.value })
  const note = (m) => m && (
    <div className={m.type === 'ok' ? 'field-success' : 'field-error'} role={m.type === 'ok' ? 'status' : 'alert'}>{m.text}</div>
  )

  return (
    <>
      <section className="hero rf-hero" aria-labelledby="pf-title">
        <span className="hero-drum" aria-hidden="true"><BronzeDrum /></span>
        <CornerFrame />
        <span className="hero-flag"><VietnamFlag /></span>
        <div className="hero-body">
          <span className="hero-eyebrow"><IconUser width={14} height={14} />Tài khoản</span>
          <h1 id="pf-title" className="display">Hồ sơ của tôi</h1>
          <p>Cập nhật họ tên và đổi mật khẩu. Email đăng nhập do quản trị viên cấp nên không tự đổi được.</p>
          <div className="hero-actions pf-hero-actions">
            <button className="btn btn-ghost" onClick={() => { logout(); navigate('/login', { replace: true }) }}>Đăng xuất</button>
          </div>
        </div>
      </section>

      <div className="rf-layout">
        <div className="rf-main">
        <form className="card rf-form" onSubmit={onSaveProfile} noValidate>
          <div className="card-head"><h3>Thông tin</h3><RoleBadge value={user.vaiTro} /></div>
          {note(msg.profile)}
          <div className="field-group">
            <label className="field-label" htmlFor="email">Email</label>
            <input className="field-input" id="email" value={user.email} disabled />
            <span className="field-hint">Email dùng để đăng nhập, không thể thay đổi.</span>
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="hoTen">Họ và tên</label>
            <input className="field-input" id="hoTen" value={hoTen} onChange={(e) => setHoTen(e.target.value)} autoComplete="name" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving === 'profile' || hoTen.trim().replace(/\s+/g, ' ') === user.hoTen}>
            {saving === 'profile' ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </form>

        <form className="card rf-form" onSubmit={onChangePassword} noValidate>
          <div className="card-head"><h3>Đổi mật khẩu</h3></div>
          {note(msg.password)}
          <input type="text" name="username" value={user.email} autoComplete="username" readOnly hidden />
          <div className="field-group">
            <label className="field-label" htmlFor="matKhauCu">Mật khẩu hiện tại</label>
            <input className="field-input" id="matKhauCu" name="matKhauCu" type="password" autoComplete="current-password" value={pw.matKhauCu} onChange={onPw} />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="matKhauMoi">Mật khẩu mới</label>
            <input className="field-input" id="matKhauMoi" name="matKhauMoi" type="password" autoComplete="new-password" value={pw.matKhauMoi} onChange={onPw} />
            <ul className="pf-rules" aria-label={PASSWORD_HINT}>
              {QUY_TAC_MK.map((r) => <li key={r.label} className={r.ok(pw.matKhauMoi) ? 'done' : ''}><span aria-hidden="true">{r.ok(pw.matKhauMoi) ? '✓' : '○'}</span>{r.label}</li>)}
            </ul>
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="nhapLai">Nhập lại mật khẩu mới</label>
            <input className="field-input" id="nhapLai" name="nhapLai" type="password" autoComplete="new-password" value={pw.nhapLai} onChange={onPw} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving === 'password'}>
            {saving === 'password' ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
        </form>
        </div>

        <aside className="rf-aside" aria-label="Thông tin tài khoản">
          <div className="card rf-progress pf-me">
            <CornerFrame />
            <span className="pf-avatar" aria-hidden="true">{initials(user.hoTen)}</span>
            <strong>{user.hoTen}</strong>
            <span className="muted pf-email">{user.email}</span>
            <RoleBadge value={user.vaiTro} />
            <p className="rf-extra">Tham gia từ <b>{formatDate(user.ngayTao)}</b></p>
          </div>

          <div className="card rf-tips">
            <span className="rf-lotus" aria-hidden="true"><LotusGold /></span>
            <div className="card-head"><h3><IconShield width={16} height={16} /> An toàn tài khoản</h3></div>
            <ol>{LOI_KHUYEN.map((t) => <li key={t}>{t}</li>)}</ol>
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
