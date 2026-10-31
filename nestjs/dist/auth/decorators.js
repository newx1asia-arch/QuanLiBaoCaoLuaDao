import { createParamDecorator, SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Roles = (...roles) => SetMetadata(ROLES_KEY, roles);
export const CurrentUser = createParamDecorator((_data, ctx) => ctx.switchToHttp().getRequest().user);
//# sourceMappingURL=decorators.js.map