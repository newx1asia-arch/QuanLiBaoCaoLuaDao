import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, MaxLength } from 'class-validator'

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email của tài khoản cần lấy lại mật khẩu', example: 'canbo@baocao.local', maxLength: 255 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255)
  email: string
}
