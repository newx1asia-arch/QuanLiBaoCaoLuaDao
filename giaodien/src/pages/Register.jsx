import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth-context.js'
import { PASSWORD_HINT, passwordError } from '../constants.js'
import AuthLayout from '../components/AuthLayout.jsx'

export default function Register() {
  const { register } = useAuth()
  const location = useLocation()
  const [form, setForm] = useState({ hoTen: '', email: '', matKhau: '', nhapLai: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    const problem =
      form.hoTen.trim().length < 2 ? 'Họ tên phải từ 2 ký tự.'
      : !/^\S+@\S+\.\S+$/.test(form.email.trim()) ? 'Email không hợp lệ.'
      : passwordError(form.matKhau)
      || (form.matKhau !== form.nhapLai ? 'Mật khẩu nhập lại không khớp.' : '')
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    setSaving(true)
    try {
      await register({ hoTen: form.hoTen, email: form.email, matKhau: form.matKhau })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <AuthLayout
      title="Đăng ký tài khoản"
      subtitle="Tạo tài khoản người dân để gửi báo cáo lừa đảo"
      footer={<>Đã có tài khoản? <Link to="/login" state={location.state}>Đăng nhập</Link></>}
    >
      <form onSubmit={onSubmit} noValidate>
        {error && <div className="field-error" role="alert">{error}</div>}
        <div className="field-group">
          <label className="field-label" htmlFor="hoTen">Họ và tên</label>
          <input className="field-input" id="hoTen" name="hoTen" autoComplete="name" value={form.hoTen} onChange={onChange} autoFocus />
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="email">Email</label>
          <input className="field-input" id="email" name="email" type="email" autoComplete="username" value={form.email} onChange={onChange} />
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="matKhau">Mật khẩu</label>
          <input className="field-input" id="matKhau" name="matKhau" type="password" autoComplete="new-password"
            value={form.matKhau} onChange={onChange} aria-describedby="pw-hint" />
          <span className="field-hint" id="pw-hint">{PASSWORD_HINT}</span>
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="nhapLai">Nhập lại mật khẩu</label>
          <input className="field-input" id="nhapLai" name="nhapLai" type="password" autoComplete="new-password"
            value={form.nhapLai} onChange={onChange} />
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
          {saving ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>
    </AuthLayout>
  )
}
