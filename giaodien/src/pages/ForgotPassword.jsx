import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PASSWORD_HINT, passwordError } from '../constants.js'
import { forgotPassword, resetPassword } from '../services/authApi.js'
import AuthLayout from '../components/AuthLayout.jsx'

const RESEND_SECONDS = 60

// Hai bước: (1) nhập email để nhận mã 6 số, (2) nhập mã và đặt mật khẩu mới
export default function ForgotPassword() {
  const [step, setStep] = useState('email') // email | code | done
  const [form, setForm] = useState({ email: '', ma: '', matKhauMoi: '', nhapLai: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [wait, setWait] = useState(0)

  useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const sendCode = async () => {
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Email không hợp lệ.')
      return false
    }
    setError('')
    setSaving(true)
    try {
      const res = await forgotPassword({ email: form.email })
      setNotice(res.message)
      setWait(RESEND_SECONDS)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  const onSendCode = async (e) => {
    e.preventDefault()
    if (await sendCode()) setStep('code')
  }

  const onResend = async () => {
    setForm((f) => ({ ...f, ma: '' }))
    await sendCode()
  }

  const onReset = async (e) => {
    e.preventDefault()
    const problem = !/^\d{6}$/.test(form.ma.trim()) ? 'Mã xác nhận gồm 6 chữ số.'
      : passwordError(form.matKhauMoi)
      || (form.matKhauMoi !== form.nhapLai ? 'Mật khẩu nhập lại không khớp.' : '')
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    setSaving(true)
    try {
      await resetPassword({ email: form.email, ma: form.ma.trim(), matKhauMoi: form.matKhauMoi })
      setStep('done')
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  const loginLink = <Link to="/login">Quay lại đăng nhập</Link>

  if (step === 'done') {
    return (
      <AuthLayout title="Đã đặt lại mật khẩu" subtitle="Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ." footer={null}>
        <div className="field-success" role="status">Mật khẩu của bạn đã được thay đổi. Các thiết bị khác sẽ phải đăng nhập lại.</div>
        <Link to="/login" className="btn btn-primary btn-block">Đăng nhập</Link>
      </AuthLayout>
    )
  }

  if (step === 'code') {
    return (
      <AuthLayout
        title="Nhập mã xác nhận"
        subtitle={<>Mã 6 số đã được gửi tới <b>{form.email.trim()}</b> (nếu email đã đăng ký).</>}
        footer={loginLink}
      >
        <form onSubmit={onReset} noValidate>
          {notice && !error && <div className="field-success" role="status">{notice}</div>}
          {error && <div className="field-error" role="alert">{error}</div>}
          {import.meta.env.DEV && (
            <div className="field-warn">Đang chạy chế độ phát triển: nếu backend chưa cấu hình email, mã được in ra terminal của backend (cửa sổ chạy <span className="mono">npm run start:dev</span>).</div>
          )}
          <div className="field-group">
            <label className="field-label" htmlFor="ma">Mã xác nhận</label>
            <input className="field-input code-input" id="ma" name="ma" inputMode="numeric" autoComplete="one-time-code"
              maxLength={6} placeholder="000000" value={form.ma}
              onChange={(e) => setForm({ ...form, ma: e.target.value.replace(/\D/g, '') })} autoFocus />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="matKhauMoi">Mật khẩu mới</label>
            <input className="field-input" id="matKhauMoi" name="matKhauMoi" type="password" autoComplete="new-password"
              value={form.matKhauMoi} onChange={onChange} aria-describedby="pw-hint" />
            <span className="field-hint" id="pw-hint">{PASSWORD_HINT}</span>
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="nhapLai">Nhập lại mật khẩu mới</label>
            <input className="field-input" id="nhapLai" name="nhapLai" type="password" autoComplete="new-password"
              value={form.nhapLai} onChange={onChange} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
          </button>
          <div className="link-row">
            <button type="button" className="link-btn" onClick={onResend} disabled={saving || wait > 0}>
              {wait > 0 ? `Gửi lại mã sau ${wait} giây` : 'Gửi lại mã'}
            </button>
            <button type="button" className="link-btn" onClick={() => { setStep('email'); setError(''); setNotice('') }}>Đổi email</button>
          </div>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận 6 số để bạn đặt mật khẩu mới."
      footer={loginLink}
    >
      <form onSubmit={onSendCode} noValidate>
        {error && <div className="field-error" role="alert">{error}</div>}
        <div className="field-group">
          <label className="field-label" htmlFor="email">Email</label>
          <input className="field-input" id="email" name="email" type="email" autoComplete="username"
            value={form.email} onChange={onChange} autoFocus />
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
          {saving ? 'Đang gửi mã...' : 'Gửi mã xác nhận'}
        </button>
      </form>
    </AuthLayout>
  )
}
