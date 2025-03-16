import { IsNotEmpty, IsString, IsObject, IsOptional, IsArray } from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty()
  @IsString()
  modelId: string;

  @IsNotEmpty()
  @IsObject()
  parameters: Record<string, any>;

  @IsOptional()
  @IsArray()
  inputContentIds?: string[];
}
