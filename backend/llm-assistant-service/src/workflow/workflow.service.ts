import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AIToolAction } from '../intent/intent.service';

// Define schema interfaces
interface WorkflowStep {
  modelId: string;
  parameters: Record<string, any>;
  inputContentIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);
  private readonly orchestrationServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.orchestrationServiceUrl = this.configService.get<string>('AI_ORCHESTRATION_SERVICE_URL');
  }

  /**
   * Create a workflow from AI tool actions
   * @param userId The user ID
   * @param actions The AI tool actions to include in the workflow
   * @param name The name of the workflow
   */
  async createWorkflow(
    userId: string,
    actions: AIToolAction[],
    name: string,
  ): Promise<Workflow> {
    try {
      // Convert AI tool actions to workflow steps
      const steps: WorkflowStep[] = actions.map((action) => ({
        modelId: action.modelId,
        parameters: action.parameters,
        inputContentIds: action.inputContentIds || [],
        status: 'pending',
      }));

      // Create the workflow in the orchestration service
      const response = await lastValueFrom(
        this.httpService.post(`${this.orchestrationServiceUrl}/workflows`, {
          userId,
          name,
          steps,
        }),
      );

      const workflow = response.data;
      this.logger.log(`Created workflow ${workflow.id} with ${steps.length} steps`);

      return workflow;
    } catch (error) {
      this.logger.error(`Error creating workflow: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a workflow by ID
   * @param userId The user ID
   * @param workflowId The workflow ID
   */
  async getWorkflow(userId: string, workflowId: string): Promise<Workflow> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.orchestrationServiceUrl}/workflows/${workflowId}`, {
          headers: { 'user-id': userId },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error getting workflow ${workflowId}: ${error.message}`);
      throw error;
    }
  }
}
