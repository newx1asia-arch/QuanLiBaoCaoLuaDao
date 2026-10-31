import { AuthService } from './auth.service.js';
import type { AuthUser } from './auth-user.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetWithCodeDto } from './dto/reset-with-code.dto.js';
export declare class AuthController {
    private readonly service;
    constructor(service: AuthService);
    register(dto: RegisterDto): Promise<{
        token: string;
        expiresIn: number;
        user: {
            id: number;
            email: string;
            hoTen: string;
            vaiTro: string;
            ngayTao: Date;
        };
    }>;
    login(dto: LoginDto, ip: string): Promise<{
        token: string;
        expiresIn: number;
        user: {
            id: number;
            email: string;
            hoTen: string;
            vaiTro: string;
            ngayTao: Date;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto, ip: string): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetWithCodeDto): Promise<{
        ok: boolean;
        message: string;
    }>;
    me(user: AuthUser): Promise<{
        id: number;
        email: string;
        hoTen: string;
        vaiTro: string;
        ngayTao: Date;
    }>;
    updateMe(user: AuthUser, dto: UpdateProfileDto): Promise<{
        id: number;
        email: string;
        hoTen: string;
        vaiTro: string;
        ngayTao: Date;
    }>;
    changePassword(user: AuthUser, dto: ChangePasswordDto): Promise<{
        token: string;
        expiresIn: number;
        user: {
            id: number;
            email: string;
            hoTen: string;
            vaiTro: string;
            ngayTao: Date;
        };
    }>;
}
