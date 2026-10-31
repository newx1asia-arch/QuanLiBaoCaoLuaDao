import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' })
  // whitelist: bỏ các trường thừa; transform: tự ép kiểu (vd page "2" -> 2) theo DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(process.env.PORT ?? 3000)
}
await bootstrap()
