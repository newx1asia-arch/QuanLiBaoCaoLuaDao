import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional } from 'class-validator'
import { LOAI } from '../reports.constants.js'
import { MO_TA_LOAI } from '../../common/swagger.js'

// Tham số của GET /stats/overview: khoảng thời gian (số ngày gần nhất) và lọc theo hình thức lừa đảo
export class QueryOverviewDto {
  @ApiPropertyOptional({ description: 'Khoảng thời gian: số ngày gần nhất', enum: [7, 30, 90, 180, 365], default: 30, type: Number })
  @IsOptional() @Type(() => Number) @IsInt() @IsIn([7, 30, 90, 180, 365]) days?: number
  @ApiPropertyOptional({ description: MO_TA_LOAI, enum: [...LOAI] })
  @IsOptional() @IsIn(LOAI) type?: string
}
