// Địa chỉ API: lấy từ VITE_API_URL (đặt trên Vercel hoặc trong giaodien/.env*), bỏ dấu "/" thừa ở cuối.
// Dùng || để biến đặt rỗng cũng rơi về mặc định cục bộ; bản production luôn có giá trị từ giaodien/.env.production.
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '')
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

// Lỗi từ API: giữ lại mã trạng thái HTTP để trang có thể xử lý riêng (404 không tìm thấy, 409 bị người khác sửa trước...)
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Hàm gọi API dùng chung. Tự gắn token; nếu server báo 401 (hết hạn / bị khóa) thì xóa token
// và phát sự kiện "auth:expired" để AuthProvider đưa người dùng về trang đăng nhập.
// Truyền { auth: false } cho các API công khai (đăng nhập, quên mật khẩu).
// Mọi phản hồi lỗi (kể cả 404) đều ném ApiError, nơi gọi tự quyết định xử lý thế nào.
export async function call(path, options = {}) {
  const { auth = true, ...init } = options
  const token = auth ? getToken() : null
  let res
  try {
    res = await fetch(BASE + path, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    })
  } catch (e) {
    // Ghi địa chỉ đang gọi ra Console để dễ biết gọi nhầm chỗ (vd localhost khi quên đặt VITE_API_URL)
    console.error('Không gọi được API:', BASE + path, e)
    throw new ApiError('Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa.', 0)
  }
  if (res.status === 401 && token) {
    setToken(null)
    window.dispatchEvent(new Event('auth:expired'))
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new ApiError(Array.isArray(err.message) ? err.message.join(', ') : err.message || 'Lỗi máy chủ', res.status)
  }
  return res.json()
}
