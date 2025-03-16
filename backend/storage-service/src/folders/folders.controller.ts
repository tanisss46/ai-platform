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
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createFolderDto: CreateFolderDto, @Request() req) {
    return this.foldersService.create(createFolderDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Request() req,
    @Query('parentId') parentId?: string,
    @Query('isShared') isShared?: boolean,
    @Query('isStarred') isStarred?: boolean,
    @Query('search') search?: string,
  ) {
    return this.foldersService.findAll(req.user.id, {
      parentId,
      isShared: isShared !== undefined ? isShared === 'true' : undefined,
      isStarred: isStarred !== undefined ? isStarred === 'true' : undefined,
      search,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.foldersService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFolderDto: UpdateFolderDto, @Request() req) {
    return this.foldersService.update(id, updateFolderDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.foldersService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/path')
  getPath(@Param('id') id: string, @Request() req) {
    return this.foldersService.getPath(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/permissions')
  updatePermissions(
    @Param('id') id: string,
    @Body() body: { permissions: { userId: string; permission: 'read' | 'write' | 'admin' }[] },
    @Request() req,
  ) {
    return this.foldersService.updatePermissions(id, body.permissions, req.user.id);
  }
}