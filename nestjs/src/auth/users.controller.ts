import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common'
import { UsersService } from './users.service.js'
import type { AuthUser } from './auth-user.js'
import { CurrentUser, Roles } from './decorators.js'
import { CreateUserDto } from './dto/create-user.dto.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import { QueryUserDto } from './dto/query-user.dto.js'
import { ResetPasswordDto } from './dto/reset-password.dto.js'

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('staff')
  @Roles('admin', 'can_bo')
  staff() {
    return this.service.staff()
  }

  @Get()
  @Roles('admin')
  list(@Query() q: QueryUserDto) {
    return this.service.list(q)
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto)
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto, @CurrentUser() actor: AuthUser) {
    return this.service.update(id, dto, actor)
  }

  @Post(':id/reset-password')
  @Roles('admin')
  @HttpCode(200)
  resetPassword(@Param('id', ParseIntPipe) id: number, @Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(id, dto)
  }
}
