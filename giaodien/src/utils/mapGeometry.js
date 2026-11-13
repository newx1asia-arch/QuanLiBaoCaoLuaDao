// Hình học nhỏ cho bản đồ: kéo điểm nằm ngoài (hoặc sát mép) đường viền vào bên trong lãnh thổ.
// Tất cả tính trên toạ độ đã chiếu (đơn vị = px của SVG).

export function pointInPolygon([x, y], poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// Điểm gần nhất trên đường viền tới p
function nearestOnEdge([px, py], poly) {
  let best = null
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j], [bx, by] = poly[i]
    const dx = bx - ax, dy = by - ay
    const len2 = dx * dx + dy * dy || 1
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2))
    const qx = ax + t * dx, qy = ay + t * dy
    const d = Math.hypot(px - qx, py - qy)
    if (!best || d < best.d) best = { d, q: [qx, qy] }
  }
  return best
}

// Trả về điểm nằm trong poly và cách mép ít nhất `margin` px (nếu hình đủ rộng).
// Điểm đã nằm sâu bên trong thì giữ nguyên.
export function snapInside(p, poly, margin = 7) {
  let cur = p
  for (let k = 0; k < 6; k++) {
    const inside = pointInPolygon(cur, poly)
    const { d, q } = nearestOnEdge(cur, poly)
    if (inside && d >= margin) return cur
    // hướng vào trong = từ mép tới điểm (nếu đang ở trong) hoặc từ điểm tới mép (nếu đang ở ngoài)
    const ux = inside ? cur[0] - q[0] : q[0] - cur[0]
    const uy = inside ? cur[1] - q[1] : q[1] - cur[1]
    const n = Math.hypot(ux, uy) || 1
    cur = [q[0] + (ux / n) * margin, q[1] + (uy / n) * margin]
  }
  return pointInPolygon(cur, poly) ? cur : p
}

// Đẩy các điểm đang chồng lên nhau ra xa nhau tối thiểu `minDist` px, rồi kéo lại vào trong đất liền.
// pts: { key: [x, y] }. Trả về { key: [x, y] } mới (không sửa đối tượng đầu vào).
export function spreadPoints(pts, poly, minDist = 12, margin = 7, rounds = 60) {
  const keys = Object.keys(pts)
  const cur = Object.fromEntries(keys.map((k) => [k, [...pts[k]]]))
  for (let it = 0; it < rounds; it++) {
    let moved = false
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const a = cur[keys[i]], b = cur[keys[j]]
        let dx = b[0] - a[0], dy = b[1] - a[1]
        let d = Math.hypot(dx, dy)
        if (d >= minDist) continue
        if (d < 1e-6) { dx = 1; dy = 0; d = 1 } // trùng hẳn: đẩy theo trục ngang
        const push = (minDist - d) / 2
        a[0] -= (dx / d) * push; a[1] -= (dy / d) * push
        b[0] += (dx / d) * push; b[1] += (dy / d) * push
        moved = true
      }
    }
    for (const k of keys) cur[k] = snapInside(cur[k], poly, margin)
    if (!moved) break
  }
  return cur
}
