import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { KIEU_DOI_TUONG, MUC_DO_NGHI_VAN } from '../reports.constants.js'

// Tham số lọc / phân trang danh sách đối tượng nghi vấn (GET /suspects?level=...&page=...)
export class QuerySuspectDto {
  @IsOptional() @IsString() @MaxLength(255) keyword?: string
  @IsOptional() @IsIn(MUC_DO_NGHI_VAN) level?: string
  @IsOptional() @IsIn(KIEU_DOI_TUONG) kind?: string
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number
}
