import { Body, Controller, Ip, Post } from '@nestjs/common'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger'
import { ReportsService } from './reports.service.js'
import { CreatePublicReportDto } from './dto/create-public-report.dto.js'
import { Public } from '../auth/decorators.js'
import { ApiConflict, ApiRateLimited } from '../common/swagger.js'

class PublicReportReceiptDto {
  @ApiProperty({ description: 'Mã tiếp nhận', example: 128 }) id: number
  @ApiProperty({ description: 'Thời điểm tiếp nhận', example: '2026-11-10T04:15:00.000Z' }) ngayTao: string
}

// API công khai cho người dân: không cần đăng nhập, CHỈ cho gửi báo cáo mới.
// Không có API xem / sửa / xóa / liệt kê báo cáo nào mở cho khách; kết quả trả về chỉ gồm mã tiếp nhận
@ApiTags('Báo cáo công khai')
@Controller('public/reports')
export class PublicReportsController {
  constructor(private readonly service: ReportsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Người dân gửi báo cáo lừa đảo', description: 'Không cần đăng nhập. Báo cáo vào hàng đợi "Chờ xử lý", cán bộ xác minh sau. Chỉ trả về mã tiếp nhận. Có giới hạn số lần gửi theo IP.' })
  @ApiCreatedResponse({ description: 'Đã tiếp nhận', type: PublicReportReceiptDto })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ' })
  @ApiConflict('Trường hợp này đã được tiếp nhận trước đó')
  @ApiRateLimited()
  create(@Body() dto: CreatePublicReportDto, @Ip() ip: string) {
    return this.service.createPublic(dto, ip)
  }
}
