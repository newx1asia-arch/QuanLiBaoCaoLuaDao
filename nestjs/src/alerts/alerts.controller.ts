import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger'
import { AlertsService } from './alerts.service.js'
import { QueryAlertDto, ReviewDto, SaveAlertDto } from './dto/alert.dto.js'
import { CurrentUser, Public, Roles } from '../auth/decorators.js'
import type { AuthUser } from '../auth/auth-user.js'
import { ApiConflict, ApiLogin, ApiNotFound, MO_TA_TINH } from '../common/swagger.js'

const ID = { name: 'id', description: 'Id cảnh báo', example: 1 }
const XUNG_DOT = 'Cảnh báo vừa đổi trạng thái do người khác thao tác, hãy tải lại rồi thử lại'

// Luồng: nhap → cho_duyet → da_duyet → da_phat_hanh (→ da_thu_hoi). Bị từ chối thì về tu_choi, sửa xong gửi duyệt lại
@ApiTags('Cảnh báo phát hành')
@ApiLogin()
@Controller('alerts')
@Roles('can_bo', 'admin')
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách cảnh báo', description: 'Lọc theo trạng thái. Mỗi lần trả tối đa 200 cảnh báo mới nhất, kèm số lượng theo từng trạng thái.' })
  @ApiOkResponse({ description: 'Danh sách cảnh báo và số lượng theo trạng thái' })
  list(@Query() q: QueryAlertDto) { return this.service.list(q) }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một cảnh báo', description: 'Kèm nhật ký thao tác (ai làm gì, lúc nào).' })
  @ApiParam(ID)
  @ApiOkResponse({ description: 'Thông tin cảnh báo' })
  @ApiNotFound('cảnh báo')
  get(@Param('id', ParseIntPipe) id: number) { return this.service.get(id) }

  @Post()
  @ApiOperation({ summary: 'Soạn cảnh báo mới (lưu nháp)', description: 'Bản nháp chưa cần đủ nội dung các kênh; đủ nội dung mới gửi duyệt được.' })
  @ApiCreatedResponse({ description: 'Cảnh báo vừa tạo ở trạng thái `nhap`' })
  create(@Body() dto: SaveAlertDto, @CurrentUser() u: AuthUser) { return this.service.create(dto, u) }

  @Put(':id')
  @ApiOperation({ summary: 'Sửa cảnh báo', description: 'Sửa xong cảnh báo quay về trạng thái `nhap` (kể cả khi bị từ chối trước đó), cần gửi duyệt lại.' })
  @ApiParam(ID)
  @ApiOkResponse({ description: 'Cảnh báo sau khi sửa' })
  @ApiNotFound('cảnh báo')
  @ApiConflict(XUNG_DOT)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveAlertDto, @CurrentUser() u: AuthUser) { return this.service.update(id, dto, u) }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Gửi duyệt', description: 'Cần đủ nội dung cho mọi kênh đã chọn, và nếu phạm vi theo địa bàn thì phải chọn ít nhất một tỉnh, thành. Sau khi gửi, trạng thái là `cho_duyet`.' })
  @ApiParam(ID)
  @ApiOkResponse({ description: 'Cảnh báo ở trạng thái `cho_duyet`' })
  @ApiBadRequestResponse({ description: 'Thiếu nội dung cho kênh đã chọn hoặc chưa chọn tỉnh, thành' })
  @ApiNotFound('cảnh báo')
  @ApiConflict(XUNG_DOT)
  submit(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { return this.service.submit(id, u) }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa cảnh báo', description: 'Chỉ xóa được cảnh báo đang là bản nháp (`nhap`) hoặc đã bị từ chối (`tu_choi`).' })
  @ApiParam(ID)
  @ApiOkResponse({ description: 'Đã xóa' })
  @ApiNotFound('cảnh báo')
  @ApiConflict(XUNG_DOT)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { return this.service.remove(id, u) }

  // Duyệt, từ chối, phát hành, thu hồi: chỉ quản trị viên
  @Post(':id/approve')
  @Roles('admin')
  @ApiOperation({ summary: 'Duyệt cảnh báo (admin)', description: 'Chuyển `cho_duyet` → `da_duyet`. Ghi chú không bắt buộc.' })
  @ApiParam(ID)
  @ApiOkResponse({ description: 'Cảnh báo ở trạng thái `da_duyet`' })
  @ApiConflict(XUNG_DOT)
  approve(@Param('id', ParseIntPipe) id: number, @Body() b: ReviewDto, @CurrentUser() u: AuthUser) { return this.service.approve(id, b.ghiChu, u) }

  @Post(':id/reject')
  @Roles('admin')
  @ApiOperation({ summary: 'Từ chối cảnh báo (admin)', description: 'Bắt buộc ghi lý do ở `ghiChu`. Cảnh báo về trạng thái `tu_choi`, người soạn sửa rồi gửi duyệt lại.' })
  @ApiParam(ID)
  @ApiOkResponse({ description: 'Cảnh báo ở trạng thái `tu_choi`' })
  @ApiBadRequestResponse({ description: 'Chưa ghi lý do từ chối' })
  @ApiConflict(XUNG_DOT)
  reject(@Param('id', ParseIntPipe) id: number, @Body() b: ReviewDto, @CurrentUser() u: AuthUser) { return this.service.reject(id, b.ghiChu, u) }

  @Post(':id/publish')
  @Roles('admin')
  @ApiOperation({ summary: 'Phát hành cảnh báo (admin)', description: 'Chỉ phát hành được cảnh báo đã duyệt. Website đăng ngay (hiện ở `GET /public/alerts`); các kênh còn lại được xếp hàng chờ gửi.' })
  @ApiParam(ID)
  @ApiOkResponse({ description: 'Cảnh báo ở trạng thái `da_phat_hanh`' })
  @ApiBadRequestResponse({ description: 'Cảnh báo chưa được duyệt' })
  @ApiConflict(XUNG_DOT)
  publish(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { return this.service.publish(id, u) }

  @Post(':id/withdraw')
  @Roles('admin')
  @ApiOperation({ summary: 'Thu hồi cảnh báo đã phát hành (admin)', description: 'Bắt buộc ghi lý do ở `ghiChu`. Cảnh báo không còn hiện ở danh sách công khai.' })
  @ApiParam(ID)
  @ApiOkResponse({ description: 'Cảnh báo ở trạng thái `da_thu_hoi`' })
  @ApiBadRequestResponse({ description: 'Chưa ghi lý do hoặc cảnh báo chưa được phát hành' })
  @ApiConflict(XUNG_DOT)
  withdraw(@Param('id', ParseIntPipe) id: number, @Body() b: ReviewDto, @CurrentUser() u: AuthUser) { return this.service.withdraw(id, b.ghiChu, u) }
}

// API công khai cho website: không cần đăng nhập, chỉ trả cảnh báo đã phát hành
@ApiTags('Cảnh báo công khai')
@Controller('public/alerts')
export class PublicAlertsController {
  constructor(private readonly service: AlertsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Danh sách cảnh báo đã phát hành', description: 'Không cần đăng nhập. Chỉ gồm cảnh báo đã phát hành lên website; có thể lọc theo tỉnh, thành.' })
  @ApiQuery({ name: 'province', required: false, description: `${MO_TA_TINH}. Không gửi = tất cả` })
  @ApiOkResponse({ description: 'Danh sách cảnh báo công khai' })
  list(@Query('province') province?: string) { return this.service.publicList(province) }
}
