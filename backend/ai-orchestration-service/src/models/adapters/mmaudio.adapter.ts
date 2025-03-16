import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ModelAdapter, JobResult, JobStatus } from '../interfaces/model-adapter.interface';

export interface MMAudioParams {
  prompt: string;
  durationInSeconds: number;
  sampleRate?: number;
  format?: string;
  quality?: string;
}

@Injectable()
export class MMAudioAdapter implements ModelAdapter {
  private readonly apiKey: string;
  private readonly apiBaseUrl: string;
  private readonly pollingInterval: number = 3000; // 3 seconds

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MMAUDIO_API_KEY');
    this.apiBaseUrl = 'https://api.mmaudio.io/v1';
  }

  async generateContent(params: MMAudioParams): Promise<JobResult> {
    try {
      // Validate parameters
      if (!params.prompt) {
        throw new Error('Prompt is required');
      }
      if (!params.durationInSeconds) {
        throw new Error('Duration is required');
      }

      // Create API client with API key
      const apiClient = axios.create({
        baseURL: this.apiBaseUrl,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      // Call MMAudio API to generate audio
      const response = await apiClient.post('/generate', {
        prompt: params.prompt,
        duration: params.durationInSeconds,
        sampleRate: params.sampleRate || 44100,
        format: params.format || 'wav',
        quality: params.quality || 'high',
      });

      // Extract job ID from response
      const jobId = response.data.job_id;

      // Start tracking the generation
      return this.trackGeneration(jobId, apiClient);
    } catch (error) {
      console.error('MMAudio API error:', error);
      return {
        jobId: 'error',
        status: JobStatus.FAILED,
        error: error.message || 'Failed to generate audio with MMAudio',
      };
    }
  }

  /**
   * Track audio generation by polling the API
   * @param jobId The job ID to track
   * @param apiClient Axios instance for API calls
   */
  private async trackGeneration(jobId: string, apiClient: any): Promise<JobResult> {
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
            result.outputs = [jobStatus.audio_url];
            
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
      }, 10 * 60 * 1000); // 10 minute timeout
    });
  }
}
