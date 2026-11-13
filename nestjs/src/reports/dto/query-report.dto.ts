import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { CHUA_RO_DIA_BAN, LOAI, TINH_THANH, TRANG_THAI, UU_TIEN } from '../reports.constants.js'
import { MO_TA_LOAI, MO_TA_TINH, MO_TA_TRANG_THAI } from '../../common/swagger.js'

// Tham số lọc / sắp xếp / phân trang trên URL (GET /reports?status=...&page=...)
export class QueryReportDto {
  @ApiPropertyOptional({ description: 'Tìm theo tiêu đề, đối tượng, tên người báo cáo...', maxLength: 255 })
  @IsOptional() @IsString() @MaxLength(255) keyword?: string
  @ApiPropertyOptional({ description: `${MO_TA_TRANG_THAI}. Thêm dang_xu_ly = chờ xử lý + đang xác minh (mọi hồ sơ còn mở)`, enum: [...TRANG_THAI, 'dang_xu_ly'] })
  @IsOptional() @IsIn([...TRANG_THAI, 'dang_xu_ly']) status?: string // 'dang_xu_ly' = chờ xử lý + đang xác minh (mọi hồ sơ còn đang mở)
  @ApiPropertyOptional({ description: MO_TA_LOAI, enum: [...LOAI] })
  @IsOptional() @IsIn(LOAI) type?: string
  @ApiPropertyOptional({ description: 'Mức ưu tiên (tính theo số tiền thiệt hại)', enum: [...UU_TIEN] })
  @IsOptional() @IsIn(UU_TIEN) priority?: string
  @ApiPropertyOptional({ description: `${MO_TA_TINH}. chua_ro = báo cáo chưa ghi địa bàn`, enum: [...TINH_THANH, CHUA_RO_DIA_BAN] })
  @IsOptional() @IsIn([...TINH_THANH, CHUA_RO_DIA_BAN]) province?: string // mã tỉnh, thành; 'chua_ro' = chưa ghi địa bàn
  @ApiPropertyOptional({ description: '1 = chỉ báo cáo được giao cho tôi', enum: ['1'] })
  @IsOptional() @IsIn(['1']) mine?: string // '1' = chỉ báo cáo được giao cho tôi (cán bộ / admin)
  @ApiPropertyOptional({ description: 'nguoi_dan = chỉ báo cáo do người dân tự gửi qua trang công khai', enum: ['nguoi_dan'] })
  @IsOptional() @IsIn(['nguoi_dan']) kenh?: string // 'nguoi_dan' = chỉ báo cáo do người dân tự gửi qua trang công khai
  @ApiPropertyOptional({ description: 'Chỉ báo cáo tiếp nhận trong N ngày gần nhất', enum: [7, 30, 90, 180, 365], type: Number })
  @IsOptional() @Type(() => Number) @IsInt() @IsIn([7, 30, 90, 180, 365]) days?: number // chỉ báo cáo tiếp nhận trong N ngày gần nhất (cùng mốc với trang Thống kê)
  @ApiPropertyOptional({ description: 'Sắp xếp theo cột nào', enum: ['id', 'soTienThietHai', 'ngayXayRa'] })
  @IsOptional() @IsIn(['id', 'soTienThietHai', 'ngayXayRa']) sort?: string
  @ApiPropertyOptional({ description: 'Chiều sắp xếp', enum: ['asc', 'desc'] })
  @IsOptional() @IsIn(['asc', 'desc']) dir?: string
  @ApiPropertyOptional({ description: 'Trang thứ mấy (bắt đầu từ 1)', default: 1, minimum: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number
  @ApiPropertyOptional({ description: 'Số dòng mỗi trang', minimum: 1, maximum: 500 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500) pageSize?: number
}
