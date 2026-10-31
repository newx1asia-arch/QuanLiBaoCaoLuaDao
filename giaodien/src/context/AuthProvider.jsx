import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context.js'
import { getToken, setToken } from '../services/http.js'
import * as authApi from '../services/authApi.js'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Có token trong máy thì phải hỏi server xem còn hợp lệ không rồi mới biết đã đăng nhập hay chưa
  const [ready, setReady] = useState(() => !getToken())

  useEffect(() => {
    if (!getToken()) return
    let ignore = false
    authApi.getMe()
      .then((u) => { if (!ignore) setUser(u) })
      .catch(() => { /* lỗi mạng: giữ token, người dùng sẽ thấy trang đăng nhập; 401 đã được http.js xóa token */ })
      .finally(() => { if (!ignore) setReady(true) })
    return () => { ignore = true }
  }, [])

  // http.js phát sự kiện này khi server trả 401 (token hết hạn, tài khoản bị khóa, đổi mật khẩu ở nơi khác)
  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const start = useCallback((session) => {
    setToken(session.token)
    setUser(session.user)
    return session.user
  }, [])

  const login = useCallback(async (data) => start(await authApi.login(data)), [start])
  const register = useCallback(async (data) => start(await authApi.register(data)), [start])
  const logout = useCallback(() => { setToken(null); setUser(null) }, [])

  const updateProfile = useCallback(async (data) => {
    const u = await authApi.updateMe(data)
    setUser(u)
    return u
  }, [])

  // Đổi mật khẩu xong server cấp token mới (token cũ ở mọi thiết bị đều bị vô hiệu)
  const changePassword = useCallback(async (data) => { start(await authApi.changePassword(data)) }, [start])

  const value = useMemo(
    () => ({ user, ready, login, register, logout, updateProfile, changePassword }),
    [user, ready, login, register, logout, updateProfile, changePassword],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
