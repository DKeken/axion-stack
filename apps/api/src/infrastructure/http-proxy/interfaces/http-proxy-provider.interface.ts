import { z } from 'zod';

// HTTP Proxy Configuration Schema
export const httpProxyConfigSchema = z.object({
  enabled: z.boolean().default(false),
  baseUrl: z.string().url().optional(),
  timeout: z.number().min(1000).default(30000),
  retries: z.number().min(0).max(5).default(3),
  retryDelay: z.number().min(100).default(1000),
  headers: z.record(z.string()).optional(),
  auth: z
    .object({
      type: z.enum(['bearer', 'basic', 'apikey']),
      token: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      apiKey: z.string().optional(),
      apiKeyHeader: z.string().optional(),
    })
    .optional(),
});

export type HttpProxyConfig = z.infer<typeof httpProxyConfigSchema>;

// HTTP Request/Response interfaces
const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const ProxyRequestBodySchema = z.union([z.string(), z.record(z.string()), z.array(z.string())]);

const ProxyRequestSchema = z.object({
  method: HttpMethodSchema,
  path: z.string(),
  body: ProxyRequestBodySchema.optional(),
  headers: z.record(z.string()).optional(),
  query: z.record(z.string()).optional(),
  timeout: z.number().positive().optional(),
});

export type ProxyRequest = z.infer<typeof ProxyRequestSchema>;

export interface ProxyResponse<T = string> {
  data: T;
  status: number;
  headers: Record<string, string>;
  timing: {
    start: number;
    end: number;
    duration: number;
  };
}

export interface ProxyError {
  message: string;
  status?: number;
  code?: string;
  originalError?: string;
  request?: Partial<ProxyRequest>;
  response?: Partial<ProxyResponse>;
}

// Retry configuration
export interface RetryOptions {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: ProxyError) => boolean;
}

// Circuit breaker configuration
export interface CircuitBreakerOptions {
  enabled: boolean;
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

// Main HTTP Proxy Provider interface
export interface IHttpProxyProvider {
  /**
   * Make an HTTP request through the proxy
   */
  request<T = string>(request: ProxyRequest): Promise<ProxyResponse<T>>;

  /**
   * GET request shorthand
   */
  get<T = string>(path: string, options?: Partial<ProxyRequest>): Promise<ProxyResponse<T>>;

  /**
   * POST request shorthand
   */
  post<T = string>(
    path: string,
    body?: ProxyRequest['body'],
    options?: Partial<ProxyRequest>
  ): Promise<ProxyResponse<T>>;

  /**
   * PUT request shorthand
   */
  put<T = string>(
    path: string,
    body?: ProxyRequest['body'],
    options?: Partial<ProxyRequest>
  ): Promise<ProxyResponse<T>>;

  /**
   * PATCH request shorthand
   */
  patch<T = string>(
    path: string,
    body?: ProxyRequest['body'],
    options?: Partial<ProxyRequest>
  ): Promise<ProxyResponse<T>>;

  /**
   * DELETE request shorthand
   */
  delete<T = string>(path: string, options?: Partial<ProxyRequest>): Promise<ProxyResponse<T>>;

  /**
   * Health check for the proxy target
   */
  healthCheck(): Promise<boolean>;

  /**
   * Get current configuration
   */
  getConfig(): HttpProxyConfig;

  /**
   * Update configuration (runtime reconfiguration)
   */
  updateConfig(config: Partial<HttpProxyConfig>): void;
}
