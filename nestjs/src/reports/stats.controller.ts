import { Controller, Get, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ReportsService } from './reports.service.js'
import { StatisticsService } from './statistics.service.js'
import { QueryOverviewDto } from './dto/query-overview.dto.js'
import { Roles } from '../auth/decorators.js'
import { ApiLogin } from '../common/swagger.js'

@ApiTags('Thống kê')
@ApiLogin()
@Controller('stats')
@Roles('can_bo', 'admin')
export class StatsController {
  constructor(
    private readonly service: ReportsService,
    private readonly statistics: StatisticsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Số liệu nhanh cho bảng điều hành', description: 'Số báo cáo chờ xử lý, báo cáo cần xử lý gấp, số đối tượng nghi vấn... (dùng cho các huy hiệu trên menu).' })
  @ApiOkResponse({ description: 'Các chỉ số tổng quan' })
  stats() {
    return this.service.stats()
  }

  // Số liệu cho trang Thống kê và Bản đồ điểm nóng: ?days=7|30|90|180|365&type=gia_danh
  @Get('overview')
  @ApiOperation({ summary: 'Số liệu cho trang Thống kê và Bản đồ điểm nóng', description: 'Theo khoảng thời gian (7, 30, 90, 180 hoặc 365 ngày gần nhất, mặc định 30) và có thể lọc theo hình thức lừa đảo.' })
  @ApiOkResponse({ description: 'Số liệu tổng hợp theo thời gian, loại lừa đảo và địa bàn' })
  overview(@Query() q: QueryOverviewDto) {
    return this.statistics.overview(q.days ?? 30, q.type)
  }
}
