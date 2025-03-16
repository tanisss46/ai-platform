import { JobStatus } from '../../models/interfaces/model-adapter.interface';

export class JobResponseDto {
  id: string;
  userId: string;
  modelId: string;
  status: JobStatus;
  progress: number;
  parameters: Record<string, any>;
  inputContentIds: string[];
  outputContentIds: string[];
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  creditsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}
