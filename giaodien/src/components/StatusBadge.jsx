import { TRANG_THAI } from '../constants.js'

export default function StatusBadge({ value }) {
  const t = TRANG_THAI[value]
  return <span className={`badge ${t?.cls ?? ''}`}>{t?.label ?? value}</span>
}
