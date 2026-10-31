import { Controller, Get, Query } from '@nestjs/common'
import { ReportsService } from './reports.service.js'
import { LookupDto } from './dto/lookup.dto.js'

// Mọi tài khoản đã đăng nhập (kể cả người dân) đều tra cứu được; kết quả chỉ là số liệu tổng hợp
@Controller('lookup')
export class LookupController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  lookup(@Query() q: LookupDto) {
    return this.service.lookup(q.q)
  }
}
