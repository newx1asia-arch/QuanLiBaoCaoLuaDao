import { ApiProperty } from '@nestjs/swagger'
import { KIEU_DOI_TUONG, LOAI, TRANG_THAI } from '../reports.constants.js'
import { MO_TA_LOAI, MO_TA_TRANG_THAI } from '../../common/swagger.js'

// Các mẫu kết quả trả về của API Tra cứu và Đối tượng nghi vấn, chỉ dùng để hiển thị trên Swagger.
// Không ảnh hưởng đến cách API xử lý và trả dữ liệu.

const MO_TA_MUC_DO = 'Mức độ: chua_co (chưa ai báo cáo), can_than (đã bị báo cáo), nguy_hiem (đã được xác nhận hoặc từ 3 người khác nhau báo cáo)'

// Số báo cáo theo từng hình thức lừa đảo
export class LoaiCountDto {
  @ApiProperty({ description: MO_TA_LOAI, enum: [...LOAI], example: 'gia_danh' }) loai: string
  @ApiProperty({ description: 'Số báo cáo thuộc hình thức này', example: 3 }) soLan: number
}

// GET /lookup
export class LookupResponseDto {
  @ApiProperty({ description: 'Nội dung đã nhập để tra cứu', example: '0912345678' }) q: string
  @ApiProperty({ description: MO_TA_MUC_DO, enum: ['chua_co', 'can_than', 'nguy_hiem'], example: 'nguy_hiem' }) mucDo: string
  @ApiProperty({ description: 'Số báo cáo (không tính báo cáo đã bị từ chối)', example: 4 }) soBaoCao: number
  @ApiProperty({ description: 'Số báo cáo đã được cán bộ xác nhận', example: 1 }) daXacNhan: number
  @ApiProperty({ description: 'Tổng thiệt hại (đồng)', example: 95000000 }) tongThietHai: number
  @ApiProperty({ description: 'Thống kê theo hình thức lừa đảo, nhiều nhất trước', type: [LoaiCountDto] }) loai: LoaiCountDto[]
  @ApiProperty({ description: 'Ngày xảy ra gần nhất (YYYY-MM-DD), null nếu chưa có báo cáo', type: String, format: 'date', nullable: true, example: '2026-11-05' }) baoCaoGanNhat: string | null
}

// Số liệu tổng hợp của một đối tượng
export class SuspectSummaryDto {
  @ApiProperty({ description: 'Khóa đã chuẩn hóa của đối tượng', example: '0912345678' }) key: string
  @ApiProperty({ description: 'Loại đối tượng: sdt, tai_khoan hoặc link', enum: [...KIEU_DOI_TUONG], example: 'sdt' }) kieu: string
  @ApiProperty({ description: MO_TA_MUC_DO, enum: ['can_than', 'nguy_hiem'], example: 'nguy_hiem' }) mucDo: string
  @ApiProperty({ description: 'Số báo cáo (không tính báo cáo bị từ chối)', example: 4 }) soBaoCao: number
  @ApiProperty({ description: 'Số người báo cáo khác nhau', example: 3 }) soNguoiBaoCao: number
  @ApiProperty({ description: 'Số báo cáo đã xác nhận', example: 1 }) daXacNhan: number
  @ApiProperty({ description: 'Số báo cáo còn đang xử lý (chờ xử lý hoặc đang xác minh)', example: 2 }) dangXuLy: number
  @ApiProperty({ description: 'Tổng thiệt hại (đồng)', example: 95000000 }) thietHai: number
  @ApiProperty({ description: 'Ngày xảy ra gần nhất (YYYY-MM-DD)', type: String, format: 'date', nullable: true, example: '2026-11-05' }) baoCaoGanNhat: string | null
}

