import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { LOAI, TRANG_THAI, UU_TIEN } from '../reports.constants.js'

// Tham số lọc / sắp xếp / phân trang trên URL (GET /reports?status=...&page=...)
export class QueryReportDto {
  @IsOptional() @IsString() keyword?: string
  @IsOptional() @IsIn(TRANG_THAI) status?: string
  @IsOptional() @IsIn(LOAI) type?: string
  @IsOptional() @IsIn(UU_TIEN) priority?: string
  @IsOptional() @IsIn(['1']) mine?: string // '1' = chỉ báo cáo được giao cho tôi (cán bộ / admin)
  @IsOptional() @IsIn(['id', 'soTienThietHai', 'ngayXayRa']) sort?: string
  @IsOptional() @IsIn(['asc', 'desc']) dir?: string
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100000) pageSize?: number
}
