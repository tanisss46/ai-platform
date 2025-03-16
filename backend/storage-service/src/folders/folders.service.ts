import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from '../content/schemas/content.schema';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  private readonly logger = new Logger(FoldersService.name);

  constructor(
    @InjectModel(Content.name) private contentModel: Model<ContentDocument>,
  ) {}

  /**
   * Create a new folder
   */
  async createFolder(
    createFolderDto: CreateFolderDto,
    userId: string,
  ): Promise<Content> {
    try {
      const { name, parentId, color, icon } = createFolderDto;

      // Check for folder name conflicts in the same directory
      const existingFolder = await this.contentModel.findOne({
        name,
        userId,
        parentId: parentId || null,
        type: 'folder',
        isDeleted: false,
      });

      if (existingFolder) {
        throw new ConflictException(`Folder with name "${name}" already exists in this location`);
      }

      // Get parent folder path if it exists
      let parentPath: string[] = [];
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

        parentPath = [...parentFolder.path, parentId];
      }

      // Create the folder
      const folder = new this.contentModel({
        name,
        type: 'folder',
        userId,
        parentId: parentId || null,
        path: parentPath,
        metadata: {
          color: color || '#808080',
          icon: icon || 'folder',
        },
      });

      await folder.save();
      return folder;
    } catch (error) {
      this.logger.error(`Failed to create folder: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a folder by ID
   */
  async getFolderById(
    folderId: string,
    userId: string,
  ): Promise<Content> {
    const folder = await this.contentModel.findOne({
      _id: folderId,
      userId,
      type: 'folder',
      isDeleted: false,
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID "${folderId}" not found`);
    }

    return folder;
  }

  /**
   * Get all folders for a user (flat list)
   */
  async getAllFolders(userId: string): Promise<Content[]> {
    return this.contentModel.find({
      userId,
      type: 'folder',
      isDeleted: false,
    }).sort({ name: 1 });
  }

  /**
   * Get user's root folders
   */
  async getRootFolders(userId: string): Promise<Content[]> {
    return this.contentModel.find({
      userId,
      type: 'folder',
      parentId: null,
      isDeleted: false,
    }).sort({ name: 1 });
  }

  /**
   * Get subfolders of a folder
   */
  async getSubfolders(
    folderId: string,
    userId: string,
  ): Promise<Content[]> {
    // If folderId is 'root', get root folders
    if (folderId === 'root') {
      return this.getRootFolders(userId);
    }

    // Check if folder exists
    const folder = await this.contentModel.findOne({
      _id: folderId,
      userId,
      type: 'folder',
      isDeleted: false,
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID "${folderId}" not found`);
    }

    // Get subfolders
    return this.contentModel.find({
      userId,
      type: 'folder',
      parentId: folderId,
      isDeleted: false,
    }).sort({ name: 1 });
  }

  /**
   * Get folder contents (files and subfolders)
   */
  async getFolderContents(
    folderId: string,
    userId: string,
  ): Promise<{ folders: Content[]; files: Content[] }> {
    // Get folder ID or null for root
    const parentId = folderId === 'root' ? null : folderId;

    // If not root, check if folder exists
    if (parentId) {
      const folder = await this.contentModel.findOne({
        _id: parentId,
        userId,
        type: 'folder',
        isDeleted: false,
      });

      if (!folder) {
        throw new NotFoundException(`Folder with ID "${folderId}" not found`);
      }
    }

    // Get folders and files
    const [folders, files] = await Promise.all([
      this.contentModel.find({
        userId,
        type: 'folder',
        parentId,
        isDeleted: false,
      }).sort({ name: 1 }),
      this.contentModel.find({
        userId,
        type: 'file',
        parentId,
        isDeleted: false,
      }).sort({ name: 1 }),
    ]);

    return { folders, files };
  }

  /**
   * Update a folder
   */
  async updateFolder(
    folderId: string,
    userId: string,
    updateFolderDto: UpdateFolderDto,
  ): Promise<Content> {
    const folder = await this.contentModel.findOne({
      _id: folderId,
      userId,
      type: 'folder',
      isDeleted: false,
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID "${folderId}" not found`);
    }

    // Prevent circular references when moving folders
    if (updateFolderDto.parentId) {
      // Check if new parent is not the folder itself
      if (updateFolderDto.parentId === folderId) {
        throw new BadRequestException('Cannot move a folder into itself');
      }

      // Check if new parent is not a descendant of the folder
      const descendantFolders = await this.contentModel.find({
        userId,
        type: 'folder',
        path: folderId,
        isDeleted: false,
      });

      if (descendantFolders.some(f => f._id.toString() === updateFolderDto.parentId)) {
        throw new BadRequestException('Cannot move a folder into its descendant');
      }

      // Update parent references
      const currentPath = folder.path;
      const oldParentId = folder.parentId;

      // Get the new parent folder
      let newParentPath: string[] = [];
      if (updateFolderDto.parentId !== 'root') {
        const newParent = await this.contentModel.findOne({
          _id: updateFolderDto.parentId,
          userId,
          type: 'folder',
          isDeleted: false,
        });

        if (!newParent) {
          throw new NotFoundException(`New parent folder with ID "${updateFolderDto.parentId}" not found`);
        }

        newParentPath = [...newParent.path, updateFolderDto.parentId];
      }

      // Update the moved folder's path
      folder.path = newParentPath;
      folder.parentId = updateFolderDto.parentId === 'root' ? null : updateFolderDto.parentId;

      // Get all descendant items (both files and folders)
      const descendants = await this.contentModel.find({
        userId,
        path: folderId,
        isDeleted: false,
      });

      // Update the paths of all descendant items
      const bulkOps = [];
      for (const descendant of descendants) {
        // Replace the old part of the path with the new path
        const oldPathIndex = descendant.path.indexOf(
          oldParentId === null ? currentPath[0] : oldParentId
        );
        const newPath = [
          ...newParentPath,
          ...descendant.path.slice(oldPathIndex === -1 ? 0 : oldPathIndex + 1),
        ];

        bulkOps.push({
          updateOne: {
            filter: { _id: descendant._id },
            update: { $set: { path: newPath } },
          },
        });
      }

      if (bulkOps.length > 0) {
        await this.contentModel.bulkWrite(bulkOps);
      }
    }

    // Update other properties
    if (updateFolderDto.name !== undefined) {
      folder.name = updateFolderDto.name;
    }

    if (updateFolderDto.color !== undefined || updateFolderDto.icon !== undefined) {
      folder.metadata = {
        ...folder.metadata,
        color: updateFolderDto.color || folder.metadata?.color || '#808080',
        icon: updateFolderDto.icon || folder.metadata?.icon || 'folder',
      };
    }

    await folder.save();
    return folder;
  }

  /**
   * Delete a folder (soft delete)
   */
  async deleteFolder(folderId: string, userId: string, permanent = false): Promise<void> {
    try {
      // Find the folder
      const folder = await this.contentModel.findOne({
        _id: folderId,
        userId,
        type: 'folder',
        isDeleted: permanent ? undefined : false,
      });

      if (!folder) {
        throw new NotFoundException(`Folder with ID "${folderId}" not found`);
      }

      if (permanent) {
        // Get all descendant items (recursive query using path)
        const descendants = await this.contentModel.find({
          userId,
          path: folderId,
        });

        // Create IDs list for batch delete
        const descendantIds = descendants.map(item => item._id);
        const itemsToDelete = [folder._id, ...descendantIds];

        // Permanently delete items
        await this.contentModel.deleteMany({
          _id: { $in: itemsToDelete },
        });

        this.logger.debug(`Permanently deleted folder "${folder.name}" and ${descendants.length} descendants`);
      } else {
        // Soft delete the folder
        folder.isDeleted = true;
        folder.deletedAt = new Date();
        await folder.save();

        // Soft delete all descendant items
        const updateResult = await this.contentModel.updateMany(
          {
            userId,
            path: folderId,
            isDeleted: false,
          },
          {
            $set: {
              isDeleted: true,
              deletedAt: new Date(),
            },
          },
        );

        this.logger.debug(`Soft deleted folder "${folder.name}" and ${updateResult.modifiedCount} descendants`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete folder: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Restore a deleted folder
   */
  async restoreFolder(folderId: string, userId: string): Promise<Content> {
    try {
      // Find the folder
      const folder = await this.contentModel.findOne({
        _id: folderId,
        userId,
        type: 'folder',
        isDeleted: true,
      });

      if (!folder) {
        throw new NotFoundException(`Deleted folder with ID "${folderId}" not found`);
      }

      // Check if parent folder exists and is not deleted
      if (folder.parentId) {
        const parentFolder = await this.contentModel.findOne({
          _id: folder.parentId,
          userId,
          type: 'folder',
        });

        // If parent folder is deleted or doesn't exist, move this folder to root
        if (!parentFolder || parentFolder.isDeleted) {
          folder.parentId = null;
          folder.path = [];
        }
      }

      // Restore the folder
      folder.isDeleted = false;
      folder.deletedAt = null;
      await folder.save();

      // Restore all descendant items
      const updateResult = await this.contentModel.updateMany(
        {
          userId,
          path: folderId,
          isDeleted: true,
        },
        {
          $set: {
            isDeleted: false,
            deletedAt: null,
          },
        },
      );

      this.logger.debug(`Restored folder "${folder.name}" and ${updateResult.modifiedCount} descendants`);

      return folder;
    } catch (error) {
      this.logger.error(`Failed to restore folder: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get folders in trash
   */
  async getTrashFolders(userId: string): Promise<Content[]> {
    return this.contentModel.find({
      userId,
      type: 'folder',
      isDeleted: true,
    }).sort({ deletedAt: -1 });
  }

  /**
   * Get folder path (breadcrumbs)
   */
  async getFolderPath(folderId: string, userId: string): Promise<Content[]> {
    if (folderId === 'root') {
      return [];
    }

    const folder = await this.contentModel.findOne({
      _id: folderId,
      userId,
      type: 'folder',
      isDeleted: false,
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID "${folderId}" not found`);
    }

    if (!folder.path || folder.path.length === 0) {
      return [];
    }

    // Get all folders in the path
    const pathFolders = await this.contentModel.find({
      _id: { $in: folder.path },
      userId,
      type: 'folder',
    }).sort({ path: 1 });

    // Sort them in the correct order
    return folder.path.map(pathId => 
      pathFolders.find(f => f._id.toString() === pathId)
    ).filter(Boolean);
  }

  /**
   * Share a folder with another user
   */
  async shareFolder(folderId: string, userId: string, targetUserId: string, permission = 'read'): Promise<void> {
    const folder = await this.contentModel.findOne({
      _id: folderId,
      userId,
      type: 'folder',
      isDeleted: false,
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID "${folderId}" not found`);
    }

    // Update sharing information
    if (!folder.sharedWith.includes(targetUserId)) {
      folder.sharedWith.push(targetUserId);
    }
    
    folder.permissions = {
      ...folder.permissions,
      [targetUserId]: permission,
    };
    
    folder.isShared = true;
    await folder.save();

    // Update sharing for all descendant items
    await this.contentModel.updateMany(
      {
        userId,
        path: folderId,
        isDeleted: false,
      },
      {
        $addToSet: { sharedWith: targetUserId },
        $set: { 
          isShared: true,
          [`permissions.${targetUserId}`]: permission,
        },
      },
    );
  }

  /**
   * Remove sharing for a folder
   */
  async removeSharing(folderId: string, userId: string, targetUserId: string): Promise<void> {
    const folder = await this.contentModel.findOne({
      _id: folderId,
      userId,
      type: 'folder',
      isDeleted: false,
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID "${folderId}" not found`);
    }

    // Update sharing information
    folder.sharedWith = folder.sharedWith.filter(id => id !== targetUserId);
    if (folder.permissions[targetUserId]) {
      delete folder.permissions[targetUserId];
    }
    
    folder.isShared = folder.sharedWith.length > 0;
    await folder.save();

    // Update sharing for all descendant items
    await this.contentModel.updateMany(
      {
        userId,
        path: folderId,
        isDeleted: false,
      },
      {
        $pull: { sharedWith: targetUserId },
        $unset: { [`permissions.${targetUserId}`]: "" },
      },
    );

    // Update isShared flag for descendants
    await this.contentModel.updateMany(
      {
        userId,
        path: folderId,
        isDeleted: false,
        sharedWith: { $size: 0 },
      },
      {
        $set: { isShared: false },
      },
    );
  }

  /**
   * Get all folders shared with the user
   */
  async getSharedWithMe(userId: string): Promise<Content[]> {
    return this.contentModel.find({
      sharedWith: userId,
      type: 'folder',
      isDeleted: false,
    });
  }

  /**
   * Get all folders shared by the user
   */
  async getSharedByMe(userId: string): Promise<Content[]> {
    return this.contentModel.find({
      userId,
      type: 'folder',
      isShared: true,
      isDeleted: false,
    });
  }

  /**
   * Get folder usage statistics
   */
  async getFolderStats(folderId: string, userId: string): Promise<{
    totalItems: number;
    totalSize: number;
    fileCount: number;
    folderCount: number;
  }> {
    const parentId = folderId === 'root' ? null : folderId;
    
    // If not root, check if folder exists
    if (parentId) {
      const folder = await this.contentModel.findOne({
        _id: parentId,
        userId,
        type: 'folder',
        isDeleted: false,
      });

      if (!folder) {
        throw new NotFoundException(`Folder with ID "${folderId}" not found`);
      }
    }

    // Get all contents in the folder and its descendants
    const contents = await this.contentModel.find({
      userId,
      isDeleted: false,
      $or: [
        { parentId },
        { path: parentId },
      ],
    });

    // Calculate statistics
    const fileCount = contents.filter(item => item.type === 'file').length;
    const folderCount = contents.filter(item => item.type === 'folder').length;
    const totalSize = contents.reduce((sum, item) => sum + (item.size || 0), 0);

    return {
      totalItems: contents.length,
      totalSize,
      fileCount,
      folderCount,
    };
  }
}
