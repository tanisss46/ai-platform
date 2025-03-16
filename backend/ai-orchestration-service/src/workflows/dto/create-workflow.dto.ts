import { IsNotEmpty, IsString, IsArray, IsObject, IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class WorkflowStepDto {
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

export class CreateWorkflowDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps: WorkflowStepDto[];

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;
}
