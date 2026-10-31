import { type Relation } from 'typeorm';
import { Report } from './report.entity.js';
export declare class ReportHistory {
    id: number;
    report: Relation<Report>;
    noiDung: string;
    nguoi: string;
    noiBo: boolean;
    time: Date;
}
