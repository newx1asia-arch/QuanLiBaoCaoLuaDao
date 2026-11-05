import { IsString, Matches, MaxLength, MinLength } from 'class-validator'
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../auth.constants.js'

export class ChangePasswordDto {
  @IsString({ message: 'Vui lòng nhập mật khẩu hiện tại' })
  @MinLength(1, { message: 'Vui lòng nhập mật khẩu hiện tại' })
  @MaxLength(128)
  matKhauCu: string

  @IsString({ message: PASSWORD_MESSAGE })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  matKhauMoi: string
}
