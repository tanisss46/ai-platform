import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Patch,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Express } from 'express';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folderId: {
          type: 'string',
          description: 'ID of the folder to upload to (optional)',
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Tags for the file (optional)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB max
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('folderId') folderId?: string,
    @Body('tags') tags?: string,
    @Req() req: any,
  ) {
    // Extract user ID from request
    const userId = req.user.id;
    
    // Parse tags if provided
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // Extract metadata for specific file types
    let metadata = null;
    
    if (file.mimetype.startsWith('image/')) {
      // Extract image dimensions if available (would be handled by a metadata extraction service)
      metadata = {
        width: 0, // Placeholder
        height: 0, // Placeholder
      };
    } else if (file.mimetype.startsWith('video/')) {
      // Extract video metadata if available
      metadata = {
        width: 0, // Placeholder
        height: 0, // Placeholder
        duration: 0, // Placeholder
      };
    } else if (file.mimetype.startsWith('audio/')) {
      // Extract audio metadata if available
      metadata = {
        duration: 0, // Placeholder
      };
    }

    return this.filesService.uploadFile(file, userId, folderId, parsedTags, metadata);
  }

  @Post('batch-upload')
  @ApiOperation({ summary: 'Upload multiple files at once' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folderId') folderId?: string,
    @Body('tags') tags?: string,
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const userId = req.user.id;
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // Upload each file and return results
    const uploadPromises = files.map(file => 
      this.filesService.uploadFile(file, userId, folderId, parsedTags)
    );

    return Promise.all(uploadPromises);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file details' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async getFile(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.filesService.downloadFile(id, userId);
  }

  @Get(':id/thumbnail')
  @ApiOperation({ summary: 'Get file thumbnail' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async getThumbnail(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.filesService.getThumbnail(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  async deleteFile(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.filesService.remove(id, userId);
  }
}
