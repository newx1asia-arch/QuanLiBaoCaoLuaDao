import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm'
import { Report } from './report.entity.js'

@Entity('report_history')
export class ReportHistory {
  @PrimaryGeneratedColumn() id: number

  // Relation<> tránh lỗi import vòng giữa 2 entity khi dùng ES module
  @ManyToOne(() => Report, (r) => r.lichSu, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportId' })
  report: Relation<Report>

  @Column({ type: 'text' }) noiDung: string

  @Column({ length: 100, default: 'Quản trị viên' }) nguoi: string

  // true = ghi chú nội bộ của cán bộ, ẩn với người dân
  @Column({ default: false }) noiBo: boolean

  @CreateDateColumn() time: Date
}
