import { AccountRole } from '@/database/entities/Account.entity';
import { CampaignDonationStatus } from '@/database/entities/campaign.entity';
import { ApiPaginatedResponse } from '@/share/decorators/api-paginated-response.decorator';
import { Roles } from '@/share/decorators/role.decorator';
import { RolesGuard } from '@/share/guards/roles.guard';
import { RequestWithUser } from '@/share/types/request.type';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../auth/guard/clerk.guard';
import { ClerkAdminAuthGuard } from '../auth/guard/clerkAdmin.guard';
import {
  CreateDonationRequestDto,
  DonationRequestListQueryDto,
  DonationRequestResponseDto,
  UpdateDonationRequestStatusDto,
} from './dtos/donation-request.dto';
import { DonationService } from './donation.service';

@ApiTags('Donations')
@Controller('donations')
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  // Customer endpoints
  @Post('requests')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({
    summary: 'Create a donation request for a specific campaign',
  })
  async createDonationRequest(
    @Req() request: RequestWithUser,
    @Body() data: CreateDonationRequestDto,
  ) {
    return this.donationService.createDonationRequest(request.user.id, data);
  }

  @Get('my-requests')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get my donation requests' })
  @ApiPaginatedResponse(DonationRequestResponseDto)
  async getMyDonationRequests(
    @Req() request: RequestWithUser,
    @Query() query: DonationRequestListQueryDto,
  ) {
    return this.donationService.getDonationRequests(query, request.user.id);
  }

  @Get('my-requests/:id')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get my donation request by ID' })
  @ApiParam({ name: 'id', type: String })
  async getMyDonationRequestById(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.donationService.getDonationRequestById(id, request.user.id);
  }

  @Patch('my-requests/:id/cancel')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Cancel my donation request' })
  @ApiParam({ name: 'id', type: String })
  async cancelDonationRequest(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.donationService.cancelDonationRequest(id, request.user.id);
  }

  // Staff endpoints
  @Get('requests')
  @UseGuards(ClerkAdminAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN, AccountRole.STAFF)
  @ApiOperation({ summary: 'Get all donation requests (staff only)' })
  @ApiPaginatedResponse(DonationRequestResponseDto)
  @ApiQuery({ name: 'status', enum: CampaignDonationStatus, required: false })
  async getDonationRequests(@Query() query: DonationRequestListQueryDto) {
    return this.donationService.getDonationRequests(query);
  }

  @Get('requests/:id')
  @UseGuards(ClerkAdminAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN, AccountRole.STAFF)
  @ApiOperation({ summary: 'Get donation request by ID (staff only)' })
  @ApiParam({ name: 'id', type: String })
  async getDonationRequestById(@Param('id') id: string) {
    return this.donationService.getDonationRequestById(id);
  }

  @Patch('requests/:id/status')
  @UseGuards(ClerkAdminAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN, AccountRole.STAFF)
  @ApiOperation({ summary: 'Update donation request status (staff only)' })
  @ApiParam({ name: 'id', type: String })
  async updateDonationRequestStatus(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() data: UpdateDonationRequestStatusDto,
  ) {
    return this.donationService.updateDonationRequestStatus(
      id,
      request.user.id,
      data,
    );
  }
}
