import { Inject, Injectable } from '@nestjs/common';
import { StorageProviderInterface } from './providers/storage-provider.interface';

@Injectable()
export class StorageProviderService {
  constructor(
    @Inject('STORAGE_PROVIDER')
    private readonly provider: StorageProviderInterface,
  ) {}

  async uploadFile(
    buffer: Buffer,
    mimeType: string,
    fileName: string,
    userId: string,
    metadata?: Record<string, any>,
  ) {
    return this.provider.uploadFile(buffer, mimeType, fileName, userId, metadata);
  }

  async getFileUrl(key: string) {
    return this.provider.getFileUrl(key);
  }

  async deleteFile(key: string) {
    return this.provider.deleteFile(key);
  }

  async copyFile(sourceKey: string, destinationKey: string) {
    return this.provider.copyFile(sourceKey, destinationKey);
  }

  async moveFile(sourceKey: string, destinationKey: string) {
    return this.provider.moveFile(sourceKey, destinationKey);
  }
}