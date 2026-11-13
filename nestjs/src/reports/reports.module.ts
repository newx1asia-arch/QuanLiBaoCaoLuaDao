import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Report } from './entities/report.entity.js'
import { ReportHistory } from './entities/report-history.entity.js'
import { User } from '../auth/entities/user.entity.js'
import { ReportsController } from './reports.controller.js'
import { PublicReportsController } from './public-reports.controller.js'
import { StatsController } from './stats.controller.js'
import { LookupController } from './lookup.controller.js'
import { SuspectsController } from './suspects.controller.js'
import { MonitorService } from './monitor.service.js'
import { ReportsService } from './reports.service.js'
import { StatisticsService } from './statistics.service.js'

@Module({
  imports: [TypeOrmModule.forFeature([Report, ReportHistory, User])],
  controllers: [ReportsController, PublicReportsController, StatsController, LookupController, SuspectsController],
  providers: [ReportsService, MonitorService, StatisticsService],
})
export class ReportsModule {}
