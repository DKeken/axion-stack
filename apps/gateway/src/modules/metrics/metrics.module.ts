import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { HttpMetricsInterceptor } from './interceptors/http-metrics.interceptor';
import { MetricsController } from './metrics.controller';
import {
  MetricsService,
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  microserviceRequestsTotal,
  microserviceRequestDuration,
} from './metrics.service';

@Module({
  imports: [
    PrometheusModule.register({
      // Use a different path to avoid conflicts with our secured controller
      path: '/internal-metrics',
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'axion_gateway_',
        },
      },
    }),
  ],
  controllers: [MetricsController],
  providers: [
    MetricsService,
    HttpMetricsInterceptor,
    httpRequestsTotal,
    httpRequestDuration,
    activeConnections,
    microserviceRequestsTotal,
    microserviceRequestDuration,
  ],
  exports: [MetricsService, HttpMetricsInterceptor],
})
export class MetricsModule {}
