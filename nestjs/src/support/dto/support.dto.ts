import { Type } from 'class-transformer'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator'
import { AI_DO_DAI_TIN, AI_SO_TIN_TOI_DA, KHU_VUC } from '../support.constants.js'

export class QueryStatusDto {
  @IsOptional() @IsIn(KHU_VUC, { message: 'Khu vực không hợp lệ' }) khuVuc?: string
}

export class SetDutyDto {
  @IsIn(KHU_VUC, { message: 'Khu vực không hợp lệ' }) khuVuc: string
  @IsBoolean({ message: 'dangTruc phải là true hoặc false' }) dangTruc: boolean
}

export class ChatMessageDto {
  @IsIn(['user', 'assistant'], { message: 'Vai trò tin nhắn không hợp lệ' }) role: 'user' | 'assistant'
  @IsString() @MinLength(1, { message: 'Tin nhắn không được để trống' }) @MaxLength(AI_DO_DAI_TIN, { message: `Mỗi tin nhắn tối đa ${AI_DO_DAI_TIN} ký tự` }) content: string
}

export class ChatDto {
  @IsIn(KHU_VUC, { message: 'Khu vực không hợp lệ' }) khuVuc: string
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(AI_SO_TIN_TOI_DA, { message: `Tối đa ${AI_SO_TIN_TOI_DA} tin nhắn mỗi lần gửi` })
  @ValidateNested({ each: true }) @Type(() => ChatMessageDto) messages: ChatMessageDto[]
}
