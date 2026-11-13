import { ApiProperty } from '@nestjs/swagger'
import { KENH, LOAI, TINH_THANH, TRANG_THAI, UU_TIEN } from '../reports.constants.js'
import { MO_TA_LOAI, MO_TA_TINH, MO_TA_TRANG_THAI } from '../../common/swagger.js'

// Các mẫu kết quả trả về của API Báo cáo, chỉ dùng để hiển thị trên Swagger (mục Schemas và ví dụ kết quả).
// Không ảnh hưởng đến cách API xử lý và trả dữ liệu.

// Một dòng trong lịch sử xử lý báo cáo
export class ReportHistoryDto {
  @ApiProperty({ example: 12 }) id: number
  @ApiProperty({ description: 'Nội dung thao tác', example: 'Đổi trạng thái: Chờ xử lý → Đang xác minh' }) noiDung: string
  @ApiProperty({ description: 'Tên người thao tác tại thời điểm đó', example: 'Trần Thị Bích' }) nguoi: string
  @ApiProperty({ description: 'Id tài khoản thao tác (null = hệ thống hoặc người dân gửi trực tuyến)', type: Number, nullable: true, example: 2 }) nguoiId: number | null
  @ApiProperty({ example: '2026-11-10T04:15:00.000Z' }) time: string
}

// Các trường lưu trong CSDL của một báo cáo
export class ReportRecordDto {
  @ApiProperty({ example: 1 }) id: number
  @ApiProperty({ example: 'Giả danh công an yêu cầu chuyển tiền' }) tieuDe: string
  @ApiProperty({ description: MO_TA_LOAI, enum: [...LOAI], example: 'gia_danh' }) loai: string
  @ApiProperty({ description: 'SĐT, số tài khoản hoặc link của đối tượng, đúng như lúc nhập', example: '0912 345 678' }) doiTuong: string
  @ApiProperty({ description: 'Bản chuẩn hóa của đối tượng, dùng để phát hiện báo cáo trùng', example: '0912345678' }) doiTuongKey: string
  @ApiProperty({ description: 'Số tiền thiệt hại (đồng)', example: 25000000 }) soTienThietHai: number
  @ApiProperty({ description: 'Ngày xảy ra vụ việc (YYYY-MM-DD)', example: '2026-11-05', format: 'date' }) ngayXayRa: string
  @ApiProperty({ description: `${MO_TA_TINH}. null = chưa ghi địa bàn`, enum: [...TINH_THANH], nullable: true, example: 'ha_noi' }) tinhThanh: string | null
  @ApiProperty({ description: 'Mô tả diễn biến vụ việc', type: String, nullable: true, example: 'Đối tượng gọi điện tự xưng là công an quận, yêu cầu chuyển tiền để xác minh tài khoản.' }) moTa: string | null
  @ApiProperty({ description: 'Họ tên người dân trình báo', example: 'Nguyễn Văn An' }) nguoiBaoCao: string
  @ApiProperty({ description: MO_TA_TRANG_THAI, enum: [...TRANG_THAI], example: 'cho_xu_ly' }) trangThai: string
  @ApiProperty({ description: 'Kênh tiếp nhận: can_bo (cán bộ nhập hộ) hoặc nguoi_dan (người dân tự gửi trực tuyến)', enum: [...KENH], example: 'can_bo' }) kenh: string
  @ApiProperty({ description: 'SĐT hoặc email người dân để lại (chỉ có ở báo cáo người dân tự gửi)', type: String, nullable: true, example: '0987654321' }) lienHe: string | null
  @ApiProperty({ description: 'Tên cán bộ phụ trách để hiển thị (Chưa phân công nếu chưa ai nhận)', example: 'Trần Thị Bích' }) canBo: string
  @ApiProperty({ description: 'Id cán bộ đang phụ trách (null = chưa ai nhận)', type: Number, nullable: true, example: 2 }) canBoId: number | null
  @ApiProperty({ description: 'Id cán bộ đã nhập báo cáo (null với báo cáo người dân gửi hoặc dữ liệu mẫu)', type: Number, nullable: true, example: 2 }) nguoiTaoId: number | null
  @ApiProperty({ description: 'Số phiên bản, tăng 1 sau mỗi lần sửa. Gửi lại khi PATCH để không ghi đè lên người khác', example: 3 }) phienBan: number
  @ApiProperty({ description: 'Thời điểm xóa mềm. Báo cáo đã xóa không được trả về nên luôn là null', type: String, format: 'date-time', nullable: true, example: null }) xoaLuc: string | null
  @ApiProperty({ description: 'Thời điểm tiếp nhận', example: '2026-11-10T04:15:00.000Z' }) ngayTao: string
}

// Báo cáo kèm mức ưu tiên tự tính theo số tiền thiệt hại
export class ReportItemDto extends ReportRecordDto {
  @ApiProperty({ description: 'Mức ưu tiên: từ 50 triệu là cao, từ 10 triệu là trung bình, còn lại là thấp', enum: [...UU_TIEN], example: 'trung_binh' }) uuTien: string
}

// Chi tiết một báo cáo (GET /reports/:id, và kết quả của POST, PATCH)
export class ReportDetailDto extends ReportItemDto {
  @ApiProperty({ description: 'Lịch sử xử lý, cũ nhất trước', type: [ReportHistoryDto] }) lichSu: ReportHistoryDto[]
  @ApiProperty({ description: 'Các báo cáo khác cùng đối tượng', type: [ReportRecordDto] }) lienQuan: ReportRecordDto[]
  @ApiProperty({ description: 'Tổng số báo cáo cùng đối tượng, tính cả báo cáo này', example: 2 }) soBaoCaoCungDoiTuong: number
}

// Một trang danh sách báo cáo (GET /reports)
export class ReportListResponseDto {
  @ApiProperty({ description: 'Các báo cáo của trang hiện tại', type: [ReportItemDto] }) items: ReportItemDto[]
  @ApiProperty({ description: 'Tổng số báo cáo khớp bộ lọc (dùng để chia trang)', example: 42 }) total: number
  @ApiProperty({
    description: 'Số báo cáo theo từng trạng thái (áp dụng các bộ lọc khác, trừ trạng thái), để hiện số trên các tab. `all` là tổng; trạng thái chưa có báo cáo nào thì không xuất hiện',
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { all: 42, cho_xu_ly: 20, dang_xac_minh: 12, da_xac_nhan: 8, tu_choi: 2 },
  })
  counts: Record<string, number>
}

export class DeletedResponseDto {
  @ApiProperty({ example: true }) deleted: boolean
}
