import { IsBoolean, IsIn, IsOptional } from 'class-validator'
import { VAI_TRO } from '../auth.constants.js'

export class UpdateUserDto {
  @IsOptional()
  @IsIn(VAI_TRO, { message: 'Vai trò không hợp lệ' })
  vaiTro?: string

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái không hợp lệ' })
  hoatDong?: boolean
}
