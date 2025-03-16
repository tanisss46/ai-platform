import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as redis from 'redis';
import { promisify } from 'util';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private redisClient;
  private getAsync;
  private setAsync;
  private incrAsync;
  private expireAsync;

  constructor(private readonly configService: ConfigService) {
    // Initialize Redis client if enabled
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      this.redisClient = redis.createClient({
        url: redisUrl,
      });

      this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
      this.setAsync = promisify(this.redisClient.set).bind(this.redisClient);
      this.incrAsync = promisify(this.redisClient.incr).bind(this.redisClient);
      this.expireAsync = promisify(this.redisClient.expire).bind(this.redisClient);

      this.redisClient.on('error', (err) => {
        console.error('Redis error:', err);
      });
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip rate limiting if Redis is not available or in development mode
    if (!this.redisClient || process.env.NODE_ENV === 'development') {
      return next();
    }

    try {
      // Get user identifier (IP address or user ID if authenticated)
      const identifier = req.user?.id || req.ip;
      const endpoint = req.originalUrl;
      
      // Create a key combining identifier and endpoint
      const key = `ratelimit:${identifier}:${endpoint}`;
      
      // Check current count
      const currentCount = await this.incrAsync(key);
      
      // Set expiry for the key if it's a new key
      if (currentCount === 1) {
        await this.expireAsync(key, 60); // 60 seconds window
      }
      
      // Set rate limits based on endpoint
      let limit = 100; // Default limit
      
      // Adjust limits for specific endpoints
      if (endpoint.includes('/api/auth')) {
        limit = 20; // Stricter limit for auth endpoints
      } else if (endpoint.includes('/api/storage/upload')) {
        limit = 30; // Limit for uploads
      } else if (endpoint.includes('/api/ai')) {
        limit = 50; // Limit for AI requests
      }
      
      // Check if rate limit is exceeded
      if (currentCount > limit) {
        throw new HttpException(
          {
            message: 'Rate limit exceeded, please try again later',
            limit,
            remaining: 0,
            reset: 60, // seconds
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      
      // Add rate limit headers
      res.header('X-RateLimit-Limit', String(limit));
      res.header('X-RateLimit-Remaining', String(limit - currentCount));
      res.header('X-RateLimit-Reset', '60');
      
      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      console.error('Rate limit middleware error:', error);
      next(); // Continue even if rate limiting fails
    }
  }
}
