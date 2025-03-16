import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Folder, FolderDocument } from './schemas/folder.schema';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(
    @InjectModel(Folder.name) private folderModel: Model<FolderDocument>,
  ) {}

  async create(createFolderDto: CreateFolderDto, userId: string) {
    // Check if folder with same name exists at the same level
    const existingFolder = await this.folderModel.findOne({
      ownerId: userId,
      name: createFolderDto.name,
      parentId: createFolderDto.parentId || null,
    });

    if (existingFolder) {
      throw new ConflictException(`Folder with name '${createFolderDto.name}' already exists in this location`);
    }

    // Build the path for the new folder
    let path = ['root'];
    if (createFolderDto.parentId) {
      const parentFolder = await this.folderModel.findOne({
        _id: createFolderDto.parentId,
        ownerId: userId,
      });

      if (!parentFolder) {
        throw new NotFoundException(`Parent folder with ID ${createFolderDto.parentId} not found`);
      }

      path = [...parentFolder.path, createFolderDto.parentId];
      
      // Update the parent folder's childCount
      await this.folderModel.updateOne(
        { _id: createFolderDto.parentId },
        { $inc: { childCount: 1 } },
      );
    }

    const newFolder = new this.folderModel({
      ...createFolderDto,
      ownerId: userId,
      path,
    });

    const savedFolder = await newFolder.save();
    return savedFolder;
  }

  async findAll(userId: string, options: {
    parentId?: string;
    isShared?: boolean;
    isStarred?: boolean;
    search?: string;
  } = {}) {
    const { parentId, isShared, isStarred, search } = options;

    let query = this.folderModel.find({ ownerId: userId });

    // Filter by parent folder
    if (parentId) {
      query = query.where('parentId').equals(parentId || null);
    }

    // Filter by shared status
    if (isShared !== undefined) {
      query = query.where('isShared').equals(isShared);
    }

    // Filter by starred status
    if (isStarred !== undefined) {
      query = query.where('isStarred').equals(isStarred);
    }

    // Search by name
    if (search) {
      query = query.where('name', new RegExp(search, 'i'));
    }

    // Sort by name
    query = query.sort({ name: 1 });

    const folders = await query.exec();
    return folders;
  }

  async findOne(id: string, userId: string) {
    const folder = await this.folderModel.findOne({
      _id: id,
      $or: [
        { ownerId: userId },
        { 'permissions.userId': userId },
      ],
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }

    return folder;
  }

  async update(id: string, updateFolderDto: UpdateFolderDto, userId: string) {
    const folder = await this.findOne(id, userId);

    // Don't allow changing the ownerId
    delete updateFolderDto['ownerId'];

    // If changing the parent, need to update the path
    if (updateFolderDto.parentId !== undefined && updateFolderDto.parentId !== folder.parentId) {
      // Check if the new parent exists
      if (updateFolderDto.parentId) {
        const parentFolder = await this.folderModel.findOne({
          _id: updateFolderDto.parentId,
          ownerId: userId,
        });

        if (!parentFolder) {
          throw new NotFoundException(`Parent folder with ID ${updateFolderDto.parentId} not found`);
        }

        // Update path
        updateFolderDto.path = [...parentFolder.path, updateFolderDto.parentId];
        
        // Update old parent's and new parent's childCount
        if (folder.parentId) {
          await this.folderModel.updateOne(
            { _id: folder.parentId },
            { $inc: { childCount: -1 } },
          );
        }
        
        await this.folderModel.updateOne(
          { _id: updateFolderDto.parentId },
          { $inc: { childCount: 1 } },
        );
      } else {
        // Moving to root
        updateFolderDto.path = ['root'];
        
        // Update old parent's childCount
        if (folder.parentId) {
          await this.folderModel.updateOne(
            { _id: folder.parentId },
            { $inc: { childCount: -1 } },
          );
        }
      }
    }

    const updatedFolder = await this.folderModel
      .findByIdAndUpdate(id, updateFolderDto, { new: true })
      .exec();

    return updatedFolder;
  }

  async remove(id: string, userId: string) {
    const folder = await this.findOne(id, userId);

    // Update parent's childCount
    if (folder.parentId) {
      await this.folderModel.updateOne(
        { _id: folder.parentId },
        { $inc: { childCount: -1 } },
      );
    }

    // Delete the folder
    await this.folderModel.findByIdAndDelete(id);

    // Delete all child folders
    const childFolders = await this.folderModel.find({
      path: { $elemMatch: { $eq: id } },
      ownerId: userId,
    });

    for (const childFolder of childFolders) {
      await this.folderModel.deleteOne({ _id: childFolder._id });
    }

    return { id, deletedChildFolders: childFolders.length };
  }

  async getPath(id: string, userId: string) {
    const folder = await this.findOne(id, userId);
    
    if (!folder.path || folder.path.length === 0) {
      return [{ id: 'root', name: 'Root' }];
    }

    const pathIds = [...folder.path];
    if (pathIds[0] === 'root') {
      pathIds.shift(); // Remove 'root'
    }

    const pathFolders = await this.folderModel.find({
      _id: { $in: pathIds },
      ownerId: userId,
    });

    // Sort the folders according to the path order
    const sortedFolders = pathIds.map(id => 
      pathFolders.find(folder => folder._id.toString() === id)
    ).filter(Boolean);

    // Construct the breadcrumb
    const breadcrumb = [
      { id: 'root', name: 'Root' },
      ...sortedFolders.map(folder => ({ 
        id: folder._id.toString(), 
        name: folder.name 
      })),
    ];

    return breadcrumb;
  }

  async updatePermissions(id: string, permissions: { userId: string; permission: 'read' | 'write' | 'admin' }[], ownerId: string) {
    const folder = await this.folderModel.findOne({ _id: id, ownerId });

    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found or you don't have permission to update it`);
    }

    folder.permissions = permissions;
    folder.isShared = permissions.length > 0;
    await folder.save();

    return folder;
  }
}