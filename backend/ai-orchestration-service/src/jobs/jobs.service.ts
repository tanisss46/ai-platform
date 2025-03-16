import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Job } from './schemas/job.schema';
import { ModelsService } from '../models/models.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobStatus } from '../models/interfaces/model-adapter.interface';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class JobsService {
  private readonly storageServiceUrl: string;

  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    private readonly modelsService: ModelsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.storageServiceUrl = this.configService.get<string>('STORAGE_SERVICE_URL');
  }

  /**
   * Create a new job for an AI model execution
   */
  async create(userId: string, createJobDto: CreateJobDto): Promise<Job> {
    const { modelId, parameters, inputContentIds } = createJobDto;
    
    // Check if model exists
    this.modelsService.getModel(modelId);
    
    // Create job in database
    const job = new this.jobModel({
      userId,
      modelId,
      parameters,
      inputContentIds: inputContentIds || [],
      status: JobStatus.QUEUED,
    });
    
    await job.save();
    
    // Process job asynchronously
    this.processJob(job);
    
    return job;
  }

  /**
   * Get a job by ID
   */
  async findOne(userId: string, id: string): Promise<Job> {
    const job = await this.jobModel.findOne({ _id: id, userId }).exec();
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  /**
   * Get all jobs for a user
   */
  async findAll(userId: string): Promise<Job[]> {
    return this.jobModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Process a job by executing the associated AI model
   * This is run asynchronously after job creation
   */
  private async processJob(job: Job): Promise<void> {
    try {
      // Update job status to processing
      job.status = JobStatus.PROCESSING;
      job.startedAt = new Date();
      await job.save();

      // Get model and generate content
      const model = this.modelsService.getModel(job.modelId);
      const result = await model.generateContent(job.parameters);

      // Update job with external job ID if available
      if (result.jobId && result.jobId !== 'error') {
        job.externalJobId = result.jobId;
        await job.save();
      }

      // Handle result based on status
      if (result.status === JobStatus.COMPLETED && result.outputs?.length) {
        // Store outputs in storage service
        const outputContentIds = await this.storeOutputs(job.userId, job.modelId, result.outputs);
        
        // Update job with success status and output content IDs
        job.status = JobStatus.COMPLETED;
        job.progress = 100;
        job.outputContentIds = outputContentIds;
        job.completedAt = new Date();
        // Calculate credits used (would be based on model and parameters)
        job.creditsUsed = this.calculateCreditsUsed(job.modelId, job.parameters);
      } else if (result.status === JobStatus.FAILED) {
        // Update job with failure status
        job.status = JobStatus.FAILED;
        job.error = result.error;
      } else {
        // Update progress
        job.progress = result.progress || 0;
      }

      await job.save();
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      
      // Update job with failure status
      job.status = JobStatus.FAILED;
      job.error = error.message || 'Unknown error occurred during processing';
      await job.save();
    }
  }

  /**
   * Store output files in the storage service
   */
  private async storeOutputs(userId: string, modelId: string, outputs: string[]): Promise<string[]> {
    const outputContentIds: string[] = [];

    for (const output of outputs) {
      try {
        // Determine content type based on model
        const contentType = this.getContentTypeForModel(modelId);
        
        // Create content in storage service
        const response = await lastValueFrom(
          this.httpService.post(`${this.storageServiceUrl}/content`, {
            userId,
            name: `${modelId}-output-${Date.now()}`,
            type: contentType,
            sourceUrl: output,
            generationParams: {
              modelId,
            },
          }),
        );

        // Add content ID to output list
        outputContentIds.push(response.data.id);
      } catch (error) {
        console.error(`Error storing output for job:`, error);
      }
    }

    return outputContentIds;
  }

  /**
   * Get content type based on model ID
   */
  private getContentTypeForModel(modelId: string): string {
    switch (modelId) {
      case 'midjourney':
      case 'stable-diffusion':
        return 'image';
      case 'kling-ai':
        return 'video';
      case 'mmaudio':
        return 'audio';
      default:
        return 'unknown';
    }
  }

  /**
   * Calculate credits used for a job
   * This would normally be based on model specific parameters and usage
   */
  private calculateCreditsUsed(modelId: string, parameters: any): number {
    // Simple placeholder implementation
    // In real app, this would have model-specific logic
    const baseCredits = {
      'midjourney': 10,
      'stable-diffusion': 5,
      'kling-ai': 20,
      'mmaudio': 8,
    };

    return baseCredits[modelId] || 1;
  }
}
