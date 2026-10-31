import { UsersService } from './users.service.js';
import type { AuthUser } from './auth-user.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
export declare class UsersController {
    private readonly service;
    constructor(service: UsersService);
    staff(): Promise<string[]>;
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
