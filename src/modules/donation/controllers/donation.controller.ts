import { AccountRole, Staff } from '@/database/entities/Account.entity';
import { CampaignDonationStatus } from '@/database/entities/campaign.entity';
import { ApiPaginatedResponse } from '@/share/decorators/api-paginated-response.decorator';
import { Roles } from '@/share/decorators/role.decorator';
import { RolesGuard } from '@/share/guards/roles.guard';
import { RequestWithUser } from '@/share/types/request.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../auth/guard/clerk.guard';
import { ClerkAdminAuthGuard } from '../../auth/guard/clerkAdmin.guard';
import {
  CreateDonationRequestDto,
  DonationRequestListQueryDto,
  DonationRequestResponseDto,
  UpdateDonationRequestStatusDto,
} from '../dtos/donation-request.dto';
import {
  DonationResultResponseDto,
  UpdateDonationResultDto,
} from '../dtos/donation-result.dto';
import { DonationService } from '../services/donation.service';

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

  @Get('my-requests/:id/result')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({ summary: 'Get my donation result by donation request ID' })
  @ApiParam({ name: 'id', type: String })
  async getMyDonationResult(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ) {
    // First check if the donation request belongs to the user
    await this.donationService.getDonationRequestById(id, request.user.id);
    // Then get the result
    return this.donationService.getDonationResultByDonationId(id);
  }

  @Patch('my-requests/:id/cancel')
  @UseGuards(ClerkAuthGuard)
  @ApiOperation({
    summary: 'Cancel my donation request',
    description: `
    Allows customers to cancel their own donation request.

    Rules:
    - Pending requests can be cancelled at any time
    - Confirmed appointments can be cancelled only if it's at least 24 hours before the scheduled time
    - Status will be updated to CUSTOMER_CANCELLED
    `,
  })
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
  @Roles(AccountRole.STAFF)
  @ApiOperation({
    summary: 'Update donation request status (staff only)',
    description: `
    Updates the status of a donation request. Supports all status transitions:

    - To mark as check-in: Set status to "customer_checked_in"
    - To mark as COMPLETED: Set status to "completed"
    - To cancel an appointment: Set status to "appointment_cancelled"
    - To mark as absent: Set status to "appointment_absent"
    - To confirm appointment: Set status to "appointment_confirmed"
    - To mark results as returned: Set status to "result_returned"
    - To reject a request: Set status to "rejected"

    The system will validate if the status transition is allowed based on the current status.

    Note: "customer_cancelled" status is set automatically when a customer cancels their own request.
    `,
  })
  @ApiParam({ name: 'id', type: String })
  async updateDonationRequestStatus(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() data: UpdateDonationRequestStatusDto,
  ) {
    const staff = request.user as Staff;
    return this.donationService.updateDonationRequestStatus(id, staff, data);
  }

  // Donation Results endpoints
  @Get('results')
  @UseGuards(ClerkAdminAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN, AccountRole.STAFF)
  @ApiOperation({ summary: 'Get all donation results (staff only)' })
  @ApiPaginatedResponse(DonationResultResponseDto)
  async getDonationResults(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.donationService.getDonationResults({ page, limit });
  }

  @Get('requests/:id/result')
  @UseGuards(ClerkAdminAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN, AccountRole.STAFF)
  @ApiOperation({
    summary: 'Get donation result by donation request ID (staff only)',
  })
  @ApiParam({ name: 'id', type: String })
  async getDonationResult(@Param('id') id: string) {
    return this.donationService.getDonationResultByDonationId(id);
  }

  @Patch('requests/:id/result')
  @UseGuards(ClerkAdminAuthGuard, RolesGuard)
  @Roles(AccountRole.STAFF)
  @ApiOperation({
    summary:
      'Update donation result and set status to RESULT_RETURNED (staff only)',
  })
  @ApiParam({ name: 'id', type: String })
  async updateDonationResult(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() data: UpdateDonationResultDto,
  ) {
    const staff = request.user as Staff;
    return this.donationService.updateDonationResult(id, staff, data);
  }

  // Development only endpoint
  @Delete('dev/requests/:id')
  @UseGuards(ClerkAdminAuthGuard, RolesGuard)
  @Roles(AccountRole.ADMIN)
  @ApiOperation({
    summary: '[DEV ONLY] Delete a donation request and all related data',
    description: 'WARNING: This endpoint is for development use only!',
  })
  @ApiParam({ name: 'id', type: String })
  async deleteDonationRequest(@Param('id') id: string) {
    // Check if we're in development environment
    if (process.env.NODE_ENV !== 'development') {
      throw new Error(
        'This endpoint is only available in development environment',
      );
    }

    await this.donationService.deleteDonationRequest(id);
    return {
      message: `Donation request ${id} and all related data deleted successfully`,
    };
  }
}