// Một dòng trong GET /suspects
export class SuspectItemDto extends SuspectSummaryDto {
  @ApiProperty({ description: 'SĐT, số tài khoản hoặc link, đúng như báo cáo mới nhất ghi', example: '0912 345 678' }) doiTuong: string
  @ApiProperty({ description: 'Cơ cấu theo hình thức lừa đảo, nhiều nhất trước', type: [LoaiCountDto] }) loai: LoaiCountDto[]
  @ApiProperty({ description: 'Thời điểm tiếp nhận báo cáo đầu tiên', example: '2026-10-20T03:00:00.000Z' }) lanDau: string
}

export class SuspectCountsDto {
  @ApiProperty({ description: 'Tất cả đối tượng khớp bộ lọc (trừ mức độ)', example: 12 }) all: number
  @ApiProperty({ example: 4 }) nguy_hiem: number
  @ApiProperty({ example: 8 }) can_than: number
}

// GET /suspects
export class SuspectListResponseDto {
  @ApiProperty({ description: 'Các đối tượng của trang hiện tại', type: [SuspectItemDto] }) items: SuspectItemDto[]
  @ApiProperty({ description: 'Tổng số đối tượng khớp bộ lọc (dùng để chia trang)', example: 12 }) total: number
  @ApiProperty({ description: 'Số đối tượng theo mức độ, để hiện số trên các tab', type: SuspectCountsDto }) counts: SuspectCountsDto
  @ApiProperty({ description: 'Tổng thiệt hại của các đối tượng khớp bộ lọc (đồng)', example: 540000000 }) tongThietHai: number
}

// Số liệu tổng hợp trong hồ sơ một đối tượng
export class SuspectOverviewDto extends SuspectSummaryDto {
  @ApiProperty({ description: 'SĐT, số tài khoản hoặc link, đúng như báo cáo mới nhất ghi', example: '0912 345 678' }) doiTuong: string
  @ApiProperty({ description: 'Cơ cấu theo hình thức lừa đảo, nhiều nhất trước', type: [LoaiCountDto] }) loai: LoaiCountDto[]
  @ApiProperty({ description: 'Thời điểm tiếp nhận báo cáo đầu tiên', example: '2026-10-20T03:00:00.000Z' }) lanDau: string
}

// Một báo cáo liên quan trong hồ sơ đối tượng
export class SuspectReportDto {
  @ApiProperty({ example: 1 }) id: number
  @ApiProperty({ example: 'Giả danh công an yêu cầu chuyển tiền' }) tieuDe: string
  @ApiProperty({ description: MO_TA_LOAI, enum: [...LOAI], example: 'gia_danh' }) loai: string
  @ApiProperty({ description: MO_TA_TRANG_THAI, enum: [...TRANG_THAI], example: 'cho_xu_ly' }) trangThai: string
  @ApiProperty({ description: 'Số tiền thiệt hại (đồng)', example: 25000000 }) soTienThietHai: number
  @ApiProperty({ description: 'Ngày xảy ra (YYYY-MM-DD)', example: '2026-11-05', format: 'date' }) ngayXayRa: string
  @ApiProperty({ description: 'Thời điểm tiếp nhận', example: '2026-11-10T04:15:00.000Z' }) ngayTao: string
  @ApiProperty({ description: 'Tên cán bộ phụ trách', example: 'Trần Thị Bích' }) canBo: string
}

// GET /suspects/detail
export class SuspectDetailResponseDto {
  @ApiProperty({ description: 'Khóa đã chuẩn hóa của đối tượng', example: '0912345678' }) key: string
  @ApiProperty({ description: 'Tên hiển thị (theo báo cáo mới nhất, hoặc đúng như đã nhập nếu chưa có báo cáo)', example: '0912 345 678' }) doiTuong: string
  @ApiProperty({ description: 'Số liệu tổng hợp. null nếu đối tượng chưa có báo cáo nào hoặc mọi báo cáo đều bị từ chối', type: SuspectOverviewDto, nullable: true }) tongHop: SuspectOverviewDto | null
  @ApiProperty({ description: 'Các báo cáo liên quan, mới nhất trước, kể cả báo cáo đã bị từ chối (xem trangThai)', type: [SuspectReportDto] }) baoCao: SuspectReportDto[]
}
