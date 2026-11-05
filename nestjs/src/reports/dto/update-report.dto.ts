import { Transform, Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator'
import { TRANG_THAI } from '../reports.constants.js'

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value)

// Dữ liệu khi xử lý báo cáo (PATCH /reports/:id): đổi trạng thái, phân công, ghi chú
// Tất cả đều tùy chọn, client gửi trường nào thì cập nhật trường đó
export class UpdateReportDto {
  @IsOptional()
  @IsIn(TRANG_THAI, { message: 'Trạng thái không hợp lệ' })
  trangThai?: string

  // Id cán bộ nhận việc (lấy từ GET /users/staff). Gửi null = hủy phân công (chỉ admin). Không gửi = giữ nguyên
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Cán bộ phụ trách không hợp lệ' })
  canBoId?: number | null

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000, { message: 'Ghi chú tối đa 2000 ký tự' })
  ghiChu?: string

  // Số phiên bản báo cáo mà người dùng đang xem; nếu đã có người sửa trước thì server từ chối (409)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  phienBan?: number
}
