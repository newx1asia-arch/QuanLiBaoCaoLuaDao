import { Controller, Get, Query } from '@nestjs/common'
import { ReportsService } from './reports.service.js'
import { LookupDto } from './dto/lookup.dto.js'
import { CurrentUser, Roles } from '../auth/decorators.js'
import type { AuthUser } from '../auth/auth-user.js'

// Chỉ cán bộ / quản trị viên tra cứu; có giới hạn số lượt theo từng tài khoản
@Controller('lookup')
@Roles('can_bo', 'admin')
export class LookupController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  lookup(@Query() q: LookupDto, @CurrentUser() user: AuthUser) {
    return this.service.lookup(q.q, user)
  }
}
