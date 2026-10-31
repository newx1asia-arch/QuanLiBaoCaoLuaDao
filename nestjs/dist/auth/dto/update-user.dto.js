var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { VAI_TRO } from '../auth.constants.js';
export class UpdateUserDto {
    vaiTro;
    hoatDong;
}
__decorate([
    IsOptional(),
    IsIn(VAI_TRO, { message: 'Vai trò không hợp lệ' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "vaiTro", void 0);
__decorate([
    IsOptional(),
    IsBoolean({ message: 'Trạng thái không hợp lệ' }),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "hoatDong", void 0);
//# sourceMappingURL=update-user.dto.js.map