import { call } from './http.js'

const json = (method, body) => ({ method, body: JSON.stringify(body) })

export const getUsers = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  return call(`/users?${qs}`)
}
export const createUser = (data) => call('/users', json('POST', data))
export const updateUser = (id, data) => call(`/users/${id}`, json('PATCH', data))
export const resetUserPassword = (id, matKhau) => call(`/users/${id}/reset-password`, json('POST', { matKhau }))
// Danh sách tên cán bộ để phân công
export const getStaff = () => call('/users/staff')
