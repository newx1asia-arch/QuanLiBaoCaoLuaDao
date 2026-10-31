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
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IS_PUBLIC_KEY } from './decorators.js';
import { TokenService } from './token.service.js';
import { User } from './entities/user.entity.js';
let JwtAuthGuard = class JwtAuthGuard {
    reflector;
    tokens;
    users;
    constructor(reflector, tokens, users) {
        this.reflector = reflector;
        this.tokens = tokens;
        this.users = users;
    }
    async canActivate(ctx) {
        if (this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]))
            return true;
        const req = ctx.switchToHttp().getRequest();
        const [scheme, token] = (req.headers.authorization ?? '').split(' ');
        if (scheme !== 'Bearer' || !token)
            throw new UnauthorizedException('Vui lòng đăng nhập');
        const payload = this.tokens.verify(token);
        const u = await this.users.findOneBy({ id: payload.sub });
        if (!u || !u.hoatDong || u.tokenVersion !== payload.tv) {
            throw new UnauthorizedException('Phiên đăng nhập không còn hiệu lực, vui lòng đăng nhập lại');
        }
        req.user = { id: u.id, email: u.email, hoTen: u.hoTen, vaiTro: u.vaiTro };
        return true;
    }
};
JwtAuthGuard = __decorate([
    Injectable(),
    __param(2, InjectRepository(User)),
    __metadata("design:paramtypes", [Reflector,
        TokenService,
        Repository])
], JwtAuthGuard);
export { JwtAuthGuard };
//# sourceMappingURL=jwt-auth.guard.js.map