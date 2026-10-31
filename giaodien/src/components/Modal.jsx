import { useEffect, useRef } from 'react'

// Hộp thoại dùng thẻ <dialog> có sẵn của trình duyệt: tự khóa nền, đóng bằng phím Esc, hỗ trợ trình đọc màn hình
export default function Modal({ title, onClose, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
    return () => { if (d?.open) d.close() }
  }, [])

  return (
    <dialog
      ref={ref}
      className="modal"
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
