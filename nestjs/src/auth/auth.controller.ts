import { Body, Controller, Get, HttpCode, Ip, Patch, Post } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { AuthService } from './auth.service.js'
import type { AuthUser } from './auth-user.js'
import { CurrentUser, Public } from './decorators.js'
import { LoginDto } from './dto/login.dto.js'
import { UpdateProfileDto } from './dto/update-profile.dto.js'
import { ChangePasswordDto } from './dto/change-password.dto.js'
import { ForgotPasswordDto } from './dto/forgot-password.dto.js'
import { ResetWithCodeDto } from './dto/reset-with-code.dto.js'
import { MessageResponseDto, OkResponseDto, SessionResponseDto, UserResponseDto } from './dto/auth-response.dto.js'
import { ApiLogin, ApiRateLimited } from '../common/swagger.js'

@ApiTags('Xác thực')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  // Không còn API đăng ký công khai: tài khoản cán bộ do quản trị viên tạo ở POST /users

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đăng nhập', description: 'Trả về `token`. Dán token vào nút **Authorize** để gọi các API cần đăng nhập. Sai mật khẩu nhiều lần sẽ bị khóa tạm thời.' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Đăng nhập thành công', type: SessionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Sai email hoặc mật khẩu, hoặc tài khoản đã bị khóa' })
  @ApiRateLimited()
  login(@Body() dto: LoginDto, @Ip() ip: string) {
    return this.service.login(dto, ip)
  }

  // Bước 1: nhập email, hệ thống gửi mã 6 số (luôn trả lời giống nhau dù email có tồn tại hay không)
  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Quên mật khẩu, bước 1: xin mã xác nhận', description: 'Luôn trả lời giống nhau dù email có tồn tại hay không (để người ngoài không dò được email). Mã 6 số hiệu lực 15 phút, xin lại mã phải cách nhau tối thiểu 60 giây.' })
  @ApiOkResponse({ description: 'Đã nhận yêu cầu', type: MessageResponseDto })
  @ApiRateLimited()
  forgotPassword(@Body() dto: ForgotPasswordDto, @Ip() ip: string) {
    return this.service.forgotPassword(dto, ip)
  }

  // Bước 2: nhập mã + mật khẩu mới
  @Public()
  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Quên mật khẩu, bước 2: đặt mật khẩu mới bằng mã', description: 'Sau khi đặt lại, mọi phiên đăng nhập cũ đều hết hiệu lực.' })
  @ApiOkResponse({ description: 'Đã đặt lại mật khẩu', type: OkResponseDto })
  @ApiBadRequestResponse({ description: 'Mã sai, hết hạn hoặc đã bị khóa do nhập sai quá số lần' })
  resetPassword(@Body() dto: ResetWithCodeDto) {
    return this.service.resetPassword(dto)
  }

  @Get('me')
  @ApiLogin()
  @ApiOperation({ summary: 'Xem hồ sơ của tôi' })
  @ApiOkResponse({ type: UserResponseDto })
  me(@CurrentUser() user: AuthUser) {
    return this.service.me(user)
  }

  @Patch('me')
  @ApiLogin()
  @ApiOperation({ summary: 'Đổi họ tên của tôi', description: 'Họ tên mới được cập nhật luôn vào các báo cáo mình đang phụ trách. Email không đổi được.' })
  @ApiOkResponse({ type: UserResponseDto })
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.service.updateProfile(user, dto)
  }

  @Post('change-password')
  @HttpCode(200)
  @ApiLogin()
  @ApiOperation({ summary: 'Đổi mật khẩu', description: 'Các thiết bị khác bị đăng xuất. Kết quả có token mới dành cho thiết bị đang dùng, hãy dán lại vào Authorize.' })
  @ApiOkResponse({ description: 'Đã đổi mật khẩu', type: SessionResponseDto })
  @ApiBadRequestResponse({ description: 'Mật khẩu hiện tại sai hoặc mật khẩu mới trùng mật khẩu cũ' })
  changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return this.service.changePassword(user, dto)
  }
}
