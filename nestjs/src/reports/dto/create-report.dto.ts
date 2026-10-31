import { Type } from 'class-transformer'
import { IsDateString, IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator'
import { LOAI } from '../reports.constants.js'

// Dữ liệu client gửi lên khi tạo báo cáo mới (POST /reports)
export class CreateReportDto {
  @IsString({ message: 'Tiêu đề không hợp lệ' })
  @MinLength(5, { message: 'Tiêu đề phải từ 5 ký tự' })
  @MaxLength(255, { message: 'Tiêu đề tối đa 255 ký tự' })
  tieuDe: string

  @IsIn(LOAI, { message: 'Loại lừa đảo không hợp lệ' })
  loai: string

  @IsString({ message: 'Đối tượng lừa đảo không hợp lệ' })
  @MinLength(3, { message: 'Đối tượng lừa đảo phải từ 3 ký tự' })
  @MaxLength(255)
  doiTuong: string

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số tiền thiệt hại phải là số nguyên' })
  @Min(0, { message: 'Số tiền thiệt hại không được âm' })
  soTienThietHai?: number

  @IsDateString({}, { message: 'Ngày xảy ra không hợp lệ (định dạng YYYY-MM-DD)' })
  ngayXayRa: string

  @IsOptional()
  @IsString()
  moTa?: string

  // Người dân: bỏ qua, server tự lấy theo tài khoản. Cán bộ nhập hộ: bắt buộc
  @IsOptional()
  @IsString({ message: 'Người báo cáo không hợp lệ' })
  @MinLength(2, { message: 'Tên người báo cáo phải từ 2 ký tự' })
  @MaxLength(100)
  nguoiBaoCao?: string
}
