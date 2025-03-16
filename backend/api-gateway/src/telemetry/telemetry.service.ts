import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface TraceContext {
  requestId: string;
  userId?: string;
  service: string;
  endpoint: string;
  startTime: number;
}

interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: number;
}

/**
 * TelemetryService provides distributed tracing and metrics collection
 * for API Gateway and microservices communication.
 * 
 * In a production environment, this would be integrated with a proper
 * tracing system like Jaeger, Zipkin, or OpenTelemetry.
 */
@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('TELEMETRY_ENABLED', false);
  }

  /**
   * Start a new trace for a request
   */
  startTrace(service: string, endpoint: string, userId?: string): TraceContext {
    const requestId = this.generateRequestId();
    const context: TraceContext = {
      requestId,
      userId,
      service,
      endpoint,
      startTime: Date.now(),
    };

    if (this.enabled) {
      this.logger.debug(
        `Trace started: ${requestId} -> ${service}/${endpoint} ${userId ? `(user: ${userId})` : ''}`,
      );
    }

    return context;
  }

  /**
   * End a trace and log the duration
   */
  endTrace(context: TraceContext): void {
    if (!this.enabled) return;

    const duration = Date.now() - context.startTime;
    
    this.logger.debug(
      `Trace completed: ${context.requestId} -> ${context.service}/${
        context.endpoint
      } (${duration}ms)`,
    );

    // Record the request duration metric
    this.recordMetric({
      name: 'request.duration',
      value: duration,
      tags: {
        service: context.service,
        endpoint: context.endpoint,
        userId: context.userId || 'anonymous',
      },
    });
  }

  /**
   * Record a metric
   */
  recordMetric(metric: MetricData): void {
    if (!this.enabled) return;

    // In a real implementation, this would send metrics to a system like
    // Prometheus, Datadog, or CloudWatch
    this.logger.verbose(
      `Metric: ${metric.name} = ${metric.value} ${
        metric.tags ? `tags=${JSON.stringify(metric.tags)}` : ''
      }`,
    );
  }

  /**
   * Record an error in the tracing system
   */
  recordError(context: TraceContext, error: Error): void {
    if (!this.enabled) return;

    this.logger.error(
      `Trace error: ${context.requestId} -> ${context.service}/${context.endpoint}: ${error.message}`,
      error.stack,
    );

    // Count errors by type
    this.recordMetric({
      name: 'request.error',
      value: 1,
      tags: {
        service: context.service,
        endpoint: context.endpoint,
        errorType: error.name,
        errorMessage: error.message.substring(0, 100), // Truncate long messages
      },
    });
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
}
