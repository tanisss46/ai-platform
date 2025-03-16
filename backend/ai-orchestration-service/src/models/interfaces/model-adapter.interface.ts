/**
 * Generic interface for all AI model adapters
 */
export interface ModelAdapter {
  // Each model adapter must implement a method to generate content
  generateContent(params: any): Promise<JobResult>;
}

/**
 * Job result interface representing the result of an AI job
 */
export interface JobResult {
  jobId: string;
  status: JobStatus;
  progress?: number;
  outputs?: string[];
  error?: string;
}

/**
 * Possible statuses for an AI job
 */
export enum JobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
