import { Injectable } from '@nestjs/common';
import {
  InjectMetric,
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge } from 'prom-client';

// Define metric providers
export const httpRequestsTotal = makeCounterProvider({
  name: 'axion_gateway_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status_code', 'path', 'service'],
});

export const httpRequestDuration = makeHistogramProvider({
  name: 'axion_gateway_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'status_code', 'path', 'service'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const activeConnections = makeGaugeProvider({
  name: 'axion_gateway_active_connections',
  help: 'Number of active connections',
});

export const microserviceRequestsTotal = makeCounterProvider({
  name: 'axion_gateway_microservice_requests_total',
  help: 'Total number of requests to microservices',
  labelNames: ['service', 'method', 'status'],
});

export const microserviceRequestDuration = makeHistogramProvider({
  name: 'axion_gateway_microservice_request_duration_seconds',
  help: 'Duration of microservice requests in seconds',
  labelNames: ['service', 'method', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('axion_gateway_http_requests_total')
    private readonly httpRequestsCounter: Counter<string>,
    @InjectMetric('axion_gateway_http_request_duration_seconds')
    private readonly httpRequestDurationHistogram: Histogram<string>,
    @InjectMetric('axion_gateway_active_connections')
    private readonly activeConnectionsGauge: Gauge<string>,
    @InjectMetric('axion_gateway_microservice_requests_total')
    private readonly microserviceRequestsCounter: Counter<string>,
    @InjectMetric('axion_gateway_microservice_request_duration_seconds')
    private readonly microserviceRequestDurationHistogram: Histogram<string>
  ) {}

  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    service?: string
  ) {
    const labels = {
      method: method.toUpperCase(),
      status_code: statusCode.toString(),
      path: this.normalizePath(path),
      service: service || 'gateway',
    };

    this.httpRequestsCounter.inc(labels);
    this.httpRequestDurationHistogram.observe(labels, duration);
  }

  /**
   * Record microservice request metrics
   */
  recordMicroserviceRequest(service: string, method: string, status: string, duration: number) {
    const labels = {
      service,
      method: method.toUpperCase(),
      status,
    };

    this.microserviceRequestsCounter.inc(labels);
    this.microserviceRequestDurationHistogram.observe(labels, duration);
  }

  /**
   * Update active connections count
   */
  setActiveConnections(count: number) {
    this.activeConnectionsGauge.set(count);
  }

  /**
   * Increment active connections
   */
  incrementActiveConnections() {
    this.activeConnectionsGauge.inc();
  }

  /**
   * Decrement active connections
   */
  decrementActiveConnections() {
    this.activeConnectionsGauge.dec();
  }

  /**
   * Normalize path for metrics (remove IDs and query params)
   */
  private normalizePath(path: string): string {
    return path
      .replace(/\/\d+/g, '/:id') // Replace numeric IDs
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid') // Replace UUIDs
      .replace(/\?.*$/, '') // Remove query parameters
      .toLowerCase();
  }
}
