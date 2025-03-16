import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly baseUrl = process.env.LLM_API_URL || 'https://api.anthropic.com';
  private readonly apiKey = process.env.LLM_API_KEY;
  private readonly defaultModel = process.env.LLM_DEFAULT_MODEL || 'claude-3-sonnet-20240229';

  constructor(private readonly httpService: HttpService) {}

  async generateChatCompletion(
    messages: ChatMessage[],
    options: { temperature?: number; max_tokens?: number; model?: string } = {},
  ): Promise<string> {
    try {
      const model = options.model || this.defaultModel;
      const temperature = options.temperature || 0.7;
      const max_tokens = options.max_tokens || 1000;

      // Format for Anthropic Claude API
      const requestBody = {
        model,
        messages,
        temperature,
        max_tokens,
      };

      const response = await firstValueFrom(
        this.httpService.post<ChatCompletionResponse>('/v1/messages', requestBody, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
          },
        }),
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      this.logger.error(`Error generating chat completion: ${error.message}`, error.stack);
      throw new Error(`Failed to generate chat completion: ${error.message}`);
    }
  }

  async generateSystemPrompt(): Promise<string> {
    // Generate a system prompt that helps the LLM assistant understand the platform's context
    return `You are the AI Assistant for AICloud, a platform that helps users access AI models without local installation.
You can help users:
1. Find and use AI tools (like Stable Diffusion, MMAudio, etc.)
2. Create workflows combining multiple AI tools
3. Manage their files and projects
4. Understand how to use the platform features
Be helpful, concise, and assume users might not be technical experts.`;
  }
}