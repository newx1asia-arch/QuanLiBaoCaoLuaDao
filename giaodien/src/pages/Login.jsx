import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth-context.js'
import AuthLayout from '../components/AuthLayout.jsx'

export default function Login() {
  const { login } = useAuth()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', matKhau: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.matKhau) {
      setError('Vui lòng nhập email và mật khẩu.')
      return
    }
    setError('')
    setSaving(true)
    try {
      await login(form) // đăng nhập xong GuestOnly tự chuyển sang trang trước đó hoặc trang chủ
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Đăng nhập để gửi và theo dõi báo cáo lừa đảo"
      footer={<>Chưa có tài khoản? <Link to="/register" state={location.state}>Đăng ký</Link></>}
    >
      <form onSubmit={onSubmit} noValidate>
        {error && <div className="field-error" role="alert">{error}</div>}
        <div className="field-group">
          <label className="field-label" htmlFor="email">Email</label>
          <input className="field-input" id="email" name="email" type="email" autoComplete="username"
            value={form.email} onChange={onChange} autoFocus />
        </div>
        <div className="field-group">
          <div className="label-row">
            <label className="field-label" htmlFor="matKhau">Mật khẩu</label>
            <Link to="/forgot-password" className="label-link">Quên mật khẩu?</Link>
          </div>
          <input className="field-input" id="matKhau" name="matKhau" type="password" autoComplete="current-password"
            value={form.matKhau} onChange={onChange} />
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
          {saving ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </AuthLayout>
  )
}
