import type { VaiTro } from './auth.constants.js';
export declare const IS_PUBLIC_KEY = "isPublic";
export declare const ROLES_KEY = "roles";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare const Roles: (...roles: VaiTro[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
