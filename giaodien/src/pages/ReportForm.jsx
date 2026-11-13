import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { createReport, lookupTarget } from '../services/reportApi.js'
import {
  DON_VI, HOTLINE, KHU_VUC_NHOM, LOAI_LUA_DAO, MUC_UU_TIEN, SLA_GIO, TINH_THANH, VI_DO_BAC,
  formatMoneyShort, formatNumber, formatThousands, caretAfterDigits, todayISO, tinhUuTien,
} from '../constants.js'
import { BronzeDrum, CornerFrame, LotusGold, VietnamFlag } from '../components/VietnamMotifs.jsx'
import { IconAlert, IconBell, IconClock, IconFile, IconPhone, IconShield, IconTarget, IconUserCheck } from '../components/Icons.jsx'
import '../report-form.css'

// Nhóm tỉnh, thành theo vùng (từ Bắc vào Nam) để dễ tìm; gõ chữ cái đầu trên ô chọn cũng nhảy tới tỉnh đó
const NHOM_TINH = KHU_VUC_NHOM.map((g, i) => ({
  label: g.label,
  items: TINH_THANH.filter((t) => t.lat < (i === 0 ? 99 : KHU_VUC_NHOM[i - 1].from) && t.lat >= g.from),
}))

const empty = {
  tieuDe: '', loai: 'gia_danh', doiTuong: '', soTienThietHai: '',
  ngayXayRa: '', moTa: '', nguoiBaoCao: '', tinhThanh: '',
}

// Khớp giới hạn ở backend (create-report.dto.ts)
const MAX_TIEN = 1_000_000_000_000
const MAX_MO_TA = 5000

// Các trường bắt buộc, theo thứ tự hiện trên form (dùng cho kiểm tra, danh sách tiến độ và nhảy tới ô lỗi đầu tiên)
const BAT_BUOC = [
  { key: 'tieuDe', label: 'Tiêu đề vụ việc' },
  { key: 'ngayXayRa', label: 'Ngày xảy ra' },
  { key: 'doiTuong', label: 'Đối tượng lừa đảo' },
  { key: 'nguoiBaoCao', label: 'Người báo cáo' },
]

// Trả về { tên trường: thông báo lỗi }. Rỗng nghĩa là hợp lệ
function validate(f) {
  const e = {}
  const tieuDe = f.tieuDe.trim()
  const doiTuong = f.doiTuong.trim()
  const ten = f.nguoiBaoCao.trim()
  if (!tieuDe) e.tieuDe = 'Vui lòng nhập tiêu đề.'
  else if (tieuDe.length < 5) e.tieuDe = 'Tiêu đề phải từ 5 ký tự.'
  if (!f.ngayXayRa) e.ngayXayRa = 'Vui lòng chọn ngày xảy ra.'
  else if (f.ngayXayRa > todayISO()) e.ngayXayRa = 'Ngày xảy ra không được ở tương lai.'
  else if (f.ngayXayRa < '2000-01-01') e.ngayXayRa = 'Ngày xảy ra quá xa, vui lòng kiểm tra lại.'
  if (!doiTuong) e.doiTuong = 'Vui lòng nhập thông tin đối tượng lừa đảo.'
  else if (doiTuong.length < 3) e.doiTuong = 'Thông tin đối tượng phải từ 3 ký tự.'
  if (!ten) e.nguoiBaoCao = 'Vui lòng nhập tên người báo cáo.'
  else if (ten.length < 2) e.nguoiBaoCao = 'Tên người báo cáo phải từ 2 ký tự.'
  if (f.soTienThietHai !== '' && Number(f.soTienThietHai) > MAX_TIEN) e.soTienThietHai = 'Số tiền quá lớn, vui lòng kiểm tra lại.'
  return e
}

// Đơn vị tiếp nhận dự kiến: cùng cách chia với trang Năng lực xử lý (utils/capacity.js).
// Chưa chọn tỉnh thì tính cho PA05 Hà Nội (đơn vị tiếp nhận mặc định)
const donViTiepNhan = (tinh) => {
  const t = TINH_THANH.find((x) => x.value === tinh)
  return !t || t.lat >= VI_DO_BAC ? DON_VI[0] : DON_VI[1]
}

// 24 -> "24 giờ", 72 -> "3 ngày"
const slaText = (gio) => (gio > 24 ? `${gio / 24} ngày` : `${gio} giờ`)

const TIPS = [
  'Ghi đúng số điện thoại / số tài khoản như người dân cung cấp, không thêm chữ. Hệ thống tự gộp các cách viết khác nhau của cùng một số.',
  'Một người báo cáo cùng một đối tượng trong cùng một ngày chỉ được ghi một lần.',
  'Chưa rõ số tiền thì để trống. Mức ưu tiên và thời hạn xử lý tính tự động theo thiệt hại.',
  'Báo cáo mới vào hàng đợi "Chờ xử lý"; cán bộ nhận việc rồi mới xác minh.',
]

