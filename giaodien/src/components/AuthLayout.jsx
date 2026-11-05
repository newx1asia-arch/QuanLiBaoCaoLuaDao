import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'
import { CornerFrame, LotusGold, VietnamFlag } from './VietnamMotifs.jsx'
import { IconShield } from './Icons.jsx'
import { APP_KICKER, APP_NAME } from '../constants.js'

// Khung chung cho trang đăng nhập / quên mật khẩu (không có thanh điều hướng quản trị)
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <header className="gov-header auth-header">
        <Link to="/" className="gov-brand">
          <span className="gov-emblem"><IconShield width={26} height={26} /></span>
          <span className="gov-brand-text">
            <small>{APP_KICKER}</small>
            <strong>{APP_NAME}</strong>
          </span>
        </Link>
        <div className="gov-actions"><span className="gov-flag"><VietnamFlag /></span><ThemeToggle /></div>
      </header>
      <div className="auth-body">
        <div className="auth-box">
          <div className="card auth-card">
            <CornerFrame />
            <h1>{title}</h1>
            <p className="muted">{subtitle}</p>
            {children}
          </div>
          <div className="auth-lotus"><LotusGold /></div>
          <p className="auth-footer">{footer}</p>
        </div>
      </div>
    </div>
  )
}
