import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { KIEU_DOI_TUONG, MUC_DO_NGHI_VAN } from '../reports.constants.js'

// Tham số lọc / phân trang danh sách đối tượng nghi vấn (GET /suspects?level=...&page=...)
export class QuerySuspectDto {
  @ApiPropertyOptional({ description: 'Tìm theo SĐT, số tài khoản hoặc link', maxLength: 255 })
  @IsOptional() @IsString() @MaxLength(255) keyword?: string
  @ApiPropertyOptional({ description: 'Mức độ: nguy_hiem (đã xác nhận hoặc từ 3 người khác nhau báo cáo) hoặc can_than', enum: [...MUC_DO_NGHI_VAN] })
  @IsOptional() @IsIn(MUC_DO_NGHI_VAN) level?: string
  @ApiPropertyOptional({ description: 'Loại đối tượng: sdt (số điện thoại), tai_khoan (số tài khoản), link (đường dẫn)', enum: [...KIEU_DOI_TUONG] })
  @IsOptional() @IsIn(KIEU_DOI_TUONG) kind?: string
  @ApiPropertyOptional({ description: 'Trang thứ mấy (bắt đầu từ 1)', default: 1, minimum: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number
  @ApiPropertyOptional({ description: 'Số dòng mỗi trang', minimum: 1, maximum: 100 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number
}
