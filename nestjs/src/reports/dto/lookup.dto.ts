import { Transform } from 'class-transformer'
import { IsString, MaxLength, MinLength } from 'class-validator'

// Tra cứu một SĐT / số tài khoản / link xem đã bị báo cáo lừa đảo chưa (GET /lookup?q=...)
export class LookupDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Vui lòng nhập số điện thoại, số tài khoản hoặc link cần tra cứu' })
  @MinLength(3, { message: 'Nhập ít nhất 3 ký tự để tra cứu' })
  @MaxLength(255)
  q: string
}
