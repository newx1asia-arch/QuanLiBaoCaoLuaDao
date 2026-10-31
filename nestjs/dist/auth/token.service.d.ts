import { ConfigService } from '@nestjs/config';
export interface TokenPayload {
    sub: number;
    tv: number;
    iat: number;
    exp: number;
}
export declare class TokenService {
    private readonly secret;
    readonly expiresIn: number;
    constructor(config: ConfigService);
    private signature;
    digest(data: string): string;
    sign(sub: number, tv: number): string;
    verify(token: string): TokenPayload;
}
