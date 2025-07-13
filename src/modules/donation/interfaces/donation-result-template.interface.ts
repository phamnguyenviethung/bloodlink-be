import {
  DonationResultTemplate,
  DonationResultTemplateItem,
  DonationResultTemplateItemOption,
} from '@/database/entities/campaign.entity';
import { PaginatedResponseType } from '@/share/dtos/pagination.dto';
import {
  CreateDonationResultTemplateDtoType,
  TemplateItemDtoType,
  TemplateItemOptionDtoType,
  UpdateDonationResultTemplateDtoType,
} from '../dtos/donation-result-template.dto';

export interface IDonationResultTemplateService {
  // Template methods
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

  // Item methods
  addItemToTemplate(
    staffId: string,
    templateId: string,
    itemData: TemplateItemDtoType,
  ): Promise<DonationResultTemplateItem>;

  updateItem(
    staffId: string,
    itemId: string,
    itemData: TemplateItemDtoType,
  ): Promise<DonationResultTemplateItem>;

  getItem(itemId: string): Promise<DonationResultTemplateItem>;

  deleteItem(staffId: string, itemId: string): Promise<void>;

  getItemsByTemplate(
    templateId: string,
    options?: {
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponseType<DonationResultTemplateItem>>;

  // Option methods
  addOptionToItem(
    staffId: string,
    itemId: string,
    optionData: TemplateItemOptionDtoType,
  ): Promise<DonationResultTemplateItemOption>;

  updateOption(
    staffId: string,
    optionId: string,
    optionData: TemplateItemOptionDtoType,
  ): Promise<DonationResultTemplateItemOption>;

  getOption(optionId: string): Promise<DonationResultTemplateItemOption>;

  deleteOption(staffId: string, optionId: string): Promise<void>;

  getOptionsByItem(
    itemId: string,
    options?: {
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponseType<DonationResultTemplateItemOption>>;
}
