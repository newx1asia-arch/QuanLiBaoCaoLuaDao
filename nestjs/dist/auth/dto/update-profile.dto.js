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
import { IsString, MaxLength, MinLength } from 'class-validator';
export class UpdateProfileDto {
    hoTen;
}
__decorate([
    Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    IsString({ message: 'Họ tên không hợp lệ' }),
    MinLength(2, { message: 'Họ tên phải từ 2 ký tự' }),
    MaxLength(100, { message: 'Họ tên tối đa 100 ký tự' }),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "hoTen", void 0);
//# sourceMappingURL=update-profile.dto.js.map