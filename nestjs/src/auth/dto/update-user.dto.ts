import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsIn, IsOptional } from 'class-validator'
import { VAI_TRO } from '../auth.constants.js'

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Đổi vai trò (không gửi = giữ nguyên)', enum: [...VAI_TRO] })
  @IsOptional()
  @IsIn(VAI_TRO, { message: 'Vai trò không hợp lệ' })
  vaiTro?: string

  @ApiPropertyOptional({ description: 'true = đang hoạt động, false = khóa tài khoản (không gửi = giữ nguyên)' })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái không hợp lệ' })
  hoatDong?: boolean
}
