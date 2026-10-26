import { IsNotEmpty, IsOptional, IsString, IsArray, IsInt, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class InterleaveRulesDto {
  @IsString()
  type: string; // "INTERVAL_BY_COUNT" ou "INTERVAL_BY_TIME"

  @IsOptional()
  @IsInt()
  youtubeFrequency?: number; // A cada X vídeos do YouTube...

  @IsOptional()
  @IsInt()
  timeMinutesInterval?: number; // A cada X minutos...

  @IsOptional()
  @IsString()
  adGroupId?: string;
}

export class PlaylistItemInputDto {
  @IsNotEmpty()
  @IsString()
  assetId: string;

  @IsNotEmpty()
  @IsInt()
  position: number;

  @IsOptional()
  @IsString()
  category?: string; // 'CONTENT' ou 'COMMERCIAL_AD'

  @IsOptional()
  @IsInt()
  customDurationSeconds?: number;

  @IsOptional()
  @IsBoolean()
  isMuted?: boolean;
}

export class CreatePlaylistDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  interleaveRules?: InterleaveRulesDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaylistItemInputDto)
  items?: PlaylistItemInputDto[];
}

export class ReorderItemDto {
  @IsNotEmpty()
  @IsString()
  itemId: string;

  @IsNotEmpty()
  @IsInt()
  newPosition: number;
}

export class ReorderPlaylistDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  orders: ReorderItemDto[];
}
