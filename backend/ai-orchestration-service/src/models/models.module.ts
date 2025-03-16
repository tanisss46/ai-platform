import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MidjourneyAdapter } from './adapters/midjourney.adapter';
import { StableDiffusionAdapter } from './adapters/stable-diffusion.adapter';
import { KlingAIAdapter } from './adapters/kling-ai.adapter';
import { MMAudioAdapter } from './adapters/mmaudio.adapter';
import { ModelsService } from './models.service';

@Module({
  imports: [ConfigModule],
  providers: [
    ModelsService,
    MidjourneyAdapter,
    StableDiffusionAdapter,
    KlingAIAdapter,
    MMAudioAdapter,
  ],
  exports: [ModelsService],
})
export class ModelsModule {}
