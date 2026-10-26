import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';

export enum AssetType {
  VIDEO = 'VIDEO',
  YOUTUBE = 'YOUTUBE',
  IMAGE = 'IMAGE',
}

export class CreateYouTubeAssetDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class CreateLocalVideoAssetDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  cdnUrl: string;

  @IsOptional()
  @IsString()
  storageKey?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  fileSizeBytes?: number;

  @IsOptional()
  @IsString()
  checksumSha256?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
