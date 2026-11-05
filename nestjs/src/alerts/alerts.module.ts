import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Alert } from './entities/alert.entity.js'
import { AlertsController, PublicAlertsController } from './alerts.controller.js'
import { AlertsService } from './alerts.service.js'

@Module({
  imports: [TypeOrmModule.forFeature([Alert])],
  controllers: [AlertsController, PublicAlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
