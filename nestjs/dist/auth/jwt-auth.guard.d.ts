import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { TokenService } from './token.service.js';
import { User } from './entities/user.entity.js';
export declare class JwtAuthGuard implements CanActivate {
    private readonly reflector;
    private readonly tokens;
    private readonly users;
    constructor(reflector: Reflector, tokens: TokenService, users: Repository<User>);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
