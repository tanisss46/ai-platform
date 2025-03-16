import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from './schemas/content.schema';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { StorageProviderService } from '../storage-provider/storage-provider.service';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
    private readonly storageProviderService: StorageProviderService,
  ) {}

  async create(createContentDto: CreateContentDto, userId: string) {
    const newContent = new this.contentModel({
      ...createContentDto,
      ownerId: userId,
    });
    
    // Set URL from storage provider
    if (createContentDto.storageKey) {
      newContent.url = await this.storageProviderService.getFileUrl(createContentDto.storageKey);
    }
    
    // Set default path if not provided
    if (!createContentDto.path || createContentDto.path.length === 0) {
      if (createContentDto.parentFolderId) {
        // If parent folder is specified, we'll need to look up its path
        // This would be handled in a real implementation
        newContent.path = ['root']; // Placeholder
      } else {
        newContent.path = ['root'];
      }
    }
    
    const savedContent = await newContent.save();
    return savedContent;
  }

  async findAll(userId: string, options: {
    parentFolderId?: string;
    type?: string[];
    tags?: string[];
    search?: string;
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
  } = {}) {
    const {
      parentFolderId,
      type,
      tags,
      search,
      page = 1,
      limit = 50,
      sort = { createdAt: -1 },
    } = options;
    
    // Build query
    let query = this.contentModel.find({ ownerId: userId });
    
    // Filter by parent folder
    if (parentFolderId) {
      query = query.where('parentFolderId').equals(parentFolderId);
    }
    
    // Filter by type
    if (type && type.length > 0) {
      query = query.where('type').in(type);
    }
    
    // Filter by tags
    if (tags && tags.length > 0) {
      query = query.where('tags').all(tags);
    }
    
    // Search in name
    if (search) {
      query = query.where({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ],
      });
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    
    // Sorting
    query = query.sort(sort);
    
    // Execute query
    const content = await query.exec();
    const total = await this.contentModel.countDocuments(query.getFilter());
    
    return {
      items: content,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const content = await this.contentModel.findOne({ 
      _id: id,
      $or: [
        { ownerId: userId },
        { isPublic: true },
        { 'permissions.userId': userId },
      ],
    });
    
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    
    return content;
  }

  async update(id: string, updateContentDto: UpdateContentDto, userId: string) {
    const content = await this.contentModel.findOne({ _id: id, ownerId: userId });
    
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found or you don't have permission to update it`);
    }
    
    // Update URL if storage key changes
    if (updateContentDto.storageKey && updateContentDto.storageKey !== content.storageKey) {
      updateContentDto['url'] = await this.storageProviderService.getFileUrl(updateContentDto.storageKey);
    }
    
    const updatedContent = await this.contentModel
      .findByIdAndUpdate(id, updateContentDto, { new: true })
      .exec();
      
    return updatedContent;
  }

  async remove(id: string, userId: string) {
    const content = await this.contentModel.findOne({ _id: id, ownerId: userId });
    
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found or you don't have permission to delete it`);
    }
    
    // Delete the file from storage
    if (content.storageKey) {
      await this.storageProviderService.deleteFile(content.storageKey);
    }
    
    // Delete thumbnail if exists
    if (content.thumbnailKey) {
      await this.storageProviderService.deleteFile(content.thumbnailKey);
    }
    
    // Delete the content from database
    await this.contentModel.findByIdAndDelete(id);
    
    return { id };
  }

  async addVersion(id: string, storageKey: string, userId: string) {
    const content = await this.contentModel.findOne({ _id: id, ownerId: userId });
    
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found or you don't have permission to update it`);
    }
    
    // Add the current version to versions array
    content.versions.push({
      version: `v${content.versions.length + 1}`,
      storageKey: content.storageKey,
      createdAt: new Date(),
    });
    
    // Update to the new version
    content.storageKey = storageKey;
    content.url = await this.storageProviderService.getFileUrl(storageKey);
    
    await content.save();
    
    return content;
  }

  async getVersions(id: string, userId: string) {
    const content = await this.contentModel.findOne({ 
      _id: id,
      $or: [
        { ownerId: userId },
        { isPublic: true },
        { 'permissions.userId': userId },
      ],
    });
    
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    
    // Return current version + all past versions
    const currentVersion = {
      version: 'current',
      storageKey: content.storageKey,
      url: content.url,
      createdAt: content.updatedAt,
    };
    
    const versions = await Promise.all(content.versions.map(async (version) => ({
      version: version.version,
      storageKey: version.storageKey,
      url: await this.storageProviderService.getFileUrl(version.storageKey),
      createdAt: version.createdAt,
    })));
    
    return [currentVersion, ...versions];
  }

  async updatePermissions(id: string, permissions: { userId: string; permission: 'read' | 'write' | 'admin' }[], ownerId: string) {
    const content = await this.contentModel.findOne({ _id: id, ownerId });
    
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found or you don't have permission to update it`);
    }
    
    content.permissions = permissions;
    await content.save();
    
    return content;
  }
}