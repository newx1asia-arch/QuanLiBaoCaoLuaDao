import { Transform } from 'class-transformer'
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator'
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../auth.constants.js'

// Bước 2 của quên mật khẩu: email + mã 6 số nhận được + mật khẩu mới
export class ResetWithCodeDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255)
  email: string

  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\s/g, '') : value))
  @IsString({ message: 'Mã xác nhận gồm 6 chữ số' })
  @Matches(/^\d{6}$/, { message: 'Mã xác nhận gồm 6 chữ số' })
  ma: string

  @IsString({ message: PASSWORD_MESSAGE })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  matKhauMoi: string
}
