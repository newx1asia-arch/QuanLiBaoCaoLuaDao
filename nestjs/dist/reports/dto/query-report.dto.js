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
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { LOAI, TRANG_THAI, UU_TIEN } from '../reports.constants.js';
export class QueryReportDto {
    keyword;
    status;
    type;
    priority;
    mine;
    sort;
    dir;
    page;
    pageSize;
}
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], QueryReportDto.prototype, "keyword", void 0);
__decorate([
    IsOptional(),
    IsIn(TRANG_THAI),
    __metadata("design:type", String)
], QueryReportDto.prototype, "status", void 0);
__decorate([
    IsOptional(),
    IsIn(LOAI),
    __metadata("design:type", String)
], QueryReportDto.prototype, "type", void 0);
__decorate([
    IsOptional(),
    IsIn(UU_TIEN),
    __metadata("design:type", String)
], QueryReportDto.prototype, "priority", void 0);
__decorate([
    IsOptional(),
    IsIn(['1']),
    __metadata("design:type", String)
], QueryReportDto.prototype, "mine", void 0);
__decorate([
    IsOptional(),
    IsIn(['id', 'soTienThietHai', 'ngayXayRa']),
    __metadata("design:type", String)
], QueryReportDto.prototype, "sort", void 0);
__decorate([
    IsOptional(),
    IsIn(['asc', 'desc']),
    __metadata("design:type", String)
], QueryReportDto.prototype, "dir", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], QueryReportDto.prototype, "page", void 0);
__decorate([
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(100000),
    __metadata("design:type", Number)
], QueryReportDto.prototype, "pageSize", void 0);
//# sourceMappingURL=query-report.dto.js.map