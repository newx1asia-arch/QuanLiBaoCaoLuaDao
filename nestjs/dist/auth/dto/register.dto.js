var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../auth.constants.js';
const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value);
const normalizeEmail = ({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);
export class RegisterDto {
    hoTen;
    email;
    matKhau;
}
__decorate([
    Transform(trim),
    IsString({ message: 'Họ tên không hợp lệ' }),
    MinLength(2, { message: 'Họ tên phải từ 2 ký tự' }),
    MaxLength(100, { message: 'Họ tên tối đa 100 ký tự' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "hoTen", void 0);
__decorate([
    Transform(normalizeEmail),
    IsEmail({}, { message: 'Email không hợp lệ' }),
    MaxLength(255),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    IsString({ message: PASSWORD_MESSAGE }),
    Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE }),
    __metadata("design:type", String)
], RegisterDto.prototype, "matKhau", void 0);
//# sourceMappingURL=register.dto.js.map