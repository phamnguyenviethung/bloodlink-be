import {
  DonationResultTemplate,
  DonationResultTemplateItem,
  DonationResultTemplateItemOption,
} from '@/database/entities/campaign.entity';
import {
  createPaginatedResponse,
  PaginatedResponseType,
} from '@/share/dtos/pagination.dto';
import { EntityManager, Transactional } from '@mikro-orm/core';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CreateDonationResultTemplateDtoType,
  UpdateDonationResultTemplateDtoType,
} from '../dtos/donation-result-template.dto';
import { IDonationResultTemplateService } from '../interfaces/donation-result-template.interface';
import { Staff } from '@/database/entities/Account.entity';

@Injectable()
export class DonationResultTemplateService
  implements IDonationResultTemplateService
{
  private readonly logger = new Logger(DonationResultTemplateService.name);

  constructor(private readonly em: EntityManager) {}

  @Transactional()
  async createTemplate(
    staffId: string,
    data: CreateDonationResultTemplateDtoType,
  ): Promise<DonationResultTemplate> {
    try {
      // Find staff
      const staff = await this.em.findOne(Staff, { id: staffId });
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${staffId} not found`);
      }

      // Create template
      const template = new DonationResultTemplate();
      template.name = data.name;
      template.description = data.description || '';
      template.active = data.active !== undefined ? data.active : true;
      template.createdBy = staff;
      template.updatedBy = staff;

      await this.em.persistAndFlush(template);

      // Create items
      if (data.items && data.items.length > 0) {
        for (const itemData of data.items) {
          const item = new DonationResultTemplateItem();
          item.template = template;
          item.type = itemData.type;
          item.label = itemData.label;
          item.description = itemData.description || '';
          item.placeholder = itemData.placeholder || '';
          item.defaultValue = itemData.defaultValue || '';
          item.sortOrder = itemData.sortOrder;
          item.minValue = itemData.minValue;
          item.maxValue = itemData.maxValue;
          item.minLength = itemData.minLength;
          item.maxLength = itemData.maxLength;
          item.isRequired =
            itemData.isRequired !== undefined ? itemData.isRequired : true;
          item.pattern = itemData.pattern || '';

          await this.em.persist(item);

          // Create options if applicable
          if (itemData.options && itemData.options.length > 0) {
            for (const optionData of itemData.options) {
              const option = new DonationResultTemplateItemOption();
              option.item = item;
              option.label = optionData.label;
              await this.em.persist(option);
            }
          }
        }
      }

      await this.em.flush();
      return template;
    } catch (error: any) {
      this.logger.error(
        `Error creating template: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Transactional()
  async updateTemplate(
    staffId: string,
    id: string,
    data: UpdateDonationResultTemplateDtoType,
  ): Promise<DonationResultTemplate> {
    try {
      // Find staff
      const staff = await this.em.findOne(Staff, { id: staffId });
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${staffId} not found`);
      }

      // Find template
      const template = await this.em.findOne(
        DonationResultTemplate,
        { id },
        {
          populate: ['items', 'items.options'],
        },
      );
      if (!template) {
        throw new NotFoundException(`Template with ID ${id} not found`);
      }

      // Update template fields
      if (data.name !== undefined) template.name = data.name;
      if (data.description !== undefined)
        template.description = data.description;
      if (data.active !== undefined) template.active = data.active;
      template.updatedBy = staff;

      // Update items if provided
      if (data.items) {
        // Remove existing items and their options
        const existingItems = await this.em.find(DonationResultTemplateItem, {
          template,
        });
        for (const item of existingItems) {
          // Remove options
          const options = await this.em.find(DonationResultTemplateItemOption, {
            item,
          });
          await this.em.removeAndFlush(options);
        }
        await this.em.removeAndFlush(existingItems);

        // Create new items
        for (const itemData of data.items) {
          const item = new DonationResultTemplateItem();
          item.template = template;
          item.type = itemData.type;
          item.label = itemData.label;
          item.description = itemData.description || '';
          item.placeholder = itemData.placeholder || '';
          item.defaultValue = itemData.defaultValue || '';
          item.sortOrder = itemData.sortOrder;
          item.minValue = itemData.minValue;
          item.maxValue = itemData.maxValue;
          item.minLength = itemData.minLength;
          item.maxLength = itemData.maxLength;
          item.isRequired =
            itemData.isRequired !== undefined ? itemData.isRequired : true;
          item.pattern = itemData.pattern || '';

          await this.em.persist(item);

          // Create options if applicable
          if (itemData.options && itemData.options.length > 0) {
            for (const optionData of itemData.options) {
              const option = new DonationResultTemplateItemOption();
              option.item = item;
              option.label = optionData.label;
              await this.em.persist(option);
            }
          }
        }
      }

      await this.em.flush();
      return template;
    } catch (error: any) {
      this.logger.error(
        `Error updating template: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getTemplate(id: string): Promise<DonationResultTemplate> {
    const template = await this.em.findOne(
      DonationResultTemplate,
      { id },
      {
        populate: ['items', 'items.options', 'createdBy', 'updatedBy'],
      },
    );

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  @Transactional()
  async deleteTemplate(id: string): Promise<void> {
    const template = await this.em.findOne(
      DonationResultTemplate,
      { id },
      {
        populate: ['items', 'items.options'],
      },
    );

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    // Delete all related items and options
    const items = await this.em.find(DonationResultTemplateItem, { template });
    for (const item of items) {
      // Delete options
      const options = await this.em.find(DonationResultTemplateItemOption, {
        item,
      });
      await this.em.removeAndFlush(options);
    }
    await this.em.removeAndFlush(items);

    // Delete template
    await this.em.removeAndFlush(template);
  }

  async getTemplates(options: {
    page?: number;
    limit?: number;
    active?: boolean;
    search?: string;
  }): Promise<PaginatedResponseType<DonationResultTemplate>> {
    const page = options.page || 1;
    const limit = options.limit || 10;

    const queryOptions: Record<string, any> = {};
    if (options.active !== undefined) {
      queryOptions.active = options.active;
    }

    const [templates, total] = await this.em.findAndCount(
      DonationResultTemplate,
      options.search
        ? {
            ...queryOptions,
            name: { $ilike: `%${options.search}%` },
          }
        : queryOptions,
      {
        populate: ['createdBy', 'updatedBy'],
        limit,
        offset: (page - 1) * limit,
        orderBy: { createdAt: 'DESC' },
      },
    );

    return createPaginatedResponse(templates, page, limit, total);
  }
}
