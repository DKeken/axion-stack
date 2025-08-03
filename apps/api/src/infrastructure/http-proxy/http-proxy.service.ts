import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HTTP_PROXY_CONFIG } from './tokens';

import type {
  IHttpProxyProvider,
  HttpProxyConfig,
  ProxyRequest,
  ProxyResponse,
  ProxyError,
} from './interfaces/http-proxy-provider.interface';
import type { AppConfig } from '@/config/configuration';

/**
 * Default HTTP Proxy implementation
 * This is a basic implementation that can be replaced with more sophisticated providers
 */
@Injectable()
export class HttpProxyService implements IHttpProxyProvider {
  private readonly logger = new Logger(HttpProxyService.name);
  private config: HttpProxyConfig;

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    @Inject(HTTP_PROXY_CONFIG) initialConfig: HttpProxyConfig
  ) {
    this.config = initialConfig;
  }

  async request<T = string>(request: ProxyRequest): Promise<ProxyResponse<T>> {
    if (!this.config.enabled) {
      throw new Error('HTTP Proxy is disabled');
    }

    const startTime = Date.now();

    try {
      this.logger.debug(`HTTP Proxy Request: ${request.method} ${request.path}`);

      // This is a placeholder implementation
      // In a real implementation, you would use a library like axios, node-fetch, etc.
      const response = await this.makeHttpRequest<T>(request);

      const endTime = Date.now();
      const duration = endTime - startTime;

      this.logger.debug(`HTTP Proxy Response: ${response.status} in ${duration}ms`);

      return {
        ...response,
        timing: {
          start: startTime,
          end: endTime,
          duration,
        },
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.logger.error(`HTTP Proxy Error after ${duration}ms:`, error);

      throw this.transformError(error as Error, request);
    }
  }

  async get<T = string>(path: string, options?: Partial<ProxyRequest>): Promise<ProxyResponse<T>> {
    return this.request<T>({
      method: 'GET',
      path,
      ...options,
    });
  }

  async post<T = string>(
    path: string,
    body?: ProxyRequest['body'],
    options?: Partial<ProxyRequest>
  ): Promise<ProxyResponse<T>> {
    return this.request<T>({
      method: 'POST',
      path,
      body,
      ...options,
    });
  }

  async put<T = string>(
    path: string,
    body?: ProxyRequest['body'],
    options?: Partial<ProxyRequest>
  ): Promise<ProxyResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      path,
      body,
      ...options,
    });
  }

  async patch<T = string>(
    path: string,
    body?: ProxyRequest['body'],
    options?: Partial<ProxyRequest>
  ): Promise<ProxyResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      path,
      body,
      ...options,
    });
  }

  async delete<T = string>(
    path: string,
    options?: Partial<ProxyRequest>
  ): Promise<ProxyResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      path,
      ...options,
    });
  }

  async healthCheck(): Promise<boolean> {
    if (!this.config.enabled || !this.config.baseUrl) {
      return false;
    }

    try {
      await this.get('/health', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  getConfig(): HttpProxyConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<HttpProxyConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.log('HTTP Proxy configuration updated');
  }

  private async makeHttpRequest<T>(
    _request: ProxyRequest
  ): Promise<Omit<ProxyResponse<T>, 'timing'>> {
    // This is a placeholder - replace with actual HTTP client implementation
    // Example using fetch API:
    /*
    const url = new URL(request.path, this.config.baseUrl);
    if (request.query) {
      Object.entries(request.query).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const headers = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...request.headers,
    };

    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: request.body ? JSON.stringify(request.body) : undefined,
      signal: AbortSignal.timeout(request.timeout || this.config.timeout),
    });

    const data = await response.json();

    return {
      data,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    };
    */

    // Placeholder response
    return {
      data: {} as T,
      status: 200,
      headers: {},
    };
  }

  private transformError(
    error: Error | { message: string; status?: number; code?: string },
    request: ProxyRequest
  ): ProxyError {
    return {
      message: error.message || 'HTTP Proxy request failed',
      status: 'status' in error ? (error as { status: number }).status : 500,
      code: 'code' in error ? (error as { code: string }).code : undefined,
      originalError: error.message,
      request: {
        method: request.method,
        path: request.path,
      },
    };
  }
}
