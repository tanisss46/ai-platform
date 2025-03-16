import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createContentDto: CreateContentDto, @Request() req) {
    return this.contentService.create(createContentDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Request() req,
    @Query('parentFolderId') parentFolderId?: string,
    @Query('type') type?: string,
    @Query('tags') tags?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortDir') sortDir?: 'asc' | 'desc',
  ) {
    const typeArray = type ? type.split(',') : undefined;
    const tagsArray = tags ? tags.split(',') : undefined;
    
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortDir === 'asc' ? 1 : -1;
    } else {
      sort['createdAt'] = -1; // Default sort by createdAt desc
    }
    
    return this.contentService.findAll(req.user.id, {
      parentFolderId,
      type: typeArray,
      tags: tagsArray,
      search,
      page: page ? parseInt(page.toString(), 10) : undefined,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
      sort,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.contentService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto, @Request() req) {
    return this.contentService.update(id, updateContentDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.contentService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/versions')
  addVersion(
    @Param('id') id: string,
    @Body() body: { storageKey: string },
    @Request() req,
  ) {
    return this.contentService.addVersion(id, body.storageKey, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/versions')
  getVersions(@Param('id') id: string, @Request() req) {
    return this.contentService.getVersions(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/permissions')
  updatePermissions(
    @Param('id') id: string,
    @Body() body: { permissions: { userId: string; permission: 'read' | 'write' | 'admin' }[] },
    @Request() req,
  ) {
    return this.contentService.updatePermissions(id, body.permissions, req.user.id);
  }
}