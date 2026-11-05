import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import { ReportsService } from './reports.service.js'
import { CreateReportDto } from './dto/create-report.dto.js'
import { UpdateReportDto } from './dto/update-report.dto.js'
import { QueryReportDto } from './dto/query-report.dto.js'
import { CurrentUser, Roles } from '../auth/decorators.js'
import type { AuthUser } from '../auth/auth-user.js'

// Toàn bộ API báo cáo chỉ dành cho cán bộ / quản trị viên
@Controller('reports')
@Roles('can_bo', 'admin')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  list(@Query() q: QueryReportDto, @CurrentUser() user: AuthUser) {
    return this.service.list(q, user)
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.get(id)
  }

  @Post()
  create(@Body() dto: CreateReportDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user)
  }

  // Quyền chi tiết (ai được nhận / đổi trạng thái) do service kiểm tra theo báo cáo cụ thể
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReportDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, dto, user)
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.service.remove(id, user)
  }
}
