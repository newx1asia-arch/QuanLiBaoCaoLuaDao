import { ApiProperty } from '@nestjs/swagger'

// Các mẫu kết quả trả về, chỉ dùng để hiển thị trên Swagger
export class UserResponseDto {
  @ApiProperty({ example: 1 }) id: number
  @ApiProperty({ example: 'admin@baocao.local' }) email: string
  @ApiProperty({ example: 'Quản trị viên' }) hoTen: string
  @ApiProperty({ enum: ['can_bo', 'admin'], example: 'admin' }) vaiTro: string
  @ApiProperty({ example: '2026-11-10T03:51:00.000Z' }) ngayTao: string
}

export class StaffResponseDto {
  @ApiProperty({ example: 2 }) id: number
  @ApiProperty({ example: 'Trần Thị Bích' }) hoTen: string
}

export class UserAdminResponseDto extends UserResponseDto {
  @ApiProperty({ description: 'false = tài khoản đang bị khóa', example: true }) hoatDong: boolean
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserAdminResponseDto] }) items: UserAdminResponseDto[]
  @ApiProperty({ description: 'Tổng số tài khoản khớp bộ lọc', example: 12 }) total: number
}

export class SessionResponseDto {
  @ApiProperty({ description: 'Dán vào nút Authorize để gọi các API cần đăng nhập', example: 'eyJzdWIiOjEsInR2IjowLC4uLn0.xxxx' }) token: string
  @ApiProperty({ description: 'Số giây token còn hiệu lực', example: 43200 }) expiresIn: number
  @ApiProperty({ type: UserResponseDto }) user: UserResponseDto
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Nếu email đã đăng ký, mã xác nhận 6 số sẽ được gửi tới email đó. Mã có hiệu lực 15 phút.' }) message: string
}

export class OkResponseDto {
  @ApiProperty({ example: true }) ok: boolean
  @ApiProperty({ example: 'Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.', required: false }) message?: string
}
