import { IsNotEmpty, IsOptional, IsString, Length, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RequestPairingDto {
  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsOptional()
  @IsString()
  osName?: string;

  @IsOptional()
  @IsString()
  osVersion?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  resolution?: string;
}

export class ClaimPairingDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 7) // Suporta "123456" ou "123-456"
  pairingCode: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  assignedScheduleId?: string;

  @IsOptional()
  @IsString()
  fallbackPlaylistId?: string;
}

export class TelemetryPingDto {
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsOptional()
  storageFreeMb?: number;

  @IsOptional()
  @IsString()
  currentAssetId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class PlaybackLogEntryDto {
  @IsNotEmpty()
  @IsString()
  assetId: string;

  @IsOptional()
  @IsString()
  playlistId?: string;

  @IsNotEmpty()
  startedAt: string;

  @IsNotEmpty()
  endedAt: string;

  @IsNotEmpty()
  durationPlayedSeconds: number;

  @IsOptional()
  completedWithoutInterruption?: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class TelemetryBatchDto {
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaybackLogEntryDto)
  entries: PlaybackLogEntryDto[];
}
