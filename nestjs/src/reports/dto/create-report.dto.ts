import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator'
import { LOAI, TINH_THANH } from '../reports.constants.js'
import { MO_TA_LOAI, MO_TA_TINH } from '../../common/swagger.js'

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value)

// Tên người: gộp khoảng trắng liên tiếp thành một và chuẩn hóa dạng chữ có dấu (NFC), để "Nguyễn  Văn A" và "Nguyễn Văn A"
// (hoặc cùng tên gõ bằng hai kiểu mã hóa dấu tiếng Việt) được coi là MỘT người. Nếu không, một người nhập nhiều báo cáo
// chỉ cần đổi khoảng trắng là được tính thành nhiều người và tự dựng được cảnh báo "nguy hiểm"
const chuanHoaTen = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.normalize('NFC').replace(/\s+/g, ' ').trim() : value)

// Dữ liệu cán bộ gửi lên khi lập báo cáo mới (POST /reports)
export class CreateReportDto {
  @ApiProperty({ description: 'Tiêu đề ngắn gọn của vụ việc', example: 'Giả danh công an yêu cầu chuyển tiền', minLength: 5, maxLength: 255 })
  @Transform(trim)
  @IsString({ message: 'Tiêu đề không hợp lệ' })
  @MinLength(5, { message: 'Tiêu đề phải từ 5 ký tự' })
  @MaxLength(255, { message: 'Tiêu đề tối đa 255 ký tự' })
  tieuDe: string

  @ApiProperty({ description: MO_TA_LOAI, enum: [...LOAI], example: 'gia_danh' })
  @IsIn(LOAI, { message: 'Loại lừa đảo không hợp lệ' })
  loai: string

  @ApiProperty({ description: 'Số điện thoại, số tài khoản hoặc đường link của đối tượng. Hệ thống tự chuẩn hóa để phát hiện báo cáo trùng (+84912345678 và 0912345678 là một)', example: '0912345678', minLength: 3, maxLength: 255 })
  @Transform(trim)
  @IsString({ message: 'Đối tượng lừa đảo không hợp lệ' })
  @MinLength(3, { message: 'Đối tượng lừa đảo phải từ 3 ký tự' })
  @MaxLength(255)
  doiTuong: string

  @ApiPropertyOptional({ description: 'Số tiền thiệt hại (đồng). Quyết định mức ưu tiên: từ 50 triệu là cao, từ 10 triệu là trung bình, còn lại là thấp', example: 25000000, minimum: 0, maximum: 1_000_000_000_000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số tiền thiệt hại phải là số nguyên' })
  @Min(0, { message: 'Số tiền thiệt hại không được âm' })
  @Max(1_000_000_000_000, { message: 'Số tiền thiệt hại quá lớn, vui lòng kiểm tra lại' })
  soTienThietHai?: number

  @ApiProperty({ description: 'Ngày xảy ra vụ việc, định dạng YYYY-MM-DD (không ở tương lai, không trước năm 2000)', example: '2026-11-05', pattern: '^\\d{4}-\\d{2}-\\d{2}$' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ngày xảy ra không hợp lệ (định dạng YYYY-MM-DD)' })
  ngayXayRa: string

  // Tỉnh, thành nơi xảy ra (tùy chọn). Chuỗi rỗng coi như không chọn
  @ApiPropertyOptional({ description: MO_TA_TINH, enum: [...TINH_THANH], example: 'ha_noi' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsIn(TINH_THANH, { message: 'Tỉnh, thành không hợp lệ' })
  tinhThanh?: string

  @ApiPropertyOptional({ description: 'Mô tả diễn biến vụ việc', example: 'Đối tượng gọi điện tự xưng là công an quận, yêu cầu chuyển tiền để xác minh tài khoản.', maxLength: 5000 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(5000, { message: 'Mô tả tối đa 5000 ký tự' })
  moTa?: string

  // Họ tên người dân trình báo: bắt buộc (cán bộ nhập hộ)
  @ApiProperty({ description: 'Họ tên người dân trình báo (cán bộ nhập hộ)', example: 'Nguyễn Văn An', minLength: 2, maxLength: 100 })
  @Transform(chuanHoaTen)
  @IsString({ message: 'Vui lòng nhập tên người báo cáo' })
  @MinLength(2, { message: 'Tên người báo cáo phải từ 2 ký tự' })
  @MaxLength(100)
  nguoiBaoCao: string
}
