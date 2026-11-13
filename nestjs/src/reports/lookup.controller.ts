import { Controller, Get, Query } from '@nestjs/common'
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ReportsService } from './reports.service.js'
import { LookupDto } from './dto/lookup.dto.js'
import { LookupResponseDto } from './dto/suspect-response.dto.js'
import { CurrentUser, Roles } from '../auth/decorators.js'
import type { AuthUser } from '../auth/auth-user.js'
import { ApiLogin, ApiRateLimited } from '../common/swagger.js'

// Chỉ cán bộ / quản trị viên tra cứu; có giới hạn số lượt theo từng tài khoản
@ApiTags('Tra cứu')
@ApiLogin()
@Controller('lookup')
@Roles('can_bo', 'admin')
export class LookupController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Tra cứu SĐT, số tài khoản hoặc link', description: 'Trả về mức độ (`mucDo`), số báo cáo, số báo cáo đã xác nhận, tổng thiệt hại, thống kê theo loại và ngày xảy ra gần nhất. Báo cáo đã bị từ chối không được tính. Số điện thoại dạng +84 hoặc 84 được hiểu giống số bắt đầu bằng 0.' })
  @ApiOkResponse({ description: 'Kết quả tra cứu', type: LookupResponseDto })
  @ApiBadRequestResponse({ description: 'Nhập ít hơn 3 ký tự' })
  @ApiRateLimited()
  lookup(@Query() q: LookupDto, @CurrentUser() user: AuthUser) {
    return this.service.lookup(q.q, user)
  }
}
