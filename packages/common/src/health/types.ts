/**
 * Types for microservice health checks via RabbitMQ
 */

export interface HealthCheckRequest {
  /** Timestamp when health check was initiated */
  timestamp: string;
  /** Optional timeout for health check in milliseconds */
  timeout?: number;
}

export interface HealthCheckStatus {
  status: 'up' | 'down';
  error?: string;
  details?: Record<string, unknown>;
  latency?: number;
}

export interface HealthCheckResponse {
  /** Overall service status */
  status: 'ok' | 'error';
  /** Service name */
  service: string;
  /** Response timestamp */
  timestamp: string;
  /** Service uptime in seconds */
  uptime: number;
  /** Individual component checks */
  checks: Record<string, HealthCheckStatus>;
  /** Total response time for health check */
  responseTime: number;
}

export interface HealthCheckDependency {
  name: string;
  check: () => Promise<HealthCheckStatus>;
}

export interface HealthCheckConfig {
  /** Service name for identification */
  serviceName: string;
  /** Dependencies to check */
  dependencies: HealthCheckDependency[];
  /** Default timeout for health check in milliseconds */
  defaultTimeout?: number;
}
