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

  // Tên hiển thị tại thời điểm thao tác
  @Column({ length: 100, default: 'Quản trị viên' }) nguoi: string

  // Tài khoản thực hiện (null = hệ thống). Tên có thể đổi, id thì không
  @Column({ type: 'int', nullable: true }) nguoiId: number | null

  @CreateDateColumn() time: Date
}
