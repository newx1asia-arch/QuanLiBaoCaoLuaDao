import { useEffect } from 'react'

// Thông báo nổi tự tắt sau 3,5 giây. role="status" để trình đọc màn hình đọc lên
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [toast, onClose])
  if (!toast) return null
  return <div className={`toast ${toast.error ? 'toast-error' : ''}`} role={toast.error ? 'alert' : 'status'}>{toast.text}</div>
}
