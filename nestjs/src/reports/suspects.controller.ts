import { Controller, Get, Query } from '@nestjs/common'
import { MonitorService } from './monitor.service.js'
import { QuerySuspectDto } from './dto/query-suspect.dto.js'
import { LookupDto } from './dto/lookup.dto.js'
import { Roles } from '../auth/decorators.js'

// Đối tượng nghi vấn + giám sát trực tiếp: chỉ cán bộ / quản trị viên
@Controller()
@Roles('can_bo', 'admin')
export class SuspectsController {
  constructor(private readonly service: MonitorService) {}

  @Get('suspects')
  suspects(@Query() q: QuerySuspectDto) {
    return this.service.suspects(q)
  }

  // Đối tượng truyền qua ?q= vì link có chứa dấu "/" không đặt được trong đường dẫn
  @Get('suspects/detail')
  detail(@Query() q: LookupDto) {
    return this.service.suspectDetail(q.q)
  }

  @Get('monitor')
  monitor() {
    return this.service.monitor()
  }
}
