import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UploadFileDto } from './dto/upload-file.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    const { folderId, tags, metadata } = uploadFileDto;
    
    return this.filesService.uploadFile(
      file,
      userId,
      folderId,
      tags ? (typeof tags === 'string' ? [tags] : tags) : undefined,
      metadata ? (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('download/:id')
  download(@Param('id') id: string, @Request() req) {
    return this.filesService.downloadFile(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('thumbnail/:id')
  getThumbnail(@Param('id') id: string, @Request() req) {
    return this.filesService.getThumbnail(id, req.user.id);
  }
}