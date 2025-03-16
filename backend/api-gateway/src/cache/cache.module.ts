import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisEnabled = configService.get<boolean>('REDIS_ENABLED', false);
        
        if (!redisEnabled) {
          // Use in-memory cache if Redis is not enabled
          return {
            ttl: 60, // Default TTL in seconds
            max: 100, // Maximum number of items in cache
          };
        }
        
        // Use Redis store
        return {
          store: redisStore,
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD', ''),
          ttl: configService.get<number>('REDIS_TTL', 60),
          max: configService.get<number>('REDIS_MAX_ITEMS', 100),
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheModule, CacheService],
})
export class CacheModule {}
