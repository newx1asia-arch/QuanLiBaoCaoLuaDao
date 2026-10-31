import { Repository } from 'typeorm';
import type { AuthUser } from './auth-user.js';
import { User } from './entities/user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetWithCodeDto } from './dto/reset-with-code.dto.js';
import { MailService } from './mail.service.js';
import { TokenService } from './token.service.js';
export declare const toPublicUser: (u: User) => {
    id: number;
    email: string;
    hoTen: string;
    vaiTro: string;
    ngayTao: Date;
};
export declare class AuthService {
    private readonly users;
    private readonly tokens;
    private readonly mail;
    private readonly fails;
    private readonly dummyHash;
    private readonly forgotByIp;
    constructor(users: Repository<User>, tokens: TokenService, mail: MailService);
    private session;
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
    me(auth: AuthUser): Promise<{
        id: number;
        email: string;
        hoTen: string;
        vaiTro: string;
        ngayTao: Date;
    }>;
    updateProfile(auth: AuthUser, dto: UpdateProfileDto): Promise<{
        id: number;
        email: string;
        hoTen: string;
        vaiTro: string;
        ngayTao: Date;
    }>;
    changePassword(auth: AuthUser, dto: ChangePasswordDto): Promise<{
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
    private limitForgot;
    private assertNotLocked;
    private recordFail;
}
