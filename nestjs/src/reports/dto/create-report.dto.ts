import { Transform, Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator'
import { LOAI, TINH_THANH } from '../reports.constants.js'

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value)

// Dữ liệu cán bộ gửi lên khi lập báo cáo mới (POST /reports)
export class CreateReportDto {
  @Transform(trim)
  @IsString({ message: 'Tiêu đề không hợp lệ' })
  @MinLength(5, { message: 'Tiêu đề phải từ 5 ký tự' })
  @MaxLength(255, { message: 'Tiêu đề tối đa 255 ký tự' })
  tieuDe: string

  @IsIn(LOAI, { message: 'Loại lừa đảo không hợp lệ' })
  loai: string

  @Transform(trim)
  @IsString({ message: 'Đối tượng lừa đảo không hợp lệ' })
  @MinLength(3, { message: 'Đối tượng lừa đảo phải từ 3 ký tự' })
  @MaxLength(255)
  doiTuong: string

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số tiền thiệt hại phải là số nguyên' })
  @Min(0, { message: 'Số tiền thiệt hại không được âm' })
  @Max(1_000_000_000_000, { message: 'Số tiền thiệt hại quá lớn, vui lòng kiểm tra lại' })
  soTienThietHai?: number

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ngày xảy ra không hợp lệ (định dạng YYYY-MM-DD)' })
  ngayXayRa: string

  // Tỉnh, thành nơi xảy ra (tùy chọn). Chuỗi rỗng coi như không chọn
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsIn(TINH_THANH, { message: 'Tỉnh, thành không hợp lệ' })
  tinhThanh?: string

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(5000, { message: 'Mô tả tối đa 5000 ký tự' })
  moTa?: string

  // Họ tên người dân trình báo: bắt buộc (cán bộ nhập hộ)
  @Transform(trim)
  @IsString({ message: 'Vui lòng nhập tên người báo cáo' })
  @MinLength(2, { message: 'Tên người báo cáo phải từ 2 ký tự' })
  @MaxLength(100)
  nguoiBaoCao: string
}
