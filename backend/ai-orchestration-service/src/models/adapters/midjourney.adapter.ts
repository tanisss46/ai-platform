import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as WebSocket from 'ws';
import { ModelAdapter, JobResult, JobStatus } from '../interfaces/model-adapter.interface';

export interface MidjourneyParams {
  prompt: string;
  width?: number;
  height?: number;
  style?: string;
  quality?: 'standard' | 'hd';
  negative_prompt?: string;
}

@Injectable()
export class MidjourneyAdapter implements ModelAdapter {
  private readonly apiKey: string;
  private readonly apiBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MIDJOURNEY_API_KEY');
    this.apiBaseUrl = 'https://api.midjourney.com/v1';
  }

  async generateContent(params: MidjourneyParams): Promise<JobResult> {
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

      // Call Midjourney API to start image generation
      const response = await apiClient.post('/imagine', {
        prompt: params.prompt,
        width: params.width || 1024,
        height: params.height || 1024,
        style: params.style || 'raw',
        quality: params.quality || 'standard',
        negative_prompt: params.negative_prompt || '',
      });

      // Extract job ID from response
      const jobId = response.data.job_id;

      // Start tracking the job completion
      return this.trackJobCompletion(jobId);
    } catch (error) {
      console.error('Midjourney API error:', error);
      return {
        jobId: 'error',
        status: JobStatus.FAILED,
        error: error.message || 'Failed to generate image with Midjourney',
      };
    }
  }

  /**
   * Track the completion of a job using WebSocket
   * @param jobId The ID of the job to track
   */
  private async trackJobCompletion(jobId: string): Promise<JobResult> {
    // Initialize job result
    const result: JobResult = {
      jobId,
      status: JobStatus.QUEUED,
    };

    // Return a promise that resolves when the job is complete
    return new Promise((resolve) => {
      // Connect to WebSocket for real-time updates
      const ws = new WebSocket(`wss://api.midjourney.com/v1/jobs/${jobId}/status`);
      
      ws.on('open', () => {
        // Send authentication message
        ws.send(JSON.stringify({ token: this.apiKey }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        // Update job status based on message
        if (message.status === 'processing') {
          result.status = JobStatus.PROCESSING;
          result.progress = message.progress || 0;
        } else if (message.status === 'completed') {
          result.status = JobStatus.COMPLETED;
          result.outputs = message.images || [];
          
          // Close WebSocket and resolve promise
          ws.close();
          resolve(result);
        } else if (message.status === 'failed') {
          result.status = JobStatus.FAILED;
          result.error = message.error || 'Unknown error';
          
          // Close WebSocket and resolve promise
          ws.close();
          resolve(result);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        result.status = JobStatus.FAILED;
        result.error = 'WebSocket connection error';
        
        // Close WebSocket and resolve promise
        ws.close();
        resolve(result);
      });

      // Set a timeout to close the connection if it takes too long
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          result.status = JobStatus.FAILED;
          result.error = 'Timeout waiting for job completion';
          
          // Close WebSocket and resolve promise
          ws.close();
          resolve(result);
        }
      }, 15 * 60 * 1000); // 15 minute timeout
    });
  }
}
