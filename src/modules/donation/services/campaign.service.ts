import { Campaign, CampaignStatus } from '@/database/entities/campaign.entity';
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
import { CreateCampaignDtoType, UpdateCampaignDtoType } from '../dtos';
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

      const campaign = new Campaign();
      campaign.name = data.name;
      campaign.description = data.description || '';
      campaign.startDate = startDate;
      campaign.endDate = endDate;
      campaign.status = data.status || CampaignStatus.NOT_STARTED;
      campaign.banner = data.banner || '';

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

      // If both dates are provided, validate them
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

      if (data.status) campaign.status = data.status;
      if (data.banner !== undefined) campaign.banner = data.banner;

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

  async getCampaign(id: string): Promise<Campaign> {
    const campaign = await this.em.findOne(Campaign, { id });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    return campaign;
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
            ],
          }
        : queryOptions,
      {
        limit,
        offset: (page - 1) * limit,
        orderBy: { createdAt: 'DESC' },
      },
    );

    return createPaginatedResponse(campaigns, page, limit, total);
  }
}
