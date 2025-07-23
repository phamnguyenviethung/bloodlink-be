import { AccountRole } from '@/database/entities/Account.entity';
import { ClerkAdminAuthGuard } from '@/modules/auth/guard/clerkAdmin.guard';
import { Roles } from '@/share/decorators/role.decorator';
import { RolesGuard } from '@/share/guards/roles.guard';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  BloodTypeDistributionDto,
  CampaignStatsDto,
  DashboardSummaryDto,
  DateRangeFilterDto,
  DonorStatsDto,
  MonthlyStatsDto,
  OverallDonationStatsDto,
} from '../dtos/donation-stats.dto';
import { StatsService } from '../services/stats.service';

@ApiTags('Donation Statistics')
@Controller('donation-stats')
@UseGuards(ClerkAdminAuthGuard, RolesGuard)
@Roles(AccountRole.ADMIN, AccountRole.STAFF)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard summary statistics',
    description:
      'Returns a summary of key statistics for the dashboard, including total donations, blood volume, unique donors, recent campaigns, blood type distribution, and monthly trends.',
  })
  @ApiResponse({ status: 200, type: DashboardSummaryDto })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (format: YYYY-MM-DD)',
  })
  async getDashboardSummary(@Query() dateFilter: DateRangeFilterDto) {
    return this.statsService.getDashboardSummary(dateFilter);
  }

  @Get('overall')
  @ApiOperation({
    summary: 'Get overall donation statistics',
    description:
      'Returns overall statistics including total donations, completion rates, blood volume, and unique donors.',
  })
  @ApiResponse({ status: 200, type: OverallDonationStatsDto })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (format: YYYY-MM-DD)',
  })
  async getOverallStats(@Query() dateFilter: DateRangeFilterDto) {
    return this.statsService.getOverallStats(dateFilter);
  }

  @Get('blood-types')
  @ApiOperation({
    summary: 'Get blood type distribution statistics',
    description:
      'Returns statistics on the distribution of blood types among donations.',
  })
  @ApiResponse({ status: 200, type: BloodTypeDistributionDto })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (format: YYYY-MM-DD)',
  })
  async getBloodTypeDistribution(@Query() dateFilter: DateRangeFilterDto) {
    return this.statsService.getBloodTypeDistribution(dateFilter);
  }

  @Get('monthly')
  @ApiOperation({
    summary: 'Get monthly donation statistics',
    description:
      'Returns donation statistics broken down by month, including total and completed donations and blood volume.',
  })
  @ApiResponse({ status: 200, type: MonthlyStatsDto })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (format: YYYY-MM-DD)',
  })
  async getMonthlyStats(@Query() dateFilter: DateRangeFilterDto) {
    return this.statsService.getMonthlyStats(dateFilter);
  }

  @Get('campaigns')
  @ApiOperation({
    summary: 'Get campaign statistics',
    description:
      'Returns statistics for all campaigns, including donation counts and blood volume.',
  })
  @ApiResponse({ status: 200, type: CampaignStatsDto })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (format: YYYY-MM-DD)',
  })
  async getCampaignStats(@Query() dateFilter: DateRangeFilterDto) {
    return this.statsService.getCampaignStats(dateFilter);
  }

  @Get('donors')
  @ApiOperation({
    summary: 'Get donor statistics',
    description:
      'Returns statistics about donors, including top donors, new donors, and returning donors.',
  })
  @ApiResponse({ status: 200, type: DonorStatsDto })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (format: YYYY-MM-DD)',
  })
  async getDonorStats(@Query() dateFilter: DateRangeFilterDto) {
    return this.statsService.getDonorStats(dateFilter);
  }
}
