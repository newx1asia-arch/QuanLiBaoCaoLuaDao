import type { EntityManager } from 'typeorm'
import { Report } from './entities/report.entity.js'
import { ReportHistory } from './entities/report-history.entity.js'
import { User } from '../auth/entities/user.entity.js'
import { LOAI, normalizeTarget } from './reports.constants.js'

// Dữ liệu mẫu để xem thử bản đồ điểm nóng và biểu đồ thống kê. Chỉ chạy khi đặt SEED_DEMO=true trong nestjs/.env.
// Mọi dòng lịch sử của dữ liệu mẫu có tên người thao tác "Dữ liệu mẫu" để nhận ra và xóa đi sau này (xem nestjs/README.md).
export const DEMO_TAG = 'Dữ liệu mẫu'

// Bộ sinh số ngẫu nhiên cố định: chạy lại luôn ra cùng một bộ dữ liệu
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

// [mã tỉnh, trọng số]: nơi đông dân và nhiều giao dịch trực tuyến có nhiều báo cáo hơn
const TINH_TRONG_SO: [string, number][] = [
  ['tp_hcm', 22], ['ha_noi', 19], ['da_nang', 8], ['hai_phong', 6], ['can_tho', 6], ['dong_nai', 6], ['khanh_hoa', 4],
  ['thanh_hoa', 4], ['nghe_an', 4], ['quang_ninh', 3], ['bac_ninh', 3], ['hue', 3], ['lam_dong', 3], ['dak_lak', 3],
  ['an_giang', 3], ['thai_nguyen', 2], ['phu_tho', 2], ['hung_yen', 2], ['ninh_binh', 2], ['gia_lai', 2], ['tay_ninh', 2],
  ['dong_thap', 2], ['vinh_long', 2], ['ca_mau', 2], ['quang_ngai', 2], ['ha_tinh', 1], ['quang_tri', 1], ['lao_cai', 1],
  ['tuyen_quang', 1], ['lang_son', 1], ['son_la', 1], ['cao_bang', 1], ['dien_bien', 1], ['lai_chau', 1],
]
const LOAI_TRONG_SO: [string, number][] = [['gia_danh', 34], ['dau_tu', 20], ['viec_lam', 16], ['mua_ban', 18], ['tinh_cam', 7], ['khac', 5]]
const TIEU_DE: Record<string, string[]> = {
  gia_danh: ['Giả danh công an yêu cầu chuyển tiền', 'Giả nhân viên ngân hàng xin mã OTP', 'Giả shipper yêu cầu nhấp vào link nhận hàng', 'Giả cán bộ điện lực dọa cắt điện'],
  dau_tu: ['Sàn đầu tư tiền ảo không cho rút tiền', 'Nhóm Zalo mời đầu tư chứng khoán cam kết lãi cao', 'App cho vay yêu cầu đóng phí giải ngân'],
  viec_lam: ['Tuyển cộng tác viên làm nhiệm vụ online', 'Việc nhẹ lương cao yêu cầu đặt cọc', 'Nhiệm vụ like, chốt đơn thưởng tiền'],
  mua_ban: ['Shop online nhận cọc rồi chặn liên lạc', 'Bán điện thoại giá rẻ không giao hàng', 'Thuê nhà đặt cọc rồi biến mất'],
  tinh_cam: ['Kết bạn mạng rồi mời gửi quà bị giữ hải quan', 'Người quen nước ngoài nhờ chuyển tiền'],
  khac: ['Mạo danh người thân vay tiền gấp', 'Đường link lạ đánh cắp tài khoản mạng xã hội'],
}
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Ngô']
const DEM = ['Văn', 'Thị', 'Minh', 'Quốc', 'Thanh', 'Ngọc', 'Hữu', 'Anh']
const TEN = ['An', 'Bình', 'Châu', 'Dũng', 'Giang', 'Hà', 'Hạnh', 'Khoa', 'Lan', 'Long', 'Mai', 'Nam', 'Phúc', 'Quân', 'Sơn', 'Thảo', 'Trang', 'Tuấn', 'Vy', 'Yến']

const pick = <T,>(r: () => number, items: [T, number][]) => {
  let x = r() * items.reduce((s, [, w]) => s + w, 0)
  for (const [v, w] of items) { x -= w; if (x <= 0) return v }
  return items[items.length - 1][0]
}

