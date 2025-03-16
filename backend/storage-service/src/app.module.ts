import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesModule } from './files/files.module';
import { FoldersModule } from './folders/folders.module';
import { ContentModule } from './content/content.module';
import { StorageProviderModule } from './storage-provider/storage-provider.module';
import { ThumbnailModule } from './thumbnail/thumbnail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost/aicloud-storage'),
    StorageProviderModule,
    FilesModule,
    FoldersModule,
    ContentModule,
    ThumbnailModule,
  ],
})
export class AppModule {}