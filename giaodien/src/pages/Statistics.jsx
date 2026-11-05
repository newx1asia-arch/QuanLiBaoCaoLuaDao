import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getOverview } from '../services/reportApi.js'
import { downloadCsv } from '../services/exportCsv.js'
import {
  KHOANG_THOI_GIAN, LOAI_LUA_DAO, MAU_LOAI, MAU_TRANG_THAI, MUC_UU_TIEN, TRANG_THAI,
  formatMoney, formatMoneyShort, formatNumber, formatPercent, loaiNgan,
} from '../constants.js'
import { Donut, Legend, HBars, Heatmap, LineChart, StackedColumns } from '../components/Charts.jsx'
import { LoadingBlock, ErrorBlock } from '../components/PageState.jsx'
import { IconClock, IconDownload, IconFile, IconShield, IconTrendUp, IconWallet } from '../components/Icons.jsx'

// "2026-11-03" -> "03/11", "2026-11" -> "11/26"
const nhanMoc = (nhan, donVi) => (donVi === 'thang' ? `${nhan.slice(5)}/${nhan.slice(2, 4)}` : `${nhan.slice(8)}/${nhan.slice(5, 7)}`)
const donViText = { ngay: 'theo ngày', tuan: 'theo tuần', thang: 'theo tháng' }

// Mũi tên tăng / giảm so với kỳ trước. Với báo cáo lừa đảo, tăng là xấu nên tăng tô đỏ, giảm tô xanh
function Delta({ value, suffix = 'so với kỳ trước' }) {
  if (value == null) return <span className="muted">Chưa có số liệu kỳ trước</span>
  return <><b className={value > 0 ? 'down' : 'up'}><IconTrendUp />{formatPercent(value)}</b> {suffix}</>
}

function Kpi({ cls, title, icon, value, foot, title2 }) {
  return (
    <div className={`kpi ${cls}`} title={title2}>
      <div className="kpi-top"><span>{title}</span><i className="kpi-icon">{icon}</i></div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">{foot}</div>
    </div>
  )
}

