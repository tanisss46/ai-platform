import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { StorageProviderModule } from '../storage-provider/storage-provider.module';
import { ContentModule } from '../content/content.module';
import { FoldersModule } from '../folders/folders.module';
import { ThumbnailModule } from '../thumbnail/thumbnail.module';

@Module({
  imports: [
    StorageProviderModule,
    ContentModule,
    FoldersModule,
    ThumbnailModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}