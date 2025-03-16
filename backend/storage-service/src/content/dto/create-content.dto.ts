import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DimensionsDto {
  @IsNumber()
  width: number;

  @IsNumber()
  height: number;
}

export class CreateContentDto {
  @IsString()
  name: string;

  @IsEnum(['image', 'video', 'audio', '3d', 'document', 'other'])
  type: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  size: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: { width: number; height: number };

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsString()
  storageKey: string;

  @IsOptional()
  @IsString()
  thumbnailKey?: string;

  @IsOptional()
  @IsString()
  parentFolderId?: string;

  @IsOptional()
  @IsArray()
  path?: string[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  generationParams?: Record<string, any>;

  @IsOptional()
  @IsString()
  modelId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}