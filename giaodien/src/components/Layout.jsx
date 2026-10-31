import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { IconGrid, IconList, IconLogout, IconPlus, IconSearch, IconUser, IconUsers } from './Icons.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import RoleBadge from './RoleBadge.jsx'
import { useAuth } from '../context/auth-context.js'
import { isStaff } from '../constants.js'

export default function Layout() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  // Đăng xuất chủ động thì về /login sạch, không ghi nhớ trang cũ để lần đăng nhập sau (có thể là tài khoản khác) không bị đưa về đó
  const onLogout = () => { logout(); navigate('/login', { replace: true }) }
  const staff = isStaff(user)
  const admin = user.vaiTro === 'admin'
  // "Danh sách" cũng sáng khi đang xem chi tiết một báo cáo (/reports/5)
  const listActive = pathname === '/reports' || /^\/reports\/\d+/.test(pathname)
  const listClass = () => (listActive ? 'active' : '')

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <div className="admin">
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand">
          <span className="logo-mark">!</span>
          <span>
            Báo Cáo Lừa Đảo
            <small>{staff ? 'Khu vực quản trị' : 'Cổng báo cáo'}</small>
          </span>
        </Link>

        <nav className="sidebar-nav" aria-label="Điều hướng chính">
          <div className="sidebar-label">{staff ? 'Quản lý' : 'Báo cáo'}</div>
          <NavLink to="/" end><IconGrid />Tổng quan</NavLink>
          <NavLink to="/reports" className={listClass}><IconList />{staff ? 'Danh sách báo cáo' : 'Báo cáo của tôi'}</NavLink>
          <NavLink to="/reports/new"><IconPlus />Tạo báo cáo mới</NavLink>
          <NavLink to="/lookup"><IconSearch />Tra cứu đối tượng</NavLink>
          {admin && (
            <>
              <div className="sidebar-label">Quản trị</div>
              <NavLink to="/users"><IconUsers />Người dùng</NavLink>
            </>
          )}
          <div className="sidebar-label">Tài khoản</div>
          <NavLink to="/profile"><IconUser />Hồ sơ của tôi</NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-name" title={user.email}>{user.hoTen}</div>
          <RoleBadge value={user.vaiTro} />
          <button type="button" className="sidebar-logout" onClick={onLogout}><IconLogout />Đăng xuất</button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <Link to="/" className="topbar-brand">
            <span className="logo-mark">!</span>
            <span>Báo Cáo Lừa Đảo</span>
          </Link>
          <span className="today">{today}</span>
          <div className="topbar-actions">
            <Link to="/profile" className="topbar-user" title={user.email}>{user.hoTen}</Link>
            <ThemeToggle />
            <button type="button" className="icon-btn" onClick={onLogout} aria-label="Đăng xuất" title="Đăng xuất"><IconLogout /></button>
            <Link to="/reports/new" className="btn btn-primary btn-sm topbar-new">+ Tạo báo cáo</Link>
          </div>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Điều hướng chính">
        <NavLink to="/" end><IconGrid /><span>Tổng quan</span></NavLink>
        <NavLink to="/reports" className={listClass}><IconList /><span>Báo cáo</span></NavLink>
        {/* Tối đa 5 mục: quản trị viên đổi "Tạo mới" lấy "Người dùng" (vẫn tạo được báo cáo từ trang Báo cáo) */}
        {!admin && <NavLink to="/reports/new"><IconPlus /><span>Tạo mới</span></NavLink>}
        <NavLink to="/lookup"><IconSearch /><span>Tra cứu</span></NavLink>
        {admin && <NavLink to="/users"><IconUsers /><span>Người dùng</span></NavLink>}
        <NavLink to="/profile"><IconUser /><span>Tài khoản</span></NavLink>
      </nav>
    </div>
  )
}
