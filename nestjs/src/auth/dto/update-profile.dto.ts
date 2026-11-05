import { Transform } from 'class-transformer'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateProfileDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Họ tên không hợp lệ' })
  @MinLength(2, { message: 'Họ tên phải từ 2 ký tự' })
  @MaxLength(100, { message: 'Họ tên tối đa 100 ký tự' })
  hoTen: string
}
