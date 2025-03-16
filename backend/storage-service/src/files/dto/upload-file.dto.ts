import { IsString, IsOptional, IsArray } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsString()
  folderPath?: string;

  @IsOptional()
  @IsString()
  folderId?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}