import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getSuspectDetail, getSuspects } from '../services/reportApi.js'
import {
  KIEU_DOI_TUONG, MUC_DO_NGHI_VAN, formatDate, formatMoney, formatMoneyShort, loaiNgan, reportCode,
} from '../constants.js'
import Modal from '../components/Modal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { LoadingBlock, ErrorBlock } from '../components/PageState.jsx'
import { IconEye } from '../components/Icons.jsx'

const PAGE_SIZE = 10

// Nhận bộ lọc ban đầu từ địa chỉ (?q=...&level=...&kind=...) để các liên kết từ Bảng điều hành dẫn thẳng tới kết quả
export default function Suspects() {
  const [sp] = useSearchParams()
  return <SuspectsInner key={sp.toString()} initial={{ keyword: sp.get('q') || '', level: sp.get('level') || '', kind: sp.get('kind') || '' }} />
}

function SuspectsInner({ initial }) {
  const [data, setData] = useState({ items: [], total: 0, counts: { all: 0, nguy_hiem: 0, can_than: 0 }, tongThietHai: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [f, setF] = useState({ keyword: initial.keyword, level: initial.level, kind: initial.kind, page: 1 })
  const [kw, setKw] = useState(initial.keyword) // nội dung đang gõ; chỉ gửi lên server khi ngừng gõ một chút
  const [detail, setDetail] = useState(null) // đối tượng đang xem hồ sơ

  const set = (patch) => setF((p) => ({ ...p, page: 1, ...patch }))

  useEffect(() => {
    if (kw.trim() === f.keyword.trim()) return
    const t = setTimeout(() => setF((p) => ({ ...p, keyword: kw, page: 1 })), 350)
    return () => clearTimeout(t)
  }, [kw, f.keyword])

  useEffect(() => {
    let ignore = false // bỏ qua kết quả của lần gọi cũ nếu bộ lọc đã đổi
    setLoading(true)
    getSuspects({ ...f, pageSize: PAGE_SIZE })
      .then((d) => { if (!ignore) { setData(d); setError(false); setLoading(false) } })
      .catch(() => { if (!ignore) { setError(true); setLoading(false) } })
    return () => { ignore = true }
  }, [f, retry])

  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))
  const hasFilter = f.keyword || f.level || f.kind

  return (
    <>
      <nav className="crumbs" aria-label="Đường dẫn"><span>Nghiệp vụ</span><i>›</i><b>Đối tượng nghi vấn</b></nav>
      <div className="page-head">
        <div>
          <h1 className="display">Đối tượng nghi vấn</h1>
          <p>Số điện thoại, số tài khoản và đường link bị báo cáo, gom từ các báo cáo chưa bị từ chối</p>
        </div>
        <div className="head-actions">
          <Link to="/lookup" className="btn btn-secondary">Tra cứu nhanh</Link>
          <Link to="/reports/new" className="btn btn-primary">+ Tạo báo cáo</Link>
        </div>
      </div>

      <div className="stat-grid mb-1">
        <div className="stat"><div className="stat-label">Đối tượng nghi vấn</div><div className="stat-value">{data.counts.all}</div></div>
        <div className="stat danger"><div className="stat-label">Mức nguy hiểm</div><div className="stat-value">{data.counts.nguy_hiem}</div></div>
        <div className="stat"><div className="stat-label">Thiệt hại liên quan</div><div className="stat-value money" title={formatMoney(data.tongThietHai)}>{formatMoneyShort(data.tongThietHai)}</div></div>
      </div>

      <div className="card flush">
        <div className="tabs">
          <button className={!f.level ? 'active' : ''} onClick={() => set({ level: '' })}>Tất cả <b>{data.counts.all}</b></button>
          {Object.entries(MUC_DO_NGHI_VAN).map(([k, v]) => (
            <button key={k} className={f.level === k ? 'active' : ''} onClick={() => set({ level: k })}>
              {v.label} <b>{data.counts[k] || 0}</b>
            </button>
          ))}
        </div>

        <div className="toolbar">
          <input className="field-input grow" placeholder="Tìm theo SĐT, số tài khoản hoặc link..."
            value={kw} onChange={(e) => setKw(e.target.value)} aria-label="Tìm đối tượng nghi vấn" />
          <select className="field-select" value={f.kind} onChange={(e) => set({ kind: e.target.value })} aria-label="Loại đối tượng">
            <option value="">Mọi loại đối tượng</option>
            {Object.entries(KIEU_DOI_TUONG).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
          {hasFilter && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setKw(''); set({ keyword: '', level: '', kind: '' }) }}>Xóa lọc</button>
          )}
        </div>

        {loading ? (
          <LoadingBlock rows={5} />
        ) : error ? (
          <ErrorBlock onRetry={() => setRetry((n) => n + 1)} />
        ) : data.items.length === 0 ? (
          <div className="empty-state">
            Không có đối tượng nghi vấn nào phù hợp
            <small>Đối tượng xuất hiện ở đây khi có báo cáo (chưa bị từ chối) về số điện thoại, số tài khoản hoặc link đó.</small>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="stack">
              <thead>
                <tr>
                  <th>Đối tượng</th><th>Mức độ</th><th className="num">Báo cáo</th><th className="num">Người báo cáo</th>
                  <th className="num">Đã xác nhận</th><th className="num">Đang xử lý</th><th className="num">Thiệt hại</th>
                  <th>Gần nhất</th><th className="num">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((d) => (
                  <tr key={d.key} data-pri={MUC_DO_NGHI_VAN[d.mucDo]?.pri}>
                    <td className="cell-title">
                      <button type="button" className="link-btn mono" onClick={() => setDetail(d)}>{d.doiTuong}</button>
                      <small>{KIEU_DOI_TUONG[d.kieu]} · {d.loai.map((l) => loaiNgan(l.loai)).slice(0, 2).join(', ')}</small>
                    </td>
                    <td data-label="Mức độ"><span className={`badge ${MUC_DO_NGHI_VAN[d.mucDo]?.cls ?? ''}`}>{MUC_DO_NGHI_VAN[d.mucDo]?.label ?? d.mucDo}</span></td>
                    <td className="num" data-label="Báo cáo">{d.soBaoCao}</td>
                    <td className="num" data-label="Người báo cáo">{d.soNguoiBaoCao}</td>
                    <td className="num" data-label="Đã xác nhận">{d.daXacNhan}</td>
                    <td className="num" data-label="Đang xử lý">{d.dangXuLy}</td>
                    <td className="num" data-label="Thiệt hại">{formatMoney(d.thietHai)}</td>
                    <td className="nowrap" data-label="Gần nhất">{formatDate(d.baoCaoGanNhat)}</td>
                    <td className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => setDetail(d)} aria-label={`Xem hồ sơ ${d.doiTuong}`} title="Xem hồ sơ"><IconEye /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pager">
          <span className="muted">{data.total} đối tượng</span>
          <div>
            <button className="btn btn-secondary btn-sm" disabled={f.page <= 1} onClick={() => setF({ ...f, page: f.page - 1 })}>← Trước</button>
            <span className="pager-info">Trang {f.page}/{pages}</span>
            <button className="btn btn-secondary btn-sm" disabled={f.page >= pages} onClick={() => setF({ ...f, page: f.page + 1 })}>Sau →</button>
          </div>
        </div>
      </div>

      {detail && <SuspectModal item={detail} onClose={() => setDetail(null)} />}
    </>
  )
}

// Hồ sơ một đối tượng: số liệu tổng hợp và danh sách báo cáo liên quan (tải khi mở)
function SuspectModal({ item, onClose }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    getSuspectDetail(item.doiTuong)
      .then((d) => { if (!ignore) setData(d) })
      .catch((err) => { if (!ignore) setError(err.message) })
    return () => { ignore = true }
  }, [item.doiTuong])

  const lv = MUC_DO_NGHI_VAN[item.mucDo]
  return (
    <Modal title="Hồ sơ đối tượng nghi vấn" onClose={onClose} wide>
      <div className="suspect-head">
        <span className="mono suspect-id">{item.doiTuong}</span>
        <span className={`badge ${lv?.cls ?? ''}`}>{lv?.label ?? item.mucDo}</span>
        <small className="muted">{KIEU_DOI_TUONG[item.kieu]}</small>
      </div>

      <div className="stat-grid lookup-stats">
        <div className="stat"><div className="stat-label">Số báo cáo</div><div className="stat-value">{item.soBaoCao}</div></div>
        <div className="stat"><div className="stat-label">Người báo cáo</div><div className="stat-value">{item.soNguoiBaoCao}</div></div>
        <div className="stat danger"><div className="stat-label">Thiệt hại</div><div className="stat-value money">{formatMoney(item.thietHai)}</div></div>
      </div>

      <h4 className="dossier-title">Hình thức lừa đảo được báo cáo</h4>
      <ul className="progress-list">
        {item.loai.map((l) => (
          <li key={l.loai}>
            <div className="progress-top"><span>{loaiNgan(l.loai)}</span><b>{l.soLan}</b></div>
            <div className="progress-track"><i style={{ width: `${(l.soLan / item.soBaoCao) * 100}%` }} /></div>
          </li>
        ))}
      </ul>

      <h4 className="dossier-title">Báo cáo liên quan</h4>
      {error ? (
        <div className="field-error" role="alert">{error}</div>
      ) : !data ? (
        <LoadingBlock rows={3} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Mã</th><th>Tiêu đề</th><th>Ngày xảy ra</th><th className="num">Thiệt hại</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {data.baoCao.map((r) => (
                <tr key={r.id}>
                  <td className="code"><Link to={`/reports/${r.id}`}>{reportCode(r)}</Link></td>
                  <td>{r.tieuDe}</td>
                  <td className="nowrap">{formatDate(r.ngayXayRa)}</td>
                  <td className="num">{formatMoney(r.soTienThietHai)}</td>
                  <td><StatusBadge value={r.trangThai} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
        <Link to={`/reports/new?doiTuong=${encodeURIComponent(item.doiTuong)}`} className="btn btn-primary">Gửi báo cáo về đối tượng này</Link>
      </div>
    </Modal>
  )
}
