import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createReport } from '../services/reportApi.js'
import { LOAI_LUA_DAO, TINH_THANH, KHU_VUC_NHOM, todayISO } from '../constants.js'

// Nhóm tỉnh, thành theo vùng (từ Bắc vào Nam) để dễ tìm; gõ chữ cái đầu trên ô chọn cũng nhảy tới tỉnh đó
const NHOM_TINH = KHU_VUC_NHOM.map((g, i) => ({
  label: g.label,
  items: TINH_THANH.filter((t) => t.lat < (i === 0 ? 99 : KHU_VUC_NHOM[i - 1].from) && t.lat >= g.from),
}))

const empty = {
  tieuDe: '', loai: 'gia_danh', doiTuong: '', soTienThietHai: '',
  ngayXayRa: '', moTa: '', nguoiBaoCao: '', tinhThanh: '',
}

export default function ReportForm() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ ...empty, doiTuong: (params.get('doiTuong') ?? '').slice(0, 255) }) // từ trang Tra cứu
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.tieuDe.trim() || !form.doiTuong.trim() || !form.ngayXayRa || !form.nguoiBaoCao.trim()) {
      setError('Vui lòng nhập đủ: tiêu đề, đối tượng lừa đảo, ngày xảy ra và người báo cáo.')
      return
    }
    if (form.tieuDe.trim().length < 5) {
      setError('Tiêu đề phải từ 5 ký tự.')
      return
    }
    if (form.ngayXayRa > todayISO()) {
      setError('Ngày xảy ra không được ở tương lai.')
      return
    }
    if (form.soTienThietHai !== '' && (!Number.isInteger(Number(form.soTienThietHai)) || Number(form.soTienThietHai) < 0)) {
      setError('Số tiền thiệt hại phải là số nguyên không âm.')
      return
    }
    setError('')
    setSaving(true)
    try {
      const { tinhThanh, ...rest } = form
      const created = await createReport(tinhThanh ? { ...rest, tinhThanh } : rest)
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
        {error && <div className="field-error" role="alert">{error}</div>}

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
            <input className="field-input" id="ngayXayRa" name="ngayXayRa" type="date" max={todayISO()} value={form.ngayXayRa} onChange={onChange} />
          </div>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="tinhThanh">Tỉnh, thành nơi xảy ra</label>
          <select className="field-select" id="tinhThanh" name="tinhThanh" value={form.tinhThanh} onChange={onChange}>
            <option value="">Chưa xác định</option>
            {NHOM_TINH.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.items.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </optgroup>
            ))}
          </select>
          <span className="field-hint">Dùng để thống kê, bản đồ điểm nóng và chia hồ sơ cho đơn vị phụ trách</span>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="doiTuong">Đối tượng lừa đảo</label>
          <input className="field-input" id="doiTuong" name="doiTuong" value={form.doiTuong} onChange={onChange} />
          <span className="field-hint">Số điện thoại, số tài khoản, link web, tên Facebook/Zalo...</span>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label className="field-label" htmlFor="soTienThietHai">Số tiền thiệt hại (đ)</label>
            <input className="field-input" id="soTienThietHai" name="soTienThietHai" type="number" min="0" step="1" value={form.soTienThietHai} onChange={onChange} />
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="nguoiBaoCao">Người báo cáo</label>
            <input className="field-input" id="nguoiBaoCao" name="nguoiBaoCao" value={form.nguoiBaoCao} onChange={onChange} />
            <span className="field-hint">Họ tên người dân đã trình báo (cán bộ nhập hộ)</span>
          </div>
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
