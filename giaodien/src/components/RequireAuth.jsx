import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth-context.js'
import { LoadingBlock } from './PageState.jsx'

// Bọc các route cần đăng nhập. Truyền roles={['admin']} để giới hạn theo vai trò.
export default function RequireAuth({ roles }) {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) return <div className="auth-wait"><LoadingBlock rows={3} /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (roles && !roles.includes(user.vaiTro)) {
    return (
      <div className="card empty-state" role="alert">
        Bạn không có quyền truy cập trang này
        <small><Link to="/">Về trang tổng quan</Link></small>
      </div>
    )
  }
  return <Outlet />
}

// Trang đăng nhập/đăng ký: nếu đã đăng nhập thì quay lại trang trước đó (hoặc trang chủ)
export function GuestOnly() {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <div className="auth-wait"><LoadingBlock rows={3} /></div>
  if (user) return <Navigate to={location.state?.from || '/'} replace />
  return <Outlet />
}
