import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, VersionColumn } from 'typeorm'
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

  // Tỉnh, thành nơi xảy ra vụ việc (mã trong TINH_THANH). Null với báo cáo cũ chưa ghi địa bàn
  @Index() @Column({ type: 'varchar', length: 30, nullable: true }) tinhThanh: string | null

  @Column({ type: 'text', nullable: true }) moTa: string | null

  // Họ tên người dân/nạn nhân đã trình báo (do cán bộ nhập hộ)
  @Column({ length: 100 }) nguoiBaoCao: string

  @Index() @Column({ type: 'enum', enum: [...TRANG_THAI], default: 'cho_xu_ly' }) trangThai: string

  // Nguồn tiếp nhận: 'can_bo' (cán bộ nhập hộ, mặc định) hoặc 'nguoi_dan' (người dân tự gửi qua trang công khai)
  @Index() @Column({ type: 'varchar', length: 20, default: 'can_bo' }) kenh: string

  // Số điện thoại / email người dân để lại (tùy chọn), chỉ cán bộ đăng nhập mới xem được
  @Column({ type: 'varchar', length: 100, nullable: true }) lienHe: string | null

  // Tên cán bộ phụ trách để hiển thị; quyền xử lý được xác định theo canBoId, không theo tên
  @Column({ length: 100, default: 'Chưa phân công' }) canBo: string

  // Tài khoản cán bộ đang phụ trách (null = chưa ai nhận)
  @Index() @Column({ type: 'int', nullable: true }) canBoId: number | null

  // Cán bộ đã nhập báo cáo (null với dữ liệu mẫu)
  @Index() @Column({ type: 'int', nullable: true }) nguoiTaoId: number | null

  // Tăng 1 mỗi lần sửa: dùng để chặn hai người sửa cùng lúc ghi đè nhau
  @VersionColumn() phienBan: number

  // Xóa mềm: báo cáo bị xóa vẫn còn trong CSDL để truy vết
  @DeleteDateColumn() xoaLuc: Date | null

  @CreateDateColumn() ngayTao: Date

  @OneToMany(() => ReportHistory, (h) => h.report) lichSu: ReportHistory[]
}
