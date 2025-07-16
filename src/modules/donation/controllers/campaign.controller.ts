import { AccountRole } from '@/database/entities/Account.entity';
import {
  CampaignDonationStatus,
  CampaignStatus,
} from '@/database/entities/campaign.entity';
import { ClerkAdminAuthGuard } from '@/modules/auth/guard/clerkAdmin.guard';
import { ApiPaginatedResponse } from '@/share/decorators/api-paginated-response.decorator';
import { Public, Roles } from '@/share/decorators/role.decorator';
import { RolesGuard } from '@/share/guards/roles.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import {
  AvailableCampaignsQueryDto,
  CampaignDonationRequestsQueryDto,
  CampaignListQueryDto,
  CampaignResponseDto,
  CreateCampaignDto,
  UpdateCampaignDto,
} from '../dtos';
import { DonationRequestResponseDto } from '../dtos/donation-request.dto';
import { CampaignService } from '../services/campaign.service';

@ApiTags('Campaigns')
@Controller('campaigns')
@UseGuards(ClerkAdminAuthGuard, RolesGuard)
@Roles(AccountRole.ADMIN)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new campaign',
    description:
      'Create a new campaign. Note: bloodCollectionDate must be at least 3 days after endDate',
  })
  @Roles(AccountRole.ADMIN)
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.createCampaign(createCampaignDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns with pagination' })
  @ApiPaginatedResponse(CampaignResponseDto)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: CampaignStatus })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, description or location',
  })
  @Public()
  async getCampaigns(@Query() query: CampaignListQueryDto) {
    return this.campaignService.getCampaigns({
      page: query.page || 1,
      limit: query.limit || 10,
      status: query.status,
      search: query.search,
    });
  }

  @Get('available')
  @ApiOperation({
    summary: 'Get all available campaigns that are still open for registration',
    description: 'Returns campaigns where current date is before the end date',
  })
  @ApiPaginatedResponse(CampaignResponseDto)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, description or location',
  })
  @Public()
  async getAvailableCampaigns(@Query() query: AvailableCampaignsQueryDto) {
    return this.campaignService.getAvailableCampaigns({
      page: query.page || 1,
      limit: query.limit || 10,
      search: query.search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiParam({ name: 'id', type: String })
  @Public()
  async getCampaign(@Param('id') id: string) {
    return this.campaignService.getCampaign(id);
  }

  @Get(':id/donation-requests')
  @ApiOperation({
    summary: 'Get all donation requests for a specific campaign',
  })
  @ApiPaginatedResponse(DonationRequestResponseDto)
  @ApiParam({ name: 'id', type: String, description: 'Campaign ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: CampaignDonationStatus })
  @Roles(AccountRole.ADMIN, AccountRole.STAFF)
  async getCampaignDonationRequests(
    @Param('id') id: string,
    @Query() query: CampaignDonationRequestsQueryDto,
  ) {
    return this.campaignService.getCampaignDonationRequests(id, {
      page: query.page || 1,
      limit: query.limit || 10,
      status: query.status,
    });
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a campaign',
    description:
      'Update a campaign. Note: bloodCollectionDate must be at least 3 days after endDate',
  })
  @ApiParam({ name: 'id', type: String })
  @Roles(AccountRole.ADMIN)
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignService.updateCampaign(id, updateCampaignDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a campaign' })
  @ApiParam({ name: 'id', type: String })
  @Roles(AccountRole.ADMIN)
  async deleteCampaign(@Param('id') id: string) {
    await this.campaignService.deleteCampaign(id);
    return { success: true };
  }
}
