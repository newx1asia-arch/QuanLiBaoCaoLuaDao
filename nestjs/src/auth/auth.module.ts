import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity.js'
import { AuthController } from './auth.controller.js'
import { UsersController } from './users.controller.js'
import { AuthService } from './auth.service.js'
import { UsersService } from './users.service.js'
import { TokenService } from './token.service.js'
import { MailService } from './mail.service.js'
import { JwtAuthGuard } from './jwt-auth.guard.js'
import { RolesGuard } from './roles.guard.js'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController, UsersController],
  providers: [
    AuthService,
    UsersService,
    TokenService,
    MailService,
    // Hai guard áp dụng cho toàn bộ API (thứ tự: đăng nhập trước, rồi mới kiểm tra vai trò)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
