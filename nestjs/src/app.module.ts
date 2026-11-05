import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module.js'
import { ReportsModule } from './reports/reports.module.js'
import { AlertsModule } from './alerts/alerts.module.js'

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
        // Tự tạo / sửa bảng theo entity khi phát triển. Production mặc định tắt (đặt DB_SYNC=true nếu thật sự muốn bật)
        synchronize: String(c.get('DB_SYNC', c.get('NODE_ENV') === 'production' ? 'false' : 'true')) === 'true',
      }),
    }),
    AuthModule,
    ReportsModule,
    AlertsModule,
  ],
})
export class AppModule {}
