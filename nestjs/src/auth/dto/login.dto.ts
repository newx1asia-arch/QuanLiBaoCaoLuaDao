import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ description: 'Email đăng nhập (tự bỏ khoảng trắng và đổi sang chữ thường)', example: 'admin@baocao.local', maxLength: 255 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsString({ message: 'Vui lòng nhập email' })
  @MinLength(1, { message: 'Vui lòng nhập email' })
  @MaxLength(255)
  email: string

  @ApiProperty({ description: 'Mật khẩu', example: 'MatKhau123', maxLength: 128 })
  @IsString({ message: 'Vui lòng nhập mật khẩu' })
  @MinLength(1, { message: 'Vui lòng nhập mật khẩu' })
  @MaxLength(128)
  matKhau: string
}
