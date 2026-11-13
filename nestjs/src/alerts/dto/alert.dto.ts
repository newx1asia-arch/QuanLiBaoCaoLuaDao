import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { GIOI_HAN, KENH, MUC_DO, PHAM_VI, TRANG_THAI_CANH_BAO } from '../alerts.constants.js'
import { TINH_THANH } from '../../reports/reports.constants.js'

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value)

// Soạn / sửa cảnh báo (bản nháp có thể chưa đủ nội dung các kênh; đủ nội dung mới được gửi duyệt)
export class SaveAlertDto {
  @ApiProperty({ description: 'Tiêu đề cảnh báo', example: 'Cảnh báo giả mạo cơ quan công an gọi điện yêu cầu chuyển tiền', minLength: 5, maxLength: 200 })
  @Transform(trim) @IsString() @MinLength(5, { message: 'Tiêu đề phải từ 5 ký tự' }) @MaxLength(200) tieuDe: string
  @ApiProperty({ description: 'Mức độ: thong_tin (thông tin), canh_bao (cảnh báo), khan_cap (khẩn cấp)', enum: [...MUC_DO], example: 'canh_bao' })
  @IsIn(MUC_DO, { message: 'Mức độ không hợp lệ' }) mucDo: string
  @ApiProperty({ description: `Nội dung đăng trên website (tối đa ${GIOI_HAN.website} ký tự)`, maxLength: GIOI_HAN.website })
  @Transform(trim) @IsString() @MaxLength(GIOI_HAN.website) noiDung: string
  @ApiPropertyOptional({ description: `Nội dung tin nhắn SMS (tối đa ${GIOI_HAN.sms} ký tự). Bắt buộc nếu chọn kênh sms khi gửi duyệt`, maxLength: GIOI_HAN.sms })
  @IsOptional() @Transform(trim) @IsString() @MaxLength(GIOI_HAN.sms, { message: `Nội dung SMS tối đa ${GIOI_HAN.sms} ký tự` }) noiDungSms?: string
  @ApiPropertyOptional({ description: `Nội dung thông báo ứng dụng (tối đa ${GIOI_HAN.ung_dung} ký tự)`, maxLength: GIOI_HAN.ung_dung })
  @IsOptional() @Transform(trim) @IsString() @MaxLength(GIOI_HAN.ung_dung, { message: `Thông báo ứng dụng tối đa ${GIOI_HAN.ung_dung} ký tự` }) noiDungUngDung?: string
  @ApiPropertyOptional({ description: `Nội dung đăng mạng xã hội (tối đa ${GIOI_HAN.mang_xa_hoi} ký tự)`, maxLength: GIOI_HAN.mang_xa_hoi })
  @IsOptional() @Transform(trim) @IsString() @MaxLength(GIOI_HAN.mang_xa_hoi) noiDungMxh?: string
  @ApiProperty({ description: 'Các kênh phát hành (chọn ít nhất một): website, sms, ung_dung, mang_xa_hoi', enum: [...KENH], isArray: true, example: ['website', 'sms'] })
  @IsArray() @ArrayMinSize(1, { message: 'Chọn ít nhất một kênh phát hành' }) @ArrayUnique() @IsIn(KENH, { each: true, message: 'Kênh không hợp lệ' }) kenh: string[]
  @ApiProperty({ description: 'Phạm vi: toan_quoc (cả nước) hoặc dia_ban (chỉ một số tỉnh, thành, khai báo ở tinhThanh)', enum: [...PHAM_VI], example: 'toan_quoc' })
  @IsIn(PHAM_VI, { message: 'Phạm vi không hợp lệ' }) phamVi: string
  @ApiPropertyOptional({ description: 'Danh sách tỉnh, thành áp dụng (dùng khi phamVi = dia_ban)', enum: [...TINH_THANH], isArray: true, example: ['ha_noi', 'tp_hcm'] })
  @IsOptional() @IsArray() @ArrayMaxSize(TINH_THANH.length) @ArrayUnique() @IsIn(TINH_THANH, { each: true, message: 'Tỉnh, thành không hợp lệ' }) tinhThanh?: string[]
}

export class ReviewDto {
  @ApiPropertyOptional({ description: 'Ghi chú / lý do (nên ghi rõ khi từ chối hoặc thu hồi)', example: 'Nội dung chưa chính xác, cần bổ sung nguồn.', maxLength: 1000 })
  @IsOptional() @Transform(trim) @IsString() @MaxLength(1000) ghiChu?: string
}

export class QueryAlertDto {
  @ApiPropertyOptional({ description: 'Lọc theo trạng thái: nhap, cho_duyet, da_duyet, tu_choi, da_phat_hanh, da_thu_hoi', enum: [...TRANG_THAI_CANH_BAO] })
  @IsOptional() @IsIn(TRANG_THAI_CANH_BAO) status?: string
}
