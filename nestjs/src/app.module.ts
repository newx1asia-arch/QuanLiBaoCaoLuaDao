import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module.js'
import { ReportsModule } from './reports/reports.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'mysql' as const,
        host: c.get<string>('DB_HOST', 'localhost'),
        port: Number(c.get('DB_PORT', 3306)),
        username: c.get<string>('DB_USER', 'root'),
        password: c.get<string>('DB_PASS', ''),
        database: c.get<string>('DB_NAME', 'baocao_luadao'),
        charset: 'utf8mb4',
        autoLoadEntities: true,
        synchronize: true, // tự tạo bảng khi học/dev; production nên dùng migration
      }),
    }),
    AuthModule,
    ReportsModule,
  ],
})
export class AppModule {}
