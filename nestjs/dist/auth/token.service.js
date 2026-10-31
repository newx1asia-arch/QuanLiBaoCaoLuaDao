var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
const DEV_SECRET = 'dev-only-secret-doi-gia-tri-nay-trong-file-env';
const b64url = (v) => Buffer.from(v).toString('base64url');
let TokenService = class TokenService {
    secret;
    expiresIn;
    constructor(config) {
        const secret = config.get('JWT_SECRET');
        if (!secret && process.env.NODE_ENV === 'production') {
            throw new Error('Thiếu JWT_SECRET trong môi trường production');
        }
        if (!secret)
            new Logger('Auth').warn('Chưa đặt JWT_SECRET trong .env, đang dùng khóa mặc định (chỉ dùng khi phát triển)');
        this.secret = secret || DEV_SECRET;
        this.expiresIn = Number(config.get('JWT_EXPIRES_HOURS', 12)) * 3600;
    }
    signature(data) {
        return createHmac('sha256', this.secret).update(data).digest();
    }
    digest(data) {
        return this.signature(`digest:${data}`).toString('hex');
    }
    sign(sub, tv) {
        const iat = Math.floor(Date.now() / 1000);
        const head = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const body = b64url(JSON.stringify({ sub, tv, iat, exp: iat + this.expiresIn }));
        return `${head}.${body}.${b64url(this.signature(`${head}.${body}`))}`;
    }
    verify(token) {
        const invalid = () => new UnauthorizedException('Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại');
        const parts = token.split('.');
        if (parts.length !== 3)
            throw invalid();
        const [head, body, sig] = parts;
        const expected = this.signature(`${head}.${body}`);
        const given = Buffer.from(sig, 'base64url');
        if (given.length !== expected.length || !timingSafeEqual(given, expected))
            throw invalid();
        try {
            if (JSON.parse(Buffer.from(head, 'base64url').toString()).alg !== 'HS256')
                throw invalid();
            const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
            if (typeof payload.sub !== 'number' || typeof payload.exp !== 'number')
                throw invalid();
            if (payload.exp <= Math.floor(Date.now() / 1000)) {
                throw new UnauthorizedException('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
            }
            return payload;
        }
        catch (e) {
            throw e instanceof UnauthorizedException ? e : invalid();
        }
    }
};
TokenService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], TokenService);
export { TokenService };
//# sourceMappingURL=token.service.js.map