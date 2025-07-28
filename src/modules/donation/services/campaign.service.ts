import {
  Campaign,
  CampaignDonation,
  CampaignDonationLog,
  CampaignDonationStatus,
  CampaignStatus,
} from '@/database/entities/campaign.entity';
import {
  createPaginatedResponse,
  PaginatedResponseType,
} from '@/share/dtos/pagination.dto';
import { EntityManager } from '@mikro-orm/core';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  CampaignDetailResponseDtoType,
  CreateCampaignDtoType,
  UpdateCampaignDtoType,
} from '../dtos';
import { ICampaignService } from '../interfaces/campaign.interface';

@Injectable()
export class CampaignService implements ICampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(private readonly em: EntityManager) {}

  async createCampaign(data: CreateCampaignDtoType): Promise<Campaign> {
    try {
      // Ensure startDate and endDate are Date objects
      const startDate =
        data.startDate instanceof Date
          ? data.startDate
          : new Date(data.startDate);

      const endDate =
        data.endDate instanceof Date ? data.endDate : new Date(data.endDate);

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      // Handle bloodCollectionDate validation if provided
      let bloodCollectionDate: Date | undefined = undefined;
      if (data.bloodCollectionDate) {
        bloodCollectionDate =
          data.bloodCollectionDate instanceof Date
            ? data.bloodCollectionDate
            : new Date(data.bloodCollectionDate);

        // Validate bloodCollectionDate is at least 3 days after endDate
        const minCollectionDate = new Date(endDate);
        minCollectionDate.setDate(endDate.getDate() + 1);

        if (bloodCollectionDate < minCollectionDate) {
          throw new BadRequestException(
            'Blood collection date must be at least 1 day after end date',
          );
        }
      }

      // Determine status based on dates
      let status = data.status || CampaignStatus.NOT_STARTED;
      const now = new Date();

      // If current date is between start and end dates, set status to ACTIVE
      if (now >= startDate && now <= endDate) {
        status = CampaignStatus.ACTIVE;
      } else if (now > endDate) {
        status = CampaignStatus.ENDED;
      }

      const campaign = new Campaign();
      campaign.name = data.name;
      campaign.description = data.description || '';
      campaign.startDate = startDate;
      campaign.endDate = endDate;
      campaign.status = status;
      campaign.banner = data.banner || '';
      campaign.location = data.location || '';
      campaign.limitDonation = data.limitDonation || 0;
      campaign.bloodCollectionDate = bloodCollectionDate;
      campaign.metadata = data.metadata || {};

      await this.em.persistAndFlush(campaign);
      return campaign;
    } catch (error: any) {
      this.logger.error(
        `Error creating campaign: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateCampaign(
    id: string,
    data: UpdateCampaignDtoType,
  ): Promise<Campaign> {
    try {
      const campaign = await this.em.findOne(Campaign, { id });
      if (!campaign) {
        throw new NotFoundException(`Campaign with ID ${id} not found`);
      }

      if (data.startDate && data.endDate) {
        const startDate =
          data.startDate instanceof Date
            ? data.startDate
            : new Date(data.startDate);

        const endDate =
          data.endDate instanceof Date ? data.endDate : new Date(data.endDate);

        if (endDate <= startDate) {
          throw new BadRequestException('End date must be after start date');
        }
      }

      // Update fields if provided
      if (data.name) campaign.name = data.name;
      if (data.description !== undefined)
        campaign.description = data.description;

      if (data.startDate) {
        campaign.startDate =
          data.startDate instanceof Date
            ? data.startDate
            : new Date(data.startDate);
      }

      if (data.endDate) {
        campaign.endDate =
          data.endDate instanceof Date ? data.endDate : new Date(data.endDate);
      }

      if (data.bloodCollectionDate) {
        const bloodCollectionDate =
          data.bloodCollectionDate instanceof Date
            ? data.bloodCollectionDate
            : new Date(data.bloodCollectionDate);

        const endDate = campaign.endDate;

        const minCollectionDate = new Date(endDate);
        minCollectionDate.setDate(endDate.getDate() + 1);

        if (bloodCollectionDate < minCollectionDate) {
          throw new BadRequestException(
            'Blood collection date must be at least 1 day after end date',
          );
        }

        campaign.bloodCollectionDate = bloodCollectionDate;
      }

      // Update status based on dates if not explicitly provided
      if (!data.status) {
        const now = new Date();
        if (now >= campaign.startDate && now <= campaign.endDate) {
          campaign.status = CampaignStatus.ACTIVE;
        }
        // TODO: Uncomment this logic later
        /*  else if (now > campaign.endDate) {
          campaign.status = CampaignStatus.ENDED;
        } else {
          campaign.status = CampaignStatus.NOT_STARTED;
        } */
      } else {
        campaign.status = data.status;
      }

      if (data.banner !== undefined) campaign.banner = data.banner;
      if (data.location !== undefined) campaign.location = data.location;
      if (data.limitDonation !== undefined)
        campaign.limitDonation = data.limitDonation;
      if (data.metadata !== undefined) campaign.metadata = data.metadata;

      await this.em.flush();
      return campaign;
    } catch (error: any) {
      this.logger.error(
        `Error updating campaign: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getCampaign(id: string): Promise<CampaignDetailResponseDtoType> {
    const campaign = await this.em.findOne(Campaign, { id });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    // Update campaign status based on current date
    this.updateCampaignStatus(campaign);

    // Get statistics for the campaign
    const statistics = await this.getCampaignStatistics(id);

    // Create a response object that includes both campaign data and statistics
    const response: CampaignDetailResponseDtoType = {
      ...campaign,
      statistics,
    };

    return response;
  }

  /**
   * Update campaign status based on current date
   */
  private updateCampaignStatus(campaign: Campaign): void {
    const now = new Date();

    // If current date is between start and end dates, set status to ACTIVE
    if (now >= campaign.startDate && now <= campaign.endDate) {
      if (campaign.status !== CampaignStatus.ACTIVE) {
        campaign.status = CampaignStatus.ACTIVE;
        this.em.flush();
      }
    }
    // TODO: Uncomment this logic later
    /* else if (now > campaign.endDate) {
      if (campaign.status !== CampaignStatus.ENDED) {
        campaign.status = CampaignStatus.ENDED;
        this.em.flush();
      }
    } else {
      if (campaign.status !== CampaignStatus.NOT_STARTED) {
        campaign.status = CampaignStatus.NOT_STARTED;
        this.em.flush();
      }
    } */
  }

  /**
   * Get statistics for a campaign
   */
  private async getCampaignStatistics(campaignId: string): Promise<any> {
    // Get total donation requests
    const totalDonations = await this.em.count(CampaignDonation, {
      campaign: { id: campaignId },
    });

    // Get donation requests by status
    const statusCounts: Record<string, number> = {};

    // Initialize counts for all statuses
    Object.values(CampaignDonationStatus).forEach((status) => {
      statusCounts[status] = 0;
    });

    // Get counts for each status
    for (const status of Object.values(CampaignDonationStatus)) {
      const count = await this.em.count(CampaignDonation, {
        campaign: { id: campaignId },
        currentStatus: status,
      });
      statusCounts[status] = count;
    }

    // Calculate completion rate
    const completedDonations =
      statusCounts[CampaignDonationStatus.COMPLETED] +
      statusCounts[CampaignDonationStatus.RESULT_RETURNED];

    const completionRate =
      totalDonations > 0 ? (completedDonations / totalDonations) * 100 : 0;

    // Get daily registration counts for the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Get all donations in the last 7 days
    const recentDonations = await this.em.find(CampaignDonation, {
      campaign: { id: campaignId },
      createdAt: { $gte: sevenDaysAgo },
    });

    // Group by date
    const dailyRegistrationsMap: Record<string, number> = {};

    // Initialize the last 7 days with 0 counts
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      dailyRegistrationsMap[dateStr] = 0;
    }

    // Count donations by date
    recentDonations.forEach((donation) => {
      const dateStr = donation.createdAt.toISOString().split('T')[0];
      dailyRegistrationsMap[dateStr] =
        (dailyRegistrationsMap[dateStr] || 0) + 1;
    });

    // Convert to array for easier consumption
    const dailyRegistrations = Object.entries(dailyRegistrationsMap)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalDonations,
      statusCounts,
      completedDonations,
      completionRate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
      dailyRegistrations,
    };
  }

  async deleteCampaign(id: string): Promise<void> {
    const campaign = await this.em.findOne(Campaign, { id });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    await this.em.removeAndFlush(campaign);
  }

  async getCampaigns(options: {
    page?: number;
    limit?: number;
    status?: CampaignStatus;
    search?: string;
  }): Promise<PaginatedResponseType<Campaign>> {
    const page = options.page || 1;
    const limit = options.limit || 10;

    const queryOptions: Record<string, any> = {};
    if (options.status) {
      queryOptions.status = options.status;
    }

    const [campaigns, total] = await this.em.findAndCount(
      Campaign,
      options.search
        ? {
            ...queryOptions,
            $or: [
              { name: { $ilike: `%${options.search}%` } },
              { description: { $ilike: `%${options.search}%` } },
              { location: { $ilike: `%${options.search}%` } },
            ],
          }
        : queryOptions,
      {
        limit,
        offset: (page - 1) * limit,
        orderBy: { createdAt: 'DESC' },
      },
    );

    // Update status for each campaign based on current date
    for (const campaign of campaigns) {
      this.updateCampaignStatus(campaign);
    }

    return createPaginatedResponse(campaigns, page, limit, total);
  }

  async getCampaignDonationRequests(
    campaignId: string,
    options: {
      page?: number;
      limit?: number;
      status?: CampaignDonationStatus;
      isBloodUnitCreated?: boolean;
    },
  ): Promise<PaginatedResponseType<CampaignDonation>> {
    // Verify campaign exists
    const campaign = await this.em.findOne(Campaign, { id: campaignId });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    const queryOptions: Record<string, any> = {
      campaign: { id: campaignId },
    };

    if (options.status) {
      queryOptions.currentStatus = options.status;
    }

    if (options.isBloodUnitCreated !== undefined) {
      queryOptions.isBloodUnitCreated = options.isBloodUnitCreated;
    }

    const [donations, total] = await this.em.findAndCount(
      CampaignDonation,
      queryOptions,
      {
        populate: ['donor'],
        limit,
        offset,
        orderBy: { createdAt: 'DESC' },
      },
    );

    // Fetch logs for each donation request
    for (const donation of donations) {
      const logs = await this.em.find(
        CampaignDonationLog,
        { campaignDonation: donation },
        { populate: ['staff'] },
      );
      // Manually add logs to the result
      (donation as any).logs = logs;
    }

    return createPaginatedResponse(donations, page, limit, total);
  }

  async getAvailableCampaigns(options: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponseType<Campaign>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const now = new Date();

    const queryOptions: Record<string, any> = {
      endDate: { $gt: now },
    };

    const [campaigns, total] = await this.em.findAndCount(
      Campaign,
      options.search
        ? {
            ...queryOptions,
            $or: [
              { name: { $ilike: `%${options.search}%` } },
              { description: { $ilike: `%${options.search}%` } },
              { location: { $ilike: `%${options.search}%` } },
            ],
          }
        : queryOptions,
      {
        limit,
        offset: (page - 1) * limit,
        orderBy: { endDate: 'ASC' },
      },
    );

    // Update status for each campaign based on current date
    for (const campaign of campaigns) {
      this.updateCampaignStatus(campaign);
    }

    return createPaginatedResponse(campaigns, page, limit, total);
  }
}
