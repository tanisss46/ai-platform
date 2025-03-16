import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { WorkflowResponseDto } from './dto/workflow-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  /**
   * Create a new workflow
   */
  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body() createWorkflowDto: CreateWorkflowDto,
  ): Promise<WorkflowResponseDto> {
    const workflow = await this.workflowsService.create(userId, createWorkflowDto);
    return this.mapToResponseDto(workflow);
  }

  /**
   * Get a workflow by ID
   */
  @Get(':id')
  async findOne(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<WorkflowResponseDto> {
    const workflow = await this.workflowsService.findOne(userId, id);
    return this.mapToResponseDto(workflow);
  }

  /**
   * Get all workflows for current user
   */
  @Get()
  async findAll(
    @CurrentUser() userId: string,
    @Query('isTemplate') isTemplate?: boolean,
  ): Promise<WorkflowResponseDto[]> {
    const workflows = await this.workflowsService.findAll(userId, isTemplate);
    return workflows.map(workflow => this.mapToResponseDto(workflow));
  }

  /**
   * Map workflow entity to response DTO
   */
  private mapToResponseDto(workflow: any): WorkflowResponseDto {
    return {
      id: workflow._id.toString(),
      userId: workflow.userId,
      name: workflow.name,
      description: workflow.description,
      steps: workflow.steps.map(step => ({
        modelId: step.modelId,
        parameters: step.parameters,
        inputContentIds: step.inputContentIds || [],
        outputContentIds: step.outputContentIds || [],
        status: step.status,
        progress: step.progress,
        error: step.error,
        jobId: step.jobId,
        startedAt: step.startedAt,
        completedAt: step.completedAt,
      })),
      status: workflow.status,
      progress: workflow.progress,
      startedAt: workflow.startedAt,
      completedAt: workflow.completedAt,
      error: workflow.error,
      isTemplate: workflow.isTemplate,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    };
  }
}
