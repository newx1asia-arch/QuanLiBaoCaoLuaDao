import { call } from './http.js'

export const getAlerts = (status = '') => call(`/alerts${status ? `?status=${status}` : ''}`)
export const createAlert = (data) => call('/alerts', { method: 'POST', body: JSON.stringify(data) })
export const updateAlert = (id, data) => call(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteAlert = (id) => call(`/alerts/${id}`, { method: 'DELETE' })
const act = (id, name, ghiChu) => call(`/alerts/${id}/${name}`, { method: 'POST', body: JSON.stringify(ghiChu ? { ghiChu } : {}) })
export const submitAlert = (id) => act(id, 'submit')
export const approveAlert = (id, ghiChu) => act(id, 'approve', ghiChu)
export const rejectAlert = (id, ghiChu) => act(id, 'reject', ghiChu)
export const publishAlert = (id) => act(id, 'publish')
export const withdrawAlert = (id, ghiChu) => act(id, 'withdraw', ghiChu)

// API công khai (không cần đăng nhập): chỉ trả cảnh báo đã phát hành có kênh website
export const getPublicAlerts = (province = '') => call(`/public/alerts${province ? `?province=${encodeURIComponent(province)}` : ''}`, { auth: false })