export async function seedDemo(m: EntityManager, soLuong = 160) {
  const daCo = await m.count(ReportHistory, { where: { nguoi: DEMO_TAG } })
  if (daCo > 0) return false

  const staff = await m.find(User, { where: [{ vaiTro: 'can_bo', hoatDong: true }, { vaiTro: 'admin', hoatDong: true }] })
  const r = rng(20261103)
  // Một số đối tượng bị nhiều người báo cáo để có dữ liệu "đối tượng nghi vấn" và chiến dịch
  const doiTuongLap = ['0912345679', '0987654321', 'https://dautu-vip.example.com', '0369852147', '1903456789012', 'https://shop-giamgia.example.net', '0868123456', 'https://nhiemvu-online.example.org']
  const now = Date.now()

  for (let i = 0; i < soLuong; i++) {
    const loai = pick(r, LOAI_TRONG_SO)
    const tinh = pick(r, TINH_TRONG_SO)
    // Thiên về những ngày gần đây: tăng dần theo thời gian để biểu đồ xu hướng có hình dạng
    const tuoi = Math.floor(Math.pow(r(), 1.15) * 180)
    const gio = Math.min(23, Math.floor(8 + (r() + r() + r()) * 5)) // dồn vào giờ hành chính và chiều tối
    const ngayTao = new Date(now - tuoi * 86400000)
    ngayTao.setUTCHours(gio - 7, Math.floor(r() * 60), 0, 0)
    if (ngayTao.getTime() > now) ngayTao.setTime(now - Math.floor(r() * 3600000))
    const ngayXayRa = new Date(ngayTao.getTime() - Math.floor(r() * 3) * 86400000 + 7 * 3600000).toISOString().slice(0, 10)

    const dungLap = r() < 0.28
    const doiTuong = dungLap
      ? doiTuongLap[Math.floor(r() * doiTuongLap.length)]
      : r() < 0.2 ? `https://${Math.floor(r() * 90000 + 10000)}-khuyenmai.example.com` : `0${[3, 5, 7, 8, 9][Math.floor(r() * 5)]}${String(Math.floor(r() * 1e8)).padStart(8, '0')}`
    const tier = r()
    const soTien = tier < 0.3 ? Math.round(r() * 5) * 500000 : tier < 0.75 ? Math.round(5 + r() * 40) * 1000000 : Math.round(50 + r() * 400) * 1000000

    // Báo cáo càng cũ càng có nhiều khả năng đã được xử lý xong
    const x = r() + tuoi / 180
    const trangThai = x < 0.45 ? 'cho_xu_ly' : x < 0.85 ? 'dang_xac_minh' : x < 1.45 ? 'da_xac_nhan' : 'tu_choi'
    const canBo = trangThai === 'cho_xu_ly' || !staff.length ? null : staff[Math.floor(r() * staff.length)]
    const tieuDe = TIEU_DE[loai][Math.floor(r() * TIEU_DE[loai].length)]
    const doi = tuoi > 0 && trangThai !== 'cho_xu_ly'

    await m.transaction(async (t) => {
      const rep = await t.save(
        t.create(Report, {
          tieuDe,
          loai: (LOAI as readonly string[]).includes(loai) ? loai : 'khac',
          doiTuong,
          doiTuongKey: normalizeTarget(doiTuong),
          soTienThietHai: soTien,
          ngayXayRa,
          tinhThanh: tinh,
          moTa: 'Dữ liệu mẫu dùng để xem thử bản đồ điểm nóng và biểu đồ thống kê.',
          nguoiBaoCao: `${HO[Math.floor(r() * HO.length)]} ${DEM[Math.floor(r() * DEM.length)]} ${TEN[Math.floor(r() * TEN.length)]}`,
          trangThai,
          canBo: canBo ? canBo.hoTen : 'Chưa phân công',
          canBoId: canBo ? canBo.id : null,
          nguoiTaoId: null,
          ngayTao,
        }),
      )
      const logs = [t.create(ReportHistory, { report: rep, noiDung: 'Tiếp nhận báo cáo', nguoi: DEMO_TAG, nguoiId: null, time: ngayTao })]
      if (doi) logs.push(t.create(ReportHistory, { report: rep, noiDung: `Đổi trạng thái sang: ${trangThai}`, nguoi: DEMO_TAG, nguoiId: null, time: new Date(ngayTao.getTime() + 3600000) }))
      await t.save(logs)
    })
  }
  return true
}
