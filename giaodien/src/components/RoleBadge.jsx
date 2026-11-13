import { VAI_TRO } from '../constants.js'

export default function RoleBadge({ value }) {
  const r = VAI_TRO[value]
  return <span className={`badge ${r?.cls ?? ''}`}>{r?.label ?? value}</span>
}
