import { call } from './http.js'

// Trạng thái hỗ trợ: khu vực, cán bộ đang trực cùng khu vực (không tính mình), trợ lý AI có sẵn sàng không
export const getSupportStatus = (khuVuc = '') => call(`/support/status${khuVuc ? `?khuVuc=${khuVuc}` : ''}`)
export const setDuty = (khuVuc, dangTruc) => call('/support/duty', { method: 'PUT', body: JSON.stringify({ khuVuc, dangTruc }) })
// messages: [{ role: 'user' | 'assistant', content }], tin cuối cùng phải là của người dùng
export const askAssistant = (khuVuc, messages) => call('/support/chat', { method: 'POST', body: JSON.stringify({ khuVuc, messages }) })
