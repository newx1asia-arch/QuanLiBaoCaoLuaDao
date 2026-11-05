import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

// Gửi email. Nếu chưa cấu hình SMTP_HOST thì không gửi được email thật:
//  - khi phát triển: in mã ra terminal của backend để bạn tự lấy dùng thử
//  - khi production: không in mã (tránh lộ qua file log), quản trị viên dùng chức năng "Đặt lại mật khẩu" ở trang Người dùng
// Muốn gửi email thật: chạy `npm i nodemailer` rồi điền SMTP_* trong .env (xem .env.example)
@Injectable()
export class MailService {
  private readonly log = new Logger('Mail')

  constructor(private readonly config: ConfigService) {}

  async sendResetCode(to: string, hoTen: string, code: string, minutes: number): Promise<void> {
    const subject = 'Mã đặt lại mật khẩu - Báo Cáo Lừa Đảo'
    const text =
      `Xin chào ${hoTen},\n\n` +
      `Mã xác nhận đặt lại mật khẩu của bạn là: ${code}\n` +
      `Mã có hiệu lực trong ${minutes} phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.\n`

    if (await this.trySmtp(to, subject, text)) return

    if (process.env.NODE_ENV === 'production') {
      this.log.warn(`Chưa cấu hình SMTP nên không gửi được mã đặt lại mật khẩu cho ${to}`)
    } else {
      this.log.warn(`[CHƯA CẤU HÌNH SMTP] Mã đặt lại mật khẩu của ${to}: ${code} (hết hạn sau ${minutes} phút)`)
    }
  }

  private async trySmtp(to: string, subject: string, text: string): Promise<boolean> {
    const host = this.config.get<string>('SMTP_HOST')
    if (!host) return false
    try {
      // nodemailer là thư viện tùy chọn: nạp động để server vẫn chạy được khi chưa cài
      const name = 'nodemailer'
      const nodemailer = (await import(name)) as { default?: any; createTransport?: any }
      const createTransport = nodemailer.createTransport ?? nodemailer.default?.createTransport
      if (!createTransport) throw new Error('Không tìm thấy nodemailer, hãy chạy: npm i nodemailer')
      const port = Number(this.config.get('SMTP_PORT', 587))
      const user = this.config.get<string>('SMTP_USER')
      const transport = createTransport({
        host,
        port,
        secure: port === 465,
        auth: user ? { user, pass: this.config.get<string>('SMTP_PASS') } : undefined,
      })
      await transport.sendMail({ from: this.config.get('SMTP_FROM', user ?? 'no-reply@baocao.local'), to, subject, text })
      return true
    } catch (e) {
      this.log.error(`Gửi email thất bại: ${(e as Error).message}`)
      return false
    }
  }
}
