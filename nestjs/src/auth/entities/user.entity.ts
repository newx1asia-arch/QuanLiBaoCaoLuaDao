import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { VAI_TRO } from '../auth.constants.js'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id: number

  @Index({ unique: true }) @Column({ length: 255 }) email: string

  @Column({ length: 100 }) hoTen: string

  // select: false => mặc định không bao giờ trả mật khẩu ra ngoài, chỉ lấy khi đăng nhập/đổi mật khẩu
  @Column({ length: 255, select: false }) matKhau: string

  @Column({ type: 'enum', enum: [...VAI_TRO], default: 'nguoi_dan' }) vaiTro: string

  // false = tài khoản bị khóa
  @Column({ default: true }) hoatDong: boolean

  @Column({ default: 0 }) tokenVersion: number

  // Quên mật khẩu: chỉ lưu bản băm của mã 6 số (không lưu mã gốc), mã hết hạn sau vài phút và chỉ được thử vài lần
  @Column({ type: 'varchar', length: 64, nullable: true, select: false }) resetHash: string | null
  @Column({ type: 'datetime', nullable: true, select: false }) resetHetHan: Date | null
  @Column({ type: 'int', default: 0, select: false }) resetSoLan: number

  @CreateDateColumn() ngayTao: Date
}
