var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
let MailService = class MailService {
    config;
    log = new Logger('Mail');
    constructor(config) {
        this.config = config;
    }
    async sendResetCode(to, hoTen, code, minutes) {
        const subject = 'Mã đặt lại mật khẩu - Báo Cáo Lừa Đảo';
        const text = `Xin chào ${hoTen},\n\n` +
            `Mã xác nhận đặt lại mật khẩu của bạn là: ${code}\n` +
            `Mã có hiệu lực trong ${minutes} phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.\n`;
        if (await this.trySmtp(to, subject, text))
            return;
        if (process.env.NODE_ENV === 'production') {
            this.log.warn(`Chưa cấu hình SMTP nên không gửi được mã đặt lại mật khẩu cho ${to}`);
        }
        else {
            this.log.warn(`[CHƯA CẤU HÌNH SMTP] Mã đặt lại mật khẩu của ${to}: ${code} (hết hạn sau ${minutes} phút)`);
        }
    }
    async trySmtp(to, subject, text) {
        const host = this.config.get('SMTP_HOST');
        if (!host)
            return false;
        try {
            const name = 'nodemailer';
            const nodemailer = (await import(name));
            const createTransport = nodemailer.createTransport ?? nodemailer.default?.createTransport;
            if (!createTransport)
                throw new Error('Không tìm thấy nodemailer, hãy chạy: npm i nodemailer');
            const port = Number(this.config.get('SMTP_PORT', 587));
            const user = this.config.get('SMTP_USER');
            const transport = createTransport({
                host,
                port,
                secure: port === 465,
                auth: user ? { user, pass: this.config.get('SMTP_PASS') } : undefined,
            });
            await transport.sendMail({ from: this.config.get('SMTP_FROM', user ?? 'no-reply@baocao.local'), to, subject, text });
            return true;
        }
        catch (e) {
            this.log.error(`Gửi email thất bại: ${e.message}`);
            return false;
        }
    }
};
MailService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], MailService);
export { MailService };
//# sourceMappingURL=mail.service.js.map