import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    
    // Generate a unique request ID
    const requestId = uuidv4();
    req['requestId'] = requestId;
    
    // Set the request ID header
    res.setHeader('X-Request-ID', requestId);

    // Get start time
    const startTime = Date.now();

    // Log the request
    this.logger.log(
      `[${requestId}] ${method} ${originalUrl} - ${ip} - ${userAgent}`
    );

    // Track response time and status code
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - startTime;

      // Log based on status code
      const logMethod = 
        statusCode < 400 ? 'log' : 
        statusCode < 500 ? 'warn' : 
        'error';

      this.logger[logMethod](
        `[${requestId}] ${method} ${originalUrl} ${statusCode} ${contentLength || 0}B - ${responseTime}ms`
      );
    });

    next();
  }
}
