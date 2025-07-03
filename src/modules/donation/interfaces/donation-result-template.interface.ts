import { DonationResultTemplate } from '@/database/entities/campaign.entity';
import { PaginatedResponseType } from '@/share/dtos/pagination.dto';
import {
  CreateDonationResultTemplateDtoType,
  UpdateDonationResultTemplateDtoType,
} from '../dtos/donation-result-template.dto';

export interface IDonationResultTemplateService {
  createTemplate(
    staffId: string,
    data: CreateDonationResultTemplateDtoType,
  ): Promise<DonationResultTemplate>;

  updateTemplate(
    staffId: string,
    id: string,
    data: UpdateDonationResultTemplateDtoType,
  ): Promise<DonationResultTemplate>;

  getTemplate(id: string): Promise<DonationResultTemplate>;

  deleteTemplate(id: string): Promise<void>;

  getTemplates(options: {
    page?: number;
    limit?: number;
    active?: boolean;
    search?: string;
  }): Promise<PaginatedResponseType<DonationResultTemplate>>;
}
