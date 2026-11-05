import { Controller, Get, Query } from '@nestjs/common'
import { ReportsService } from './reports.service.js'
import { StatisticsService } from './statistics.service.js'
import { QueryOverviewDto } from './dto/query-overview.dto.js'
import { Roles } from '../auth/decorators.js'

@Controller('stats')
@Roles('can_bo', 'admin')
export class StatsController {
  constructor(
    private readonly service: ReportsService,
    private readonly statistics: StatisticsService,
  ) {}

  @Get()
  stats() {
    return this.service.stats()
  }

  // Số liệu cho trang Thống kê và Bản đồ điểm nóng: ?days=7|30|90|180|365&type=gia_danh
  @Get('overview')
  overview(@Query() q: QueryOverviewDto) {
    return this.statistics.overview(q.days ?? 30, q.type)
  }
}
