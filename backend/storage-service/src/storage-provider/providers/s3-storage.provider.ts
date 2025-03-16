import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { StorageProviderInterface } from './storage-provider.interface';

@Injectable()
export class S3StorageProvider implements StorageProviderInterface {
  private readonly s3: S3;
  private readonly bucket: string;
  private readonly region: string;
  private readonly cdnDomain?: string;

  constructor(private configService: ConfigService) {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bucket = process.env.S3_BUCKET || 'aicloud-storage';
    this.cdnDomain = process.env.CDN_DOMAIN;
    
    this.s3 = new S3({
      region: this.region,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async uploadFile(
    buffer: Buffer,
    mimeType: string,
    fileName: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<{ key: string; url: string; eTag?: string }> {
    const key = `${userId}/${Date.now()}-${fileName}`;
    
    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      Metadata: metadata ? this.flattenMetadata(metadata) : undefined,
    };
    
    const result = await this.s3.upload(params).promise();
    
    return {
      key,
      url: this.getPublicUrl(key),
      eTag: result.ETag,
    };
  }

  async getFileUrl(key: string): Promise<string> {
    // If CDN domain is set, use it, otherwise use S3 URL
    return this.getPublicUrl(key);
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };
    
    await this.s3.deleteObject(params).promise();
  }

  async copyFile(sourceKey: string, destinationKey: string): Promise<{ key: string; url: string }> {
    const params = {
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${sourceKey}`,
      Key: destinationKey,
    };
    
    await this.s3.copyObject(params).promise();
    
    return {
      key: destinationKey,
      url: this.getPublicUrl(destinationKey),
    };
  }

  async moveFile(sourceKey: string, destinationKey: string): Promise<{ key: string; url: string }> {
    // Copy first then delete the original
    await this.copyFile(sourceKey, destinationKey);
    await this.deleteFile(sourceKey);
    
    return {
      key: destinationKey,
      url: this.getPublicUrl(destinationKey),
    };
  }

  private getPublicUrl(key: string): string {
    if (this.cdnDomain) {
      return `https://${this.cdnDomain}/${key}`;
    }
    
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

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
}