export default function ReportForm() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState(() => ({ ...empty, doiTuong: (params.get('doiTuong') ?? '').slice(0, 255) })) // từ trang Tra cứu
  const initial = useRef(form) // để biết người dùng đã nhập gì chưa (hỏi lại khi bấm Hủy)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('') // lỗi từ máy chủ
  const [saving, setSaving] = useState(false)
  const [dup, setDup] = useState(null) // kết quả tra cứu nhanh đối tượng
  const dupSeq = useRef(0)
  const dupLast = useRef('')

  const dirty = JSON.stringify(form) !== JSON.stringify(initial.current)

  // Đóng tab / tải lại khi đang nhập dở thì trình duyệt hỏi lại
  useEffect(() => {
    if (!dirty || saving) return undefined
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, saving])

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((er) => (er[name] ? { ...er, [name]: undefined } : er))
    if (error) setError('')
  }

  const onChange = (e) => {
    const { name } = e.target
    let { value } = e.target
    if (name === 'soTienThietHai') {
      const el = e.target
      const truoc = el.value.slice(0, el.selectionStart ?? el.value.length).replace(/\D/g, '').length // số chữ số đứng trước con trỏ
      value = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 13) // chỉ nhận chữ số: không còn lọt "1e3" hay số thập phân
      const hienThi = formatThousands(value)
      requestAnimationFrame(() => { const pos = caretAfterDigits(hienThi, Math.min(truoc, value.length)); el.setSelectionRange(pos, pos) })
    }
    if (name === 'doiTuong') {
      setDup(null)
      dupLast.current = ''
    }
    setField(name, value)
  }

  // Rời ô nhập: báo lỗi ngay nếu ô đã có nội dung nhưng sai (ô còn trống thì chờ lúc bấm Gửi)
  const onBlur = (e) => {
    const { name } = e.target
    if (form[name] !== '' && validate(form)[name]) setErrors((er) => ({ ...er, [name]: validate(form)[name] }))
  }

  // Rời ô "Đối tượng": tra nhanh đã có báo cáo về đối tượng này chưa (không chặn việc gửi, chỉ để cán bộ biết)
  const checkDup = async () => {
    const q = form.doiTuong.trim()
    if (q.length < 3 || q === dupLast.current) return
    dupLast.current = q
    const seq = ++dupSeq.current
    try {
      const r = await lookupTarget(q)
      if (seq === dupSeq.current) setDup(r)
    } catch { /* tra cứu lỗi hoặc quá nhanh: bỏ qua, việc gửi báo cáo không phụ thuộc */ }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    const errs = validate(form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      setError('')
      const first = [...BAT_BUOC.map((b) => b.key), 'soTienThietHai'].find((k) => errs[k])
      document.getElementById(first)?.focus()
      return
    }
    setErrors({})
    setError('')
    setSaving(true)
    try {
      const { tinhThanh, ...rest } = form
      const created = await createReport({
        ...rest,
        tieuDe: rest.tieuDe.trim(), doiTuong: rest.doiTuong.trim(), nguoiBaoCao: rest.nguoiBaoCao.trim(), moTa: rest.moTa.trim(),
        ...(tinhThanh && { tinhThanh }),
      })
      initial.current = form // đã lưu: không hỏi lại khi rời trang
      navigate(`/reports/${created.id}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const onCancel = () => {
    if (dirty && !window.confirm('Bạn đã nhập thông tin nhưng chưa gửi. Rời khỏi trang và bỏ các thông tin này?')) return
    navigate('/reports')
  }

  // ----- Thông tin hiển thị ở cột bên phải (tính trực tiếp từ những gì đang nhập) -----
  const errsNow = validate(form)
  const xong = BAT_BUOC.filter((b) => !errsNow[b.key]).length
  const phanTram = Math.round((xong / BAT_BUOC.length) * 100)
  const tien = Number(form.soTienThietHai) || 0
  const uuTien = tinhUuTien(tien)
  const donVi = donViTiepNhan(form.tinhThanh)
  const boSung = [form.tinhThanh, form.soTienThietHai, form.moTa.trim()].filter(Boolean).length

  const fieldCls = (name) => `field-input${errors[name] ? ' invalid' : ''}`
  const errMsg = (name) => errors[name] && <span className="field-msg" id={`${name}-err`} role="alert">{errors[name]}</span>
  const aria = (name) => ({ 'aria-invalid': errors[name] ? true : undefined, 'aria-describedby': errors[name] ? `${name}-err` : undefined })

  return (
    <>
      <section className="hero rf-hero" aria-labelledby="rf-title">
        <span className="hero-drum" aria-hidden="true"><BronzeDrum /></span>
        <CornerFrame />
        <span className="hero-flag"><VietnamFlag /></span>
        <div className="hero-body">
          <span className="hero-eyebrow"><IconFile width={14} height={14} />Nghiệp vụ tiếp nhận</span>
          <h1 id="rf-title" className="display">Tạo báo cáo mới</h1>
          <p>Ghi nhận một trường hợp lừa đảo do người dân trình báo. Báo cáo sau khi gửi sẽ vào hàng đợi &quot;Chờ xử lý&quot; để cán bộ nhận việc và xác minh.</p>
          <ul className="hero-badges">
            <li><IconUserCheck width={16} height={16} />Cán bộ nhập hộ người dân</li>
            <li><IconClock width={16} height={16} />Tự tính thời hạn xử lý</li>
            <li><IconShield width={16} height={16} />Lưu lịch sử mọi thao tác</li>
          </ul>
        </div>
      </section>

      <div className="rf-layout">
        <form className="card rf-form" onSubmit={onSubmit} noValidate>
          {error && <div className="field-error" role="alert">{error}</div>}

          <div className="rf-section">
            <span className="rf-step" aria-hidden="true">1</span>
            <div><h3>Thông tin vụ việc</h3><p>Chuyện gì đã xảy ra, vào lúc nào, ở đâu</p></div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="tieuDe">Tiêu đề <span className="req">*</span></label>
            <input className={fieldCls('tieuDe')} id="tieuDe" name="tieuDe" value={form.tieuDe} onChange={onChange} onBlur={onBlur} maxLength={255}
              placeholder="Ví dụ: Giả danh nhân viên ngân hàng yêu cầu đọc mã OTP" {...aria('tieuDe')} />
            {errMsg('tieuDe')}
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
              <label className="field-label" htmlFor="ngayXayRa">Ngày xảy ra <span className="req">*</span></label>
              <input className={fieldCls('ngayXayRa')} id="ngayXayRa" name="ngayXayRa" type="date" min="2000-01-01" max={todayISO()} value={form.ngayXayRa} onChange={onChange} onBlur={onBlur} {...aria('ngayXayRa')} />
              {errMsg('ngayXayRa')}
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

          <div className="rf-section">
            <span className="rf-step" aria-hidden="true">2</span>
            <div><h3>Đối tượng và thiệt hại</h3><p>Thông tin để tra cứu và cảnh báo về đối tượng</p></div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="doiTuong">Đối tượng lừa đảo <span className="req">*</span></label>
            <input className={fieldCls('doiTuong')} id="doiTuong" name="doiTuong" value={form.doiTuong} onChange={onChange}
              onBlur={(e) => { onBlur(e); checkDup() }} maxLength={255} autoComplete="off"
              placeholder="Số điện thoại, số tài khoản, link web..." {...aria('doiTuong')} />
            {errMsg('doiTuong')}
            {!errors.doiTuong && <span className="field-hint">Số điện thoại, số tài khoản, link web, tên Facebook/Zalo...</span>}
            {dup && dup.soBaoCao > 0 && (
              <div className={`rf-dup ${dup.mucDo === 'nguy_hiem' ? 'field-error' : 'field-warn'}`} role="status">
                <IconAlert width={18} height={18} />
                <span>
                  Đối tượng này <b>đã bị báo cáo {dup.soBaoCao} lần</b>
                  {dup.daXacNhan > 0 && <>, trong đó {dup.daXacNhan} lần đã được xác nhận</>}
                  {dup.tongThietHai > 0 && <>, tổng thiệt hại {formatMoneyShort(dup.tongThietHai)}</>}.
                  {' '}Vẫn có thể ghi nhận thêm nếu đây là người báo cáo khác.{' '}
                  <Link to={`/lookup?q=${encodeURIComponent(form.doiTuong.trim())}`} target="_blank" rel="noopener">Xem chi tiết tra cứu</Link>
                </span>
              </div>
            )}
            {dup && dup.soBaoCao === 0 && <span className="field-hint rf-ok">Chưa có báo cáo nào về đối tượng này.</span>}
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="soTienThietHai">Số tiền thiệt hại (đ)</label>
              <input className={fieldCls('soTienThietHai')} id="soTienThietHai" name="soTienThietHai" inputMode="numeric" autoComplete="off"
                value={form.soTienThietHai === '' ? '' : formatThousands(form.soTienThietHai)}
                onChange={onChange} onBlur={onBlur} placeholder="0" {...aria('soTienThietHai')} />
              {errMsg('soTienThietHai')}
              {!errors.soTienThietHai && <span className="field-hint">{tien > 0 ? `Tương đương ${formatMoneyShort(tien)}` : 'Để trống nếu chưa mất tiền'}</span>}
            </div>
            <div className="field-group" />
          </div>

          <div className="rf-section">
            <span className="rf-step" aria-hidden="true">3</span>
            <div><h3>Người báo cáo và diễn biến</h3><p>Người dân đã trình báo và mô tả sự việc</p></div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="nguoiBaoCao">Người báo cáo <span className="req">*</span></label>
            <input className={fieldCls('nguoiBaoCao')} id="nguoiBaoCao" name="nguoiBaoCao" value={form.nguoiBaoCao} onChange={onChange} onBlur={onBlur} maxLength={100} autoComplete="off" {...aria('nguoiBaoCao')} />
            {errMsg('nguoiBaoCao')}
            {!errors.nguoiBaoCao && <span className="field-hint">Họ tên người dân đã trình báo (cán bộ nhập hộ)</span>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="moTa">Mô tả chi tiết</label>
            <textarea className="field-textarea" id="moTa" name="moTa" rows="6" value={form.moTa} onChange={onChange} maxLength={MAX_MO_TA}
              placeholder="Đối tượng liên lạc bằng cách nào, nói gì, yêu cầu làm gì, đã chuyển tiền ra sao..." />
            <span className={`field-hint rf-count${form.moTa.length > MAX_MO_TA * 0.9 ? ' near' : ''}`}>{formatNumber(form.moTa.length)} / {formatNumber(MAX_MO_TA)} ký tự</span>
          </div>

          <div className="form-actions rf-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Gửi báo cáo'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={saving}>Hủy</button>
          </div>
        </form>

        <aside className="rf-aside" aria-label="Thông tin hỗ trợ nhập báo cáo">
          <div className="card rf-progress">
            <CornerFrame />
            <div className="card-head">
              <h3>Tiến độ nhập liệu</h3>
              <span className={`pill${phanTram === 100 ? ' rf-pill-ok' : ''}`}>{xong}/{BAT_BUOC.length}</span>
            </div>
            <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={phanTram} aria-label="Tiến độ nhập các trường bắt buộc">
              <i style={{ width: `${phanTram}%` }} />
            </div>
            <ul className="rf-checklist">
              {BAT_BUOC.map((b) => (
                <li key={b.key} className={errsNow[b.key] ? '' : 'done'}>
                  <span className="rf-tick" aria-hidden="true">{errsNow[b.key] ? '' : '✓'}</span>
                  {b.label}
                  <span className="sr-only">{errsNow[b.key] ? ' (chưa xong)' : ' (đã xong)'}</span>
                </li>
              ))}
            </ul>
            <p className="rf-extra">Thông tin bổ sung: <b>{boSung}/3</b> (tỉnh thành, số tiền, mô tả)</p>
          </div>

          <div className="card rf-preview">
            <div className="card-head"><h3>Dự kiến sau khi gửi</h3></div>
            <dl>
              <div>
                <dt><IconTarget width={16} height={16} />Mức ưu tiên</dt>
                <dd><span className={`badge ${MUC_UU_TIEN[uuTien].cls}`}>{MUC_UU_TIEN[uuTien].label}</span></dd>
              </div>
              <div>
                <dt><IconClock width={16} height={16} />Thời hạn xử lý</dt>
                <dd>{slaText(SLA_GIO[uuTien])}</dd>
              </div>
              <div>
                <dt><IconShield width={16} height={16} />Đơn vị tiếp nhận</dt>
                <dd>{donVi.ten}</dd>
              </div>
            </dl>
            <p className="rf-note">Từ 50 triệu: ưu tiên cao · từ 10 triệu: trung bình · còn lại: thấp.{!form.tinhThanh && ' Chưa chọn tỉnh, thành nên tạm tính cho PA05 Hà Nội.'}</p>
          </div>

          <div className="card rf-tips">
            <span className="rf-lotus" aria-hidden="true"><LotusGold /></span>
            <div className="card-head"><h3><IconBell width={16} height={16} /> Lưu ý khi nhập</h3></div>
            <ol>{TIPS.map((t) => <li key={t}>{t}</li>)}</ol>
          </div>

          <div className="card rf-hotline">
            <span className="rf-hotline-drum" aria-hidden="true"><BronzeDrum /></span>
            <span className="rf-hotline-icon"><IconPhone width={22} height={22} /></span>
            <div>
              <small>{HOTLINE.label}</small>
              <strong>{HOTLINE.value}</strong>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
