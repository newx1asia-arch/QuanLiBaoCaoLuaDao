import { ReportsService } from './reports.service.js';
import { LookupDto } from './dto/lookup.dto.js';
export declare class LookupController {
    private readonly service;
    constructor(service: ReportsService);
    lookup(q: LookupDto): Promise<{
        q: string;
        mucDo: string;
        soBaoCao: number;
        daXacNhan: number;
        tongThietHai: number;
        loai: {
            loai: string;
            soLan: number;
        }[];
        baoCaoGanNhat: string | null;
    }>;
}
