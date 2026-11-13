import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger'
import { Public } from './auth/decorators.js'

class HealthResponseDto {
  @ApiProperty({ example: 'ok' }) status: string
  @ApiProperty({ example: '2026-11-10T04:15:00.000Z' }) time: string
}

// Dùng cho Render (Health Check Path = /api/health) và để tự kiểm tra backend còn sống.
// Cố ý không chạm vào cơ sở dữ liệu: Render gọi liên tục, và trả lời nhanh để dịch vụ khởi động xong là báo "sẵn sàng".
@ApiTags('Hệ thống')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Kiểm tra backend còn hoạt động', description: 'Không cần đăng nhập và không truy vấn cơ sở dữ liệu.' })
  @ApiOkResponse({ type: HealthResponseDto })
  check() {
    return { status: 'ok', time: new Date().toISOString() }
  }
}
