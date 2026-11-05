export const KENH = ['website', 'sms', 'ung_dung', 'mang_xa_hoi'] as const
export const MUC_DO = ['thong_tin', 'canh_bao', 'khan_cap'] as const
export const PHAM_VI = ['toan_quoc', 'dia_ban'] as const
// nhap -> cho_duyet -> da_duyet -> da_phat_hanh (-> da_thu_hoi). Bị từ chối thì về tu_choi, sửa xong gửi duyệt lại
export const TRANG_THAI_CANH_BAO = ['nhap', 'cho_duyet', 'da_duyet', 'tu_choi', 'da_phat_hanh', 'da_thu_hoi'] as const

// Giới hạn độ dài từng kênh. SMS tiếng Việt có dấu tính theo bộ ký tự Unicode: 70 ký tự / tin
export const GIOI_HAN = { website: 5000, sms: 480, ung_dung: 300, mang_xa_hoi: 2000 } as const

export const KENH_LABEL: Record<string, string> = {
  website: 'Cảnh báo trên website', sms: 'Tin nhắn SMS', ung_dung: 'Thông báo ứng dụng', mang_xa_hoi: 'Mạng xã hội',
}

// Kết quả phát hành theo kênh. Website đăng ngay (API công khai); các kênh còn lại được xếp hàng chờ gửi,
// vì chưa nối nhà cung cấp SMS / push / mạng xã hội (xem AlertsService.dispatch)
export type TrangThaiKenh = 'da_dang' | 'cho_gui' | 'da_gui' | 'loi'
export interface KetQuaKenh { kenh: string; trangThai: TrangThaiKenh; ghiChu: string }
export interface NhatKyCanhBao { time: string; nguoi: string; nguoiId: number | null; noiDung: string }
