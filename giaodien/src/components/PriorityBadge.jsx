import { MUC_UU_TIEN } from '../constants.js'

export default function PriorityBadge({ value }) {
  const p = MUC_UU_TIEN[value]
  return <span className={`badge ${p?.cls ?? ''}`}>{p?.label ?? value}</span>
}
