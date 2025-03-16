import { Injectable } from '@nestjs/common';
import { MidjourneyAdapter } from './adapters/midjourney.adapter';
import { StableDiffusionAdapter } from './adapters/stable-diffusion.adapter';
import { KlingAIAdapter } from './adapters/kling-ai.adapter';
import { MMAudioAdapter } from './adapters/mmaudio.adapter';
import { ModelAdapter, JobResult } from './interfaces/model-adapter.interface';

/**
 * Service for managing AI model integrations
 */
@Injectable()
export class ModelsService {
  private readonly models: Map<string, ModelAdapter> = new Map();

  constructor(
    private readonly midjourneyAdapter: MidjourneyAdapter,
    private readonly stableDiffusionAdapter: StableDiffusionAdapter,
    private readonly klingAIAdapter: KlingAIAdapter,
    private readonly mmAudioAdapter: MMAudioAdapter,
  ) {
    // Register all available models
    this.registerModels();
  }

  /**
   * Register all available AI models
   */
  private registerModels() {
    this.models.set('midjourney', this.midjourneyAdapter);
    this.models.set('stable-diffusion', this.stableDiffusionAdapter);
    this.models.set('kling-ai', this.klingAIAdapter);
    this.models.set('mmaudio', this.mmAudioAdapter);
  }

  /**
   * Get all available models
   */
  getAllModels(): { id: string }[] {
    return Array.from(this.models.keys()).map(id => ({ id }));
  }

  /**
   * Get a specific model by ID
   */
  getModel(modelId: string): ModelAdapter {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }
    return model;
  }

  /**
   * Generate content using a specific model
   */
  async generateContent(modelId: string, params: any): Promise<JobResult> {
    const model = this.getModel(modelId);
    return model.generateContent(params);
  }
}
