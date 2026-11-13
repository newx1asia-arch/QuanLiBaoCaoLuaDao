import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional, IsString, MaxLength } from 'class-validator'
import { CreateReportDto } from './create-report.dto.js'

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value)

// Dữ liệu người dân tự gửi qua trang công khai (POST /public/reports, không cần đăng nhập).
// Dùng lại toàn bộ quy tắc kiểm tra của CreateReportDto (tiêu đề, loại, đối tượng, số tiền, ngày, tỉnh, mô tả, tên người báo cáo)
export class CreatePublicReportDto extends CreateReportDto {
  // Số điện thoại hoặc email để cán bộ liên hệ xác minh (tùy chọn)
  @ApiPropertyOptional({ description: 'Số điện thoại hoặc email để cán bộ liên hệ xác minh. Chỉ cán bộ đăng nhập mới xem được', example: '0987654321', maxLength: 100 })
  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'Thông tin liên hệ không hợp lệ' })
  @MaxLength(100, { message: 'Thông tin liên hệ tối đa 100 ký tự' })
  lienHe?: string

  // Ô "bẫy" chống tool tự động: người thật không thấy ô này nên không bao giờ điền. Có nội dung thì coi là bot
  @ApiPropertyOptional({ description: 'Ô bẫy chống bot: LUÔN ĐỂ TRỐNG. Có nội dung thì báo cáo bị bỏ qua mà vẫn trả thành công giả', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string
}
