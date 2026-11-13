import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { ReportsService } from './reports.service.js'
import { CreateReportDto } from './dto/create-report.dto.js'
import { UpdateReportDto } from './dto/update-report.dto.js'
import { QueryReportDto } from './dto/query-report.dto.js'
import { DeletedResponseDto, ReportDetailDto, ReportListResponseDto } from './dto/report-response.dto.js'
import { CurrentUser, Roles } from '../auth/decorators.js'
import type { AuthUser } from '../auth/auth-user.js'
import { ApiConflict, ApiLogin, ApiNotFound } from '../common/swagger.js'

// Toàn bộ API báo cáo chỉ dành cho cán bộ / quản trị viên
@ApiTags('Báo cáo')
@ApiLogin()
@Controller('reports')
@Roles('can_bo', 'admin')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách báo cáo', description: 'Lọc theo từ khóa, trạng thái, loại, mức ưu tiên, tỉnh thành, kênh tiếp nhận; có sắp xếp và phân trang. `mine=1` chỉ lấy báo cáo giao cho tôi.' })
  @ApiOkResponse({ description: 'Một trang báo cáo cùng tổng số bản ghi khớp bộ lọc', type: ReportListResponseDto })
  list(@Query() q: QueryReportDto, @CurrentUser() user: AuthUser) {
    return this.service.list(q, user)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một báo cáo', description: 'Kèm lịch sử xử lý (`lichSu`), các báo cáo cùng đối tượng (`lienQuan`) và `phienBan` (cần gửi lại khi cập nhật để tránh ghi đè lên người khác).' })
  @ApiParam({ name: 'id', description: 'Id báo cáo', example: 1 })
  @ApiOkResponse({ description: 'Thông tin báo cáo', type: ReportDetailDto })
  @ApiNotFound()
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.get(id)
  }

  @Post()
  @ApiOperation({ summary: 'Lập báo cáo mới (cán bộ nhập hộ người dân)', description: 'Báo cáo mới vào trạng thái `cho_xu_ly`. Mức ưu tiên tự tính theo số tiền thiệt hại.' })
  @ApiCreatedResponse({ description: 'Báo cáo vừa tạo (cùng dạng với chi tiết báo cáo)', type: ReportDetailDto })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ (ngày ở tương lai, đối tượng quá ngắn...)' })
  @ApiConflict('Trường hợp này (cùng đối tượng, người báo cáo và ngày) đã được ghi nhận ở báo cáo khác')
  create(@Body() dto: CreateReportDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user)
  }

  // Quyền chi tiết (ai được nhận / đổi trạng thái) do service kiểm tra theo báo cáo cụ thể
  @Patch(':id')
  @ApiOperation({
    summary: 'Xử lý báo cáo: nhận việc, đổi trạng thái, ghi chú',
    description:
      'Gửi trường nào cập nhật trường đó.\n\n' +
      '- Báo cáo chưa ai nhận: cán bộ nào cũng nhận được (chỉ nhận cho chính mình). Chỉ admin phân công cho người khác hoặc hủy phân công.\n' +
      '- Chỉ cán bộ đang phụ trách (hoặc admin) được đổi trạng thái và ghi chú.\n' +
      '- Luồng hợp lệ: `cho_xu_ly` → `dang_xac_minh` → `da_xac_nhan` hoặc `tu_choi`. Xác nhận, từ chối hoặc mở lại phải ghi lý do ở `ghiChu`.\n' +
      '- Báo cáo đã xác nhận hoặc từ chối chỉ admin mới mở lại được.',
  })
  @ApiParam({ name: 'id', description: 'Id báo cáo', example: 1 })
  @ApiOkResponse({ description: 'Báo cáo sau khi cập nhật (cùng dạng với chi tiết báo cáo)', type: ReportDetailDto })
  @ApiBadRequestResponse({ description: 'Chuyển trạng thái sai luồng hoặc thiếu lý do' })
  @ApiConflict('Báo cáo vừa được người khác cập nhật (phienBan cũ), hãy tải lại rồi thao tác lại')
  @ApiNotFound()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReportDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, dto, user)
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa báo cáo (admin)' })
  @ApiParam({ name: 'id', description: 'Id báo cáo', example: 1 })
  @ApiOkResponse({ description: 'Đã xóa', type: DeletedResponseDto })
  @ApiNotFound()
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.service.remove(id, user)
  }
}
