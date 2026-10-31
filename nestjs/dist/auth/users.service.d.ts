import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import type { AuthUser } from './auth-user.js';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
export declare class UsersService implements OnModuleInit {
    private readonly repo;
    private readonly config;
    private readonly log;
    constructor(repo: Repository<User>, config: ConfigService);
    onModuleInit(): Promise<void>;
    list(q: QueryUserDto): Promise<{
        items: {
            hoatDong: boolean;
            id: number;
            email: string;
            hoTen: string;
            vaiTro: string;
            ngayTao: Date;
        }[];
        total: number;
    }>;
    staff(): Promise<string[]>;
    create(dto: CreateUserDto): Promise<{
        hoatDong: boolean;
        id: number;
        email: string;
        hoTen: string;
        vaiTro: string;
        ngayTao: Date;
    }>;
    update(id: number, dto: UpdateUserDto, actor: AuthUser): Promise<{
        hoatDong: boolean;
        id: number;
        email: string;
        hoTen: string;
        vaiTro: string;
        ngayTao: Date;
    }>;
    resetPassword(id: number, dto: ResetPasswordDto): Promise<{
        ok: boolean;
    }>;
}
