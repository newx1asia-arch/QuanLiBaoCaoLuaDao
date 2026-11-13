import { Column, Entity, PrimaryColumn } from 'typeorm'

// Mỗi cán bộ một dòng: đang trực ở khu vực nào. Tách bảng riêng (không thêm cột vào bảng users)
// để nếu bảng này chưa được tạo thì chỉ chức năng hỗ trợ bị ảnh hưởng, đăng nhập vẫn hoạt động.
@Entity('truc_ban')
export class TrucBan {
  @PrimaryColumn() userId: number

  @Column({ type: 'varchar', length: 10 }) khuVuc: string

  @Column({ default: false }) dangTruc: boolean

  // Thời điểm bật / tắt gần nhất, dùng để tự hết hạn ca trực
  @Column({ type: 'datetime' }) capNhat: Date
}
