import { IsIn } from 'class-validator'
import { VAI_TRO } from '../auth.constants.js'
import { RegisterDto } from './register.dto.js'

// Admin tạo tài khoản (thường là cán bộ), được chọn vai trò
export class CreateUserDto extends RegisterDto {
  @IsIn(VAI_TRO, { message: 'Vai trò không hợp lệ' })
  vaiTro: string
}
