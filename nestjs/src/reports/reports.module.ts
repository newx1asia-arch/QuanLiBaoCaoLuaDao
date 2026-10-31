import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Report } from './entities/report.entity.js'
import { ReportHistory } from './entities/report-history.entity.js'
import { ReportsController } from './reports.controller.js'
import { StatsController } from './stats.controller.js'
import { LookupController } from './lookup.controller.js'
import { ReportsService } from './reports.service.js'

@Module({
  imports: [TypeOrmModule.forFeature([Report, ReportHistory])],
  controllers: [ReportsController, StatsController, LookupController],
  providers: [ReportsService],
})
export class ReportsModule {}
