import { call } from './http.js'

export const getReports = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  return call(`/reports?${qs}`)
}

// Không có báo cáo (hoặc đã bị xóa) thì trả về null; các lỗi khác (mất kết nối, hết phiên...) vẫn ném lỗi
export const getReportById = (id) =>
  call(`/reports/${id}`).catch((err) => {
    if (err.status === 404) return null
    throw err
  })

export const createReport = (data) =>
  call('/reports', { method: 'POST', body: JSON.stringify({ ...data, soTienThietHai: Number(data.soTienThietHai) || 0 }) })

// Người dân gửi báo cáo qua trang công khai /bao-cao: không cần đăng nhập (auth: false), chỉ nhận lại mã tiếp nhận { id, ngayTao }
export const submitPublicReport = (data) =>
  call('/public/reports', { method: 'POST', auth: false, body: JSON.stringify({ ...data, soTienThietHai: Number(data.soTienThietHai) || 0 }) })

export const updateReport = (id, body) =>
  call(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify(body) })

export const getStats = () => call('/stats')

export const deleteReport = (id) => call(`/reports/${id}`, { method: 'DELETE' })

// Tra cứu SĐT / số tài khoản / link đã bị báo cáo chưa
export const lookupTarget = (q) => call(`/lookup?${new URLSearchParams({ q })}`)

// Đối tượng nghi vấn: danh sách gom theo SĐT / STK / link, hồ sơ từng đối tượng
export const getSuspects = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  return call(`/suspects?${qs}`)
}
export const getSuspectDetail = (q) => call(`/suspects/detail?${new URLSearchParams({ q })}`)

// Dữ liệu khối "Giám sát trực tiếp" trên Bảng điều hành
export const getMonitor = () => call('/monitor')

// Số liệu cho trang Thống kê và Bản đồ điểm nóng (days: 7 | 30 | 90 | 180 | 365, type: hình thức lừa đảo, tùy chọn)
export const getOverview = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  return call(`/stats/overview?${qs}`)
}
