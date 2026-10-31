import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createReport } from '../services/reportApi.js'
import { LOAI_LUA_DAO, isStaff } from '../constants.js'
import { useAuth } from '../context/auth-context.js'

const empty = {
  tieuDe: '', loai: 'gia_danh', doiTuong: '', soTienThietHai: '',
  ngayXayRa: '', moTa: '', nguoiBaoCao: '',
}

export default function ReportForm() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const staff = isStaff(user) // cán bộ nhập hộ người dân thì phải ghi tên người báo cáo; người dân thì lấy theo tài khoản
  const [form, setForm] = useState({ ...empty, doiTuong: (params.get('doiTuong') ?? '').slice(0, 255) }) // từ trang Tra cứu
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.tieuDe.trim() || !form.doiTuong.trim() || !form.ngayXayRa || (staff && !form.nguoiBaoCao.trim())) {
      setError(staff ? 'Vui lòng nhập đủ: tiêu đề, đối tượng lừa đảo, ngày xảy ra và người báo cáo.' : 'Vui lòng nhập đủ: tiêu đề, đối tượng lừa đảo và ngày xảy ra.')
      return
    }
    setError('')
    setSaving(true)
    try {
      const { nguoiBaoCao, ...rest } = form
      const created = await createReport(staff ? form : rest)
      navigate(`/reports/${created.id}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Tạo báo cáo mới</h1>
          <p>Ghi nhận một trường hợp lừa đảo</p>
        </div>
      </div>

      <form className="card form-narrow" onSubmit={onSubmit}>
        {error && <div className="field-error">{error}</div>}

        <div className="field-group">
          <label className="field-label" htmlFor="tieuDe">Tiêu đề</label>
          <input className="field-input" id="tieuDe" name="tieuDe" value={form.tieuDe} onChange={onChange} />
        </div>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label" htmlFor="loai">Loại lừa đảo</label>
            <select className="field-select" id="loai" name="loai" value={form.loai} onChange={onChange}>
              {LOAI_LUA_DAO.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="ngayXayRa">Ngày xảy ra</label>
            <input className="field-input" id="ngayXayRa" name="ngayXayRa" type="date" value={form.ngayXayRa} onChange={onChange} />
          </div>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="doiTuong">Đối tượng lừa đảo</label>
          <input className="field-input" id="doiTuong" name="doiTuong" value={form.doiTuong} onChange={onChange} />
          <span className="field-hint">Số điện thoại, số tài khoản, link web, tên Facebook/Zalo...</span>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label" htmlFor="soTienThietHai">Số tiền thiệt hại (đ)</label>
            <input className="field-input" id="soTienThietHai" name="soTienThietHai" type="number" min="0" value={form.soTienThietHai} onChange={onChange} />
          </div>
          {staff && (
            <div className="field-group">
              <label className="field-label" htmlFor="nguoiBaoCao">Người báo cáo</label>
              <input className="field-input" id="nguoiBaoCao" name="nguoiBaoCao" value={form.nguoiBaoCao} onChange={onChange} />
            </div>
          )}
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="moTa">Mô tả chi tiết</label>
          <textarea className="field-textarea" id="moTa" name="moTa" rows="5" value={form.moTa} onChange={onChange} />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Gửi báo cáo'}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate('/reports')}>Hủy</button>
        </div>
      </form>
    </>
  )
}
