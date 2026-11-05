import { Transform } from 'class-transformer'
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../auth.constants.js'

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value)
const normalizeEmail = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)

export class RegisterDto {
  @Transform(trim)
  @IsString({ message: 'Họ tên không hợp lệ' })
  @MinLength(2, { message: 'Họ tên phải từ 2 ký tự' })
  @MaxLength(100, { message: 'Họ tên tối đa 100 ký tự' })
  hoTen: string

  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255)
  email: string

  @IsString({ message: PASSWORD_MESSAGE })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  matKhau: string
}
