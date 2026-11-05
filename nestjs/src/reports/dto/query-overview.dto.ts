import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional } from 'class-validator'
import { LOAI } from '../reports.constants.js'

// Tham số của GET /stats/overview: khoảng thời gian (số ngày gần nhất) và lọc theo hình thức lừa đảo
export class QueryOverviewDto {
  @IsOptional() @Type(() => Number) @IsInt() @IsIn([7, 30, 90, 180, 365]) days?: number
  @IsOptional() @IsIn(LOAI) type?: string
}
