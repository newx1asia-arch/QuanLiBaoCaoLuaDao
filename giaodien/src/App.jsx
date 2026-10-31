import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RequireAuth, { GuestOnly } from './components/RequireAuth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ReportList from './pages/ReportList.jsx'
import ReportForm from './pages/ReportForm.jsx'
import ReportDetail from './pages/ReportDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Lookup from './pages/Lookup.jsx'
import Profile from './pages/Profile.jsx'
import Users from './pages/Users.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<ReportList />} />
          <Route path="/reports/new" element={<ReportForm />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/lookup" element={<Lookup />} />
          <Route path="/profile" element={<Profile />} />
          <Route element={<RequireAuth roles={['admin']} />}>
            <Route path="/users" element={<Users />} />
          </Route>
          <Route path="*" element={<div className="card empty-state">Không tìm thấy trang</div>} />
        </Route>
      </Route>
    </Routes>
  )
}
