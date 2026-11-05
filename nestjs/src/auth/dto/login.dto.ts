import { Transform } from 'class-transformer'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsString({ message: 'Vui lòng nhập email' })
  @MinLength(1, { message: 'Vui lòng nhập email' })
  @MaxLength(255)
  email: string

  @IsString({ message: 'Vui lòng nhập mật khẩu' })
  @MinLength(1, { message: 'Vui lòng nhập mật khẩu' })
  @MaxLength(128)
  matKhau: string
}
