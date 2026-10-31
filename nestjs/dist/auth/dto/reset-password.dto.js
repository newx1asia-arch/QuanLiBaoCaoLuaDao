var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, Matches } from 'class-validator';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../auth.constants.js';
export class ResetPasswordDto {
    matKhau;
}
__decorate([
    IsString({ message: PASSWORD_MESSAGE }),
    Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "matKhau", void 0);
//# sourceMappingURL=reset-password.dto.js.map