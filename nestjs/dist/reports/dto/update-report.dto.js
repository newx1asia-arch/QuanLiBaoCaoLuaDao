var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { TRANG_THAI } from '../reports.constants.js';
export class UpdateReportDto {
    trangThai;
    canBo;
    ghiChu;
}
__decorate([
    IsOptional(),
    IsIn(TRANG_THAI, { message: 'Trạng thái không hợp lệ' }),
    __metadata("design:type", String)
], UpdateReportDto.prototype, "trangThai", void 0);
__decorate([
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], UpdateReportDto.prototype, "canBo", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UpdateReportDto.prototype, "ghiChu", void 0);
//# sourceMappingURL=update-report.dto.js.map