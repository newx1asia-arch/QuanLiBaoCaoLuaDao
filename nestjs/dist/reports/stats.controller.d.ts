import { ReportsService } from './reports.service.js';
import type { AuthUser } from '../auth/auth-user.js';
export declare class StatsController {
    private readonly service;
    constructor(service: ReportsService);
    stats(user: AuthUser): Promise<{
        tong: number;
        choXuLy: number;
        dangXacMinh: number;
        daXacNhan: number;
        tongThietHai: number;
        byType: Record<string, number>;
        byMonth: [string, number][];
        canXuLyGap: {
            uuTien: string;
            id: number;
            tieuDe: string;
            loai: string;
            doiTuong: string;
            doiTuongKey: string;
            soTienThietHai: number;
            ngayXayRa: string;
            moTa: string | null;
            nguoiBaoCao: string;
            trangThai: string;
            canBo: string;
            nguoiTaoId: number | null;
            ngayTao: Date;
            lichSu: import("./entities/report-history.entity.js").ReportHistory[];
        }[];
        lapLai: {
            doiTuong: string;
            soLan: number;
            thietHai: number;
        }[];
        moiNhat: {
            uuTien: string;
            id: number;
            tieuDe: string;
            loai: string;
            doiTuong: string;
            doiTuongKey: string;
            soTienThietHai: number;
            ngayXayRa: string;
            moTa: string | null;
            nguoiBaoCao: string;
            trangThai: string;
            canBo: string;
            nguoiTaoId: number | null;
            ngayTao: Date;
            lichSu: import("./entities/report-history.entity.js").ReportHistory[];
        }[];
    }>;
}
