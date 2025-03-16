import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ModelAdapter, JobResult, JobStatus } from '../interfaces/model-adapter.interface';

export interface KlingVideoParams {
  prompt: string;
  negative_prompt?: string;
  durationInSeconds?: number;
  resolution?: string;
  fps?: number;
  style?: string;
  motion_strength?: number;
}

@Injectable()
export class KlingAIAdapter implements ModelAdapter {
  private readonly apiKey: string;
  private readonly apiBaseUrl: string;
  private readonly pollingInterval: number = 5000; // 5 seconds

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('KLING_AI_API_KEY');
    this.apiBaseUrl = 'https://api.kling.ai/v1';
  }

  async generateContent(params: KlingVideoParams): Promise<JobResult> {
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

      // Call Kling AI API to initiate video generation
      const response = await apiClient.post('/text-to-video', {
        prompt: params.prompt,
        negative_prompt: params.negative_prompt || '',
        duration: params.durationInSeconds || 5,
        resolution: params.resolution || '1080p',
        fps: params.fps || 30,
        style: params.style || 'cinematic',
        motion_strength: params.motion_strength || 0.7,
      });

      // Extract job ID from response
      const jobId = response.data.job_id;

      // Start monitoring the process
      return this.monitorProcess(jobId, apiClient);
    } catch (error) {
      console.error('Kling AI API error:', error);
      return {
        jobId: 'error',
        status: JobStatus.FAILED,
        error: error.message || 'Failed to generate video with Kling AI',
      };
    }
  }

  /**
   * Monitor the video generation process by polling the API
   * @param jobId The job ID to monitor
   * @param apiClient Axios instance for API calls
   */
  private async monitorProcess(jobId: string, apiClient: any): Promise<JobResult> {
    return new Promise((resolve) => {
      // Initialize result object
      const result: JobResult = {
        jobId,
        status: JobStatus.PROCESSING,
        progress: 0,
      };

      // Set up polling interval
      const pollInterval = setInterval(async () => {
        try {
          // Get job status from API
          const statusResponse = await apiClient.get(`/jobs/${jobId}`);
          const jobStatus = statusResponse.data;

          // Update progress
          result.progress = jobStatus.progress || 0;

          // Check if job is complete
          if (jobStatus.status === 'completed') {
            result.status = JobStatus.COMPLETED;
            result.outputs = [jobStatus.video_url];
            
            // Clear interval and resolve promise
            clearInterval(pollInterval);
            resolve(result);
          } 
          // Check if job failed
          else if (jobStatus.status === 'failed') {
            result.status = JobStatus.FAILED;
            result.error = jobStatus.error || 'Unknown error';
            
            // Clear interval and resolve promise
            clearInterval(pollInterval);
            resolve(result);
          }
        } catch (error) {
          console.error('Error polling job status:', error);
          result.status = JobStatus.FAILED;
          result.error = 'Error polling job status';
          
          // Clear interval and resolve promise
          clearInterval(pollInterval);
          resolve(result);
        }
      }, this.pollingInterval);

      // Set a timeout to stop polling after a certain amount of time
      setTimeout(() => {
        if (result.status !== JobStatus.COMPLETED && result.status !== JobStatus.FAILED) {
          result.status = JobStatus.FAILED;
          result.error = 'Timeout waiting for job completion';
          
          // Clear interval and resolve promise
          clearInterval(pollInterval);
          resolve(result);
        }
      }, 30 * 60 * 1000); // 30 minute timeout
    });
  }
}
