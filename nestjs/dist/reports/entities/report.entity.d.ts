import { ReportHistory } from './report-history.entity.js';
export declare class Report {
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
    lichSu: ReportHistory[];
}
