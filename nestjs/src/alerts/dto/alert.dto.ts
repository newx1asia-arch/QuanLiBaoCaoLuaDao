import { Transform } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { GIOI_HAN, KENH, MUC_DO, PHAM_VI, TRANG_THAI_CANH_BAO } from '../alerts.constants.js'
import { TINH_THANH } from '../../reports/reports.constants.js'

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value)

// Soạn / sửa cảnh báo (bản nháp có thể chưa đủ nội dung các kênh; đủ nội dung mới được gửi duyệt)
export class SaveAlertDto {
  @Transform(trim) @IsString() @MinLength(5, { message: 'Tiêu đề phải từ 5 ký tự' }) @MaxLength(200) tieuDe: string
  @IsIn(MUC_DO, { message: 'Mức độ không hợp lệ' }) mucDo: string
  @Transform(trim) @IsString() @MaxLength(GIOI_HAN.website) noiDung: string
  @IsOptional() @Transform(trim) @IsString() @MaxLength(GIOI_HAN.sms, { message: `Nội dung SMS tối đa ${GIOI_HAN.sms} ký tự` }) noiDungSms?: string
  @IsOptional() @Transform(trim) @IsString() @MaxLength(GIOI_HAN.ung_dung, { message: `Thông báo ứng dụng tối đa ${GIOI_HAN.ung_dung} ký tự` }) noiDungUngDung?: string
  @IsOptional() @Transform(trim) @IsString() @MaxLength(GIOI_HAN.mang_xa_hoi) noiDungMxh?: string
  @IsArray() @ArrayMinSize(1, { message: 'Chọn ít nhất một kênh phát hành' }) @ArrayUnique() @IsIn(KENH, { each: true, message: 'Kênh không hợp lệ' }) kenh: string[]
  @IsIn(PHAM_VI, { message: 'Phạm vi không hợp lệ' }) phamVi: string
  @IsOptional() @IsArray() @ArrayMaxSize(TINH_THANH.length) @ArrayUnique() @IsIn(TINH_THANH, { each: true, message: 'Tỉnh, thành không hợp lệ' }) tinhThanh?: string[]
}

export class ReviewDto {
  @IsOptional() @Transform(trim) @IsString() @MaxLength(1000) ghiChu?: string
}

export class QueryAlertDto {
  @IsOptional() @IsIn(TRANG_THAI_CANH_BAO) status?: string
}
