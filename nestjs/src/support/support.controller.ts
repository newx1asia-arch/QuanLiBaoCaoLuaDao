import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../auth/decorators.js'
import type { AuthUser } from '../auth/auth-user.js'
import { ApiLogin } from '../common/swagger.js'
import { ChatDto, QueryStatusDto, SetDutyDto } from './dto/support.dto.js'
import { SupportService } from './support.service.js'

@ApiTags('Trung tâm hỗ trợ')
@ApiLogin()
@Controller('support')
export class SupportController {
  constructor(private readonly service: SupportService) {}

  @Get('status')
  @ApiOperation({ summary: 'Trạng thái hỗ trợ', description: 'Khu vực của bạn, ai đang trực cùng khu vực (không tính bạn), và trợ lý AI có sẵn sàng không.' })
  @ApiOkResponse({ description: 'Trạng thái trực và danh sách cán bộ đang trực' })
  status(@CurrentUser() u: AuthUser, @Query() q: QueryStatusDto) { return this.service.status(u, q.khuVuc) }

  @Put('duty')
  @ApiOperation({ summary: 'Bật / tắt trạng thái Đang trực', description: 'Chọn khu vực và bật hoặc tắt. Ca trực tự hết hiệu lực sau vài giờ nếu quên tắt.' })
  @ApiOkResponse({ description: 'Trạng thái sau khi cập nhật' })
  setDuty(@CurrentUser() u: AuthUser, @Body() dto: SetDutyDto) { return this.service.setDuty(u, dto) }

  @Post('chat')
  @ApiOperation({ summary: 'Hỏi trợ lý AI', description: 'Chỉ dùng được khi khu vực không có cán bộ nào đang trực. Giới hạn số lần hỏi mỗi giờ.' })
  @ApiOkResponse({ description: 'Câu trả lời của trợ lý AI' })
  chat(@CurrentUser() u: AuthUser, @Body() dto: ChatDto) { return this.service.chat(u, dto) }
}
