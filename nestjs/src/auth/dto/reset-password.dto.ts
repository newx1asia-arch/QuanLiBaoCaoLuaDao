import { IsString, Matches } from 'class-validator'
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../auth.constants.js'

export class ResetPasswordDto {
  @IsString({ message: PASSWORD_MESSAGE })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  matKhau: string
}
