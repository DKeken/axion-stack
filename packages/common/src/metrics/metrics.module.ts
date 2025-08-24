import { Module, Global } from '@nestjs/common';

import { MicroserviceMetricsInterceptor } from './microservice-metrics.interceptor';
import { PushgatewayService } from './pushgateway.service';

@Global()
@Module({
  providers: [PushgatewayService, MicroserviceMetricsInterceptor],
  exports: [PushgatewayService, MicroserviceMetricsInterceptor],
})
export class MetricsModule {}
