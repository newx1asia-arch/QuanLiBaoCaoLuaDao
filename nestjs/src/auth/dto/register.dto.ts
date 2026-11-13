import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../auth.constants.js'

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value)
const normalizeEmail = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)

export class RegisterDto {
  @ApiProperty({ description: 'Họ và tên cán bộ', example: 'Trần Thị Bích', minLength: 2, maxLength: 100 })
  @Transform(trim)
  @IsString({ message: 'Họ tên không hợp lệ' })
  @MinLength(2, { message: 'Họ tên phải từ 2 ký tự' })
  @MaxLength(100, { message: 'Họ tên tối đa 100 ký tự' })
  hoTen: string

  @ApiProperty({ description: 'Email đăng nhập (không trùng tài khoản khác)', example: 'canbo2@baocao.local', maxLength: 255 })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255)
  email: string

  @ApiProperty({ description: 'Mật khẩu: từ 8 ký tự, gồm cả chữ và số', example: 'MatKhau123', minLength: 8, maxLength: 128 })
  @IsString({ message: PASSWORD_MESSAGE })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  matKhau: string
}
