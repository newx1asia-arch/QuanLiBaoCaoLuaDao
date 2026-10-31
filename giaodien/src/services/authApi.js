import { call } from './http.js'

const json = (method, body) => ({ method, body: JSON.stringify(body) })

export const login = (data) => call('/auth/login', { ...json('POST', data), auth: false })
export const register = (data) => call('/auth/register', { ...json('POST', data), auth: false })
export const getMe = () => call('/auth/me')
export const updateMe = (data) => call('/auth/me', json('PATCH', data))
export const changePassword = (data) => call('/auth/change-password', json('POST', data))

// Quên mật khẩu: bước 1 gửi mã về email, bước 2 nhập mã + mật khẩu mới (đều là API công khai)
export const forgotPassword = (data) => call('/auth/forgot-password', { ...json('POST', data), auth: false })
export const resetPassword = (data) => call('/auth/reset-password', { ...json('POST', data), auth: false })
