import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { AlertsService } from './alerts.service.js'
import { QueryAlertDto, ReviewDto, SaveAlertDto } from './dto/alert.dto.js'
import { CurrentUser, Public, Roles } from '../auth/decorators.js'
import type { AuthUser } from '../auth/auth-user.js'

@Controller('alerts')
@Roles('can_bo', 'admin')
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  @Get() list(@Query() q: QueryAlertDto) { return this.service.list(q) }
  @Get(':id') get(@Param('id', ParseIntPipe) id: number) { return this.service.get(id) }
  @Post() create(@Body() dto: SaveAlertDto, @CurrentUser() u: AuthUser) { return this.service.create(dto, u) }
  @Put(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveAlertDto, @CurrentUser() u: AuthUser) { return this.service.update(id, dto, u) }
  @Post(':id/submit') submit(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { return this.service.submit(id, u) }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { return this.service.remove(id, u) }

  // Duyệt, từ chối, phát hành, thu hồi: chỉ quản trị viên
  @Post(':id/approve') @Roles('admin') approve(@Param('id', ParseIntPipe) id: number, @Body() b: ReviewDto, @CurrentUser() u: AuthUser) { return this.service.approve(id, b.ghiChu, u) }
  @Post(':id/reject') @Roles('admin') reject(@Param('id', ParseIntPipe) id: number, @Body() b: ReviewDto, @CurrentUser() u: AuthUser) { return this.service.reject(id, b.ghiChu, u) }
  @Post(':id/publish') @Roles('admin') publish(@Param('id', ParseIntPipe) id: number, @CurrentUser() u: AuthUser) { return this.service.publish(id, u) }
  @Post(':id/withdraw') @Roles('admin') withdraw(@Param('id', ParseIntPipe) id: number, @Body() b: ReviewDto, @CurrentUser() u: AuthUser) { return this.service.withdraw(id, b.ghiChu, u) }
}

// API công khai cho website: không cần đăng nhập, chỉ trả cảnh báo đã phát hành
@Controller('public/alerts')
export class PublicAlertsController {
  constructor(private readonly service: AlertsService) {}
  @Public() @Get() list(@Query('province') province?: string) { return this.service.publicList(province) }
}
