// Họa tiết mang bản sắc Việt Nam, vẽ bằng SVG. Tất cả chỉ để trang trí: ẩn với trình đọc màn hình,
// không bắt chuột, và nằm ở vùng trống (nền, góc khung, chân trang), không phủ lên chữ hay nút bấm.

// Ngôi sao năm cánh: R là bán kính ngoài, r là bán kính trong (tỉ lệ vàng của sao đều)
const starPoints = (cx, cy, R, r = R * 0.382) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rad = i % 2 ? r : R
    return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`
  }).join(' ')

// Cờ đỏ sao vàng, có hiệu ứng bay nhẹ (kích thước đặt bằng biến CSS --w)
export function VietnamFlag({ className = '' }) {
  return (
    <span className={`flag ${className}`} aria-hidden="true">
      <svg viewBox="0 0 30 20" focusable="false">
        <rect width="30" height="20" fill="#da251d" />
        <polygon points={starPoints(15, 10.6, 6.2)} fill="#ffcd00" />
      </svg>
    </span>
  )
}

// Hoa sen vàng nét mảnh
export function LotusGold({ className = '' }) {
  const petal = 'M60 72C47 55 47 32 60 12C73 32 73 55 60 72Z'
  return (
    <svg className={`lotus ${className}`} viewBox="0 0 120 90" aria-hidden="true" focusable="false">
      <g className="lotus-petals">
        <path d={petal} transform="rotate(-62 60 72)" />
        <path d={petal} transform="rotate(62 60 72)" />
        <path d={petal} transform="rotate(-32 60 72)" />
        <path d={petal} transform="rotate(32 60 72)" />
        <path d={petal} />
      </g>
      <path className="lotus-water" d="M14 80Q37 87 60 80T106 80M30 86Q60 92 90 86" />
    </svg>
  )
}

// Mặt trống đồng: sao ở giữa, các tia, vòng chấm và vòng răng cưa
export function BronzeDrum({ className = '' }) {
  const rays = Array.from({ length: 14 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 14 - Math.PI / 2
    const w = 0.13
    const p = (rad, da) => `${(100 + rad * Math.cos(a + da)).toFixed(2)},${(100 + rad * Math.sin(a + da)).toFixed(2)}`
    return `${p(24, -w)} ${p(62, 0)} ${p(24, w)}`
  })
  const teeth = Array.from({ length: 56 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 56
    const b = a + Math.PI / 56
    const c = a + (2 * Math.PI) / 56
    const p = (rad, ang) => `${(100 + rad * Math.cos(ang)).toFixed(2)},${(100 + rad * Math.sin(ang)).toFixed(2)}`
    return `${p(82, a)} ${p(90, b)} ${p(82, c)}`
  })
  const dots = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 36
    return [100 + 72 * Math.cos(a), 100 + 72 * Math.sin(a)]
  })
  return (
    <svg className={`drum ${className}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <g className="drum-line">
        <circle cx="100" cy="100" r="97" />
        <circle cx="100" cy="100" r="93" />
        {teeth.map((t, i) => <polyline key={i} points={t} />)}
        <circle cx="100" cy="100" r="78" />
        <circle cx="100" cy="100" r="66" />
        <circle cx="100" cy="100" r="22" />
        {rays.map((t, i) => <polygon key={i} points={t} />)}
      </g>
      <g className="drum-fill">
        {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" />)}
        <polygon points={starPoints(100, 100, 17)} />
      </g>
    </svg>
  )
}

// Bốn góc khung: nét vàng và một ngôi sao đỏ nhỏ ở mỗi góc. Đặt trong khối có position: relative;
// nằm sát mép khối nên không đè lên nội dung bên trong.
export function CornerFrame() {
  return (
    <span className="cframe" aria-hidden="true">
      {['tl', 'tr', 'bl', 'br'].map((pos) => (
        <svg key={pos} className={`cframe-c cframe-${pos}`} viewBox="0 0 34 34" focusable="false">
          <path className="cframe-line" d="M1 33V1h32" />
          <path className="cframe-line thin" d="M6 33V6h27" />
          <polygon className="cframe-star" points={starPoints(1, 1, 7)} />
        </svg>
      ))}
    </span>
  )
}
