import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator'
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../auth.constants.js'

// Bước 2 của quên mật khẩu: email + mã 6 số nhận được + mật khẩu mới
export class ResetWithCodeDto {
  @ApiProperty({ description: 'Email đã dùng ở bước xin mã', example: 'canbo@baocao.local', maxLength: 255 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255)
  email: string

  @ApiProperty({ description: 'Mã xác nhận 6 chữ số nhận qua email (hiệu lực 15 phút, sai quá số lần cho phép sẽ bị khóa mã)', example: '123456', pattern: '^\\d{6}$' })
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\s/g, '') : value))
  @IsString({ message: 'Mã xác nhận gồm 6 chữ số' })
  @Matches(/^\d{6}$/, { message: 'Mã xác nhận gồm 6 chữ số' })
  ma: string

  @ApiProperty({ description: 'Mật khẩu mới: từ 8 ký tự, gồm cả chữ và số', example: 'MatKhauMoi123', minLength: 8, maxLength: 128 })
  @IsString({ message: PASSWORD_MESSAGE })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  matKhauMoi: string
}
