import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Webhook } from 'svix';
import { ClerkWebhookPayload } from '../account/interfaces';
import { AuthService } from './auth.service';
import {
  DeleteCustomerAccountReqDto,
  GetInvitationReqDto,
  GetInvitationResDto,
  InviteReqDtoType,
} from './dtos';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configSerivce: ConfigService,
  ) {}

  @Post('/clerk/admin/sync')
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
  async synCustomerFromClerkWebhook(@Req() req) {
    const wh = new Webhook(
      this.configSerivce.get('CLERK_WEBHOOK_SIGNING_SECRET'),
    );

    const data = await wh.verify(JSON.stringify(req.body), req.headers);

    await this.authService.synCustomerFromClerkWebhook(
      data as ClerkWebhookPayload,
    );
  }

  @Post('/invite')
  async inviteHospitalAndStaff(@Body() body: InviteReqDtoType) {
    await this.authService.inviteHospitalAndStaff(body.email, body.role);
  }

  @Get('/invitations')
  @ApiQuery({ type: GetInvitationReqDto, name: 'query', required: false })
  @ApiResponse({ type: GetInvitationResDto })
  async getInvitations(@Query() query: GetInvitationReqDto) {
    return this.authService.getInvitationList(
      {
        limit: Number(query.limit),
        offset: Number(query.offset),
        status: query.status,
      },
      query.role,
    );
  }

  @Get('/dev/create-token')
  async getTestToken(@Query('email') email: string) {
    return this.authService.createTestToken(email);
  }

  @Delete('/dev/delete-customer-account')
  async deleteAccount(@Body() body: DeleteCustomerAccountReqDto) {
    await this.authService.deleteCustomerAccount(body);
  }
}
