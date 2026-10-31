const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const TOKEN_KEY = 'auth_token'

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* trình duyệt chặn lưu trữ: bỏ qua */ }
}

// Hàm gọi API dùng chung. Tự gắn token; nếu server báo 401 (hết hạn / bị khóa) thì xóa token
// và phát sự kiện "auth:expired" để AuthProvider đưa người dùng về trang đăng nhập.
// Truyền { auth: false } cho các API công khai (đăng nhập, đăng ký).
export async function call(path, options = {}) {
  const { auth = true, ...init } = options
  const token = auth ? getToken() : null
  const res = await fetch(BASE + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
  })
  if (res.status === 401 && token) {
    setToken(null)
    window.dispatchEvent(new Event('auth:expired'))
  }
  if (res.status === 404) return null
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(Array.isArray(err.message) ? err.message.join(', ') : err.message || 'Lỗi máy chủ')
  }
  return res.json()
}
