import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../auth/entities/user.entity.js'
import { TrucBan } from './entities/truc-ban.entity.js'
import { GeminiService } from './gemini.service.js'
import { SupportController } from './support.controller.js'
import { SupportService } from './support.service.js'

@Module({
  imports: [TypeOrmModule.forFeature([TrucBan, User])],
  controllers: [SupportController],
  providers: [SupportService, GeminiService],
})
export class SupportModule {}
