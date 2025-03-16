import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageProviderService } from './storage-provider.service';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { LocalStorageProvider } from './providers/local-storage.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'STORAGE_PROVIDER',
      useFactory: (configService) => {
        const storageType = process.env.STORAGE_TYPE || 's3';
        if (storageType === 's3') {
          return new S3StorageProvider(configService);
        } else {
          return new LocalStorageProvider(configService);
        }
      },
      inject: [ConfigModule],
    },
    StorageProviderService,
  ],
  exports: [StorageProviderService],
})
export class StorageProviderModule {}