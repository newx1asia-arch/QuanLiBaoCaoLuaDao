import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { UsersService } from './users.service.js'
import type { AuthUser } from './auth-user.js'
import { CurrentUser, Roles } from './decorators.js'
import { CreateUserDto } from './dto/create-user.dto.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import { QueryUserDto } from './dto/query-user.dto.js'
import { ResetPasswordDto } from './dto/reset-password.dto.js'
import { OkResponseDto, StaffResponseDto, UserAdminResponseDto, UserListResponseDto } from './dto/auth-response.dto.js'
import { ApiConflict, ApiLogin, ApiNotFound } from '../common/swagger.js'

@ApiTags('Người dùng')
@ApiLogin()
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('staff')
  @Roles('admin', 'can_bo')
  @ApiOperation({ summary: 'Danh sách cán bộ để phân công', description: 'Chỉ gồm id và họ tên của các cán bộ đang hoạt động. Dùng cho ô chọn người phụ trách báo cáo. Cán bộ và admin đều gọi được.' })
  @ApiOkResponse({ type: [StaffResponseDto] })
  staff() {
    return this.service.staff()
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Danh sách tài khoản (admin)', description: 'Có tìm kiếm, lọc theo vai trò và phân trang.' })
  @ApiOkResponse({ type: UserListResponseDto })
  list(@Query() q: QueryUserDto) {
    return this.service.list(q)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Tạo tài khoản cán bộ hoặc admin (admin)', description: 'Hệ thống không có đăng ký công khai, tài khoản chỉ được tạo ở đây.' })
  @ApiCreatedResponse({ type: UserAdminResponseDto })
  @ApiConflict('Email đã được dùng cho tài khoản khác')
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Đổi vai trò hoặc khóa / mở khóa tài khoản (admin)', description: 'Không được đổi vai trò hoặc khóa chính tài khoản của mình.' })
  @ApiParam({ name: 'id', description: 'Id tài khoản', example: 2 })
  @ApiOkResponse({ type: UserAdminResponseDto })
  @ApiBadRequestResponse({ description: 'Thao tác không được phép (vd tự khóa mình)' })
  @ApiNotFound('tài khoản')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto, @CurrentUser() actor: AuthUser) {
    return this.service.update(id, dto, actor)
  }

  @Post(':id/reset-password')
  @Roles('admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đặt lại mật khẩu cho tài khoản (admin)', description: 'Dùng khi cán bộ quên mật khẩu mà hệ thống chưa gửi được email. Không dùng cho tài khoản của chính mình (hãy dùng POST /auth/change-password).' })
  @ApiParam({ name: 'id', description: 'Id tài khoản cần đặt lại mật khẩu', example: 2 })
  @ApiOkResponse({ type: OkResponseDto })
  @ApiBadRequestResponse({ description: 'Đang đặt lại mật khẩu cho chính tài khoản của mình' })
  @ApiNotFound('tài khoản')
  resetPassword(@Param('id', ParseIntPipe) id: number, @Body() dto: ResetPasswordDto, @CurrentUser() actor: AuthUser) {
    return this.service.resetPassword(id, dto, actor)
  }
}
