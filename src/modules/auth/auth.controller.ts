import { Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClerkWebhookPayload } from '../customer/interfaces';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configSerivce: ConfigService,
  ) {}

  @Post('/clerk/admin/sync')
  async syncAdminFromClerkWebhook(@Req() req) {
    const wh = new Webhook(
      this.configSerivce.get('CLERK_ADMIN_WEBHOOK_SIGNING_SECRET'),
    );

    const data = await wh.verify(JSON.stringify(req.body), req.headers);

    await this.authService.syncAdminFromClerkWebhook(
      data as ClerkWebhookPayload,
    );
  }

  @Post('/clerk/customer/sync')
  async synCustomerFromClerkWebhook(@Req() req) {
    const wh = new Webhook(
      this.configSerivce.get('CLERK_WEBHOOK_SIGNING_SECRET'),
    );

    const data = await wh.verify(JSON.stringify(req.body), req.headers);

    await this.authService.synCustomerFromClerkWebhook(
      data as ClerkWebhookPayload,
    );
  }
}
