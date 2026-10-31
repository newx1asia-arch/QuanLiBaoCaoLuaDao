var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Report } from './report.entity.js';
let ReportHistory = class ReportHistory {
    id;
    report;
    noiDung;
    nguoi;
    noiBo;
    time;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], ReportHistory.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Report, (r) => r.lichSu, { onDelete: 'CASCADE' }),
    JoinColumn({ name: 'reportId' }),
    __metadata("design:type", Object)
], ReportHistory.prototype, "report", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], ReportHistory.prototype, "noiDung", void 0);
__decorate([
    Column({ length: 100, default: 'Quản trị viên' }),
    __metadata("design:type", String)
], ReportHistory.prototype, "nguoi", void 0);
__decorate([
    Column({ default: false }),
    __metadata("design:type", Boolean)
], ReportHistory.prototype, "noiBo", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], ReportHistory.prototype, "time", void 0);
ReportHistory = __decorate([
    Entity('report_history')
], ReportHistory);
export { ReportHistory };
//# sourceMappingURL=report-history.entity.js.map