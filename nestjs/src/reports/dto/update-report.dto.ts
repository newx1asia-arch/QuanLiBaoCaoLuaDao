import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator'
import { TRANG_THAI } from '../reports.constants.js'
import { MO_TA_TRANG_THAI } from '../../common/swagger.js'

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value)

// Dữ liệu khi xử lý báo cáo (PATCH /reports/:id): đổi trạng thái, phân công, ghi chú
// Tất cả đều tùy chọn, client gửi trường nào thì cập nhật trường đó
export class UpdateReportDto {
  @ApiPropertyOptional({ description: `${MO_TA_TRANG_THAI}. Luồng hợp lệ: cho_xu_ly → dang_xac_minh → da_xac_nhan hoặc tu_choi. Xác nhận, từ chối hoặc mở lại phải kèm ghiChu (lý do)`, enum: [...TRANG_THAI] })
  @IsOptional()
  @IsIn(TRANG_THAI, { message: 'Trạng thái không hợp lệ' })
  trangThai?: string

  // Id cán bộ nhận việc (lấy từ GET /users/staff). Gửi null = hủy phân công (chỉ admin). Không gửi = giữ nguyên
  @ApiPropertyOptional({ description: 'Id cán bộ nhận việc (lấy từ GET /users/staff). null = hủy phân công (chỉ admin). Không gửi = giữ nguyên', type: Number, nullable: true, example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Cán bộ phụ trách không hợp lệ' })
  canBoId?: number | null

  @ApiPropertyOptional({ description: 'Ghi chú / căn cứ xử lý', example: 'Đã xác minh với ngân hàng, tài khoản đối tượng đang bị phong tỏa.', maxLength: 2000 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000, { message: 'Ghi chú tối đa 2000 ký tự' })
  ghiChu?: string

  // Số phiên bản báo cáo mà người dùng đang xem; nếu đã có người sửa trước thì server từ chối (409)
  @ApiPropertyOptional({ description: 'Số phiên bản báo cáo đang xem (trường phienBan khi lấy chi tiết). Đã có người sửa trước thì server trả 409', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  phienBan?: number
}
