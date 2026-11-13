import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { VAI_TRO } from '../auth.constants.js'

export class QueryUserDto {
  @ApiPropertyOptional({ description: 'Tìm theo họ tên hoặc email', maxLength: 255 })
  @IsOptional() @IsString() @MaxLength(255) keyword?: string

  @ApiPropertyOptional({ description: 'Lọc theo vai trò', enum: [...VAI_TRO] })
  @IsOptional() @IsIn(VAI_TRO) role?: string

  @ApiPropertyOptional({ description: 'Trang thứ mấy (bắt đầu từ 1)', default: 1, minimum: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number

  @ApiPropertyOptional({ description: 'Số dòng mỗi trang', default: 10, minimum: 1, maximum: 100 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number
}
