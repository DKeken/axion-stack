// Main exports
export { HttpProxyModule } from './http-proxy.module';
export { HttpProxyService } from './http-proxy.service';

// Interfaces and types
export type {
  IHttpProxyProvider,
  HttpProxyConfig,
  ProxyRequest,
  ProxyResponse,
  ProxyError,
  RetryOptions,
  CircuitBreakerOptions,
} from './interfaces/http-proxy-provider.interface';

// Tokens for DI
export { HTTP_PROXY_PROVIDER, HTTP_PROXY_CONFIG } from './tokens';

// Decorators
export { InjectHttpProxy } from './decorators/inject-http-proxy.decorator';

// Configuration schema
export { httpProxyConfigSchema } from './interfaces/http-proxy-provider.interface';
