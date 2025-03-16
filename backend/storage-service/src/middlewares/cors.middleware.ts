import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * CORS Middleware for handling Cross-Origin Resource Sharing
 * This extends the basic CORS provided by NestJS with more customization
 */
@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorsMiddleware.name);
  private allowedOrigins: string[];
  private allowedMethods: string;
  private allowCredentials: boolean;
  private maxAge: number;

  constructor(private configService: ConfigService) {
    // Get CORS configuration from environment with sensible defaults
    const originsFromEnv = this.configService.get<string>('CORS_ALLOWED_ORIGINS', '*');
    this.allowedOrigins = originsFromEnv === '*' ? ['*'] : originsFromEnv.split(',');
    
    this.allowedMethods = this.configService.get<string>(
      'CORS_ALLOWED_METHODS', 
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
    );
    
    this.allowCredentials = this.configService.get<boolean>('CORS_ALLOW_CREDENTIALS', true);
    this.maxAge = this.configService.get<number>('CORS_MAX_AGE', 86400); // 24 hours
    
    this.logger.log(`CORS configured with allowed origins: ${this.allowedOrigins.join(', ')}`);
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Get the request origin
    const origin = req.headers.origin;
    
    // Set CORS headers
    // Allow specific origins or '*' for all
    if (origin && (this.allowedOrigins.includes('*') || this.allowedOrigins.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    // For preflight requests
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', this.allowedMethods);
      res.setHeader('Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Api-Key');
      res.setHeader('Access-Control-Max-Age', this.maxAge.toString());
      
      // Allow credentials if configured
      if (this.allowCredentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      // Respond to preflight immediately
      res.status(204).end();
      return;
    }
    
    // For non-preflight requests
    if (this.allowCredentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    next();
  }
}
