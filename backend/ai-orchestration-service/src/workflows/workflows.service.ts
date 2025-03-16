import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Workflow, WorkflowStep } from './schemas/workflow.schema';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { ModelsService } from '../models/models.service';
import { JobsService } from '../jobs/jobs.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);
  private readonly storageServiceUrl: string;

  constructor(
    @InjectModel(Workflow.name) private workflowModel: Model<Workflow>,
    private readonly jobsService: JobsService,
    private readonly modelsService: ModelsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.storageServiceUrl = this.configService.get<string>('STORAGE_SERVICE_URL');
  }

  /**
   * Create a new workflow
   */
  async create(userId: string, createWorkflowDto: CreateWorkflowDto): Promise<Workflow> {
    try {
      // Create workflow in database
      const workflow = new this.workflowModel({
        userId,
        name: createWorkflowDto.name,
        description: createWorkflowDto.description,
        steps: createWorkflowDto.steps.map(step => ({
          modelId: step.modelId,
          parameters: step.parameters,
          inputContentIds: step.inputContentIds || [],
          status: 'pending',
          progress: 0,
        })),
        status: 'pending',
        progress: 0,
        isTemplate: createWorkflowDto.isTemplate || false,
      });
      
      await workflow.save();
      
      // Start workflow execution unless it's a template
      if (!workflow.isTemplate) {
        this.executeWorkflow(workflow);
      }
      
      return workflow;
    } catch (error) {
      this.logger.error(`Error creating workflow: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a workflow by ID
   */
  async findOne(userId: string, id: string): Promise<Workflow> {
    const workflow = await this.workflowModel.findOne({ _id: id, userId }).exec();
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }
    return workflow;
  }

  /**
   * Get all workflows for a user
   */
  async findAll(userId: string, isTemplate?: boolean): Promise<Workflow[]> {
    const query: any = { userId };
    
    // Filter templates if specified
    if (typeof isTemplate === 'boolean') {
      query.isTemplate = isTemplate;
    }
    
    return this.workflowModel.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Execute a workflow by processing each step in sequence
   */
  private async executeWorkflow(workflow: Workflow): Promise<void> {
    try {
      this.logger.log(`Starting execution of workflow ${workflow.id} with ${workflow.steps.length} steps`);
      
      // Update status to processing
      workflow.status = 'processing';
      workflow.startedAt = new Date();
      await workflow.save();
      
      // Execute steps sequentially
      let stepSuccess = true;
      
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        
        // Skip steps after a failure
        if (!stepSuccess) {
          step.status = 'pending';
          await workflow.save();
          continue;
        }
        
        try {
          // Update step status
          step.status = 'processing';
          step.startedAt = new Date();
          workflow.progress = Math.floor((i / workflow.steps.length) * 100);
          await workflow.save();
          
          // Check if this step uses output from previous steps as input
          // If inputContentIds is empty but we're not at the first step, use previous step output
          if (step.inputContentIds.length === 0 && i > 0) {
            const prevStep = workflow.steps[i - 1];
            if (prevStep.outputContentIds.length > 0) {
              step.inputContentIds = prevStep.outputContentIds;
              await workflow.save();
            }
          }
          
          // Create a job for this step
          const job = await this.jobsService.create(workflow.userId, {
            modelId: step.modelId,
            parameters: step.parameters,
            inputContentIds: step.inputContentIds,
          });
          
          // Save job ID to step
          step.jobId = job.id;
          await workflow.save();
          
          // Wait for job to complete (polling)
          const completedJob = await this.pollJobCompletion(workflow.userId, job.id);
          
          // Update step with job results
          step.status = completedJob.status;
          step.progress = completedJob.progress;
          step.error = completedJob.error;
          step.completedAt = completedJob.completedAt ? new Date(completedJob.completedAt) : undefined;
          
          // If job completed successfully, save the output content IDs
          if (completedJob.status === 'completed') {
            step.outputContentIds = completedJob.outputContentIds;
            stepSuccess = true;
          } else if (completedJob.status === 'failed') {
            stepSuccess = false;
            workflow.error = `Step ${i + 1} failed: ${completedJob.error || 'Unknown error'}`;
          }
          
          await workflow.save();
        } catch (error) {
          // Handle step execution error
          this.logger.error(`Error executing step ${i} of workflow ${workflow.id}: ${error.message}`);
          step.status = 'failed';
          step.error = error.message;
          stepSuccess = false;
          workflow.error = `Error executing step ${i + 1}: ${error.message}`;
          await workflow.save();
        }
      }
      
      // Update workflow status based on steps
      workflow.completedAt = new Date();
      workflow.progress = 100;
      
      if (stepSuccess) {
        workflow.status = 'completed';
      } else {
        workflow.status = 'failed';
      }
      
      await workflow.save();
      
      this.logger.log(`Completed execution of workflow ${workflow.id} with status: ${workflow.status}`);
    } catch (error) {
      this.logger.error(`Error executing workflow ${workflow.id}: ${error.message}`, error.stack);
      
      // Update workflow with failure status
      workflow.status = 'failed';
      workflow.error = error.message;
      await workflow.save();
    }
  }

  /**
   * Poll a job until it completes or fails
   */
  private async pollJobCompletion(userId: string, jobId: string): Promise<any> {
    let isComplete = false;
    let job: any = null;
    
    // Poll with exponential backoff (max 30 seconds between polls)
    let pollInterval = 1000; // Start with 1 second
    const maxPollInterval = 30000; // Max 30 seconds
    const backoffFactor = 1.5;
    
    while (!isComplete) {
      try {
        // Get job status
        job = await this.jobsService.findOne(userId, jobId);
        
        // Check if job is complete or failed
        if (job.status === 'completed' || job.status === 'failed') {
          isComplete = true;
        } else {
          // Wait before polling again
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          
          // Increase poll interval with backoff (up to max)
          pollInterval = Math.min(pollInterval * backoffFactor, maxPollInterval);
        }
      } catch (error) {
        this.logger.error(`Error polling job ${jobId}: ${error.message}`);
        throw error;
      }
    }
    
    return job;
  }
}
