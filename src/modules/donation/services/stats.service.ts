import {
  CampaignDonation,
  CampaignDonationStatus,
} from '@/database/entities/campaign.entity';
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

    // Get pending donations
    const pendingDonations = await this.em.count(CampaignDonation, {
      ...dateFilteredQuery,
      currentStatus: {
        $in: [
          CampaignDonationStatus.PENDING,
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
        ],
      },
    });

    // Get rejected donations
    const rejectedDonations = await this.em.count(CampaignDonation, {
      ...dateFilteredQuery,
      currentStatus: CampaignDonationStatus.REJECTED,
    });

    // Get unique donors
    const uniqueDonorsQuery = this.em.getConnection().execute(`
      SELECT COUNT(DISTINCT "donor_id") as count
      FROM "campaign_donation"
      WHERE ${this.buildDateFilterSql(dateFilter, 'created_at')}
    `);
    const uniqueDonorsResult = await uniqueDonorsQuery;
    const uniqueDonors = uniqueDonorsResult[0]?.count || 0;

    // Get blood volume statistics
    const bloodVolumeQuery = this.em.getConnection().execute(`
      SELECT
        SUM(dr."volume_ml") as total_volume,
        AVG(dr."volume_ml") as avg_volume
      FROM "donation_result" dr
      JOIN "campaign_donation" cd ON dr."campaign_donation_id" = cd."id"
      WHERE dr."status" = 'completed'
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
    const bloodTypeQuery = this.em.getConnection().execute(`
      SELECT
        dr."blood_type" as blood_type,
        COUNT(*) as count,
        SUM(dr."volume_ml") as volume_ml
      FROM "donation_result" dr
      JOIN "campaign_donation" cd ON dr."campaign_donation_id" = cd."id"
      WHERE dr."status" = 'completed'
      AND ${this.buildDateFilterSql(dateFilter, 'cd.created_at')}
      GROUP BY dr."blood_type"
      ORDER BY count DESC
    `);

    const bloodTypeResult = await bloodTypeQuery;

    // Calculate total for percentages
    const totalCount = bloodTypeResult.reduce(
      (sum: number, item: any) => sum + Number(item.count),
      0,
    );

    const bloodTypes = bloodTypeResult.map((item: any) => ({
      bloodType: item.blood_type,
      count: Number(item.count),
      percentage: totalCount > 0 ? (Number(item.count) / totalCount) * 100 : 0,
      volumeMl: Number(item.volume_ml || 0),
    }));

    return { bloodTypes };
  }

  /**
   * Get monthly donation statistics
   */
  async getMonthlyStats(
    dateFilter?: DateRangeFilterDtoType,
  ): Promise<MonthlyStatsDtoType> {
    // Default to last 12 months if no date range specified
    let startDate = dateFilter?.startDate
      ? new Date(dateFilter.startDate)
      : new Date();
    let endDate = dateFilter?.endDate
      ? new Date(dateFilter.endDate)
      : new Date();

    if (!dateFilter?.startDate) {
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1);
    }

    // Set time to start of day for start date and end of day for end date
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const monthlyStatsQuery = this.em.getConnection().execute(
      `
      SELECT
        TO_CHAR(cd."created_at", 'YYYY-MM') as month,
        COUNT(*) as total_donations,
        COUNT(CASE WHEN cd."current_status" IN ('completed', 'result_returned') THEN 1 END) as completed_donations,
        SUM(CASE WHEN dr."volume_ml" IS NOT NULL THEN dr."volume_ml" ELSE 0 END) as total_volume_ml
      FROM "campaign_donation" cd
      LEFT JOIN "donation_result" dr ON cd."id" = dr."campaign_donation_id"
      WHERE cd."created_at" >= $1 AND cd."created_at" <= $2
      GROUP BY TO_CHAR(cd."created_at", 'YYYY-MM')
      ORDER BY month ASC
    `,
      [startDate, endDate],
    );

    const monthlyStatsResult = await monthlyStatsQuery;

    const months = monthlyStatsResult.map((item: any) => ({
      month: item.month,
      totalDonations: Number(item.total_donations),
      completedDonations: Number(item.completed_donations),
      totalVolumeMl: Number(item.total_volume_ml || 0),
    }));

    return { months };
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(
    dateFilter?: DateRangeFilterDtoType,
  ): Promise<CampaignStatsDtoType> {
    // Base query for date filtering
    const baseQuery = {};
    const dateFilteredQuery = this.applyDateRangeFilter(baseQuery, dateFilter);

    // Get campaigns with donation statistics
    const campaignStatsQuery = this.em.getConnection().execute(`
      SELECT
        c."id" as id,
        c."name" as name,
        COUNT(cd."id") as total_donations,
        COUNT(CASE WHEN cd."current_status" IN ('completed', 'result_returned') THEN 1 END) as completed_donations,
        SUM(CASE WHEN dr."volume_ml" IS NOT NULL THEN dr."volume_ml" ELSE 0 END) as total_volume_ml
      FROM "campaign" c
      LEFT JOIN "campaign_donation" cd ON c."id" = cd."campaign_id"
      LEFT JOIN "donation_result" dr ON cd."id" = dr."campaign_donation_id"
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
        SUM(dr."volume_ml") as total_volume_ml,
        MAX(cd."created_at") as last_donation_date
      FROM "customer" c
      JOIN "campaign_donation" cd ON c."id" = cd."donor_id"
      LEFT JOIN "donation_result" dr ON cd."id" = dr."campaign_donation_id"
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
    const recentCampaignsQuery = this.em.getConnection().execute(`
      SELECT
        c."id" as id,
        c."name" as name,
        COUNT(CASE WHEN cd."current_status" IN ('completed', 'result_returned') THEN 1 END) as completed_donations,
        SUM(CASE WHEN dr."volume_ml" IS NOT NULL THEN dr."volume_ml" ELSE 0 END) as total_volume_ml
      FROM "campaign" c
      LEFT JOIN "campaign_donation" cd ON c."id" = cd."campaign_id"
      LEFT JOIN "donation_result" dr ON cd."id" = dr."campaign_donation_id"
      WHERE ${this.buildDateFilterSql(dateFilter, 'c.created_at')}
      GROUP BY c."id", c."name"
      ORDER BY c."created_at" DESC
      LIMIT 5
    `);

    const recentCampaignsResult = await recentCampaignsQuery;

    const recentCampaigns = recentCampaignsResult.map((item: any) => ({
      id: item.id,
      name: item.name,
      completedDonations: Number(item.completed_donations || 0),
      totalVolumeMl: Number(item.total_volume_ml || 0),
    }));

    // Get monthly trend for the last 6 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 5);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const monthlyTrendQuery = this.em.getConnection().execute(
      `
      SELECT
        TO_CHAR(cd."created_at", 'YYYY-MM') as month,
        COUNT(*) as donations
      FROM "campaign_donation" cd
      WHERE cd."created_at" >= $1 AND cd."created_at" <= $2
      GROUP BY TO_CHAR(cd."created_at", 'YYYY-MM')
      ORDER BY month ASC
    `,
      [startDate, endDate],
    );

    const monthlyTrendResult = await monthlyTrendQuery;

    const monthlyTrend = monthlyTrendResult.map((item: any) => ({
      month: item.month,
      donations: Number(item.donations),
    }));

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
