import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { HttpProxyService } from './http-proxy.service';
import { httpProxyConfigSchema } from './interfaces/http-proxy-provider.interface';
import { HTTP_PROXY_PROVIDER, HTTP_PROXY_CONFIG } from './tokens';

import type {
  IHttpProxyProvider,
  HttpProxyConfig,
} from './interfaces/http-proxy-provider.interface';
import type { AppConfig } from '@/config/configuration';

export interface HttpProxyModuleOptions {
  config?: Partial<HttpProxyConfig>;
  useFactory?: (configService: ConfigService<AppConfig>) => HttpProxyConfig;
  provider?: new (...args: never[]) => IHttpProxyProvider;
}

@Global()
@Module({})
export class HttpProxyModule {
  /**
   * Register HTTP Proxy module with default configuration
   */
  static forRoot(options: HttpProxyModuleOptions = {}): DynamicModule {
    const configProvider = {
      provide: HTTP_PROXY_CONFIG,
      useFactory:
        options.useFactory ||
        ((_configService: ConfigService<AppConfig>) => {
          // Default configuration - can be overridden via environment variables or options
          const defaultConfig: HttpProxyConfig = {
            enabled: false,
            timeout: 30000,
            retries: 3,
            retryDelay: 1000,
            ...options.config,
          };

          // Validate configuration
          const result = httpProxyConfigSchema.safeParse(defaultConfig);
          if (!result.success) {
            throw new Error(
              `Invalid HTTP Proxy configuration: ${JSON.stringify(result.error.format())}`
            );
          }

          return result.data;
        }),
      inject: [ConfigService],
    };

    const providerClass = options.provider || HttpProxyService;

    const proxyProvider = {
      provide: HTTP_PROXY_PROVIDER,
      useClass: providerClass,
    };

    return {
      module: HttpProxyModule,
      imports: [ConfigModule],
      providers: [configProvider, proxyProvider],
      exports: [HTTP_PROXY_PROVIDER],
    };
  }

  /**
   * Register HTTP Proxy module for feature modules
   * Note: Since this module is @Global(), this method is typically not needed.
   * The providers are already available globally after forRoot() registration.
   */
  static forFeature(): DynamicModule {
    return {
      module: HttpProxyModule,
      // No exports needed since the module is global and providers are already available
    };
  }
}
