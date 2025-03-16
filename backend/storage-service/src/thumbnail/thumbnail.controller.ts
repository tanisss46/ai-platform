import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ThumbnailService } from './thumbnail.service';
import { StorageProviderService } from '../storage-provider/storage-provider.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('thumbnails')
@Controller('thumbnails')
export class ThumbnailController {
  private readonly logger = new Logger(ThumbnailController.name);

  constructor(
    private readonly thumbnailService: ThumbnailService,
    private readonly storageProviderService: StorageProviderService,
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a thumbnail for a file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async generateThumbnail(
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: 'image' | 'video',
    @Body('userId') userId: string,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      if (!fileType) {
        throw new BadRequestException('File type is required');
      }

      if (!['image', 'video'].includes(fileType)) {
        throw new BadRequestException('Invalid file type. Must be "image" or "video"');
      }

      // Generate the thumbnail
      const thumbnailBuffer = await this.thumbnailService.generateThumbnail(
        file.buffer,
        fileType,
        file.mimetype,
      );

      // Upload the thumbnail to storage
      const { key, url } = await this.storageProviderService.uploadFile(
        thumbnailBuffer,
        'image/jpeg',
        `thumbnail-${file.originalname}.jpg`,
        userId,
        { originalFile: file.originalname },
      );

      return {
        key,
        url,
        size: thumbnailBuffer.length,
      };
    } catch (error) {
      this.logger.error(`Failed to generate thumbnail: ${error.message}`, error.stack);
      throw error;
    }
  }
}
