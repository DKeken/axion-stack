/**
 * Types for Service Discovery in microservices
 */

export interface ServiceRegistration {
  /** Service name */
  name: string;
  /** Service version */
  version: string;
  /** Service ID (unique instance) */
  instanceId: string;
  /** RabbitMQ queue name for this service instance */
  queueName: string;
  /** Service health status */
  status: 'healthy' | 'unhealthy' | 'starting' | 'stopping';
  /** Service capabilities/endpoints */
  capabilities: string[];
  /** Additional metadata */
  metadata: Record<string, unknown>;
  /** Registration timestamp */
  registeredAt: string;
  /** Last heartbeat timestamp */
  lastHeartbeat: string;
  /** Service port (if applicable) */
  port?: number;
  /** Service host (if applicable) */
  host?: string;
  /** Marked as deprecated during HMR cleanup */
  deprecated?: boolean;
  /** When the service was deprecated */
  deprecatedAt?: string;
  /** PID that deprecated this service */
  deprecatedBy?: number;
}

export interface ServiceDiscoveryConfig {
  /** Registry key prefix in Redis */
  registryPrefix: string;
  /** Heartbeat interval in milliseconds */
  heartbeatInterval: number;
  /** Service TTL in seconds (if no heartbeat) */
  serviceTtl: number;
  /** Enable auto-cleanup of stale services */
  enableCleanup: boolean;
}
