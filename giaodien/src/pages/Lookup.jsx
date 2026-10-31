import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { lookupTarget } from '../services/reportApi.js'
import { MUC_DO_TRA_CUU, formatDate, formatMoney, loaiLabel } from '../constants.js'

// Kiểm tra nhanh một SĐT / số tài khoản / link đã bị báo cáo lừa đảo chưa, trước khi chuyển tiền
export default function Lookup() {
  const [q, setQ] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const latest = useRef(0) // chỉ nhận kết quả của lần tra cứu mới nhất

  const onSubmit = async (e) => {
    e.preventDefault()
    const text = q.trim()
    if (text.length < 3) {
      setError('Nhập ít nhất 3 ký tự để tra cứu.')
      return
    }
    const id = ++latest.current
    setError('')
    setLoading(true)
    try {
      const data = await lookupTarget(text)
      if (id === latest.current) setResult(data)
    } catch (err) {
      if (id === latest.current) { setResult(null); setError(err.message) }
    } finally {
      if (id === latest.current) setLoading(false)
    }
  }

  const level = result && MUC_DO_TRA_CUU[result.mucDo]

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Tra cứu đối tượng</h1>
          <p>Kiểm tra số điện thoại, số tài khoản hoặc đường link trước khi chuyển tiền</p>
        </div>
      </div>

      <form className="card form-narrow" onSubmit={onSubmit} noValidate>
        {error && <div className="field-error" role="alert">{error}</div>}
        <label className="field-label" htmlFor="q">SĐT, số tài khoản hoặc link</label>
        <div className="search-row">
          <input className="field-input" id="q" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Ví dụ: 0912 345 678" autoFocus />
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Đang tra...' : 'Tra cứu'}</button>
        </div>
        <span className="field-hint">Khoảng trắng, dấu chấm và dấu gạch ngang được bỏ qua khi so khớp.</span>
      </form>

      {result && (
        <div className="card form-narrow mt-1" aria-live="polite">
          <div className={level.cls}>
            <b>{level.title}</b>
            <div>{level.hint}</div>
          </div>

          {result.soBaoCao > 0 && (
            <>
              <div className="stat-grid lookup-stats">
                <div className="stat"><div className="stat-label">Số báo cáo</div><div className="stat-value">{result.soBaoCao}</div></div>
                <div className="stat ok"><div className="stat-label">Đã xác nhận</div><div className="stat-value">{result.daXacNhan}</div></div>
                <div className="stat danger"><div className="stat-label">Tổng thiệt hại</div><div className="stat-value money">{formatMoney(result.tongThietHai)}</div></div>
              </div>
              <h3>Hình thức lừa đảo được báo cáo</h3>
              <ul className="progress-list">
                {result.loai.map((l) => (
                  <li key={l.loai}>
                    <div className="progress-top"><span>{loaiLabel(l.loai).split(' (')[0]}</span><b>{l.soLan}</b></div>
                    <div className="progress-track"><i style={{ width: `${(l.soLan / result.soBaoCao) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
              <p className="muted">Báo cáo gần nhất xảy ra ngày {formatDate(result.baoCaoGanNhat)}.</p>
            </>
          )}

          <Link to={`/reports/new?doiTuong=${encodeURIComponent(result.q)}`} className="btn btn-secondary">
            Gửi báo cáo về đối tượng này
          </Link>
        </div>
      )}
    </>
  )
}
