import { readFileSync } from 'node:fs'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module.js'
import { ReportsModule } from './reports/reports.module.js'
import { AlertsModule } from './alerts/alerts.module.js'
import { SupportModule } from './support/support.module.js'
import { HealthController } from './health.controller.js'

// Kết nối MySQL có mã hóa (SSL), bắt buộc với Aiven và hầu hết MySQL trên mây.
//  DB_SSL=true            bật SSL
//  DB_SSL_CA              nội dung chứng chỉ CA (dán nguyên văn từ file ca.pem của Aiven; chấp nhận cả dạng một dòng có \n)
//  DB_SSL_CA_PATH         hoặc đường dẫn tới file ca.pem (vd /etc/secrets/ca.pem khi dùng Secret Files của Render)
// Có CA thì kiểm tra chứng chỉ máy chủ đầy đủ; không có CA thì vẫn mã hóa nhưng không xác minh máy chủ (kém an toàn hơn)
function sslOptions(get: (k: string) => string | undefined) {
  if (String(get('DB_SSL') ?? 'false') !== 'true') return undefined
  const inline = get('DB_SSL_CA')?.replace(/\\n/g, '\n').trim()
  const path = get('DB_SSL_CA_PATH')?.trim()
  const ca = inline || (path ? readFileSync(path, 'utf8') : undefined)
  if (!ca) new Logger('Database').warn('DB_SSL=true nhưng chưa có DB_SSL_CA: kết nối được mã hóa nhưng không xác minh máy chủ MySQL')
  return ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false }
}

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
        ssl: sslOptions((k) => c.get<string>(k)),
        connectTimeout: Number(c.get('DB_CONNECT_TIMEOUT_MS', 20000)),
        // Gói MySQL miễn phí giới hạn số kết nối đồng thời: giữ hồ kết nối nhỏ (mặc định 10) để không bị từ chối khi chạy nhiều bản
        extra: { connectionLimit: Number(c.get('DB_POOL', 10)) },
        autoLoadEntities: true,
        // Tự tạo / sửa bảng theo entity khi phát triển. Production mặc định tắt (đặt DB_SYNC=true nếu thật sự muốn bật)
        synchronize: String(c.get('DB_SYNC', c.get('NODE_ENV') === 'production' ? 'false' : 'true')) === 'true',
      }),
    }),
    AuthModule,
    ReportsModule,
    AlertsModule,
    SupportModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