export default function Statistics() {
  const navigate = useNavigate()
  const [days, setDays] = useState(30)
  const [type, setType] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let ignore = false
    setError(false)
    getOverview({ days, type })
      .then((d) => { if (!ignore) setData(d) })
      .catch(() => { if (!ignore) setError(true) })
    return () => { ignore = true }
  }, [days, type, retry])

  if (error) return <ErrorBlock onRetry={() => setRetry((n) => n + 1)} />
  if (!data) return <LoadingBlock rows={6} />

  const { tongQuan: q, xuHuong, theoLoai, theoTinh } = data
  const labels = xuHuong.diem.map((d) => nhanMoc(d.nhan, xuHuong.donVi))
  const loaiCo = theoLoai.filter((l) => l.soBaoCao > 0)
  const loaiSlices = loaiCo.map((l) => ({ label: loaiNgan(l.loai), value: l.soBaoCao, color: MAU_LOAI[l.loai] }))
  const ttSlices = Object.keys(TRANG_THAI).map((k) => ({ label: TRANG_THAI[k].label, value: q[{ cho_xu_ly: 'choXuLy', dang_xac_minh: 'dangXacMinh', da_xac_nhan: 'daXacNhan', tu_choi: 'tuChoi' }[k]], color: MAU_TRANG_THAI[k] }))
  const topTinh = [...theoTinh].filter((t) => t.soBaoCao > 0).sort((a, b) => b.soBaoCao - a.soBaoCao).slice(0, 10)
  const uuTienSlices = Object.keys(MUC_UU_TIEN).map((k) => ({ label: MUC_UU_TIEN[k].label, value: data.uuTien[k] ?? 0, color: k === 'cao' ? '#9b111e' : k === 'trung_binh' ? '#d97706' : '#1f5a96' }))
  const coDuLieu = q.tong > 0

  const exportTinh = () => downloadCsv(
    `thong-ke-theo-dia-ban-${days}-ngay.csv`,
    ['Địa bàn', 'Số báo cáo', 'Kỳ trước', 'Tăng / giảm (%)', 'Thiệt hại (đ)', 'Đang xử lý', 'Đã xác nhận', 'Hình thức phổ biến', 'Mức độ'],
    theoTinh.filter((t) => t.soBaoCao > 0 || t.soBaoCaoKyTruoc > 0).map((t) => [t.ten, t.soBaoCao, t.soBaoCaoKyTruoc, t.tangTruong ?? '', t.thietHai, t.dangXuLy, t.daXacNhan, t.hinhThucPhoBien ? loaiNgan(t.hinhThucPhoBien) : '', t.capDo]),
  )

  return (
    <>
      <nav className="crumbs" aria-label="Đường dẫn"><span>Trang chủ</span><i>›</i><b>Báo cáo thống kê</b></nav>
      <div className="page-head">
        <div>
          <h1 className="display">Báo cáo thống kê</h1>
          <p>Số liệu {days} ngày gần nhất, cập nhật lúc {new Date(data.capNhatLuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}, {new Date(data.capNhatLuc).toLocaleDateString('vi-VN')}</p>
        </div>
        <div className="head-actions no-print">
          <button type="button" className="btn btn-secondary" onClick={exportTinh}><IconDownload />Xuất thống kê địa bàn</button>
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>In báo cáo</button>
        </div>
      </div>

      <div className="filter-bar no-print">
        <div className="segmented" role="group" aria-label="Khoảng thời gian">
          {KHOANG_THOI_GIAN.map((k) => (
            <button key={k.value} type="button" className={days === k.value ? 'active' : ''} aria-pressed={days === k.value} onClick={() => setDays(k.value)}>{k.label}</button>
          ))}
        </div>
        <select className="field-select" value={type} onChange={(e) => setType(e.target.value)} aria-label="Hình thức lừa đảo">
          <option value="">Mọi hình thức</option>
          {LOAI_LUA_DAO.map((l) => <option key={l.value} value={l.value}>{loaiNgan(l.value)}</option>)}
        </select>
        <Link to="/hotspots" className="btn btn-secondary btn-sm">Xem bản đồ điểm nóng ›</Link>
      </div>

      <div className="kpi-grid">
        <Kpi cls="kpi-red" title="Tổng báo cáo" icon={<IconFile />} value={formatNumber(q.tong)} foot={<Delta value={q.tangTruong} />} />
        <Kpi cls="kpi-orange" title="Thiệt hại ghi nhận" icon={<IconWallet />} value={formatMoneyShort(q.thietHai)} title2={formatMoney(q.thietHai)} foot={<Delta value={q.thietHaiTangTruong} />} />
        <Kpi cls="kpi-blue" title="Đã xác nhận" icon={<IconShield width={20} height={20} />} value={formatNumber(q.daXacNhan)} foot={<><b>{q.tiLeXacNhan}%</b> trên tổng báo cáo</>} />
        <Kpi cls="kpi-gold" title="Đã có kết luận" icon={<IconClock />} value={`${q.tiLeKetThuc}%`} foot={<><b>{formatNumber(q.choXuLy + q.dangXacMinh)}</b> báo cáo còn đang xử lý</>} />
      </div>

      {!coDuLieu ? (
        <div className="card empty-state">Không có báo cáo nào trong {days} ngày gần nhất{type ? ' với hình thức này' : ''}.<small>Thử chọn khoảng thời gian dài hơn.</small></div>
      ) : (
        <>
          <div className="dash-grid">
            <div className="card">
              <div className="card-head"><div><h3>Xu hướng tiếp nhận báo cáo</h3><p className="sub">Số báo cáo {donViText[xuHuong.donVi]}, so với số đã được xác nhận</p></div></div>
              <LineChart labels={labels} ariaLabel="Xu hướng số báo cáo"
                series={[
                  { name: 'Tiếp nhận', color: 'var(--primary)', area: true, values: xuHuong.diem.map((d) => d.tong) },
                  { name: 'Đã xác nhận', color: '#1b7342', values: xuHuong.diem.map((d) => d.daXacNhan) },
                ]} />
              <ul className="chart-key"><li><i style={{ background: 'var(--primary)' }} />Tiếp nhận</li><li><i style={{ background: '#1b7342' }} />Đã xác nhận</li></ul>
            </div>
            <div className="card">
              <div className="card-head"><div><h3>Tình trạng xử lý</h3><p className="sub">Phân bố theo trạng thái</p></div></div>
              <div className="donut-wrap">
                <Donut slices={ttSlices} centerValue={formatNumber(q.tong)} centerLabel="báo cáo" />
                <Legend items={ttSlices} total={q.tong} />
              </div>
            </div>
          </div>

          <div className="dash-grid">
            <div className="card">
              <div className="card-head"><div><h3>Hình thức lừa đảo theo thời gian</h3><p className="sub">Cơ cấu từng hình thức {donViText[xuHuong.donVi]}</p></div></div>
              <StackedColumns labels={labels} ariaLabel="Số báo cáo theo hình thức"
                stacks={LOAI_LUA_DAO.map((l) => ({ key: l.value, name: loaiNgan(l.value), color: MAU_LOAI[l.value], values: xuHuong.diem.map((d) => d.theoLoai[l.value] ?? 0) }))} />
              <ul className="chart-key">{LOAI_LUA_DAO.map((l) => <li key={l.value}><i style={{ background: MAU_LOAI[l.value] }} />{loaiNgan(l.value)}</li>)}</ul>
            </div>
            <div className="card">
              <div className="card-head"><div><h3>Cơ cấu hình thức</h3><p className="sub">Tỷ lệ trên tổng số báo cáo</p></div></div>
              <div className="donut-wrap">
                <Donut slices={loaiSlices} centerValue={loaiSlices[0] ? `${Math.round((loaiSlices[0].value / q.tong) * 100)}%` : '0%'} centerLabel={loaiSlices[0]?.label ?? ''} />
                <Legend items={loaiSlices} total={q.tong} />
              </div>
            </div>
          </div>

          <div className="dash-grid even">
            <div className="card">
              <div className="card-head"><div><h3>Địa bàn có nhiều báo cáo nhất</h3><p className="sub">Top 10 tỉnh, thành trong kỳ</p></div></div>
              {topTinh.length === 0
                ? <div className="empty-state">Các báo cáo trong kỳ chưa ghi tỉnh, thành.<small>Chọn địa bàn khi tạo báo cáo mới để có thống kê này.</small></div>
                : <HBars items={topTinh.map((t) => ({ key: t.ma, label: t.ten, value: t.soBaoCao, note: t.tangTruong == null ? '' : ` ${formatPercent(t.tangTruong)}` }))}
                    onPick={(it) => navigate(`/reports?province=${it.key}`)} />}
              {data.chuaRoDiaBan.soBaoCao > 0 && <p className="hp-note">{formatNumber(data.chuaRoDiaBan.soBaoCao)} báo cáo trong kỳ chưa ghi địa bàn nên không có trong bảng xếp hạng.</p>}
            </div>
            <div className="card">
              <div className="card-head"><div><h3>Thiệt hại theo hình thức</h3><p className="sub">Tổng số tiền ghi nhận trong kỳ</p></div></div>
              <HBars format={formatMoneyShort}
                items={[...loaiCo].sort((a, b) => b.thietHai - a.thietHai).map((l) => ({ key: l.loai, label: loaiNgan(l.loai), value: l.thietHai, color: MAU_LOAI[l.loai] }))} />
            </div>
          </div>

          <div className="dash-grid even">
            <div className="card">
              <div className="card-head"><div><h3>Khung giờ tiếp nhận</h3><p className="sub">Số báo cáo theo thứ trong tuần và giờ trong ngày</p></div></div>
              <Heatmap matrix={data.nhietDo} />
            </div>
            <div className="card">
              <div className="card-head"><div><h3>Mức độ ưu tiên</h3><p className="sub">Phân loại theo số tiền thiệt hại</p></div></div>
              <div className="donut-wrap">
                <Donut slices={uuTienSlices} centerValue={formatNumber(data.uuTien.cao ?? 0)} centerLabel="mức cao" />
                <Legend items={uuTienSlices} total={q.tong} />
              </div>
              <p className="hp-note">Thiệt hại trung bình mỗi báo cáo: <b>{formatMoneyShort(q.thietHaiTrungBinh)}</b></p>
            </div>
          </div>

          <div className="card flush mb-1">
            <div className="card-head">
              <div><h3>Đối tượng bị báo cáo nhiều lần trong kỳ</h3><p className="sub">Không tính báo cáo đã bị từ chối</p></div>
              <Link to="/suspects" className="btn btn-secondary btn-sm no-print">Xem tất cả</Link>
            </div>
            {data.topDoiTuong.length === 0 ? (
              <div className="empty-state">Chưa có đối tượng nào bị báo cáo từ 2 lần trở lên trong kỳ này.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Đối tượng</th><th className="num">Số báo cáo</th><th className="num">Tổng thiệt hại</th></tr></thead>
                  <tbody>
                    {data.topDoiTuong.map((t) => (
                      <tr key={t.doiTuong}>
                        <td className="mono"><Link to={`/suspects?q=${encodeURIComponent(t.doiTuong)}`}>{t.doiTuong}</Link></td>
                        <td className="num">{t.soBaoCao}</td>
                        <td className="num">{formatMoney(t.thietHai)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
