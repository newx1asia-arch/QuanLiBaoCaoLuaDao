import { call } from './http.js'

export const getReports = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  return call(`/reports?${qs}`)
}

export const getReportById = (id) => call(`/reports/${id}`)

export const createReport = (data) =>
  call('/reports', { method: 'POST', body: JSON.stringify({ ...data, soTienThietHai: Number(data.soTienThietHai) || 0 }) })

export const updateReport = (id, body) =>
  call(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify(body) })

export const getStats = () => call('/stats')

export const deleteReport = (id) => call(`/reports/${id}`, { method: 'DELETE' })

// Tra cứu SĐT / số tài khoản / link đã bị báo cáo chưa
export const lookupTarget = (q) => call(`/lookup?${new URLSearchParams({ q })}`)
