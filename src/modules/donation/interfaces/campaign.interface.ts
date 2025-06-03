import { Campaign, CampaignStatus } from '@/database/entities/campaign.entity';
import { PaginatedResponseType } from '@/share/dtos/pagination.dto';
import { CreateCampaignDtoType, UpdateCampaignDtoType } from '../dtos';

export interface ICampaignService {
  createCampaign(data: CreateCampaignDtoType): Promise<Campaign>;
  updateCampaign(id: string, data: UpdateCampaignDtoType): Promise<Campaign>;
  getCampaign(id: string): Promise<Campaign>;
  deleteCampaign(id: string): Promise<void>;
  getCampaigns(options: {
    page?: number;
    limit?: number;
    status?: CampaignStatus;
    search?: string;
  }): Promise<PaginatedResponseType<Campaign>>;
}
