import {
  CampaignDonation,
  CampaignDonationStatus,
  DonationResult,
  DonationResultStatus,
} from '@/database/entities/campaign.entity';
import { BloodRh } from '@/database/entities/Blood.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Logger } from '@nestjs/common';
import {
  BloodTypeDistributionDtoType,
  CampaignStatsDtoType,
  DashboardSummaryDtoType,
  DateRangeFilterDtoType,
  DonorStatsDtoType,
  MonthlyStatsDtoType,
  OverallDonationStatsDtoType,
} from '../dtos/donation-stats.dto';
import { Campaign } from '@/database/entities/campaign.entity';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(private readonly em: EntityManager) {}

  /**
   * Apply date range filter to a query
   * @param query Base query object
   * @param dateFilter Date range filter
   * @param dateField Field to filter on (default: createdAt)
   */
  private applyDateRangeFilter(
    query: any,
    dateFilter?: DateRangeFilterDtoType,
    dateField: string = 'createdAt',
  ): any {
    if (!dateFilter) return query;

    if (!query.$and) {
      query.$and = [];
    }

    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      query.$and.push({ [dateField]: { $gte: startDate } });
    }

    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      // Set time to end of day
      endDate.setHours(23, 59, 59, 999);
      query.$and.push({ [dateField]: { $lte: endDate } });
    }

    return query;
  }

  /**
   * Get overall donation statistics
   */
  async getOverallStats(
    dateFilter?: DateRangeFilterDtoType,
  ): Promise<OverallDonationStatsDtoType> {
    // Base query for date filtering
    const baseQuery = {};
    const dateFilteredQuery = this.applyDateRangeFilter(baseQuery, dateFilter);

    // Get total donations
    const totalDonations = await this.em.count(
      CampaignDonation,
      dateFilteredQuery,
    );

    // Get completed donations
    const completedDonations = await this.em.count(CampaignDonation, {
      ...dateFilteredQuery,
      currentStatus: {
        $in: [
          CampaignDonationStatus.COMPLETED,
          CampaignDonationStatus.RESULT_RETURNED,
        ],
      },
    });

    // Get pending/active donations
    const pendingDonations = await this.em.count(CampaignDonation, {
      ...dateFilteredQuery,
      currentStatus: {
        $in: [
          CampaignDonationStatus.APPOINTMENT_CONFIRMED,
          CampaignDonationStatus.CUSTOMER_CHECKED_IN,
        ],
      },
    });

    // Get cancelled donations
    const cancelledDonations = await this.em.count(CampaignDonation, {
      ...dateFilteredQuery,
      currentStatus: {
        $in: [
          CampaignDonationStatus.APPOINTMENT_CANCELLED,
          CampaignDonationStatus.CUSTOMER_CANCELLED,
          CampaignDonationStatus.APPOINTMENT_ABSENT,
          CampaignDonationStatus.NO_SHOW_AFTER_CHECKIN,
        ],
      },
    });

    // Get not qualified donations
    const rejectedDonations = await this.em.count(CampaignDonation, {
      ...dateFilteredQuery,
      currentStatus: CampaignDonationStatus.NOT_QUALIFIED,
    });

    // Get unique donors
    const uniqueDonorsQuery = this.em.getConnection().execute(`
      SELECT COUNT(DISTINCT "donor_id") as count
      FROM "campaign_donation"
      WHERE ${this.buildDateFilterSql(dateFilter, 'created_at')}
    `);
    const uniqueDonorsResult = await uniqueDonorsQuery;
    const uniqueDonors = uniqueDonorsResult[0]?.count || 0;

    // Get blood volume statistics - now using CampaignDonation.volumeMl instead of DonationResult.volumeMl
    const bloodVolumeQuery = this.em.getConnection().execute(`
      SELECT
        SUM(cd."volume_ml") as total_volume,
        AVG(cd."volume_ml") as avg_volume
      FROM "campaign_donation" cd
      WHERE cd."current_status" IN ('completed', 'result_returned')
      AND ${this.buildDateFilterSql(dateFilter, 'cd.created_at')}
    `);
    const bloodVolumeResult = await bloodVolumeQuery;

    const totalBloodVolume = Number(bloodVolumeResult[0]?.total_volume || 0);
    const averageBloodVolume = Number(bloodVolumeResult[0]?.avg_volume || 0);

    // Calculate completion rate
    const donationCompletionRate =
      totalDonations > 0 ? (completedDonations / totalDonations) * 100 : 0;

    return {
      totalDonations,
      completedDonations,
      pendingDonations,
      cancelledDonations,
      rejectedDonations,
      totalBloodVolume,
      averageBloodVolume,
      donationCompletionRate,
      uniqueDonors: Number(uniqueDonors),
    };
  }

  /**
   * Get blood type distribution statistics
   */
  async getBloodTypeDistribution(
    dateFilter?: DateRangeFilterDtoType,
  ): Promise<BloodTypeDistributionDtoType> {
    // Get donation results with blood group and blood rh
    const donationResults = await this.em.find(
      DonationResult,
      {
        status: DonationResultStatus.COMPLETED,
      },
      {
        populate: ['campaignDonation'],
      },
    );

    // Filter by date if needed
    const filteredResults = donationResults.filter((result) => {
      if (!dateFilter?.startDate && !dateFilter?.endDate) {
        return true;
      }

      const donationDate = result.campaignDonation?.createdAt;
      if (!donationDate) return false;

      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate);
        if (donationDate < startDate) return false;
      }

      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (donationDate > endDate) return false;
      }

      return true;
    });

    // Group by blood type (combine bloodGroup and bloodRh)
    const bloodTypeMap = new Map<string, { count: number; volumeMl: number }>();

    for (const result of filteredResults) {
      // Combine bloodGroup and bloodRh to create bloodType string (e.g., "A+")
      const bloodType = `${result.bloodGroup}${result.bloodRh === BloodRh.POSITIVE ? '+' : '-'}`;

      if (!bloodTypeMap.has(bloodType)) {
        bloodTypeMap.set(bloodType, { count: 0, volumeMl: 0 });
      }

      const data = bloodTypeMap.get(bloodType)!;
      data.count++;
      // Use campaignDonation.volumeMl instead of result.volumeMl if available
      if (
        result.campaignDonation &&
        typeof result.campaignDonation.volumeMl === 'number'
      ) {
        data.volumeMl += result.campaignDonation.volumeMl;
      } else {
        data.volumeMl += result.volumeMl || 0;
      }
    }

    // Calculate total for percentages
    const totalCount = Array.from(bloodTypeMap.values()).reduce(
      (sum, item) => sum + item.count,
      0,
    );

    // Convert map to array and sort by count
    const bloodTypes = Array.from(bloodTypeMap.entries())
      .map(([bloodType, data]) => ({
        bloodType,
        count: data.count,
        percentage: totalCount > 0 ? (data.count / totalCount) * 100 : 0,
        volumeMl: data.volumeMl,
      }))
      .sort((a, b) => b.count - a.count);

    return { bloodTypes };
  }

  /**
   * Get monthly donation statistics
   */
  async getMonthlyStats(
    dateFilter?: DateRangeFilterDtoType,
  ): Promise<MonthlyStatsDtoType> {
    // Default to last 12 months if no date range specified
    const startDate = dateFilter?.startDate
      ? new Date(dateFilter.startDate)
      : (() => {
          const date = new Date();
          date.setMonth(date.getMonth() - 11);
          date.setDate(1);
          date.setHours(0, 0, 0, 0);
          return date;
        })();

    const endDate = dateFilter?.endDate
      ? (() => {
          const date = new Date(dateFilter.endDate);
          date.setHours(23, 59, 59, 999);
          return date;
        })()
      : (() => {
          const date = new Date();
          date.setHours(23, 59, 59, 999);
          return date;
        })();

    // Create query using MikroORM
    const campaignDonations = await this.em.find(
      CampaignDonation,
      {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      {
        populate: ['campaign'],
      },
    );

    // Group by month and calculate statistics
    const monthlyData = new Map<
      string,
      {
        totalDonations: number;
        completedDonations: number;
        totalVolumeMl: number;
      }
    >();

    for (const donation of campaignDonations) {
      const month = this.formatDateToYearMonth(donation.createdAt);

      if (!monthlyData.has(month)) {
        monthlyData.set(month, {
          totalDonations: 0,
          completedDonations: 0,
          totalVolumeMl: 0,
        });
      }

      const data = monthlyData.get(month)!;
      data.totalDonations++;

      if (
        donation.currentStatus === CampaignDonationStatus.COMPLETED ||
        donation.currentStatus === CampaignDonationStatus.RESULT_RETURNED
      ) {
        data.completedDonations++;
        // Use donation.volumeMl directly instead of looking up DonationResult
        if (typeof donation.volumeMl === 'number') {
          data.totalVolumeMl += donation.volumeMl;
        }
      }
    }

    // Convert map to sorted array
    const months = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        totalDonations: data.totalDonations,
        completedDonations: data.completedDonations,
        totalVolumeMl: data.totalVolumeMl,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { months };
  }

  /**
   * Format date to YYYY-MM format
   */
  private formatDateToYearMonth(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(
    dateFilter?: DateRangeFilterDtoType,
  ): Promise<CampaignStatsDtoType> {
    // Get campaigns with donation statistics
    const campaignStatsQuery = this.em.getConnection().execute(`
      SELECT
        c."id" as id,
        c."name" as name,
        COUNT(cd."id") as total_donations,
        COUNT(CASE WHEN cd."current_status" IN ('completed', 'result_returned') THEN 1 END) as completed_donations,
        SUM(CASE WHEN cd."volume_ml" IS NOT NULL THEN cd."volume_ml" ELSE 0 END) as total_volume_ml
      FROM "campaign" c
      LEFT JOIN "campaign_donation" cd ON c."id" = cd."campaign_id"
      WHERE ${this.buildDateFilterSql(dateFilter, 'cd.created_at')}
      GROUP BY c."id", c."name"
      ORDER BY total_donations DESC
    `);

    const campaignStatsResult = await campaignStatsQuery;

    const campaigns = campaignStatsResult.map((item: any) => ({
      id: item.id,
      name: item.name,
      totalDonations: Number(item.total_donations),
      completedDonations: Number(item.completed_donations),
      totalVolumeMl: Number(item.total_volume_ml || 0),
      completionRate:
        Number(item.total_donations) > 0
          ? (Number(item.completed_donations) / Number(item.total_donations)) *
            100
          : 0,
    }));

    return { campaigns };
  }

  /**
   * Get donor statistics
   */
  async getDonorStats(
    dateFilter?: DateRangeFilterDtoType,
  ): Promise<DonorStatsDtoType> {
    // Get top donors
    const topDonorsQuery = this.em.getConnection().execute(`
      SELECT
        c."id" as donor_id,
        c."first_name" as first_name,
        c."last_name" as last_name,
        COUNT(cd."id") as donation_count,
        SUM(cd."volume_ml") as total_volume_ml,
        MAX(cd."created_at") as last_donation_date
      FROM "customer" c
      JOIN "campaign_donation" cd ON c."id" = cd."donor_id"
      WHERE cd."current_status" IN ('completed', 'result_returned')
      AND ${this.buildDateFilterSql(dateFilter, 'cd.created_at')}
      GROUP BY c."id", c."first_name", c."last_name"
      ORDER BY donation_count DESC, total_volume_ml DESC
      LIMIT 10
    `);

    const topDonorsResult = await topDonorsQuery;

    const topDonors = topDonorsResult.map((item: any) => ({
      donorId: item.donor_id,
      firstName: item.first_name,
      lastName: item.last_name,
      donationCount: Number(item.donation_count),
      totalVolumeMl: Number(item.total_volume_ml || 0),
      lastDonationDate: item.last_donation_date
        ? new Date(item.last_donation_date).toISOString().split('T')[0]
        : null,
    }));

    // Get new donors (first time donors in the period)
    const newDonorsQuery = this.em.getConnection().execute(`
      SELECT COUNT(DISTINCT c."id") as count
      FROM "customer" c
      JOIN "campaign_donation" cd ON c."id" = cd."donor_id"
      WHERE ${this.buildDateFilterSql(dateFilter, 'cd.created_at')}
      AND c."id" NOT IN (
        SELECT DISTINCT donor_id
        FROM "campaign_donation"
        WHERE ${this.buildNotInDateFilterSql(dateFilter, 'created_at')}
      )
    `);

    const newDonorsResult = await newDonorsQuery;
    const newDonors = Number(newDonorsResult[0]?.count || 0);

    // Get returning donors (donors who donated before the period and also in the period)
    const returningDonorsQuery = this.em.getConnection().execute(`
      SELECT COUNT(DISTINCT c."id") as count
      FROM "customer" c
      JOIN "campaign_donation" cd ON c."id" = cd."donor_id"
      WHERE ${this.buildDateFilterSql(dateFilter, 'cd.created_at')}
      AND c."id" IN (
        SELECT DISTINCT donor_id
        FROM "campaign_donation"
        WHERE ${this.buildNotInDateFilterSql(dateFilter, 'created_at')}
      )
    `);

    const returningDonorsResult = await returningDonorsQuery;
    const returningDonors = Number(returningDonorsResult[0]?.count || 0);

    return {
      topDonors,
      newDonors,
      returningDonors,
    };
  }

  /**
   * Get dashboard summary statistics
   */
  async getDashboardSummary(
    dateFilter?: DateRangeFilterDtoType,
  ): Promise<DashboardSummaryDtoType> {
    // Get overall stats
    const overallStats = await this.getOverallStats(dateFilter);

    // Get blood type distribution
    const bloodTypeDistribution =
      await this.getBloodTypeDistribution(dateFilter);

    // Get recent campaigns
    const campaigns = await this.em.find(
      Campaign,
      {},
      {
        orderBy: { createdAt: 'DESC' },
        limit: 5,
      },
    );

    // Get campaign donations for these campaigns
    const campaignIds = campaigns.map((campaign) => campaign.id);

    // Get donations for these campaigns
    const campaignDonations = await this.em.find(CampaignDonation, {
      campaign: { id: { $in: campaignIds } },
    });

    // Group donations by campaign
    const campaignDonationMap = new Map<
      string,
      {
        completedDonations: number;
        totalVolumeMl: number;
      }
    >();

    // Initialize map with all campaigns
    for (const campaign of campaigns) {
      campaignDonationMap.set(campaign.id, {
        completedDonations: 0,
        totalVolumeMl: 0,
      });
    }

    // Count donations and volumes
    for (const donation of campaignDonations) {
      const campaignId = donation.campaign.id;
      const data = campaignDonationMap.get(campaignId);

      if (data) {
        if (
          donation.currentStatus === CampaignDonationStatus.COMPLETED ||
          donation.currentStatus === CampaignDonationStatus.RESULT_RETURNED
        ) {
          data.completedDonations++;

          // Use donation.volumeMl directly
          if (typeof donation.volumeMl === 'number') {
            data.totalVolumeMl += donation.volumeMl;
          }
        }
      }
    }

    // Format recent campaigns data
    const recentCampaigns = campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      completedDonations:
        campaignDonationMap.get(campaign.id)?.completedDonations || 0,
      totalVolumeMl: campaignDonationMap.get(campaign.id)?.totalVolumeMl || 0,
    }));

    // Get monthly trend for the last 6 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Get donations for monthly trend
    const trendDonations = await this.em.find(CampaignDonation, {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // Group by month
    const monthlyTrendMap = new Map<string, number>();

    for (const donation of trendDonations) {
      const month = this.formatDateToYearMonth(donation.createdAt);

      if (!monthlyTrendMap.has(month)) {
        monthlyTrendMap.set(month, 0);
      }

      monthlyTrendMap.set(month, monthlyTrendMap.get(month)! + 1);
    }

    // Convert to array and sort
    const monthlyTrend = Array.from(monthlyTrendMap.entries())
      .map(([month, donations]) => ({
        month,
        donations,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Format blood type distribution for dashboard
    const bloodTypeDistributionForDashboard =
      bloodTypeDistribution.bloodTypes.map((item) => ({
        bloodType: item.bloodType,
        percentage: item.percentage,
      }));

    return {
      totalDonations: overallStats.totalDonations,
      completedDonations: overallStats.completedDonations,
      totalBloodVolume: overallStats.totalBloodVolume,
      uniqueDonors: overallStats.uniqueDonors,
      recentCampaigns,
      bloodTypeDistribution: bloodTypeDistributionForDashboard,
      monthlyTrend,
    };
  }

  /**
   * Build SQL WHERE clause for date filtering
   */
  private buildDateFilterSql(
    dateFilter?: DateRangeFilterDtoType,
    fieldName: string = 'created_at',
  ): string {
    if (!dateFilter?.startDate && !dateFilter?.endDate) {
      return '1=1'; // No filter
    }

    const conditions = [];

    if (dateFilter.startDate) {
      conditions.push(`${fieldName} >= '${dateFilter.startDate}'`);
    }

    if (dateFilter.endDate) {
      // Add time to end date to include the entire day
      conditions.push(`${fieldName} <= '${dateFilter.endDate} 23:59:59'`);
    }

    return conditions.join(' AND ');
  }

  /**
   * Build SQL WHERE clause for NOT IN date filtering
   */
  private buildNotInDateFilterSql(
    dateFilter?: DateRangeFilterDtoType,
    fieldName: string = 'created_at',
  ): string {
    if (!dateFilter?.startDate && !dateFilter?.endDate) {
      return '1=1'; // No filter
    }

    const conditions = [];

    if (dateFilter.startDate) {
      conditions.push(`${fieldName} < '${dateFilter.startDate}'`);
    }

    if (dateFilter.endDate) {
      // Add time to end date to include the entire day
      conditions.push(`${fieldName} > '${dateFilter.endDate} 23:59:59'`);
    }

    return conditions.join(' OR ');
  }
}
