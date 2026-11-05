import { useEffect, useRef, useState } from 'react'
import { getReports } from './services/reportApi.js'
import { QUEUE_REFRESH_MS } from './constants.js'

// Lấy toàn bộ hồ sơ đang mở (chờ xử lý + đang xác minh), tự tải lại định kỳ, tạm dừng khi tab bị ẩn.
// Hai khối "Hàng đợi khẩn cấp" và "Năng lực đơn vị" dùng chung một lần tải để không gọi API trùng.
export function useOpenReports() {
  const [items, setItems] = useState(null)
  const [offline, setOffline] = useState(false)
  const alive = useRef(true)

  const load = useRef(() =>
    Promise.all([
      getReports({ status: 'cho_xu_ly', pageSize: 500, sort: 'id', dir: 'desc' }),
      getReports({ status: 'dang_xac_minh', pageSize: 500, sort: 'id', dir: 'desc' }),
    ])
      .then(([a, b]) => { if (alive.current) { setItems([...a.items, ...b.items]); setOffline(false) } })
      .catch(() => { if (alive.current) setOffline(true) }))

  useEffect(() => {
    alive.current = true
    const run = load.current
    run()
    const poll = setInterval(() => { if (!document.hidden) run() }, QUEUE_REFRESH_MS)
    const onVisible = () => { if (!document.hidden) run() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { alive.current = false; clearInterval(poll); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  return { items, offline, reload: load.current, patch: (id, fn) => setItems((l) => l && l.map((r) => (r.id === id ? fn(r) : r))) }
}

// Đồng hồ 1 giây/lần để đếm ngược SLA
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}
