import { applyDecorators, Logger } from '@nestjs/common'
import type { NestExpressApplication } from '@nestjs/platform-express'
import {
  ApiBearerAuth, ApiConflictResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiTooManyRequestsResponse, ApiUnauthorizedResponse,
  DocumentBuilder, SwaggerModule,
} from '@nestjs/swagger'

// Mô tả dùng chung cho các trường có danh sách giá trị cố định
export const MO_TA_LOAI =
  'Hình thức lừa đảo: gia_danh (giả danh công an, ngân hàng, shipper...), dau_tu (đầu tư, tiền ảo, cho vay), viec_lam (việc làm online, cộng tác viên), mua_ban (mua bán online), tinh_cam (lừa đảo tình cảm), khac (khác)'
export const MO_TA_TRANG_THAI = 'Trạng thái báo cáo: cho_xu_ly (chờ xử lý), dang_xac_minh (đang xác minh), da_xac_nhan (đã xác nhận), tu_choi (từ chối)'
export const MO_TA_TINH = 'Mã tỉnh, thành (vd ha_noi, tp_hcm, da_nang)'

// Gắn cho API cần đăng nhập: hiện ổ khóa trên Swagger và liệt kê các mã lỗi chung (401, 403)
export const ApiLogin = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Chưa đăng nhập, token sai hoặc đã hết hạn' }),
    ApiForbiddenResponse({ description: 'Tài khoản không đủ quyền thực hiện thao tác này' }),
  )

export const ApiNotFound = (what = 'báo cáo') => ApiNotFoundResponse({ description: `Không tìm thấy ${what}` })
export const ApiConflict = (why: string) => ApiConflictResponse({ description: why })
export const ApiRateLimited = () => ApiTooManyRequestsResponse({ description: 'Gọi quá nhiều lần, thử lại sau ít phút' })

// Tài liệu API tại /api/docs. Mặc định bật khi phát triển, tắt khi production (đặt SWAGGER_ENABLED=true để mở trên bản thật)
export function setupSwagger(app: NestExpressApplication) {
  const on = process.env.SWAGGER_ENABLED ?? (process.env.NODE_ENV === 'production' ? 'false' : 'true')
  if (on !== 'true') return
  const config = new DocumentBuilder()
    .setTitle('Báo cáo lừa đảo API')
    .setDescription(
      'Hệ thống tiếp nhận và quản lý báo cáo lừa đảo (Cục An ninh mạng).\n\n' +
        '**Cách thử API cần đăng nhập:** gọi `POST /api/auth/login`, copy giá trị `token` trong kết quả, bấm nút **Authorize** ở góc phải rồi dán token vào (không cần gõ chữ Bearer).\n\n' +
        'Vai trò: `can_bo` (cán bộ) và `admin` (quản trị viên). API gắn ổ khóa cần đăng nhập; API không có ổ khóa là công khai.',
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Token lấy từ POST /api/auth/login' })
    .addTag('Xác thực', 'Đăng nhập, quên mật khẩu, hồ sơ cá nhân, đổi mật khẩu')
    .addTag('Người dùng', 'Quản lý tài khoản cán bộ (chủ yếu dành cho quản trị viên)')
    .addTag('Báo cáo', 'Tiếp nhận, tra danh sách, xử lý báo cáo lừa đảo')
    .addTag('Báo cáo công khai', 'Người dân gửi báo cáo, không cần đăng nhập')
    .addTag('Tra cứu', 'Tra một SĐT, số tài khoản hoặc link đã bị báo cáo chưa')
    .addTag('Đối tượng nghi vấn', 'Danh sách đối tượng nghi vấn và giám sát trực tiếp')
    .addTag('Thống kê', 'Số liệu cho bảng điều hành, trang Thống kê và bản đồ điểm nóng')
    .addTag('Cảnh báo phát hành', 'Soạn, duyệt và phát hành cảnh báo tới người dân')
    .addTag('Cảnh báo công khai', 'Danh sách cảnh báo đã phát hành, không cần đăng nhập')
    .addTag('Hệ thống', 'Kiểm tra backend còn hoạt động')
    .build()
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config), {
    customSiteTitle: 'Báo cáo lừa đảo API',
    swaggerOptions: { persistAuthorization: true, docExpansion: 'none' },
  })
  new Logger('Swagger').log('Tài liệu API: /api/docs')
}
