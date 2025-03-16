import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ModelAdapter, JobResult, JobStatus } from '../interfaces/model-adapter.interface';

export interface StableDiffusionParams {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  scheduler?: string;
  seed?: number;
}

@Injectable()
export class StableDiffusionAdapter implements ModelAdapter {
  private readonly apiKey: string;
  private readonly apiBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('STABLE_DIFFUSION_API_KEY');
    this.apiBaseUrl = 'https://api.stability.ai/v1';
  }

  async generateContent(params: StableDiffusionParams): Promise<JobResult> {
    try {
      // Validate parameters
      if (!params.prompt) {
        throw new Error('Prompt is required');
      }

      // Create API client with API key
      const apiClient = axios.create({
        baseURL: this.apiBaseUrl,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      // Call Stable Diffusion API
      const response = await apiClient.post('/generation/stable-diffusion-xl-1-0/text-to-image', {
        text_prompts: [
          {
            text: params.prompt,
            weight: 1.0,
          },
          ...(params.negative_prompt ? [{ text: params.negative_prompt, weight: -1.0 }] : []),
        ],
        cfg_scale: params.guidance_scale || 7.0,
        width: params.width || 1024,
        height: params.height || 1024,
        steps: params.num_inference_steps || 30,
        samples: 1,
        seed: params.seed || 0,
      });

      // Handle immediate response (Stability AI returns results directly)
      const images = response.data.artifacts.map(artifact => artifact.base64);
      
      // Create a job result with immediate completion
      const result: JobResult = {
        jobId: `sd-${Date.now()}`,
        status: JobStatus.COMPLETED,
        outputs: images,
      };
      
      return result;
    } catch (error) {
      console.error('Stable Diffusion API error:', error);
      return {
        jobId: 'error',
        status: JobStatus.FAILED,
        error: error.message || 'Failed to generate image with Stable Diffusion',
      };
    }
  }
}
