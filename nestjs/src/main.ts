import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module.js'
import { setupSwagger } from './common/swagger.js'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  // Chạy sau nginx / load balancer: đặt TRUST_PROXY=1 (số máy trung gian đứng trước ứng dụng) để lấy đúng IP người dùng.
  // Nếu không, mọi người đều có cùng IP của máy trung gian và giới hạn theo IP (xin mã quên mật khẩu 10 lần / giờ) tính chung cho cả hệ thống.
  // Mặc định không tin header X-Forwarded-For (tránh bị giả IP khi không có máy trung gian)
  // Trên Render luôn có máy trung gian đứng trước, nên tự đặt TRUST_PROXY=1 khi thấy biến RENDER (vẫn ưu tiên giá trị bạn đặt tay)
  const proxy = (process.env.TRUST_PROXY ?? (process.env.RENDER ? '1' : '')).trim()
  if (proxy) app.set('trust proxy', /^\d+$/.test(proxy) ? Number(proxy) : proxy === 'true' ? true : proxy)
  app.setGlobalPrefix('api')

  // CORS_ORIGIN nhận nhiều địa chỉ, ngăn cách bằng dấu phẩy; bỏ dấu "/" cuối (trình duyệt gửi origin không có dấu này nên có "/" là bị chặn oan).
  // Có thể dùng * thay cho một đoạn tên miền, vd https://*.vercel.app để cho phép cả các bản xem thử của Vercel
  const escape = (t: string) => t.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
  const allowed = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean)
    .map((o) => new RegExp(`^${o.split('*').map(escape).join('[a-z0-9-]+')}$`, 'i'))
  app.enableCors({
    origin: (origin, done) => done(null, !origin || allowed.some((re) => re.test(origin))), // không có origin = gọi trực tiếp (health check, công cụ gọi API)
    maxAge: 86400, // trình duyệt nhớ kết quả preflight 1 ngày, bớt một lượt gọi OPTIONS trước mỗi API
  })
  // Để Render dừng ứng dụng êm (đóng kết nối MySQL) khi triển khai bản mới
  app.enableShutdownHooks()
  // whitelist: bỏ các trường thừa; transform: tự ép kiểu (vd page "2" -> 2) theo DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  setupSwagger(app)
  // 0.0.0.0: Render yêu cầu lắng nghe trên mọi địa chỉ mạng
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0')
}
await bootstrap()
