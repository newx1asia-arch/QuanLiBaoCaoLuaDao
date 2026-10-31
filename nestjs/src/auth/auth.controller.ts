import { Body, Controller, Get, HttpCode, Ip, Patch, Post } from '@nestjs/common'
import { AuthService } from './auth.service.js'
import type { AuthUser } from './auth-user.js'
import { CurrentUser, Public } from './decorators.js'
import { RegisterDto } from './dto/register.dto.js'
import { LoginDto } from './dto/login.dto.js'
import { UpdateProfileDto } from './dto/update-profile.dto.js'
import { ChangePasswordDto } from './dto/change-password.dto.js'
import { ForgotPasswordDto } from './dto/forgot-password.dto.js'
import { ResetWithCodeDto } from './dto/reset-with-code.dto.js'

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto)
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto, @Ip() ip: string) {
    return this.service.login(dto, ip)
  }

  // Bước 1: nhập email, hệ thống gửi mã 6 số (luôn trả lời giống nhau dù email có tồn tại hay không)
  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto, @Ip() ip: string) {
    return this.service.forgotPassword(dto, ip)
  }

  // Bước 2: nhập mã + mật khẩu mới
  @Public()
  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetWithCodeDto) {
    return this.service.resetPassword(dto)
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.service.me(user)
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.service.updateProfile(user, dto)
  }

  @Post('change-password')
  @HttpCode(200)
  changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return this.service.changePassword(user, dto)
  }
}
