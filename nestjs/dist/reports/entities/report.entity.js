var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LOAI, TRANG_THAI } from '../reports.constants.js';
import { ReportHistory } from './report-history.entity.js';
let Report = class Report {
    id;
    tieuDe;
    loai;
    doiTuong;
    doiTuongKey;
    soTienThietHai;
    ngayXayRa;
    moTa;
    nguoiBaoCao;
    trangThai;
    canBo;
    nguoiTaoId;
    ngayTao;
    lichSu;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Report.prototype, "id", void 0);
__decorate([
    Column({ length: 255 }),
    __metadata("design:type", String)
], Report.prototype, "tieuDe", void 0);
__decorate([
    Column({ type: 'enum', enum: [...LOAI] }),
    __metadata("design:type", String)
], Report.prototype, "loai", void 0);
__decorate([
    Column({ length: 255 }),
    __metadata("design:type", String)
], Report.prototype, "doiTuong", void 0);
__decorate([
    Index(),
    Column({ length: 255 }),
    __metadata("design:type", String)
], Report.prototype, "doiTuongKey", void 0);
__decorate([
    Column({
        type: 'bigint',
        default: 0,
        transformer: { to: (v) => v, from: (v) => Number(v) },
    }),
    __metadata("design:type", Number)
], Report.prototype, "soTienThietHai", void 0);
__decorate([
    Column({ type: 'date' }),
    __metadata("design:type", String)
], Report.prototype, "ngayXayRa", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Report.prototype, "moTa", void 0);
__decorate([
    Column({ length: 100 }),
    __metadata("design:type", String)
], Report.prototype, "nguoiBaoCao", void 0);
__decorate([
    Index(),
    Column({ type: 'enum', enum: [...TRANG_THAI], default: 'cho_xu_ly' }),
    __metadata("design:type", String)
], Report.prototype, "trangThai", void 0);
__decorate([
    Column({ length: 100, default: 'Chưa phân công' }),
    __metadata("design:type", String)
], Report.prototype, "canBo", void 0);
__decorate([
    Index(),
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Report.prototype, "nguoiTaoId", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Report.prototype, "ngayTao", void 0);
__decorate([
    OneToMany(() => ReportHistory, (h) => h.report),
    __metadata("design:type", Array)
], Report.prototype, "lichSu", void 0);
Report = __decorate([
    Entity('reports')
], Report);
export { Report };
//# sourceMappingURL=report.entity.js.map