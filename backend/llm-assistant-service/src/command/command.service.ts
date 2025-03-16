import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { CommandRequestDto } from './dto/command-request.dto';
import { CommandResponseDto } from './dto/command-response.dto';
import { IntentService } from '../intent/intent.service';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class CommandService {
  private readonly logger = new Logger(CommandService.name);
  private readonly openaiApiKey: string;
  private readonly openaiApiUrl: string = 'https://api.openai.com/v1';
  private readonly orchestrationServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly intentService: IntentService,
    private readonly workflowService: WorkflowService,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.orchestrationServiceUrl = this.configService.get<string>('AI_ORCHESTRATION_SERVICE_URL');
  }

  /**
   * Process a natural language command from the user
   */
  async processCommand(userId: string, commandRequest: CommandRequestDto): Promise<CommandResponseDto> {
    try {
      // Log the command
      this.logger.log(`Processing command from user ${userId}: ${commandRequest.command}`);

      // First, use LLM to understand the user's command
      const thinking = await this.analyzeCommand(commandRequest.command);
      
      // Next, extract intent and parameters using the IntentService
      const intent = await this.intentService.extractIntent(commandRequest.command, thinking);

      // If no clear AI tool intent is found, just respond with the thinking
      if (!intent.aiToolActions || intent.aiToolActions.length === 0) {
        this.logger.log('No AI tool actions identified in command');
        return {
          thinking,
          response: "I understand what you're asking, but I'm not sure which AI tools to use for this task. Could you be more specific about what you'd like to create?",
        };
      }

      // For multiple AI tool actions, create a workflow
      if (intent.aiToolActions.length > 1) {
        this.logger.log(`Creating workflow with ${intent.aiToolActions.length} steps`);
        
        // Create a workflow with the WorkflowService
        const workflow = await this.workflowService.createWorkflow(
          userId,
          intent.aiToolActions,
          `Workflow from command: ${commandRequest.command.substring(0, 50)}...`,
        );

        return {
          thinking,
          response: `I'll help you with that! I've created a workflow to ${intent.summary}. I'll first ${intent.aiToolActions[0].description}, then use the result for the next steps.`,
          workflowId: workflow.id,
          currentStep: intent.aiToolActions[0].description,
        };
      } 
      // For a single AI tool action, create a job directly
      else {
        const action = intent.aiToolActions[0];
        this.logger.log(`Creating job for model: ${action.modelId}`);
        
        // Create a job in the orchestration service
        const jobResponse = await lastValueFrom(
          this.httpService.post(`${this.orchestrationServiceUrl}/jobs`, {
            userId,
            modelId: action.modelId,
            parameters: action.parameters,
            inputContentIds: action.inputContentIds || [],
          }),
        );

        const job = jobResponse.data;

        return {
          thinking,
          response: `I'll help you ${action.description}. I've started the process and will keep you updated on the progress.`,
          jobId: job.id,
          currentStep: 'Starting generation...',
        };
      }
    } catch (error) {
      this.logger.error(`Error processing command: ${error.message}`, error.stack);
      return {
        thinking: "I'm trying to understand your request...",
        error: 'Sorry, I encountered an error while processing your command. Please try again.',
      };
    }
  }

  /**
   * Analyze a command using an LLM to understand what the user wants
   */
  private async analyzeCommand(command: string): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.openaiApiUrl}/chat/completions`,
          {
            model: 'gpt-4-turbo',
            messages: [
              {
                role: 'system',
                content: `You are an AI assistant that analyzes user requests to understand what AI tools they want to use.
                Focus on identifying requests for image generation, video creation, audio generation, or combinations of these.
                Think step by step about what the user is asking for and what AI tools would be most appropriate.
                Available AI tools:
                - midjourney: Creates high-quality images from text prompts
                - stable-diffusion: Creates images from text prompts with more customization
                - kling-ai: Creates videos from text prompts or images
                - mmaudio: Creates audio from text descriptions`,
              },
              { role: 'user', content: command },
            ],
            temperature: 0.2,
            max_tokens: 500,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.openaiApiKey}`,
            },
          },
        ),
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      this.logger.error(`Error analyzing command with LLM: ${error.message}`);
      return "I'm having trouble analyzing your request. Let me try to understand what you need...";
    }
  }
}
