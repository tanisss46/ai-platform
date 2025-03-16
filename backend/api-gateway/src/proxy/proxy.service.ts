import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class ProxyService {
  private serviceRegistry: Record<string, string>;

  constructor(private configService: ConfigService) {
    // Initialize service registry with microservice URLs
    this.serviceRegistry = {
      'users': this.configService.get<string>('USER_SERVICE_URL') || 'http://localhost:3001',
      'storage': this.configService.get<string>('STORAGE_SERVICE_URL') || 'http://localhost:3002',
      'ai': this.configService.get<string>('AI_ORCHESTRATION_SERVICE_URL') || 'http://localhost:3003',
      'llm': this.configService.get<string>('LLM_ASSISTANT_SERVICE_URL') || 'http://localhost:3004',
      'billing': this.configService.get<string>('BILLING_SERVICE_URL') || 'http://localhost:3005',
      'notifications': this.configService.get<string>('NOTIFICATION_SERVICE_URL') || 'http://localhost:3006',
      'search': this.configService.get<string>('SEARCH_SERVICE_URL') || 'http://localhost:3007',
    };
  }

  /**
   * Forward a request to the appropriate microservice
   */
  async forwardRequest(
    service: string,
    path: string,
    method: string,
    headers: any,
    body: any,
    query: any,
    user?: any,
  ): Promise<any> {
    const serviceUrl = this.serviceRegistry[service];
    
    if (!serviceUrl) {
      throw new HttpException(`Service '${service}' not found`, HttpStatus.NOT_FOUND);
    }
    
    const url = `${serviceUrl}/${path}`;
    
    // Set up request config
    const config: AxiosRequestConfig = {
      method: method as any,
      url,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      params: query,
      data: body,
    };
    
    // If there's a user from authentication, include user info
    if (user) {
      config.headers['X-User-Id'] = user.id;
      config.headers['X-User-Role'] = user.role;
    }
    
    // Remove sensitive headers
    delete config.headers.host;
    delete config.headers.cookie;
    
    try {
      const response: AxiosResponse = await axios(config);
      return {
        statusCode: response.status,
        data: response.data,
      };
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new HttpException(
          error.response.data || 'Service error',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else if (error.request) {
        // The request was made but no response was received
        throw new HttpException(
          'Service unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new HttpException(
          error.message || 'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Get all registered services
   */
  getServices(): { name: string; url: string }[] {
    return Object.entries(this.serviceRegistry).map(([name, url]) => ({
      name,
      url,
    }));
  }

  /**
   * Check health of all services
   */
  async checkHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    
    for (const [service, url] of Object.entries(this.serviceRegistry)) {
      try {
        const response = await axios.get(`${url}/health`, { timeout: 2000 });
        health[service] = response.status === 200;
      } catch (error) {
        health[service] = false;
      }
    }
    
    return health;
  }
}
