import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContentModule } from './content/content.module';
import { FilesModule } from './files/files.module';
import { FoldersModule } from './folders/folders.module';
import { StorageProviderModule } from './storage-provider/storage-provider.module';
import { ThumbnailModule } from './thumbnail/thumbnail.module';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Scheduling
    ScheduleModule.forRoot(),
    
    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/aicloud_storage'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
        maxPoolSize: configService.get<number>('MONGODB_POOL_SIZE', 10),
        connectTimeoutMS: configService.get<number>('MONGODB_CONNECT_TIMEOUT', 10000),
        socketTimeoutMS: configService.get<number>('MONGODB_SOCKET_TIMEOUT', 45000),
      }),
    }),
    
    // Application modules
    ContentModule,
    FilesModule,
    FoldersModule,
    StorageProviderModule,
    ThumbnailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    AuthGuard,
  ],
})
export class AppModule {}
