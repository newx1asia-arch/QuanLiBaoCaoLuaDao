import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { LOAI, TRANG_THAI } from '../reports.constants.js'
import { ReportHistory } from './report-history.entity.js'

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn() id: number

  @Column({ length: 255 }) tieuDe: string

  @Column({ type: 'enum', enum: [...LOAI] }) loai: string

  @Column({ length: 255 }) doiTuong: string

  // Bản chuẩn hóa của doiTuong, dùng để tìm các báo cáo trùng đối tượng
  @Index() @Column({ length: 255 }) doiTuongKey: string

  @Column({
    type: 'bigint',
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  soTienThietHai: number

  @Column({ type: 'date' }) ngayXayRa: string

  @Column({ type: 'text', nullable: true }) moTa: string | null

  @Column({ length: 100 }) nguoiBaoCao: string

  @Index() @Column({ type: 'enum', enum: [...TRANG_THAI], default: 'cho_xu_ly' }) trangThai: string

  @Column({ length: 100, default: 'Chưa phân công' }) canBo: string

  // Tài khoản đã tạo báo cáo (null với dữ liệu mẫu). Người dân chỉ xem được báo cáo của chính mình
  @Index() @Column({ type: 'int', nullable: true }) nguoiTaoId: number | null

  @CreateDateColumn() ngayTao: Date

  @OneToMany(() => ReportHistory, (h) => h.report) lichSu: ReportHistory[]
}
