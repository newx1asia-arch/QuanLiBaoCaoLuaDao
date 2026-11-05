import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  IconAlert, IconBell, IconChart, IconFile, IconGrid, IconHelp, IconLogout, IconMap, IconPhone, IconPlus,
  IconSearch, IconShield, IconTarget, IconUser, IconUsers,
} from './Icons.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { LotusGold, VietnamFlag } from './VietnamMotifs.jsx'
import { useAuth } from '../context/auth-context.js'
import { getStats } from '../services/reportApi.js'
import { APP_KICKER, APP_NAME, APP_VERSION, HOTLINE, SUPPORT_EMAIL, VAI_TRO, initials } from '../constants.js'

export default function Layout() {
  const { pathname, search } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [counts, setCounts] = useState({ cho: 0, gap: 0, nghiVan: 0 })

  const admin = user.vaiTro === 'admin'
  const params = new URLSearchParams(search)

  // Số trên huy hiệu menu (báo cáo chờ xử lý, cảnh báo khẩn, đối tượng nghi vấn); lấy lại mỗi khi đổi trang để số luôn mới
  useEffect(() => {
    let ignore = false
    getStats()
      .then((s) => { if (!ignore) setCounts({ cho: s.choXuLy, gap: s.canXuLyGap.length, nghiVan: s.soDoiTuongNghiVan ?? 0 }) })
      .catch(() => { /* không có số liệu thì chỉ ẩn huy hiệu */ })
    return () => { ignore = true }
  }, [pathname])

  // Đăng xuất chủ động thì về /login sạch, không ghi nhớ trang cũ để lần đăng nhập sau (có thể là tài khoản khác) không bị đưa về đó
  const onLogout = () => { logout(); navigate('/login', { replace: true }) }

  const onSearch = (e) => {
    e.preventDefault()
    const q = keyword.trim()
    navigate(q ? `/reports?q=${encodeURIComponent(q)}` : '/reports')
  }

  // Các mục cùng trỏ về /reports nên tự xác định mục nào đang sáng theo cả đường dẫn lẫn bộ lọc
  const onReports = pathname === '/reports' || /^\/reports\/\d+/.test(pathname)
  const urgentActive = pathname === '/reports' && params.get('priority') === 'cao'
  const pendingActive = pathname === '/reports' && params.get('status') === 'cho_xu_ly' && !urgentActive
  const allActive = onReports && !urgentActive && !pendingActive
  const cls = (on) => (on ? 'active' : '')
  const Count = ({ n, tone }) => (n > 0 ? <span className={`nav-count ${tone ?? ''}`}>{n}</span> : null)

  return (
    <div className="shell">
      <header className="gov-header">
        <Link to="/" className="gov-brand">
          <span className="gov-emblem"><IconShield width={26} height={26} /></span>
          <span className="gov-brand-text">
            <small>{APP_KICKER}</small>
            <strong>{APP_NAME}</strong>
          </span>
        </Link>

        <form className="gov-search" role="search" onSubmit={onSearch}>
          <IconSearch />
          <input type="search" value={keyword} onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm toàn hệ thống..." aria-label="Tìm kiếm báo cáo" />
        </form>

        <div className="gov-actions">
          <span className="gov-flag" title="Cộng hòa xã hội chủ nghĩa Việt Nam"><VietnamFlag /></span>
          <Link to="/reports?status=cho_xu_ly" className="gov-icon" aria-label="Báo cáo chờ xử lý" title="Báo cáo chờ xử lý">
            <IconBell />
            {counts.cho > 0 && <i className="gov-dot" />}
          </Link>
          <ThemeToggle />
          <span className="gov-sep" />
          <Link to="/profile" className="gov-user" title={user.email}>
            <span className="avatar">{initials(user.hoTen)}</span>
            <span className="gov-user-text">
              <strong>{user.hoTen}</strong>
              <small>{VAI_TRO[user.vaiTro]?.label ?? user.vaiTro}</small>
            </span>
          </Link>
          <button type="button" className="gov-icon" onClick={onLogout} aria-label="Đăng xuất" title="Đăng xuất"><IconLogout /></button>
        </div>
      </header>

      <div className="admin">
        <aside className="sidebar">
          <div className="hotline-card">
            <span className="hotline-icon"><IconPhone /></span>
            <span>
              <small>{HOTLINE.label}</small>
              <strong>{HOTLINE.value}</strong>
            </span>
          </div>

          <nav className="sidebar-nav" aria-label="Điều hướng chính">
            <div className="sidebar-label">Tổng quan</div>
            <NavLink to="/" end><IconGrid />Bảng điều hành</NavLink>
            <NavLink to="/hotspots"><IconMap />Bản đồ điểm nóng</NavLink>
            <Link to="/reports?status=cho_xu_ly" className={cls(pendingActive)}>
              <IconFile />Báo cáo tiếp nhận<Count n={counts.cho} />
            </Link>
            <Link to="/reports?priority=cao" className={cls(urgentActive)}>
              <IconAlert />Cảnh báo khẩn<Count n={counts.gap} tone="warn" />
            </Link>
            <Link to="/reports" className={cls(allActive)}><IconFile />Tất cả báo cáo</Link>

            <div className="sidebar-label">Nghiệp vụ</div>
            <NavLink to="/reports/new"><IconPlus />Tạo báo cáo mới</NavLink>
            <NavLink to="/suspects"><IconTarget />Đối tượng nghi vấn<Count n={counts.nghiVan} /></NavLink>
            <NavLink to="/alerts"><IconBell />Cảnh báo phát hành</NavLink>
            <NavLink to="/lookup"><IconSearch />Tra cứu đối tượng</NavLink>
            <NavLink to="/statistics"><IconChart />Báo cáo thống kê</NavLink>
            {admin && <NavLink to="/users"><IconUsers />Quản lý người dùng</NavLink>}

            <div className="sidebar-label">Tài khoản</div>
            <NavLink to="/profile"><IconUser />Hồ sơ của tôi</NavLink>
          </nav>

          <div className="sidebar-lotus"><LotusGold /></div>

          <div className="support-card">
            <h4><IconHelp />Trung tâm hỗ trợ</h4>
            <p>Hỗ trợ nghiệp vụ và xử lý sự cố hệ thống 24/7.</p>
            <a href={`mailto:${SUPPORT_EMAIL}`}>Liên hệ kỹ thuật</a>
          </div>
        </aside>

        <div className="app-main">
          <main className="app-content">
            <Outlet />
          </main>
          <footer className="app-footer">
            <span className="footer-brand"><VietnamFlag className="flag-sm" />© {new Date().getFullYear()} {APP_NAME}<LotusGold className="lotus-sm" /></span>
            <span>Phiên bản {APP_VERSION} · Dữ liệu được bảo mật theo quy định</span>
          </footer>
        </div>
      </div>

      <nav className="bottom-nav" aria-label="Điều hướng chính">
        <NavLink to="/" end><IconGrid /><span>Tổng quan</span></NavLink>
        <Link to="/reports" className={cls(onReports)}><IconFile /><span>Báo cáo</span></Link>
        {/* Tối đa 5 mục: quản trị viên đổi "Tạo mới" lấy "Người dùng" (vẫn tạo được báo cáo từ trang Báo cáo) */}
        {!admin && <NavLink to="/reports/new"><IconPlus /><span>Tạo mới</span></NavLink>}
        <NavLink to="/suspects"><IconTarget /><span>Nghi vấn</span></NavLink>
        {admin && <NavLink to="/users"><IconUsers /><span>Người dùng</span></NavLink>}
        <NavLink to="/profile"><IconUser /><span>Tài khoản</span></NavLink>
      </nav>
    </div>
  )
}
