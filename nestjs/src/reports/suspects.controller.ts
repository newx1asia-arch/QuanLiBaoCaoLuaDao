import { Controller, Get, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { MonitorService } from './monitor.service.js'
import { QuerySuspectDto } from './dto/query-suspect.dto.js'
import { LookupDto } from './dto/lookup.dto.js'
import { SuspectDetailResponseDto, SuspectListResponseDto } from './dto/suspect-response.dto.js'
import { Roles } from '../auth/decorators.js'
import { ApiLogin } from '../common/swagger.js'

// Đối tượng nghi vấn + giám sát trực tiếp: chỉ cán bộ / quản trị viên
@ApiTags('Đối tượng nghi vấn')
@ApiLogin()
@Controller()
@Roles('can_bo', 'admin')
export class SuspectsController {
  constructor(private readonly service: MonitorService) {}

  @Get('suspects')
  @ApiOperation({ summary: 'Danh sách đối tượng nghi vấn', description: 'Đối tượng bị báo cáo, có lọc theo mức độ (`nguy_hiem` khi đã được xác nhận hoặc từ 3 người khác nhau báo cáo), loại đối tượng và phân trang.' })
  @ApiOkResponse({ description: 'Một trang đối tượng nghi vấn', type: SuspectListResponseDto })
  suspects(@Query() q: QuerySuspectDto) {
    return this.service.suspects(q)
  }

  // Đối tượng truyền qua ?q= vì link có chứa dấu "/" không đặt được trong đường dẫn
  @Get('suspects/detail')
  @ApiOperation({ summary: 'Chi tiết một đối tượng nghi vấn', description: 'Đối tượng truyền qua `q` (thay vì trong đường dẫn) vì link có chứa dấu "/".' })
  @ApiOkResponse({ description: 'Thông tin đối tượng cùng các báo cáo liên quan', type: SuspectDetailResponseDto })
  detail(@Query() q: LookupDto) {
    return this.service.suspectDetail(q.q)
  }

  @Get('monitor')
  @ApiOperation({ summary: 'Giám sát trực tiếp', description: 'Dữ liệu cho khối "Giám sát trực tiếp" trên bảng điều hành: số báo cáo theo từng bước xử lý, báo cáo mới trong 24 giờ, số đối tượng nghi vấn và nguy hiểm. Giao diện gọi lại mỗi 15 giây.' })
  @ApiOkResponse({ description: 'Dữ liệu giám sát' })
  monitor() {
    return this.service.monitor()
  }
}
