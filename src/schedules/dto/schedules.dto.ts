import { IsNotEmpty, IsOptional, IsString, IsArray, IsInt, ValidateNested, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleRuleInputDto {
  @IsNotEmpty()
  @IsString()
  playlistId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda ... 6 = Sábado

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'startTime deve estar no formato HH:MM ou HH:MM:SS',
  })
  startTime: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'endTime deve estar no formato HH:MM ou HH:MM:SS',
  })
  endTime: string;

  @IsOptional()
  @IsInt()
  priority?: number;
}

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleRuleInputDto)
  rules?: ScheduleRuleInputDto[];
}

export class UpdateScheduleRulesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleRuleInputDto)
  rules: ScheduleRuleInputDto[];
}
