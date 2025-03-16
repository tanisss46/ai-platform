import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { StorageProviderInterface } from './storage-provider.interface';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const copyFile = promisify(fs.copyFile);

@Injectable()
export class LocalStorageProvider implements StorageProviderInterface {
  private readonly storagePath: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.storagePath = process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), 'storage');
    this.baseUrl = process.env.LOCAL_STORAGE_URL || 'http://localhost:3001/storage';
    
    // Ensure storage directory exists
    this.ensureStorageDirectory();
  }

  private async ensureStorageDirectory() {
    try {
      if (!fs.existsSync(this.storagePath)) {
        await mkdir(this.storagePath, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating storage directory:', error);
    }
  }

  async uploadFile(
    buffer: Buffer,
    mimeType: string,
    fileName: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<{ key: string; url: string; eTag?: string }> {
    // Create user directory if it doesn't exist
    const userDirectory = path.join(this.storagePath, userId);
    if (!fs.existsSync(userDirectory)) {
      await mkdir(userDirectory, { recursive: true });
    }
    
    const key = `${userId}/${Date.now()}-${fileName}`;
    const filePath = path.join(this.storagePath, key);
    
    // Write the file
    await writeFile(filePath, buffer);
    
    // Save metadata if provided
    if (metadata) {
      const metadataPath = `${filePath}.meta.json`;
      await writeFile(metadataPath, JSON.stringify(metadata));
    }
    
    return {
      key,
      url: this.getPublicUrl(key),
    };
  }

  async getFileUrl(key: string): Promise<string> {
    return this.getPublicUrl(key);
  }

  async deleteFile(key: string): Promise<void> {
    const filePath = path.join(this.storagePath, key);
    const metadataPath = `${filePath}.meta.json`;
    
    // Delete file
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }
    
    // Delete metadata if exists
    if (fs.existsSync(metadataPath)) {
      await unlink(metadataPath);
    }
  }

  async copyFile(sourceKey: string, destinationKey: string): Promise<{ key: string; url: string }> {
    const sourcePath = path.join(this.storagePath, sourceKey);
    const destinationPath = path.join(this.storagePath, destinationKey);
    
    // Ensure destination directory exists
    const destinationDir = path.dirname(destinationPath);
    if (!fs.existsSync(destinationDir)) {
      await mkdir(destinationDir, { recursive: true });
    }
    
    // Copy the file
    await copyFile(sourcePath, destinationPath);
    
    // Copy metadata if exists
    const sourceMetaPath = `${sourcePath}.meta.json`;
    if (fs.existsSync(sourceMetaPath)) {
      await copyFile(sourceMetaPath, `${destinationPath}.meta.json`);
    }
    
    return {
      key: destinationKey,
      url: this.getPublicUrl(destinationKey),
    };
  }

  async moveFile(sourceKey: string, destinationKey: string): Promise<{ key: string; url: string }> {
    // Copy first
    await this.copyFile(sourceKey, destinationKey);
    
    // Then delete the original
    await this.deleteFile(sourceKey);
    
    return {
      key: destinationKey,
      url: this.getPublicUrl(destinationKey),
    };
  }

  private getPublicUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}