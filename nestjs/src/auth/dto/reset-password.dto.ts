import { ApiProperty } from '@nestjs/swagger'
import { IsString, Matches } from 'class-validator'
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../auth.constants.js'

export class ResetPasswordDto {
  @ApiProperty({ description: 'Mật khẩu mới do quản trị viên đặt: từ 8 ký tự, gồm cả chữ và số', example: 'MatKhauMoi123', minLength: 8, maxLength: 128 })
  @IsString({ message: PASSWORD_MESSAGE })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  matKhau: string
}
