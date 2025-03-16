export interface StorageProviderInterface {
  uploadFile(
    buffer: Buffer,
    mimeType: string,
    fileName: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<{
    key: string;
    url: string;
    eTag?: string;
  }>;

  getFileUrl(key: string): Promise<string>;

  deleteFile(key: string): Promise<void>;

  copyFile(sourceKey: string, destinationKey: string): Promise<{
    key: string;
    url: string;
  }>;

  moveFile(sourceKey: string, destinationKey: string): Promise<{
    key: string;
    url: string;
  }>;
}