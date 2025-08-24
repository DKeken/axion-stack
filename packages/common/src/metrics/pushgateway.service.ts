import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { Counter, Gauge, Histogram, register } from 'prom-client';

export type MetricLabels = Record<string, string | number>;

@Injectable()
export class PushgatewayService implements OnModuleInit {
  private readonly logger = new Logger(PushgatewayService.name);
  private readonly pushgatewayUrl: string;
  private readonly serviceName: string;
  private readonly jobName: string;

  // Standard metrics for microservices
  private readonly operationCounter: Counter<string>;
  private readonly operationDuration: Histogram<string>;
  private readonly activeOperations: Gauge<string>;
  private readonly errorCounter: Counter<string>;

  constructor() {
    this.pushgatewayUrl = process.env.PROMETHEUS_PUSHGATEWAY_URL || 'http://localhost:9091';
    this.serviceName = process.env.SERVICE_NAME || 'unknown-service';
    this.jobName = `axion_${this.serviceName}`;

    // Initialize standard metrics
    this.operationCounter = new Counter({
      name: `axion_${this.serviceName}_operations_total`,
      help: `Total number of operations performed by ${this.serviceName}`,
      labelNames: ['operation', 'status'],
    });

    this.operationDuration = new Histogram({
      name: `axion_${this.serviceName}_operation_duration_seconds`,
      help: `Duration of operations in ${this.serviceName}`,
      labelNames: ['operation', 'status'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    this.activeOperations = new Gauge({
      name: `axion_${this.serviceName}_active_operations`,
      help: `Number of active operations in ${this.serviceName}`,
      labelNames: ['operation'],
    });

    this.errorCounter = new Counter({
      name: `axion_${this.serviceName}_errors_total`,
      help: `Total number of errors in ${this.serviceName}`,
      labelNames: ['operation', 'error_type'],
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(`📊 Pushgateway metrics service initialized for ${this.serviceName}`);
    this.logger.log(`🎯 Pushing metrics to: ${this.pushgatewayUrl}`);

    // Push initial metrics
    await this.pushMetrics();

    // Setup periodic push (every 30 seconds)
    setInterval(() => {
      this.pushMetrics().catch((error) => {
        this.logger.error('Failed to push metrics periodically:', error);
      });
    }, 30000);
  }

  /**
   * Record an operation (RPC call, database query, etc.)
   */
  recordOperation(operation: string, status: 'success' | 'error', duration: number) {
    this.operationCounter.inc({ operation, status });
    this.operationDuration.observe({ operation, status }, duration);
  }

  /**
   * Record an error
   */
  recordError(operation: string, errorType: string) {
    this.errorCounter.inc({ operation, error_type: errorType });
  }

  /**
   * Set number of active operations
   */
  setActiveOperations(operation: string, count: number) {
    this.activeOperations.set({ operation }, count);
  }

  /**
   * Increment active operations
   */
  incrementActiveOperations(operation: string) {
    this.activeOperations.inc({ operation });
  }

  /**
   * Decrement active operations
   */
  decrementActiveOperations(operation: string) {
    this.activeOperations.dec({ operation });
  }

  /**
   * Create a custom counter metric
   */
  createCounter(name: string, help: string, labelNames: string[] = []): Counter<string> {
    return new Counter({
      name: `axion_${this.serviceName}_${name}`,
      help,
      labelNames,
    });
  }

  /**
   * Create a custom gauge metric
   */
  createGauge(name: string, help: string, labelNames: string[] = []): Gauge<string> {
    return new Gauge({
      name: `axion_${this.serviceName}_${name}`,
      help,
      labelNames,
    });
  }

  /**
   * Create a custom histogram metric
   */
  createHistogram(
    name: string,
    help: string,
    labelNames: string[] = [],
    buckets?: number[]
  ): Histogram<string> {
    return new Histogram({
      name: `axion_${this.serviceName}_${name}`,
      help,
      labelNames,
      buckets: buckets || [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });
  }

  /**
   * Push all metrics to Pushgateway
   */
  async pushMetrics(): Promise<void> {
    try {
      const metrics = await register.metrics();
      const url = `${this.pushgatewayUrl}/metrics/job/${this.jobName}/instance/${this.serviceName}`;

      await axios.post(url, metrics, {
        headers: {
          'Content-Type': register.contentType,
        },
        timeout: 5000,
      });

      this.logger.debug(`📊 Metrics pushed successfully to ${url}`);
    } catch (error) {
      this.logger.error('Failed to push metrics to Pushgateway:', error);
      throw error;
    }
  }

  /**
   * Delete metrics from Pushgateway (for graceful shutdown)
   */
  async deleteMetrics(): Promise<void> {
    try {
      const url = `${this.pushgatewayUrl}/metrics/job/${this.jobName}/instance/${this.serviceName}`;
      await axios.delete(url, { timeout: 5000 });
      this.logger.log('🗑️ Metrics deleted from Pushgateway');
    } catch (error) {
      this.logger.error('Failed to delete metrics from Pushgateway:', error);
    }
  }
}
