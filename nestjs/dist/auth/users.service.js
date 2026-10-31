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
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { toPublicUser } from './auth.service.js';
import { hashPassword } from './password.util.js';
const withStatus = (u) => ({ ...toPublicUser(u), hoatDong: u.hoatDong });
let UsersService = class UsersService {
    repo;
    config;
    log = new Logger('Users');
    constructor(repo, config) {
        this.repo = repo;
        this.config = config;
    }
    async onModuleInit() {
        if (await this.repo.count())
            return;
        const email = String(this.config.get('ADMIN_EMAIL', 'admin@baocao.local')).toLowerCase();
        const password = this.config.get('ADMIN_PASSWORD');
        if (!password && process.env.NODE_ENV === 'production') {
            this.log.warn('Chưa có tài khoản nào và thiếu ADMIN_PASSWORD, bỏ qua việc tạo admin mặc định');
            return;
        }
        const matKhau = password || 'Admin@12345';
        await this.repo.save(this.repo.create({ email, hoTen: 'Quản trị viên', matKhau: await hashPassword(matKhau), vaiTro: 'admin' }));
        this.log.warn(`Đã tạo admin mặc định: ${email}${password ? '' : ' / Admin@12345 (hãy đổi mật khẩu ngay)'}`);
    }
    async list(q) {
        const { page = 1, pageSize = 10 } = q;
        const qb = this.repo.createQueryBuilder('u');
        if (q.role)
            qb.andWhere('u.vaiTro = :role', { role: q.role });
        if (q.keyword?.trim())
            qb.andWhere('(u.hoTen LIKE :kw OR u.email LIKE :kw)', { kw: `%${q.keyword.trim()}%` });
        const [items, total] = await qb
            .orderBy('u.id', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        return { items: items.map(withStatus), total };
    }
    async staff() {
        const rows = await this.repo.find({ where: { vaiTro: In(['can_bo', 'admin']), hoatDong: true }, order: { hoTen: 'ASC' } });
        return [...new Set(rows.map((u) => u.hoTen))];
    }
    async create(dto) {
        if (await this.repo.findOneBy({ email: dto.email }))
            throw new ConflictException('Email này đã được đăng ký');
        const u = await this.repo.save(this.repo.create({ email: dto.email, hoTen: dto.hoTen, matKhau: await hashPassword(dto.matKhau), vaiTro: dto.vaiTro }));
        return withStatus(u);
    }
    async update(id, dto, actor) {
        const u = await this.repo.findOneBy({ id });
        if (!u)
            throw new NotFoundException('Không tìm thấy người dùng');
        if (u.id === actor.id && ((dto.vaiTro && dto.vaiTro !== u.vaiTro) || dto.hoatDong === false)) {
            throw new BadRequestException('Bạn không thể đổi vai trò hoặc khóa chính tài khoản của mình');
        }
        if (dto.vaiTro)
            u.vaiTro = dto.vaiTro;
        if (dto.hoatDong !== undefined)
            u.hoatDong = dto.hoatDong;
        return withStatus(await this.repo.save(u));
    }
    async resetPassword(id, dto) {
        const u = await this.repo.findOneBy({ id });
        if (!u)
            throw new NotFoundException('Không tìm thấy người dùng');
        u.matKhau = await hashPassword(dto.matKhau);
        u.tokenVersion += 1;
        await this.repo.save(u);
        return { ok: true };
    }
};
UsersService = __decorate([
    Injectable(),
    __param(0, InjectRepository(User)),
    __metadata("design:paramtypes", [Repository,
        ConfigService])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map