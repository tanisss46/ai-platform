import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly proxyService: ProxyService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get health status of the API gateway' })
  @ApiResponse({ status: 200, description: 'API Gateway is healthy' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('services')
  @ApiOperation({ summary: 'Get health status of all microservices' })
  @ApiResponse({ status: 200, description: 'Health status of all services' })
  async getServicesHealth() {
    const serviceHealth = await this.proxyService.checkHealth();
    
    const allHealthy = Object.values(serviceHealth).every(status => status);
    
    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: serviceHealth,
    };
  }
}
