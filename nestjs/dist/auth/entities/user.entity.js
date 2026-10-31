var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { VAI_TRO } from '../auth.constants.js';
let User = class User {
    id;
    email;
    hoTen;
    matKhau;
    vaiTro;
    hoatDong;
    tokenVersion;
    resetHash;
    resetHetHan;
    resetSoLan;
    ngayTao;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    Index({ unique: true }),
    Column({ length: 255 }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({ length: 100 }),
    __metadata("design:type", String)
], User.prototype, "hoTen", void 0);
__decorate([
    Column({ length: 255, select: false }),
    __metadata("design:type", String)
], User.prototype, "matKhau", void 0);
__decorate([
    Column({ type: 'enum', enum: [...VAI_TRO], default: 'nguoi_dan' }),
    __metadata("design:type", String)
], User.prototype, "vaiTro", void 0);
__decorate([
    Column({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "hoatDong", void 0);
__decorate([
    Column({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "tokenVersion", void 0);
__decorate([
    Column({ type: 'varchar', length: 64, nullable: true, select: false }),
    __metadata("design:type", Object)
], User.prototype, "resetHash", void 0);
__decorate([
    Column({ type: 'datetime', nullable: true, select: false }),
    __metadata("design:type", Object)
], User.prototype, "resetHetHan", void 0);
__decorate([
    Column({ type: 'int', default: 0, select: false }),
    __metadata("design:type", Number)
], User.prototype, "resetSoLan", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "ngayTao", void 0);
User = __decorate([
    Entity('users')
], User);
export { User };
//# sourceMappingURL=user.entity.js.map