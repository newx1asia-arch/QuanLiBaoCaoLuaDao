import { useEffect, useRef, useState } from 'react'
import { getReports } from './services/reportApi.js'
import { QUEUE_REFRESH_MS } from './constants.js'

const MOI_DOT = 500 // khớp giới hạn pageSize của backend
const TOI_DA_DOT = 10 // chặn an toàn: tối đa 5000 hồ sơ mỗi trạng thái

// Tải HẾT hồ sơ của một trạng thái, từng đợt 500. Trước đây chỉ lấy đợt đầu nên khi có hơn 500 hồ sơ đang mở,
// hàng đợi khẩn cấp và năng lực đơn vị âm thầm thiếu các hồ sơ cũ hơn (cũ nhất lại là hồ sơ quá hạn SLA)
async function tatCaTheoTrangThai(status) {
  const items = []
  for (let page = 1; page <= TOI_DA_DOT; page += 1) {
    const res = await getReports({ status, page, pageSize: MOI_DOT, sort: 'id', dir: 'desc' })
    items.push(...res.items)
    if (items.length >= res.total || res.items.length === 0) break
  }
  return items
}

// Lấy toàn bộ hồ sơ đang mở (chờ xử lý + đang xác minh), tự tải lại định kỳ, tạm dừng khi tab bị ẩn.
// Hai khối "Hàng đợi khẩn cấp" và "Năng lực đơn vị" dùng chung một lần tải để không gọi API trùng.
export function useOpenReports() {
  const [items, setItems] = useState(null)
  const [offline, setOffline] = useState(false)
  const alive = useRef(true)

  const load = useRef(() =>
    Promise.all([tatCaTheoTrangThai('cho_xu_ly'), tatCaTheoTrangThai('dang_xac_minh')])
      .then(([a, b]) => { if (alive.current) { setItems([...a, ...b]); setOffline(false) } })
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
