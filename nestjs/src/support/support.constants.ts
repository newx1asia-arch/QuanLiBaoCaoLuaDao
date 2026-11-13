// Khu vực trực khớp với đơn vị tiếp nhận: bac = PA05 Hà Nội (Bắc, Bắc Trung Bộ), nam = PA05 TP.HCM (Trung, Nam Bộ)
export const KHU_VUC = ['bac', 'nam'] as const
export type KhuVuc = (typeof KHU_VUC)[number]

export const TEN_KHU_VUC: Record<KhuVuc, string> = {
  bac: 'Miền Bắc (PA05 Hà Nội)',
  nam: 'Miền Trung, Nam (PA05 TP.HCM)',
}

// Trạng thái "Đang trực" tự hết hiệu lực sau số giờ này (phòng khi cán bộ quên tắt)
export const TRUC_HET_HAN_GIO = Number(process.env.DUTY_HOURS ?? 12) || 12

// Giới hạn chống lạm dụng AI: số tin nhắn mỗi người mỗi giờ, độ dài mỗi tin, số tin gửi kèm làm ngữ cảnh
export const AI_GIOI_HAN_MOI_GIO = Number(process.env.AI_LIMIT_PER_HOUR ?? 20) || 20
export const AI_DO_DAI_TIN = 1000
export const AI_SO_TIN_TOI_DA = 20
