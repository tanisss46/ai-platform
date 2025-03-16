import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API gateway health' })
  @ApiResponse({ status: 200, description: 'Health check passed' })
  @ApiResponse({ status: 503, description: 'Health check failed' })
  check() {
    return this.health.check([
      // Memory usage check
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB max
      
      // Disk space check
      () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }), // 90% max usage
      
      // Microservices health checks
      () => this.http.pingCheck('user-service', `${this.configService.get('USER_SERVICE_URL')}/health`),
      () => this.http.pingCheck('storage-service', `${this.configService.get('STORAGE_SERVICE_URL')}/health`),
      () => this.http.pingCheck('llm-assistant-service', `${this.configService.get('LLM_ASSISTANT_SERVICE_URL')}/health`),
      () => this.http.pingCheck('ai-orchestration-service', `${this.configService.get('AI_ORCHESTRATION_SERVICE_URL')}/health`),
    ]);
  }
}
