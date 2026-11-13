import { ApiProperty } from '@nestjs/swagger'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../auth.constants.js'

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mật khẩu hiện tại', example: 'MatKhauCu123', maxLength: 128 })
  @IsString({ message: 'Vui lòng nhập mật khẩu hiện tại' })
  @MinLength(1, { message: 'Vui lòng nhập mật khẩu hiện tại' })
  @MaxLength(128)
  matKhauCu: string

  @ApiProperty({ description: 'Mật khẩu mới: từ 8 ký tự, gồm cả chữ và số, phải khác mật khẩu hiện tại', example: 'MatKhauMoi123', minLength: 8, maxLength: 128 })
  @IsString({ message: PASSWORD_MESSAGE })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  matKhauMoi: string
}
