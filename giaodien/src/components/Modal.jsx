import { useEffect, useRef } from 'react'

// Hộp thoại dùng thẻ <dialog> có sẵn của trình duyệt: tự khóa nền, đóng bằng phím Esc, hỗ trợ trình đọc màn hình
export default function Modal({ title, onClose, wide = false, children }) {
  const ref = useRef(null)

  // Không gọi d.close() khi gỡ: phần tử bị xóa khỏi trang là hộp thoại tự đóng, còn gọi close() sẽ phát sự kiện "close"
  // trễ và (khi React chạy StrictMode ở chế độ dev) làm hộp thoại vừa mở đã bị đóng
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      className={wide ? 'modal modal-wide' : 'modal'}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      <div className="modal-body">
        <div className="card-head">
          <h3 id="modal-title">{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
