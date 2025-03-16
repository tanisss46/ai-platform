import { Body, Controller, Get, Param, Post, Query, UseGuards, Request } from '@nestjs/common';
import { WorkflowService, SaveWorkflowRequest } from './workflow.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async saveWorkflow(
    @Body() request: SaveWorkflowRequest,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.workflowService.saveWorkflow(request, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getWorkflows(
    @Query('includeTemplates') includeTemplates: boolean,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.workflowService.getWorkflows(userId, includeTemplates);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getWorkflowById(
    @Param('id') id: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.workflowService.getWorkflowById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/execute')
  async executeWorkflow(
    @Param('id') id: string,
    @Body() parameters: Record<string, any>,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.workflowService.executeWorkflow(id, userId, parameters);
  }
}