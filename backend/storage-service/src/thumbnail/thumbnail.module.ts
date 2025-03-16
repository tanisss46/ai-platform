import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThumbnailService } from './thumbnail.service';
import { StorageProviderModule } from '../storage-provider/storage-provider.module';

@Module({
  imports: [ConfigModule, StorageProviderModule],
  providers: [ThumbnailService],
  exports: [ThumbnailService],
})
export class ThumbnailModule {}
