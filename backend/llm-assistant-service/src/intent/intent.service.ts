import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

export interface AIToolAction {
  modelId: string;
  description: string;
  parameters: Record<string, any>;
  inputContentIds?: string[];
}

export interface CommandIntent {
  summary: string;
  aiToolActions: AIToolAction[];
}

@Injectable()
export class IntentService {
  private readonly logger = new Logger(IntentService.name);
  private readonly openaiApiKey: string;
  private readonly openaiApiUrl: string = 'https://api.openai.com/v1';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
  }

  /**
   * Extract the user's intent and AI tool parameters from a command
   * @param command The user's natural language command
   * @param thinking Initial analysis of the command
   */
  async extractIntent(command: string, thinking: string): Promise<CommandIntent> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${this.openaiApiUrl}/chat/completions`,
          {
            model: 'gpt-4-turbo',
            messages: [
              {
                role: 'system',
                content: `You are an AI tool orchestrator that extracts structured intent from user commands.
                You will analyze the command and identify which AI tools should be used with what parameters.
                You must return a valid JSON object with a specific structure.
                
                Available AI tools:
                - midjourney: Creates high-quality images from text prompts
                  Parameters: prompt (string, required), width (number, default: 1024), height (number, default: 1024), style (string, default: 'raw')
                
                - stable-diffusion: Creates images with more control
                  Parameters: prompt (string, required), negative_prompt (string), width (number, default: 1024), height (number, default: 1024)
                
                - kling-ai: Creates videos from text prompts
                  Parameters: prompt (string, required), durationInSeconds (number, default: 5), fps (number, default: 30), resolution (string, default: '1080p')
                
                - mmaudio: Creates audio from text descriptions
                  Parameters: prompt (string, required), durationInSeconds (number, required), quality (string, default: 'high')
                
                If the user wants to use an output from one tool as input to another, link them in the structure using inputContentIds.
                If the command doesn't clearly involve AI tools, return an empty aiToolActions array.`,
              },
              { 
                role: 'user', 
                content: `Command: "${command}"\n\nThinking: "${thinking}"\n\nExtract the intent and AI tool actions from this command.` 
              },
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' },
            max_tokens: 1000,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.openaiApiKey}`,
            },
          },
        ),
      );

      const intentData = JSON.parse(response.data.choices[0].message.content);
      
      this.logger.log(`Extracted intent: ${JSON.stringify(intentData)}`);
      
      // Ensure the response structure is as expected
      if (!intentData.summary || !Array.isArray(intentData.aiToolActions)) {
        throw new Error('Invalid intent structure received from LLM');
      }
      
      return intentData as CommandIntent;
    } catch (error) {
      this.logger.error(`Error extracting intent: ${error.message}`, error.stack);
      
      // Return a default empty intent structure
      return {
        summary: 'Failed to extract intent',
        aiToolActions: [],
      };
    }
  }
}
