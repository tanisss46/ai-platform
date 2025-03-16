import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  InternalServerErrorException, 
  Logger 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';
import * as path from 'path';
import * as mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';

import { Content, ContentDocument } from '../content/schemas/content.schema';
import { StorageProviderService } from '../storage-provider/storage-provider.service';
import { ThumbnailService } from '../thumbnail/thumbnail.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
  private readonly documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];
  private readonly videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.mkv', '.webm'];
  private readonly audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];

  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
    private readonly storageProviderService: StorageProviderService,
    private readonly thumbnailService: ThumbnailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Upload a file
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    parentId?: string,
    metadata?: Record<string, any>,
  ): Promise<Content> {
    try {
      // Validate the file
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      // Check if parent folder exists (if provided)
      if (parentId) {
        const parentFolder = await this.contentModel.findOne({
          _id: parentId,
          userId,
          type: 'folder',
          isDeleted: false,
        });

        if (!parentFolder) {
          throw new NotFoundException(`Parent folder with ID "${parentId}" not found`);
        }
      }

      // Extract file information
      const { originalname, buffer, mimetype, size } = file;
      const fileExtension = path.extname(originalname).toLowerCase();
      const uniqueFilename = `${uuidv4()}${fileExtension}`;

      // Upload to storage provider
      const uploadResult = await this.storageProviderService.uploadFile(
        buffer,
        mimetype,
        uniqueFilename,
        userId,
        metadata,
      );

      // Get folder path
      let parentPath: string[] = [];
      if (parentId) {
        const parentFolder = await this.contentModel.findById(parentId);
        if (parentFolder) {
          parentPath = [...parentFolder.path, parentId];
        }
      }

      // Extract dimensions for images
      let dimensions = null;
      if (this.imageExtensions.includes(fileExtension)) {
        try {
          const imageInfo = await sharp(buffer).metadata();
          dimensions = {
            width: imageInfo.width,
            height: imageInfo.height,
          };
        } catch (err) {
          this.logger.warn(`Failed to extract image dimensions: ${err.message}`);
        }
      }

      // Create and generate thumbnail if needed
      let thumbnailUrl = null;
      if (
        this.imageExtensions.includes(fileExtension) ||
        this.videoExtensions.includes(fileExtension) ||
        this.documentExtensions.includes(fileExtension)
      ) {
        try {
          const thumbnailResult = await this.thumbnailService.createThumbnail(
            buffer,
            mimetype,
            fileExtension,
            userId,
          );
          thumbnailUrl = thumbnailResult.url;
        } catch (err) {
          this.logger.warn(`Failed to create thumbnail: ${err.message}`);
        }
      }

      // Create content entry in database
      const content = new this.contentModel({
        name: originalname,
        type: 'file',
        userId,
        parentId: parentId || null,
        path: parentPath,
        mimeType: mimetype,
        size,
        storageKey: uploadResult.key,
        url: uploadResult.url,
        thumbnailUrl,
        dimensions,
        metadata: metadata || {},
      });

      await content.save();
      return content;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * Get a file by ID
   */
  async getFileById(fileId: string, userId: string): Promise<Content> {
    const file = await this.contentModel.findOne({
      _id: fileId,
      userId,
      type: 'file',
      isDeleted: false,
    });

    if (!file) {
      throw new NotFoundException(`File with ID "${fileId}" not found`);
    }

    // If file URL has expired, generate a new one
    if (file.storageKey) {
      try {
        file.url = await this.storageProviderService.getFileUrl(file.storageKey);
      } catch (error) {
        this.logger.error(`Failed to get file URL: ${error.message}`, error.stack);
      }
    }

    return file;
  }

  /**
   * Update a file's metadata
   */
  async updateFile(fileId: string, userId: string, updateFileDto: UpdateFileDto): Promise<Content> {
    const file = await this.contentModel.findOne({
      _id: fileId,
      userId,
      type: 'file',
      isDeleted: false,
    });

    if (!file) {
      throw new NotFoundException(`File with ID "${fileId}" not found`);
    }

    // Handle parent folder change
    if (updateFileDto.parentId !== undefined) {
      // If moving to root, set parentId to null
      if (updateFileDto.parentId === 'root') {
        updateFileDto.parentId = null;
      } 
      // Otherwise ensure the target folder exists
      else if (updateFileDto.parentId) {
        const targetFolder = await this.contentModel.findOne({
          _id: updateFileDto.parentId,
          userId,
          type: 'folder',
          isDeleted: false,
        });

        if (!targetFolder) {
          throw new NotFoundException(`Target folder with ID "${updateFileDto.parentId}" not found`);
        }

        // Update the path
        file.path = [...targetFolder.path, updateFileDto.parentId];
      } else {
        // Moving to root
        file.path = [];
      }
    }

    // Update fields
    Object.assign(file, updateFileDto);
    await file.save();

    return file;
  }

  /**
   * Update or add metadata to a file
   */
  async updateMetadata(fileId: string, userId: string, metadata: Record<string, any>): Promise<Content> {
    const file = await this.contentModel.findOne({
      _id: fileId,
      userId,
      type: 'file',
      isDeleted: false,
    });

    if (!file) {
      throw new NotFoundException(`File with ID "${fileId}" not found`);
    }

    // Merge existing metadata with new metadata
    file.metadata = { ...file.metadata, ...metadata };
    await file.save();

    return file;
  }

  /**
   * Delete a file (soft delete)
   */
  async deleteFile(fileId: string, userId: string, permanent = false): Promise<void> {
    const file = await this.contentModel.findOne({
      _id: fileId,
      userId,
      type: 'file',
      isDeleted: false,
    });

    if (!file) {
      throw new NotFoundException(`File with ID "${fileId}" not found`);
    }

    if (permanent) {
      // Permanently delete the file from storage
      if (file.storageKey) {
        try {
          await this.storageProviderService.deleteFile(file.storageKey);
        } catch (error) {
          this.logger.error(`Failed to delete file from storage: ${error.message}`, error.stack);
        }
      }

      // Delete the thumbnail if it exists
      if (file.thumbnailUrl) {
        const thumbnailKey = this.getThumbnailKeyFromUrl(file.thumbnailUrl);
        if (thumbnailKey) {
          try {
            await this.storageProviderService.deleteFile(thumbnailKey);
          } catch (error) {
            this.logger.error(`Failed to delete thumbnail: ${error.message}`, error.stack);
          }
        }
      }

      // Remove from database
      await this.contentModel.deleteOne({ _id: fileId });
    } else {
      // Soft delete
      file.isDeleted = true;
      file.deletedAt = new Date();
      await file.save();
    }
  }

  /**
   * Restore a deleted file
   */
  async restoreFile(fileId: string, userId: string): Promise<Content> {
    const file = await this.contentModel.findOne({
      _id: fileId,
      userId,
      type: 'file',
      isDeleted: true,
    });

    if (!file) {
      throw new NotFoundException(`Deleted file with ID "${fileId}" not found`);
    }

    file.isDeleted = false;
    file.deletedAt = null;
    await file.save();

    return file;
  }

  /**
   * Get files in trash
   */
  async getTrashFiles(userId: string): Promise<Content[]> {
    return this.contentModel.find({
      userId,
      type: 'file',
      isDeleted: true,
    });
  }

  /**
   * Empty trash (permanently delete all trash items)
   */
  async emptyTrash(userId: string): Promise<void> {
    const trashFiles = await this.contentModel.find({
      userId,
      isDeleted: true,
    });

    for (const file of trashFiles) {
      if (file.type === 'file' && file.storageKey) {
        try {
          await this.storageProviderService.deleteFile(file.storageKey);
        } catch (error) {
          this.logger.error(`Failed to delete file from storage: ${error.message}`, error.stack);
        }

        // Delete the thumbnail if it exists
        if (file.thumbnailUrl) {
          const thumbnailKey = this.getThumbnailKeyFromUrl(file.thumbnailUrl);
          if (thumbnailKey) {
            try {
              await this.storageProviderService.deleteFile(thumbnailKey);
            } catch (error) {
              this.logger.error(`Failed to delete thumbnail: ${error.message}`, error.stack);
            }
          }
        }
      }
    }

    // Delete all trash items from database
    await this.contentModel.deleteMany({
      userId,
      isDeleted: true,
    });
  }

  /**
   * Download a file
   */
  async downloadFile(fileId: string, userId: string): Promise<{ url: string; filename: string; mimeType: string }> {
    const file = await this.contentModel.findOne({
      _id: fileId,
      userId,
      type: 'file',
      isDeleted: false,
    });

    if (!file) {
      throw new NotFoundException(`File with ID "${fileId}" not found`);
    }

    // Get a fresh download URL
    const downloadUrl = await this.storageProviderService.getFileUrl(file.storageKey);

    return {
      url: downloadUrl,
      filename: file.name,
      mimeType: file.mimeType,
    };
  }

  /**
   * Get recent files
   */
  async getRecentFiles(userId: string, limit = 10): Promise<Content[]> {
    return this.contentModel
      .find({
        userId,
        type: 'file',
        isDeleted: false,
      })
      .sort({ updatedAt: -1 })
      .limit(limit);
  }

  /**
   * Add file to favorites
   */
  async toggleFavorite(fileId: string, userId: string): Promise<Content> {
    const file = await this.contentModel.findOne({
      _id: fileId,
      userId,
      type: 'file',
      isDeleted: false,
    });

    if (!file) {
      throw new NotFoundException(`File with ID "${fileId}" not found`);
    }

    file.isFavorite = !file.isFavorite;
    await file.save();

    return file;
  }

  /**
   * Add tags to a file
   */
  async addTags(fileId: string, userId: string, tags: string[]): Promise<Content> {
    const file = await this.contentModel.findOne({
      _id: fileId,
      userId,
      type: 'file',
      isDeleted: false,
    });

    if (!file) {
      throw new NotFoundException(`File with ID "${fileId}" not found`);
    }

    // Add tags without duplicates
    const existingTags = new Set(file.tags);
    tags.forEach(tag => existingTags.add(tag));
    file.tags = Array.from(existingTags);

    await file.save();
    return file;
  }

  /**
   * Remove tags from a file
   */
  async removeTags(fileId: string, userId: string, tags: string[]): Promise<Content> {
    const file = await this.contentModel.findOne({
      _id: fileId,
      userId,
      type: 'file',
      isDeleted: false,
    });

    if (!file) {
      throw new NotFoundException(`File with ID "${fileId}" not found`);
    }

    // Remove specified tags
    file.tags = file.tags.filter(tag => !tags.includes(tag));
    await file.save();

    return file;
  }

  /**
   * Extract the thumbnail key from a URL
   */
  private getThumbnailKeyFromUrl(url: string): string | null {
    try {
      // This will depend on your URL pattern
      const match = url.match(/\/([^/]+\/[^/]+)$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
