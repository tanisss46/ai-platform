export class WorkflowStepResponseDto {
  modelId: string;
  parameters: Record<string, any>;
  inputContentIds: string[];
  outputContentIds: string[];
  status: string;
  progress: number;
  error?: string;
  jobId?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export class WorkflowResponseDto {
  id: string;
  userId: string;
  name: string;
  description?: string;
  steps: WorkflowStepResponseDto[];
  status: string;
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}
