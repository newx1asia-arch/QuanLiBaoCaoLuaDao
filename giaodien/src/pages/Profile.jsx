import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context.js'
import { PASSWORD_HINT, formatDate, passwordError } from '../constants.js'
import RoleBadge from '../components/RoleBadge.jsx'

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
      await updateProfile({ hoTen })
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
      <div className="page-head">
        <div>
          <h1>Tài khoản</h1>
          <p>Thông tin cá nhân và mật khẩu</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-secondary" onClick={() => { logout(); navigate('/login', { replace: true }) }}>Đăng xuất</button>
        </div>
      </div>

      <div className="stack-cards">
        <form className="card form-narrow" onSubmit={onSaveProfile} noValidate>
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
          <p className="muted">Tham gia từ {formatDate(user.ngayTao)}</p>
          <button className="btn btn-primary" type="submit" disabled={saving === 'profile' || hoTen.trim() === user.hoTen}>
            {saving === 'profile' ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </form>

        <form className="card form-narrow" onSubmit={onChangePassword} noValidate>
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
            <span className="field-hint">{PASSWORD_HINT}</span>
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
    </>
  )
}
