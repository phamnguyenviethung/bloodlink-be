import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { RequestWithUser } from '@/share/types/request.type';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Webhook } from 'svix';
import { ClerkAuthGuard } from '../auth/guard/clerk.guard';
import { CustomerService } from './customer.service';
import { ClerkWebhookPayload } from './interfaces';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private configSerivce: ConfigService,
  ) {}

  @Post('sync')
  async synCustomerFromClerkWebhook(@Req() req) {
    const wh = new Webhook(
      this.configSerivce.get('CLERK_WEBHOOK_SIGNING_SECRET'),
    );

    const data = await wh.verify(JSON.stringify(req.body), req.headers);

    await this.customerService.synCustomerFromClerkWebhook(
      data as ClerkWebhookPayload,
    );
  }

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get current customer profile' })
  async getMe(@Req() request: RequestWithUser) {
    return this.customerService.getMe(request.user.id);
  }
}
