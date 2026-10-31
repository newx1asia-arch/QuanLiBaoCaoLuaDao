var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt, timingSafeEqual } from 'node:crypto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { hashPassword, verifyPassword } from './password.util.js';
import { MailService } from './mail.service.js';
import { TokenService } from './token.service.js';
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const RESET_MINUTES = 15;
const RESET_COOLDOWN_MS = 60 * 1000;
const RESET_MAX_TRIES = 5;
const FORGOT_PER_IP = 10;
const FORGOT_WINDOW_MS = 60 * 60 * 1000;
export const toPublicUser = (u) => ({ id: u.id, email: u.email, hoTen: u.hoTen, vaiTro: u.vaiTro, ngayTao: u.ngayTao });
let AuthService = class AuthService {
    users;
    tokens;
    mail;
    fails = new Map();
    dummyHash = hashPassword('mat-khau-gia-0');
    forgotByIp = new Map();
    constructor(users, tokens, mail) {
        this.users = users;
        this.tokens = tokens;
        this.mail = mail;
    }
    session(u) {
        return { token: this.tokens.sign(u.id, u.tokenVersion), expiresIn: this.tokens.expiresIn, user: toPublicUser(u) };
    }
    async register(dto) {
        if (await this.users.findOneBy({ email: dto.email }))
            throw new ConflictException('Email này đã được đăng ký');
        try {
            const u = await this.users.save(this.users.create({ email: dto.email, hoTen: dto.hoTen, matKhau: await hashPassword(dto.matKhau), vaiTro: 'nguoi_dan' }));
            return this.session(u);
        }
        catch (e) {
            if (e.code === 'ER_DUP_ENTRY')
                throw new ConflictException('Email này đã được đăng ký');
            throw e;
        }
    }
    async login(dto, ip) {
        const key = `${dto.email}|${ip}`;
        this.assertNotLocked(key);
        const u = await this.users.createQueryBuilder('u').addSelect('u.matKhau').where('u.email = :email', { email: dto.email }).getOne();
        const ok = await verifyPassword(dto.matKhau, u ? u.matKhau : await this.dummyHash);
        if (!u || !ok) {
            this.recordFail(key);
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }
        if (!u.hoatDong)
            throw new ForbiddenException('Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên');
        this.fails.delete(key);
        return this.session(u);
    }
    async me(auth) {
        const u = await this.users.findOneBy({ id: auth.id });
        if (!u)
            throw new UnauthorizedException('Tài khoản không tồn tại');
        return toPublicUser(u);
    }
    async updateProfile(auth, dto) {
        const u = await this.users.findOneBy({ id: auth.id });
        if (!u)
            throw new UnauthorizedException('Tài khoản không tồn tại');
        u.hoTen = dto.hoTen;
        return toPublicUser(await this.users.save(u));
    }
    async changePassword(auth, dto) {
        const u = await this.users.createQueryBuilder('u').addSelect('u.matKhau').where('u.id = :id', { id: auth.id }).getOne();
        if (!u)
            throw new UnauthorizedException('Tài khoản không tồn tại');
        if (!(await verifyPassword(dto.matKhauCu, u.matKhau)))
            throw new BadRequestException('Mật khẩu hiện tại không đúng');
        if (dto.matKhauCu === dto.matKhauMoi)
            throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại');
        u.matKhau = await hashPassword(dto.matKhauMoi);
        u.tokenVersion += 1;
        return this.session(await this.users.save(u));
    }
    async forgotPassword(dto, ip) {
        this.limitForgot(ip);
        const generic = { message: 'Nếu email đã đăng ký, mã xác nhận 6 số sẽ được gửi tới email đó. Mã có hiệu lực 15 phút.' };
        const u = await this.users.createQueryBuilder('u').addSelect('u.resetHetHan').where('u.email = :email', { email: dto.email }).getOne();
        if (!u || !u.hoatDong)
            return generic;
        const lastSent = u.resetHetHan ? u.resetHetHan.getTime() - RESET_MINUTES * 60000 : 0;
        if (Date.now() - lastSent < RESET_COOLDOWN_MS)
            return generic;
        const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
        await this.users.update(u.id, {
            resetHash: this.tokens.digest(`${u.id}:${code}`),
            resetHetHan: new Date(Date.now() + RESET_MINUTES * 60000),
            resetSoLan: 0,
        });
        void this.mail.sendResetCode(u.email, u.hoTen, code, RESET_MINUTES).catch(() => undefined);
        return generic;
    }
    async resetPassword(dto) {
        const bad = () => new BadRequestException('Mã xác nhận không đúng hoặc đã hết hạn');
        const u = await this.users
            .createQueryBuilder('u')
            .addSelect(['u.resetHash', 'u.resetHetHan', 'u.resetSoLan'])
            .where('u.email = :email', { email: dto.email })
            .getOne();
        if (!u || !u.hoatDong || !u.resetHash || !u.resetHetHan)
            throw bad();
        if (u.resetHetHan.getTime() < Date.now() || u.resetSoLan >= RESET_MAX_TRIES)
            throw bad();
        const given = Buffer.from(this.tokens.digest(`${u.id}:${dto.ma}`), 'hex');
        const expected = Buffer.from(u.resetHash, 'hex');
        if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
            await this.users.update(u.id, { resetSoLan: u.resetSoLan + 1 });
            throw bad();
        }
        await this.users.update(u.id, {
            matKhau: await hashPassword(dto.matKhauMoi),
            tokenVersion: u.tokenVersion + 1,
            resetHash: null,
            resetHetHan: null,
            resetSoLan: 0,
        });
        for (const k of this.fails.keys())
            if (k.startsWith(`${dto.email}|`))
                this.fails.delete(k);
        return { ok: true, message: 'Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.' };
    }
    limitForgot(ip) {
        const now = Date.now();
        let e = this.forgotByIp.get(ip);
        if (!e || now - e.first > FORGOT_WINDOW_MS)
            e = { n: 0, first: now };
        e.n += 1;
        this.forgotByIp.set(ip, e);
        if (e.n > FORGOT_PER_IP) {
            throw new HttpException('Bạn đã yêu cầu mã quá nhiều lần, vui lòng thử lại sau', HttpStatus.TOO_MANY_REQUESTS);
        }
        if (this.forgotByIp.size > 5000) {
            for (const [k, v] of this.forgotByIp)
                if (now - v.first > FORGOT_WINDOW_MS)
                    this.forgotByIp.delete(k);
        }
    }
    assertNotLocked(key) {
        const e = this.fails.get(key);
        if (!e)
            return;
        const now = Date.now();
        if (e.until > now) {
            const phut = Math.ceil((e.until - now) / 60000);
            throw new HttpException(`Đăng nhập sai quá nhiều lần, vui lòng thử lại sau ${phut} phút`, HttpStatus.TOO_MANY_REQUESTS);
        }
        if (e.until)
            this.fails.delete(key);
    }
    recordFail(key) {
        const now = Date.now();
        let e = this.fails.get(key);
        if (!e || now - e.first > WINDOW_MS)
            e = { n: 0, first: now, until: 0 };
        e.n += 1;
        if (e.n >= MAX_FAILS)
            e.until = now + LOCK_MS;
        this.fails.set(key, e);
        if (this.fails.size > 5000) {
            for (const [k, v] of this.fails)
                if (now - v.first > WINDOW_MS && v.until < now)
                    this.fails.delete(k);
        }
    }
};
AuthService = __decorate([
    Injectable(),
    __param(0, InjectRepository(User)),
    __metadata("design:paramtypes", [Repository,
        TokenService,
        MailService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map