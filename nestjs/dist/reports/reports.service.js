var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity.js';
import { ReportHistory } from './entities/report-history.entity.js';
import { TRANG_THAI_LABEL, normalizeTarget, tinhUuTien } from './reports.constants.js';
import { isStaff } from '../auth/auth.constants.js';
const withPriority = (r) => ({ ...r, uuTien: tinhUuTien(r.soTienThietHai) });
let ReportsService = class ReportsService {
    repo;
    hist;
    constructor(repo, hist) {
        this.repo = repo;
        this.hist = hist;
    }
    async onModuleInit() {
        if (await this.repo.count())
            return;
        const seed = [
            { tieuDe: 'Giả danh nhân viên ngân hàng yêu cầu cung cấp OTP', loai: 'gia_danh', doiTuong: '0912345678', soTienThietHai: 15000000, ngayXayRa: '2026-10-20', moTa: 'Tự xưng nhân viên ngân hàng, yêu cầu đọc mã OTP.', nguoiBaoCao: 'Nguyễn Văn A' },
            { tieuDe: 'Web đầu tư tiền ảo không cho rút tiền', loai: 'dau_tu', doiTuong: 'https://dautu-xyz.example.com', soTienThietHai: 80000000, ngayXayRa: '2026-10-15', moTa: 'Nạp tiền nhưng không rút được, bị yêu cầu đóng thêm phí.', nguoiBaoCao: 'Trần Thị B' },
            { tieuDe: 'Shop online nhận cọc rồi chặn liên lạc', loai: 'mua_ban', doiTuong: '0912 345 678', soTienThietHai: 2300000, ngayXayRa: '2026-10-10', moTa: 'Chuyển cọc xong thì bị chặn.', nguoiBaoCao: 'Phạm Thị D' },
        ];
        for (const s of seed)
            await this.insert(s, s.nguoiBaoCao, null);
    }
    async list(q, user) {
        const { page = 1, pageSize = 8, sort = 'id', dir = 'desc' } = q;
        const qb = this.repo.createQueryBuilder('r');
        if (!isStaff(user.vaiTro))
            qb.andWhere('r.nguoiTaoId = :uid', { uid: user.id });
        if (q.mine === '1' && isStaff(user.vaiTro))
            qb.andWhere('r.canBo = :me', { me: user.hoTen });
        if (q.type)
            qb.andWhere('r.loai = :type', { type: q.type });
        if (q.priority === 'cao')
            qb.andWhere('r.soTienThietHai >= 50000000');
        if (q.priority === 'trung_binh')
            qb.andWhere('r.soTienThietHai >= 10000000 AND r.soTienThietHai < 50000000');
        if (q.priority === 'thap')
            qb.andWhere('r.soTienThietHai < 10000000');
        if (q.keyword?.trim()) {
            qb.andWhere('(r.tieuDe LIKE :kw OR r.doiTuong LIKE :kw OR r.nguoiBaoCao LIKE :kw)', { kw: `%${q.keyword.trim()}%` });
        }
        const rows = await qb.clone().select('r.trangThai', 's').addSelect('COUNT(*)', 'n').groupBy('r.trangThai').getRawMany();
        const counts = { all: 0 };
        rows.forEach((x) => {
            counts[x.s] = Number(x.n);
            counts.all += Number(x.n);
        });
        if (q.status)
            qb.andWhere('r.trangThai = :st', { st: q.status });
        const [items, total] = await qb
            .orderBy(`r.${sort}`, dir === 'asc' ? 'ASC' : 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        return { items: items.map(withPriority), total, counts };
    }
    async lookup(raw) {
        const key = normalizeTarget(raw);
        if (key.length < 3)
            throw new BadRequestException('Nhập ít nhất 3 ký tự để tra cứu');
        const rows = await this.repo.find({ where: { doiTuongKey: key } });
        const hopLe = rows.filter((r) => r.trangThai !== 'tu_choi');
        const daXacNhan = hopLe.filter((r) => r.trangThai === 'da_xac_nhan').length;
        const theoLoai = {};
        hopLe.forEach((r) => (theoLoai[r.loai] = (theoLoai[r.loai] || 0) + 1));
        const mucDo = hopLe.length === 0 ? 'chua_co' : daXacNhan > 0 || hopLe.length >= 3 ? 'nguy_hiem' : 'can_than';
        return {
            q: raw,
            mucDo,
            soBaoCao: hopLe.length,
            daXacNhan,
            tongThietHai: hopLe.reduce((s, r) => s + r.soTienThietHai, 0),
            loai: Object.entries(theoLoai).map(([loai, soLan]) => ({ loai, soLan })).sort((a, b) => b.soLan - a.soLan),
            baoCaoGanNhat: hopLe.map((r) => r.ngayXayRa).sort().at(-1) ?? null,
        };
    }
    async get(id, user) {
        const r = await this.repo.findOne({ where: { id }, relations: { lichSu: true }, order: { lichSu: { id: 'ASC' } } });
        const staff = !user || isStaff(user.vaiTro);
        if (!r || (!staff && r.nguoiTaoId !== user.id))
            throw new NotFoundException('Không tìm thấy báo cáo');
        const cungDoiTuong = (await this.repo.find({ where: { doiTuongKey: r.doiTuongKey } })).filter((x) => x.id !== id);
        return {
            ...withPriority(r),
            lichSu: staff ? r.lichSu : r.lichSu.filter((h) => !h.noiBo),
            lienQuan: staff ? cungDoiTuong : [],
            soBaoCaoCungDoiTuong: cungDoiTuong.length + 1,
        };
    }
    async insert(dto, nguoiBaoCao, nguoiTaoId) {
        const r = await this.repo.save(this.repo.create({
            ...dto,
            nguoiBaoCao,
            nguoiTaoId,
            soTienThietHai: dto.soTienThietHai ?? 0,
            doiTuongKey: normalizeTarget(dto.doiTuong),
        }));
        await this.hist.save(this.hist.create({ report: r, noiDung: 'Tiếp nhận báo cáo', nguoi: 'Hệ thống' }));
        return r;
    }
    async create(dto, user) {
        const nguoiBaoCao = isStaff(user.vaiTro) ? dto.nguoiBaoCao?.trim() : user.hoTen;
        if (!nguoiBaoCao || nguoiBaoCao.length < 2)
            throw new BadRequestException('Vui lòng nhập tên người báo cáo');
        const r = await this.insert(dto, nguoiBaoCao, user.id);
        return this.get(r.id, user);
    }
    async update(id, dto, user) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new NotFoundException('Không tìm thấy báo cáo');
        const ghiChu = dto.ghiChu?.trim();
        const logs = [];
        if (dto.canBo && dto.canBo !== r.canBo) {
            logs.push({ noiDung: `Phân công cho: ${dto.canBo}` });
            r.canBo = dto.canBo;
        }
        if (dto.trangThai && dto.trangThai !== r.trangThai) {
            if (dto.trangThai === 'tu_choi' && !ghiChu)
                throw new BadRequestException('Vui lòng ghi rõ lý do khi từ chối báo cáo');
            const text = `Đổi trạng thái: ${TRANG_THAI_LABEL[r.trangThai]} → ${TRANG_THAI_LABEL[dto.trangThai]}`;
            logs.push({ noiDung: ghiChu ? `${text}. Ghi chú: ${ghiChu}` : text });
            r.trangThai = dto.trangThai;
        }
        else if (ghiChu) {
            logs.push({ noiDung: `Ghi chú nội bộ: ${ghiChu}`, noiBo: true });
        }
        await this.repo.save(r);
        if (logs.length) {
            await this.hist.save(logs.map((l) => this.hist.create({ report: r, noiDung: l.noiDung, noiBo: l.noiBo ?? false, nguoi: user.hoTen })));
        }
        return this.get(id, user);
    }
    async remove(id) {
        const r = await this.repo.findOneBy({ id });
        if (!r)
            throw new NotFoundException('Không tìm thấy báo cáo');
        await this.hist.createQueryBuilder().delete().where('reportId = :id', { id }).execute();
        await this.repo.remove(r);
        return { deleted: true };
    }
    async stats(user) {
        const where = isStaff(user.vaiTro) ? {} : { nguoiTaoId: user.id };
        const all = (await this.repo.find({ where, order: { id: 'DESC' } })).map(withPriority);
        const byType = {};
        const byMonth = {};
        const byTarget = {};
        all.forEach((r) => {
            byType[r.loai] = (byType[r.loai] || 0) + 1;
            const m = r.ngayTao.toISOString().slice(0, 7);
            byMonth[m] = (byMonth[m] || 0) + 1;
            const t = (byTarget[r.doiTuongKey] ||= { doiTuong: r.doiTuong, soLan: 0, thietHai: 0 });
            t.soLan += 1;
            t.thietHai += r.soTienThietHai;
        });
        const dem = (s) => all.filter((r) => r.trangThai === s).length;
        return {
            tong: all.length,
            choXuLy: dem('cho_xu_ly'),
            dangXacMinh: dem('dang_xac_minh'),
            daXacNhan: dem('da_xac_nhan'),
            tongThietHai: all.reduce((s, r) => s + r.soTienThietHai, 0),
            byType,
            byMonth: Object.entries(byMonth).sort().slice(-6),
            canXuLyGap: all.filter((r) => ['cho_xu_ly', 'dang_xac_minh'].includes(r.trangThai) && r.uuTien === 'cao'),
            lapLai: Object.values(byTarget).filter((t) => t.soLan >= 2).sort((a, b) => b.soLan - a.soLan),
            moiNhat: all.slice(0, 5),
        };
    }
};
ReportsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Report)),
    __param(1, InjectRepository(ReportHistory)),
    __metadata("design:paramtypes", [Repository,
        Repository])
], ReportsService);
export { ReportsService };
//# sourceMappingURL=reports.service.js.map