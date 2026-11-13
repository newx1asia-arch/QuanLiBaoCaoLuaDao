import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { MUC_DO, PHAM_VI, TRANG_THAI_CANH_BAO } from '../alerts.constants.js'
import type { KetQuaKenh, NhatKyCanhBao } from '../alerts.constants.js'

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn() id: number

  @Column({ length: 200 }) tieuDe: string

  @Column({ type: 'enum', enum: [...MUC_DO], default: 'canh_bao' }) mucDo: string

  // Nội dung theo từng kênh (mỗi kênh có độ dài và giọng văn riêng)
  @Column({ type: 'text' }) noiDung: string // website
  @Column({ type: 'text', nullable: true }) noiDungSms: string | null
  @Column({ type: 'text', nullable: true }) noiDungUngDung: string | null
  @Column({ type: 'text', nullable: true }) noiDungMxh: string | null

  // Các kênh sẽ phát hành, vd ["website","sms"]
  @Column({ type: 'simple-json' }) kenh: string[]

  @Column({ type: 'enum', enum: [...PHAM_VI], default: 'toan_quoc' }) phamVi: string
  // Mã tỉnh, thành (TINH_THANH) khi phamVi = dia_ban
  @Column({ type: 'simple-json' }) tinhThanh: string[]

  @Index() @Column({ type: 'enum', enum: [...TRANG_THAI_CANH_BAO], default: 'nhap' }) trangThai: string

  @Column({ type: 'int' }) nguoiSoanId: number
  @Column({ length: 100 }) nguoiSoan: string
  @Column({ type: 'int', nullable: true }) nguoiDuyetId: number | null
  @Column({ type: 'varchar', length: 100, nullable: true }) nguoiDuyet: string | null
  // Lý do từ chối hoặc ghi chú khi duyệt
  @Column({ type: 'text', nullable: true }) ghiChuDuyet: string | null

  @Column({ type: 'datetime', nullable: true }) phatHanhLuc: Date | null
  @Column({ type: 'simple-json', nullable: true }) ketQuaKenh: KetQuaKenh[] | null
  @Column({ type: 'simple-json' }) nhatKy: NhatKyCanhBao[]

  @CreateDateColumn() ngayTao: Date
  @UpdateDateColumn() capNhat: Date
}
