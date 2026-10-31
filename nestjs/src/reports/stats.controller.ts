import { Controller, Get } from '@nestjs/common'
import { ReportsService } from './reports.service.js'
import { CurrentUser } from '../auth/decorators.js'
import type { AuthUser } from '../auth/auth-user.js'

@Controller('stats')
export class StatsController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  stats(@CurrentUser() user: AuthUser) {
    return this.service.stats(user)
  }
}
