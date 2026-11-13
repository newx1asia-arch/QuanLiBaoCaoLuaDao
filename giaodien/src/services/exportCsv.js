import { getReports } from './reportApi.js'
import { TRANG_THAI, MUC_UU_TIEN, loaiLabel, tinhLabel, todayISO } from '../constants.js'

const BATCH = 500 // khớp giới hạn pageSize của backend

// Xuất danh sách báo cáo (theo bộ lọc hiện tại) ra file CSV mở được bằng Excel.
// Lấy từng đợt 500 báo cáo cho tới khi đủ, không dồn tất cả vào một yêu cầu.
export async function exportReportsCsv(filters = {}) {
  const items = []
  for (let page = 1; ; page += 1) {
    const res = await getReports({ ...filters, page, pageSize: BATCH })
    items.push(...res.items)
    if (items.length >= res.total || res.items.length === 0) break
  }

  const head = ['ID', 'Tiêu đề', 'Loại', 'Đối tượng', 'Thiệt hại', 'Ngày xảy ra', 'Người báo cáo', 'Trạng thái', 'Ưu tiên', 'Cán bộ', 'Tỉnh, thành', 'Nguồn']
  const rows = items.map((r) => [r.id, r.tieuDe, loaiLabel(r.loai), r.doiTuong, r.soTienThietHai,
    r.ngayXayRa, r.nguoiBaoCao, TRANG_THAI[r.trangThai]?.label ?? r.trangThai, MUC_UU_TIEN[r.uuTien]?.label ?? r.uuTien, r.canBo, tinhLabel(r.tinhThanh), r.kenh === 'nguoi_dan' ? 'Người dân gửi' : 'Cán bộ nhập'])
  downloadCsv(`bao-cao-lua-dao-${todayISO()}.csv`, head, rows)
}

// Tải một bảng ra file CSV mở được bằng Excel (có BOM để giữ đúng tiếng Việt)
export function downloadCsv(filename, head, rows) {
  // Ô CHỮ bắt đầu bằng = + - @ sẽ bị Excel hiểu là công thức; dữ liệu do người dùng nhập nên thêm dấu ' phía trước
  const cell = (c) => {
    const t = String(c ?? '')
    // Chỉ chữ mới có thể bị Excel hiểu là công thức. Số (vd -12,5 ở cột Tăng / giảm) giữ nguyên, nếu thêm dấu ' thì Excel coi là chữ, không tính tổng, không sắp xếp được
    return `"${(typeof c === 'string' && /^[=+\-@\t\r]/.test(t) ? "'" + t : t).replaceAll('"', '""')}"`
  }
  // Dòng "sep=," báo cho Excel/WPS biết dấu phân cách là dấu phẩy. Thiếu dòng này, máy cài Windows tiếng Việt
  // (dấu phân cách mặc định là ;) sẽ dồn cả hàng vào cột A.
  const csv = 'sep=,\r\n' + [head, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a) // một số trình duyệt chỉ tải khi thẻ <a> nằm trong trang
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000) // thu hồi ngay có thể làm hủy việc tải ở vài trình duyệt
}
