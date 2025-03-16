import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { StorageProviderInterface } from './storage-provider.interface';

@Injectable()
export class S3StorageProvider implements StorageProviderInterface {
  private readonly s3: S3;
  private readonly bucket: string;
  private readonly region: string;
  private readonly cdnDomain?: string;

  private readonly logger = new Logger(S3StorageProvider.name);

  constructor(private configService: ConfigService) {
    // Get config values with fallbacks
    this.region = this.configService.get('AWS_REGION', 'us-east-1');
    this.bucket = this.configService.get('S3_BUCKET', 'aicloud-storage');
    this.cdnDomain = this.configService.get('CDN_DOMAIN');
    
    // Initialize S3 client with endpoint for MinIO compatibility
    const s3Config: S3.ClientConfiguration = {
      region: this.region,
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || this.configService.get('S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || this.configService.get('S3_SECRET_KEY'),
      s3ForcePathStyle: true, // Needed for MinIO
    };
    
    // Add custom endpoint for MinIO if configured
    const endpoint = this.configService.get('S3_ENDPOINT');
    if (endpoint) {
      s3Config.endpoint = endpoint;
    }
    
    this.s3 = new S3(s3Config);
    
    // Create bucket if it doesn't exist (for local development)
    this.initBucket().catch(err => {
      this.logger.error(`Failed to initialize bucket: ${err.message}`, err.stack);
    });
  }
  
  /**
   * Initialize the bucket (create if it doesn't exist)
   */
  private async initBucket(): Promise<void> {
    try {
      // Check if bucket exists
      await this.s3.headBucket({ Bucket: this.bucket }).promise();
      this.logger.log(`Bucket ${this.bucket} already exists`);
    } catch (error) {
      if (error.code === 'NotFound' || error.code === 'NoSuchBucket') {
        try {
          // Create the bucket
          await this.s3.createBucket({
            Bucket: this.bucket,
            ACL: 'private',
          }).promise();
          
          this.logger.log(`Bucket ${this.bucket} created successfully`);
        } catch (createError) {
          this.logger.error(`Failed to create bucket: ${createError.message}`);
          throw createError;
        }
      } else {
        this.logger.error(`Failed to check bucket: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Upload a file to S3/MinIO storage
   */
  async uploadFile(
    buffer: Buffer,
    mimeType: string,
    fileName: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<{ key: string; url: string; eTag?: string }> {
    try {
      // Create a sanitized file name to prevent path traversal attacks
      const sanitizedFileName = this.sanitizeFileName(fileName);
      
      // Generate a unique key with user ID, timestamp and sanitized file name
      const key = `${userId}/${Date.now()}-${sanitizedFileName}`;
      
      const params = {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        Metadata: metadata ? this.flattenMetadata(metadata) : undefined,
      };
      
      // Upload the file
      const result = await this.s3.upload(params).promise();
      
      this.logger.debug(`File uploaded successfully: ${key}`);
      
      return {
        key,
        url: this.getPublicUrl(key),
        eTag: result.ETag,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload file to storage');
    }
  }

  /**
   * Get a URL for accessing the file
   */
  async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      // For public files, we can use the public URL
      if (this.cdnDomain) {
        return this.getPublicUrl(key);
      }
      
      // For private files, generate a signed URL
      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn,
      };
      
      return await this.s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      this.logger.error(`Failed to get file URL: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate file URL');
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
      };
      
      await this.s3.deleteObject(params).promise();
      this.logger.debug(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete file from storage');
    }
  }

  /**
   * Copy a file within the storage
   */
  async copyFile(sourceKey: string, destinationKey: string): Promise<{ key: string; url: string }> {
    try {
      const params = {
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey,
      };
      
      await this.s3.copyObject(params).promise();
      this.logger.debug(`File copied successfully from ${sourceKey} to ${destinationKey}`);
      
      return {
        key: destinationKey,
        url: this.getPublicUrl(destinationKey),
      };
    } catch (error) {
      this.logger.error(`Failed to copy file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to copy file in storage');
    }
  }

  /**
   * Move a file within the storage (copy + delete)
   */
  async moveFile(sourceKey: string, destinationKey: string): Promise<{ key: string; url: string }> {
    try {
      // Copy first then delete the original
      await this.copyFile(sourceKey, destinationKey);
      await this.deleteFile(sourceKey);
      
      this.logger.debug(`File moved successfully from ${sourceKey} to ${destinationKey}`);
      
      return {
        key: destinationKey,
        url: this.getPublicUrl(destinationKey),
      };
    } catch (error) {
      this.logger.error(`Failed to move file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to move file in storage');
    }
  }

  /**
   * Get a public URL for the file
   */
  private getPublicUrl(key: string): string {
    // If using CDN
    if (this.cdnDomain) {
      return `https://${this.cdnDomain}/${key}`;
    }
    
    // If using custom endpoint (like MinIO)
    const endpoint = this.configService.get('S3_ENDPOINT');
    if (endpoint) {
      // Remove protocol if present
      const cleanEndpoint = endpoint.replace(/^https?:\/\//, '');
      return `${endpoint.startsWith('http') ? endpoint : `http://${cleanEndpoint}`}/${this.bucket}/${key}`;
    }
    
    // Default AWS S3 URL format
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  /**
   * Convert metadata to string format required by S3
   */
  private flattenMetadata(metadata: Record<string, any>): Record<string, string> {
    // S3 metadata can only be strings, so convert all values to strings
    const result: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'object') {
        result[key] = JSON.stringify(value);
      } else {
        result[key] = String(value);
      }
    }
    
    return result;
  }
  
  /**
   * Sanitize file name to prevent path traversal
   */
  private sanitizeFileName(fileName: string): string {
    // Replace path separators and other potentially problematic characters
    return fileName
      .replace(/\.\.+/g, '') // Remove path traversal sequences
      .replace(/[/\\]/g, '-') // Replace slashes with hyphens
      .replace(/[\s]+/g, '_') // Replace spaces with underscores
      .trim();
  }
}