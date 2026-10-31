import type { VaiTro } from './auth.constants.js';
export interface AuthUser {
    id: number;
    email: string;
    hoTen: string;
    vaiTro: VaiTro;
}
