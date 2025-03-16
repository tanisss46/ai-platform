import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobResponseDto } from './dto/job-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * Create a new job
   */
  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body() createJobDto: CreateJobDto,
  ): Promise<JobResponseDto> {
    const job = await this.jobsService.create(userId, createJobDto);
    return this.mapToResponseDto(job);
  }

  /**
   * Get a job by ID
   */
  @Get(':id')
  async findOne(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<JobResponseDto> {
    const job = await this.jobsService.findOne(userId, id);
    return this.mapToResponseDto(job);
  }

  /**
   * Get all jobs for current user
   */
  @Get()
  async findAll(@CurrentUser() userId: string): Promise<JobResponseDto[]> {
    const jobs = await this.jobsService.findAll(userId);
    return jobs.map(job => this.mapToResponseDto(job));
  }

  /**
   * Map job entity to response DTO
   */
  private mapToResponseDto(job: any): JobResponseDto {
    return {
      id: job._id.toString(),
      userId: job.userId,
      modelId: job.modelId,
      status: job.status,
      progress: job.progress,
      parameters: job.parameters,
      inputContentIds: job.inputContentIds,
      outputContentIds: job.outputContentIds,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      error: job.error,
      creditsUsed: job.creditsUsed,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
