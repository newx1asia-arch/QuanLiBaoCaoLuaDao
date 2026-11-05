import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { VAI_TRO } from '../auth.constants.js'

export class QueryUserDto {
  @IsOptional() @IsString() @MaxLength(255) keyword?: string
  @IsOptional() @IsIn(VAI_TRO) role?: string
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number
}
