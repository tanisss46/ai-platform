import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { StorageProviderService } from '../storage-provider/storage-provider.service';
import { ContentService } from '../content/content.service';
import { FoldersService } from '../folders/folders.service';
import { ThumbnailService } from '../thumbnail/thumbnail.service';
import { CreateContentDto } from '../content/dto/create-content.dto';
import * as mime from 'mime-types';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(
    private readonly storageProviderService: StorageProviderService,
    private readonly contentService: ContentService,
    private readonly foldersService: FoldersService,
    private readonly thumbnailService: ThumbnailService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    folderId?: string,
    tags?: string[],
    metadata?: Record<string, any>,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Determine the file type based on mimetype
    const fileType = this.getFileType(file.mimetype);

    // Upload the file to storage
    const { buffer, originalname, mimetype, size } = file;
    const { key: storageKey } = await this.storageProviderService.uploadFile(
      buffer,
      mimetype,
      originalname,
      userId,
      metadata,
    );

    // Generate thumbnail if applicable
    let thumbnailKey = null;
    if (['image', 'video'].includes(fileType)) {
      try {
        const thumbnail = await this.thumbnailService.generateThumbnail(
          buffer,
          fileType,
          mimetype,
        );
        
        const thumbnailResult = await this.storageProviderService.uploadFile(
          thumbnail,
          'image/jpeg',
          `thumbnail-${originalname}.jpg`,
          userId,
        );
        
        thumbnailKey = thumbnailResult.key;
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
        // Continue without a thumbnail
      }
    }

    // Create content record
    const createContentDto: CreateContentDto = {
      name: originalname,
      type: fileType,
      mimeType: mimetype,
      size,
      storageKey,
      thumbnailKey,
      parentFolderId: folderId,
      tags,
      metadata,
    };

    // Add dimensions/duration for media files if available in metadata
    if (metadata) {
      if (metadata.width && metadata.height) {
        createContentDto.dimensions = {
          width: metadata.width,
          height: metadata.height,
        };
      }

      if (metadata.duration) {
        createContentDto.duration = metadata.duration;
      }
    }

    // Save content metadata to database
    const content = await this.contentService.create(createContentDto, userId);

    return content;
  }

  async downloadFile(id: string, userId: string) {
    // Get the content record
    const content = await this.contentService.findOne(id, userId);

    // Get the file URL
    const url = await this.storageProviderService.getFileUrl(content.storageKey);

    return {
      url,
      filename: content.name,
      contentType: content.mimeType,
    };
  }

  async getThumbnail(id: string, userId: string) {
    const content = await this.contentService.findOne(id, userId);

    if (!content.thumbnailKey) {
      throw new NotFoundException('Thumbnail not available for this file');
    }

    const url = await this.storageProviderService.getFileUrl(content.thumbnailKey);

    return {
      url,
      contentType: 'image/jpeg',
    };
  }

  private getFileType(mimetype: string): string {
    if (mimetype.startsWith('image/')) {
      return 'image';
    } else if (mimetype.startsWith('video/')) {
      return 'video';
    } else if (mimetype.startsWith('audio/')) {
      return 'audio';
    } else if (
      mimetype === 'model/gltf-binary' ||
      mimetype === 'model/gltf+json' ||
      mimetype === 'application/octet-stream' && path.extname(mimetype).toLowerCase() === '.glb'
    ) {
      return '3d';
    } else if (
      mimetype === 'application/pdf' ||
      mimetype === 'application/msword' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'text/plain' ||
      mimetype === 'text/markdown'
    ) {
      return 'document';
    } else {
      return 'other';
    }
  }
}