// Trạng thái chờ và lỗi dùng chung cho các trang
export function LoadingBlock({ rows = 4 }) {
  return (
    <div className="card" role="status" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton" style={{ width: `${92 - i * 14}%` }} />
      ))}
    </div>
  )
}

export function ErrorBlock({ onRetry }) {
  return (
    <div className="card empty-state" role="alert">
      Không tải được dữ liệu
      <small>Kiểm tra backend NestJS đã chạy ở cổng 3000 chưa, rồi thử lại.</small>
      <button type="button" className="btn btn-secondary btn-sm mt-1" onClick={onRetry}>Thử lại</button>
    </div>
  )
}
