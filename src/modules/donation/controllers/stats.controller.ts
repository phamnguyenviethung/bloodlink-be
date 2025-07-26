import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { StatsService } from '../services/stats.service';
import {
  DateRangeFilterDto,
  OverallDonationStatsDto,
  BloodTypeDistributionDto,
  MonthlyStatsDto,
  CampaignStatsDto,
  DonorStatsDto,
  DashboardSummaryDto,
  UserDonationStatsDto,
} from '../dtos/donation-stats.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AuthenticatedGuard } from '@/modules/auth/guard/authenticated.guard';
import { StaffRoleGuard } from '@/modules/auth/guard/staffRole.guard';
import { Roles } from '@/share/decorators/role.decorator';
import { AccountRole } from '@/database/entities/Account.entity';

@ApiTags('Donation Statistics')
@Controller('donation/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overall')
  @UseGuards(AuthenticatedGuard, StaffRoleGuard)
  @Roles(AccountRole.STAFF, AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get overall donation statistics' })
  @ApiResponse({
    status: 200,
    description: 'Overall donation statistics',
    type: OverallDonationStatsDto,
  })
  async getOverallStats(
    @Query() dateFilter: DateRangeFilterDto,
  ): Promise<OverallDonationStatsDto> {
    return this.statsService.getOverallStats(dateFilter);
  }

  @Get('blood-type-distribution')
  @UseGuards(AuthenticatedGuard, StaffRoleGuard)
  @Roles(AccountRole.STAFF, AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get blood type distribution statistics' })
  @ApiResponse({
    status: 200,
    description: 'Blood type distribution statistics',
    type: BloodTypeDistributionDto,
  })
  async getBloodTypeDistribution(
    @Query() dateFilter: DateRangeFilterDto,
  ): Promise<BloodTypeDistributionDto> {
    return this.statsService.getBloodTypeDistribution(dateFilter);
  }

  @Get('monthly')
  @UseGuards(AuthenticatedGuard, StaffRoleGuard)
  @Roles(AccountRole.STAFF, AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get monthly donation statistics' })
  @ApiResponse({
    status: 200,
    description: 'Monthly donation statistics',
    type: MonthlyStatsDto,
  })
  async getMonthlyStats(
    @Query() dateFilter: DateRangeFilterDto,
  ): Promise<MonthlyStatsDto> {
    return this.statsService.getMonthlyStats(dateFilter);
  }

  @Get('campaigns')
  @UseGuards(AuthenticatedGuard, StaffRoleGuard)
  @Roles(AccountRole.STAFF, AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get campaign statistics' })
  @ApiResponse({
    status: 200,
    description: 'Campaign statistics',
    type: CampaignStatsDto,
  })
  async getCampaignStats(
    @Query() dateFilter: DateRangeFilterDto,
  ): Promise<CampaignStatsDto> {
    return this.statsService.getCampaignStats(dateFilter);
  }

  @Get('donors')
  @UseGuards(AuthenticatedGuard, StaffRoleGuard)
  @Roles(AccountRole.STAFF, AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get donor statistics' })
  @ApiResponse({
    status: 200,
    description: 'Donor statistics',
    type: DonorStatsDto,
  })
  async getDonorStats(
    @Query() dateFilter: DateRangeFilterDto,
  ): Promise<DonorStatsDto> {
    return this.statsService.getDonorStats(dateFilter);
  }

  @Get('dashboard')
  @UseGuards(AuthenticatedGuard, StaffRoleGuard)
  @Roles(AccountRole.STAFF, AccountRole.ADMIN)
  @ApiOperation({ summary: 'Get dashboard summary statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary statistics',
    type: DashboardSummaryDto,
  })
  async getDashboardSummary(
    @Query() dateFilter: DateRangeFilterDto,
  ): Promise<DashboardSummaryDto> {
    return this.statsService.getDashboardSummary(dateFilter);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get donation statistics for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'User donation statistics',
    type: UserDonationStatsDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserDonationStats(
    @Param('userId') userId: string,
  ): Promise<UserDonationStatsDto> {
    try {
      return await this.statsService.getUserDonationStats(userId);
    } catch (error) {
      if (error instanceof Error) {
        throw new NotFoundException(
          `User statistics not found: ${error.message}`,
        );
      }
      throw new NotFoundException('User statistics not found');
    }
  }
}
