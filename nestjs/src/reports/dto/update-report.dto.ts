import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'
import { TRANG_THAI } from '../reports.constants.js'

// Dữ liệu khi xử lý báo cáo (PATCH /reports/:id): đổi trạng thái, phân công, ghi chú
// Tất cả đều tùy chọn, client gửi trường nào thì cập nhật trường đó
export class UpdateReportDto {
  @IsOptional()
  @IsIn(TRANG_THAI, { message: 'Trạng thái không hợp lệ' })
  trangThai?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  canBo?: string

  @IsOptional()
  @IsString()
  ghiChu?: string
}
