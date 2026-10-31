var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { LOAI } from '../reports.constants.js';
export class CreateReportDto {
    tieuDe;
    loai;
    doiTuong;
    soTienThietHai;
    ngayXayRa;
    moTa;
    nguoiBaoCao;
}
__decorate([
    IsString({ message: 'Tiêu đề không hợp lệ' }),
    MinLength(5, { message: 'Tiêu đề phải từ 5 ký tự' }),
    MaxLength(255, { message: 'Tiêu đề tối đa 255 ký tự' }),
    __metadata("design:type", String)
], CreateReportDto.prototype, "tieuDe", void 0);
__decorate([
    IsIn(LOAI, { message: 'Loại lừa đảo không hợp lệ' }),
    __metadata("design:type", String)
], CreateReportDto.prototype, "loai", void 0);
__decorate([
    IsString({ message: 'Đối tượng lừa đảo không hợp lệ' }),
    MinLength(3, { message: 'Đối tượng lừa đảo phải từ 3 ký tự' }),
    MaxLength(255),
    __metadata("design:type", String)
], CreateReportDto.prototype, "doiTuong", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsInt({ message: 'Số tiền thiệt hại phải là số nguyên' }),
    Min(0, { message: 'Số tiền thiệt hại không được âm' }),
    __metadata("design:type", Number)
], CreateReportDto.prototype, "soTienThietHai", void 0);
__decorate([
    IsDateString({}, { message: 'Ngày xảy ra không hợp lệ (định dạng YYYY-MM-DD)' }),
    __metadata("design:type", String)
], CreateReportDto.prototype, "ngayXayRa", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreateReportDto.prototype, "moTa", void 0);
__decorate([
    IsOptional(),
    IsString({ message: 'Người báo cáo không hợp lệ' }),
    MinLength(2, { message: 'Tên người báo cáo phải từ 2 ký tự' }),
    MaxLength(100),
    __metadata("design:type", String)
], CreateReportDto.prototype, "nguoiBaoCao", void 0);
//# sourceMappingURL=create-report.dto.js.map