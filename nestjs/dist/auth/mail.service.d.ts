import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly config;
    private readonly log;
    constructor(config: ConfigService);
    sendResetCode(to: string, hoTen: string, code: string, minutes: number): Promise<void>;
    private trySmtp;
}
