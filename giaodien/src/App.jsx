import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LoadingBlock } from './components/PageState.jsx'
import Layout from './components/Layout.jsx'
import RequireAuth, { GuestOnly } from './components/RequireAuth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'

const ReportList = lazy(() => import('./pages/ReportList.jsx'))
const ReportForm = lazy(() => import('./pages/ReportForm.jsx'))
const ReportDetail = lazy(() => import('./pages/ReportDetail.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const Lookup = lazy(() => import('./pages/Lookup.jsx'))
const Suspects = lazy(() => import('./pages/Suspects.jsx'))
const Alerts = lazy(() => import('./pages/Alerts.jsx'))
const Hotspots = lazy(() => import('./pages/Hotspots.jsx'))
const Statistics = lazy(() => import('./pages/Statistics.jsx'))
const PublicAlerts = lazy(() => import('./pages/PublicAlerts.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Users = lazy(() => import('./pages/Users.jsx'))

export default function App() {
  return (
    <Suspense fallback={<div className="app-content"><LoadingBlock rows={4} /></div>}>
    <Routes>
      {/* Trang công khai: không cần đăng nhập */}
      <Route path="/canh-bao" element={<PublicAlerts />} />

      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reports" element={<ReportList />} />
          <Route path="/reports/new" element={<ReportForm />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/hotspots" element={<Hotspots />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/suspects" element={<Suspects />} />
          <Route path="/lookup" element={<Lookup />} />
          <Route path="/profile" element={<Profile />} />
          <Route element={<RequireAuth roles={['admin']} />}>
            <Route path="/users" element={<Users />} />
          </Route>
          <Route path="*" element={<div className="card empty-state">Không tìm thấy trang</div>} />
        </Route>
      </Route>
    </Routes>
    </Suspense>
  )
}
