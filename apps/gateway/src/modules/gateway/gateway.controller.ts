import { Controller, All, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GatewayService } from './gateway.service';

import type { AppConfig } from '@/config/configuration';
import type { Request, Response } from 'express';

@Controller()
export class GatewayController {
  private readonly apiPrefix: string;

  constructor(
    private readonly gatewayService: GatewayService,
    private readonly configService: ConfigService<AppConfig>
  ) {
    this.apiPrefix = this.configService.get('API_PREFIX', { infer: true }) || '/api/v1';
  }

  // Auth service routes
  @All('api/v1/auth')
  async proxyAuthRoot(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.gatewayService.proxyToService('auth', req, res);
  }

  @All('api/v1/auth/*')
  async proxyAuth(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.gatewayService.proxyToService('auth', req, res);
  }

  // Users service routes
  @All('api/v1/users')
  async proxyUsersRoot(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.gatewayService.proxyToService('users', req, res);
  }

  @All('api/v1/users/*')
  async proxyUsers(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.gatewayService.proxyToService('users', req, res);
  }
}
