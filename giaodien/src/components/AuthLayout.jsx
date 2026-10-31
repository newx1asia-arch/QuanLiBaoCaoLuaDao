import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'

// Khung chung cho trang đăng nhập / đăng ký (không có thanh điều hướng quản trị)
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-theme"><ThemeToggle /></div>
      <div className="auth-box">
        <Link to="/" className="auth-brand">
          <span className="logo-mark">!</span>
          <span>Báo Cáo Lừa Đảo</span>
        </Link>
        <div className="card">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
        <p className="auth-footer">{footer}</p>
      </div>
    </div>
  )
}
