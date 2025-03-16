import {
  Controller,
  All,
  Req,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(private readonly proxyService: ProxyService) {}

  /**
   * Catch all route to proxy requests to the appropriate service
   */
  @All('*')
  async handleProxy(@Req() req: Request, @Res() res: Response) {
    try {
      // Get the path without /api prefix
      let path = req.path.replace(/^\/api\//, '');
      
      // Extract service name from the path (first part)
      const pathParts = path.split('/');
      const service = pathParts[0];
      
      // Update path to exclude service name for forwarding
      path = pathParts.slice(1).join('/');
      
      // Don't proxy health check requests
      if (service === 'health' || req.path === '/health') {
        this.logger.debug('Handling health check request');
        return res.status(HttpStatus.OK).json({
          status: 'ok',
          services: await this.proxyService.checkHealth(),
        });
      }
      
      // Don't proxy unsupported paths
      if (!service || service === '') {
        this.logger.warn(`Invalid path requested: ${req.path}`);
        return res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
        });
      }
      
      // Forward the request to the appropriate service
      this.logger.debug(`Forwarding request to ${service} service: ${path}`);
      const result = await this.proxyService.forwardRequest(
        service,
        path,
        req.method,
        req.headers,
        req.body,
        req.query,
        req['user'], // User from auth middleware
      );
      
      // Set status code and send response
      res.status(result.statusCode).json(result.data);
    } catch (error) {
      this.logger.error(`Error proxying request: ${error.message}`);
      
      // Handle known HTTP exceptions
      if (error.status) {
        return res.status(error.status).json({
          statusCode: error.status,
          message: error.message || 'Service error',
        });
      }
      
      // Handle generic errors
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }
  }
}
