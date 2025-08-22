import { Controller, All, Req, Res } from '@nestjs/common';

import { GatewayService } from './gateway.service';

import type { Request, Response } from 'express';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All('api/v1/auth/*')
  async proxyAuth(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.gatewayService.proxyToService('auth', req, res);
  }

  @All('api/v1/users/*')
  async proxyUsers(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.gatewayService.proxyToService('users', req, res);
  }
}
