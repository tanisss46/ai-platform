export interface StorageProviderInterface {
  /**
   * Upload a file to storage
   * @param buffer The file buffer
   * @param mimeType The file mime type
   * @param fileName The file name
   * @param userId The user ID
   * @param metadata Optional metadata
   * @returns Object containing the storage key and public URL
   */
  uploadFile(
    buffer: Buffer,
    mimeType: string,
    fileName: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<{ key: string; url: string; eTag?: string }>;

  /**
   * Get the public URL for a file
   * @param key The storage key
   * @returns The public URL
   */
  getFileUrl(key: string): Promise<string>;

  /**
   * Delete a file from storage
   * @param key The storage key
   */
  deleteFile(key: string): Promise<void>;

  /**
   * Copy a file to a new location
   * @param sourceKey The source storage key
   * @param destinationKey The destination storage key
   * @returns Object containing the new storage key and public URL
   */
  copyFile(
    sourceKey: string,
    destinationKey: string,
  ): Promise<{ key: string; url: string }>;

  /**
   * Move a file to a new location
   * @param sourceKey The source storage key
   * @param destinationKey The destination storage key
   * @returns Object containing the new storage key and public URL
   */
  moveFile(
    sourceKey: string,
    destinationKey: string,
  ): Promise<{ key: string; url: string }>;
}
